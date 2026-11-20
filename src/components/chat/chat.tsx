import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';

import { fetchChannelMessages, FetchChannelMessagesResponse, MessageItem, MessageReaction } from '@/http/fetch-channel-messages';
import { channelKeys, useChannelDetails, useChannelMembers } from '@/hooks/use-channel-details';
import { ADMIN_CHANNELS_KEY } from '@/hooks/use-admin-channels';
import { markChannelRead } from '@/http/mark-channel-read';
import type { Channel } from '@/http/fetch-channels';
import { CreateMessageForm } from './create-message-form';
import { ChatHeader } from './chat-header';
import { TypingIndicator } from './typing-indicator';
import { MessagesList } from './messages-list';
import { appendMessage, markMessageDeleted, messagesQueryKey, patchMessage } from './messages-cache';
import { ChatContext } from './chat-context';
import { formatTyping, useTypingUsers } from './use-typing-users';
import { handleAxiosError } from '@/lib/axios-error-handler';
import { socket } from '@/socket';
import { authSlice } from '@/store/auth';

/** Distance from the bottom (px) under which we keep following new messages */
const STICK_TO_BOTTOM_PX = 120
const MARK_READ_DEBOUNCE_MS = 1500

export const Chat = () => {
  const { auth } = authSlice(state => state)
  const userId = auth?.user?.id
  const { slug } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const jumpTarget = (location.state as { jumpTo?: string } | null)?.jumpTo
  const queryClient = useQueryClient()
  const channelIdRef = useRef<string | null>(null)
  const [channelId, setChannelId] = useState<string | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)
  const stickToBottomRef = useRef(true)
  const lastMessageIdRef = useRef<string | null>(null)
  const olderAnchorRef = useRef<{ height: number; top: number } | null>(null)

  const { data, isFetching, isFetchingNextPage, error, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: messagesQueryKey(slug),
    enabled: !!slug,
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: FetchChannelMessagesResponse) => lastPage.nextCursor ?? undefined,
    queryFn: async ({ pageParam }): Promise<FetchChannelMessagesResponse> => {
      const { data } = await fetchChannelMessages({ slug, cursor: pageParam })
      return data
    },
  })

  // Members share the cache with the members panel; permissions come from the API's `viewer`
  const { data: members } = useChannelMembers(slug)
  const { data: details } = useChannelDetails(slug)
  const isAdmin = details?.viewer.isAdmin ?? false
  const isInactive = details?.active === false

  const mentionUsers = useMemo(
    () => (members ?? []).map(member => ({ id: member.memberId, name: member.member.name, avatarUrl: member.member.avatarUrl })),
    [members],
  )
  const memberNames = useMemo(
    () => new Map(mentionUsers.map(member => [member.id, member.name] as [string, string | null])),
    [mentionUsers],
  )

  const [replyTo, setReplyTo] = useState<MessageItem | null>(null)
  useEffect(() => setReplyTo(null), [slug])

  const errorMessage = useMemo(() => {
    if (error) return handleAxiosError(error)
  }, [error])

  const { typing, stopTyping } = useTypingUsers(channelId)

  // ---- Read state -------------------------------------------------------------------------
  const markReadTimer = useRef<ReturnType<typeof setTimeout>>()

  const markRead = useCallback((targetSlug: string) => {
    clearTimeout(markReadTimer.current)
    markChannelRead({ slug: targetSlug }).catch(() => { /* best effort */ })
    queryClient.setQueryData<Channel[]>(['channels'], (channels) =>
      channels?.map(channel => (channel.slug === targetSlug ? { ...channel, unreadCount: 0, unreadMentionCount: 0 } : channel)),
    )
  }, [queryClient])

  useEffect(() => {
    if (!slug) return
    markRead(slug)
    return () => markRead(slug)
  }, [slug, markRead])

  // ---- Realtime ---------------------------------------------------------------------------
  useEffect(() => {
    if (!slug) return

    const join = () => {
      socket.emit('channel:join', { slug }, (response) => {
        if ('error' in response) toast.error(response.error)
        else {
          channelIdRef.current = response.channelId
          setChannelId(response.channelId)
        }
      })
    }

    // Ignore late events from a channel we already left
    const isCurrentChannel = (channelId: string) => channelIdRef.current === channelId

    const handleNewMessage = ({ channelId, message }: { channelId: string; message: MessageItem }) => {
      if (!isCurrentChannel(channelId)) return
      appendMessage(queryClient, slug, message)
      stopTyping(message.authorId)

      if (message.authorId !== userId) {
        clearTimeout(markReadTimer.current)
        markReadTimer.current = setTimeout(() => markRead(slug), MARK_READ_DEBOUNCE_MS)
      }
    };

    const handleMessageUpdated = ({ channelId, message }: { channelId: string; message: MessageItem }) => {
      if (!isCurrentChannel(channelId)) return
      patchMessage(queryClient, slug, message.id, message)
    }

    const handleMessageDeleted = ({ channelId, messageId, deletedAt }: { channelId: string; messageId: string; deletedAt: string }) => {
      if (!isCurrentChannel(channelId)) return
      markMessageDeleted(queryClient, slug, messageId, deletedAt)
      setReplyTo(current => (current?.id === messageId ? null : current))
    }

    const handleReactions = ({ channelId, messageId, reactions }: { channelId: string; messageId: string; reactions: MessageReaction[] }) => {
      if (!isCurrentChannel(channelId)) return
      patchMessage(queryClient, slug, messageId, { reactions })
    }

    const handleMemberRemoved = ({ channelId, userId: removedId }: { channelId: string; userId: string }) => {
      if (!isCurrentChannel(channelId)) return
      if (removedId === userId) {
        toast.warning('Você foi removido deste canal')
        navigate('/channels')
        return
      }
      queryClient.invalidateQueries({ queryKey: ['members', slug] })
    }

    const handleMemberAdded = ({ channelId }: { channelId: string }) => {
      if (!isCurrentChannel(channelId)) return
      queryClient.invalidateQueries({ queryKey: ['members', slug] })
    }

    // Promotions, demotions and ownership changes: my moderation rights may change with them
    const handleMemberUpdated = ({ channelId, userId: changedId }: { channelId: string; userId: string }) => {
      if (!isCurrentChannel(channelId)) return
      queryClient.invalidateQueries({ queryKey: channelKeys.members(slug) })
      if (changedId === userId) {
        queryClient.invalidateQueries({ queryKey: channelKeys.details(slug) })
        queryClient.invalidateQueries({ queryKey: ADMIN_CHANNELS_KEY })
      }
    }

    const handleOwnerChanged = ({ channelId }: { channelId: string }) => {
      if (!isCurrentChannel(channelId)) return
      queryClient.invalidateQueries({ queryKey: channelKeys.members(slug) })
      queryClient.invalidateQueries({ queryKey: channelKeys.details(slug) })
    }

    const handleChannelDeleted = ({ channelId }: { channelId: string }) => {
      if (!isCurrentChannel(channelId)) return
      toast.warning('Este canal foi removido')
      navigate('/channels')
    }

    const handleChannelUpdated = (payload: { channelId: string; slug: string; active: boolean }) => {
      if (!isCurrentChannel(payload.channelId)) return
      queryClient.invalidateQueries({ queryKey: ['channels'] })
      if (payload.slug !== slug) navigate(`/channels/${payload.slug}`, { replace: true })
      else queryClient.invalidateQueries({ queryKey: channelKeys.details(slug) })
    }

    join()
    // Rooms are lost when the connection drops: join again after reconnecting
    socket.on('connect', join)
    socket.on('channel:message', handleNewMessage);
    socket.on('channel:message_updated', handleMessageUpdated)
    socket.on('channel:message_deleted', handleMessageDeleted)
    socket.on('channel:message_reactions', handleReactions)
    socket.on('channel:member_removed', handleMemberRemoved)
    socket.on('channel:member_added', handleMemberAdded)
    socket.on('channel:member_updated', handleMemberUpdated)
    socket.on('channel:owner_changed', handleOwnerChanged)
    socket.on('channel:deleted', handleChannelDeleted)
    socket.on('channel:updated', handleChannelUpdated)

    return () => {
      socket.emit('channel:leave', { slug });
      socket.off('connect', join)
      socket.off('channel:message', handleNewMessage);
      socket.off('channel:message_updated', handleMessageUpdated)
      socket.off('channel:message_deleted', handleMessageDeleted)
      socket.off('channel:message_reactions', handleReactions)
      socket.off('channel:member_removed', handleMemberRemoved)
      socket.off('channel:member_added', handleMemberAdded)
      socket.off('channel:member_updated', handleMemberUpdated)
      socket.off('channel:owner_changed', handleOwnerChanged)
      socket.off('channel:deleted', handleChannelDeleted)
      socket.off('channel:updated', handleChannelUpdated)
      channelIdRef.current = null
      setChannelId(null)
    };
  }, [slug, userId, navigate, queryClient, stopTyping, markRead]);

  // ---- Messages + scroll ------------------------------------------------------------------
  const allMessages = useMemo(() => {
    // Pages go newest -> oldest; render oldest first. Dedupe: pages may overlap after a refetch.
    const seen = new Set<string>()
    return [...(data?.pages ?? [])].reverse().flatMap(page => page.messages).filter(message => {
      if (seen.has(message.id)) return false
      seen.add(message.id)
      return true
    })
  }, [data?.pages])

  // A different channel starts at the bottom again
  useEffect(() => {
    lastMessageIdRef.current = null
    stickToBottomRef.current = true
    olderAnchorRef.current = null
  }, [slug])

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [])

  useLayoutEffect(() => {
    const el = scrollRef.current
    if (!el || !allMessages.length) return

    // Older page prepended: keep the same messages under the user's eyes
    if (olderAnchorRef.current) {
      const { height, top } = olderAnchorRef.current
      el.scrollTop = el.scrollHeight - height + top
      olderAnchorRef.current = null
      return
    }

    const last = allMessages[allMessages.length - 1]
    if (last.id === lastMessageIdRef.current) return

    const isFirstRender = lastMessageIdRef.current === null
    lastMessageIdRef.current = last.id

    // Follow new messages only when already at the bottom (or when I sent it)
    if (isFirstRender || stickToBottomRef.current || last.authorId === userId) scrollToBottom()
  }, [allMessages, userId, scrollToBottom])

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return
    stickToBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < STICK_TO_BOTTOM_PX
  }

  const loadOlder = useCallback(() => {
    const el = scrollRef.current
    if (el) olderAnchorRef.current = { height: el.scrollHeight, top: el.scrollTop }
    fetchNextPage()
  }, [fetchNextPage])

  // ---- "New messages" divider -------------------------------------------------------------
  // Read during render, before the effect above zeroes the badge for this channel
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const unreadAtOpen = useMemo(() => queryClient.getQueryData<Channel[]>(['channels'])?.find(channel => channel.slug === slug)?.unreadCount ?? 0, [slug])
  const [firstUnread, setFirstUnread] = useState<{ slug: string; id: string | null } | null>(null)
  useEffect(() => {
    if (!slug || !allMessages.length || firstUnread?.slug === slug) return
    let id: string | null = null
    if (unreadAtOpen > 0) {
      const fromOthers = allMessages.filter(message => message.authorId !== userId)
      id = fromOthers[Math.max(0, fromOthers.length - unreadAtOpen)]?.id ?? null
    }
    setFirstUnread({ slug, id })
  }, [slug, allMessages, firstUnread?.slug, unreadAtOpen, userId])
  const firstUnreadId = firstUnread?.slug === slug ? firstUnread.id : null

  const typingText = formatTyping(typing)

  /** Scrolls to a loaded message and flashes it (used by reply quotes) */
  const jumpToMessage = useCallback((messageId: string) => {
    const element = document.getElementById(`message-${messageId}`)
    if (!element) {
      toast.info('A mensagem original é mais antiga. Carregue mensagens anteriores para vê-la.')
      return
    }
    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    element.classList.remove('message-flash')
    // Restart the animation even when the same message is flashed twice in a row
    void element.offsetWidth
    element.classList.add('message-flash')
    setTimeout(() => element.classList.remove('message-flash'), 1700)
  }, [])

  // Arriving from search: walk back through older pages until the message is loaded
  const MAX_JUMP_PAGES = 40
  const jumpPagesRef = useRef(0)
  useEffect(() => {
    if (!jumpTarget || !data?.pages.length || isFetchingNextPage) return

    const found = allMessages.some(message => message.id === jumpTarget)
    if (found || !hasNextPage || jumpPagesRef.current >= MAX_JUMP_PAGES) {
      jumpPagesRef.current = 0
      // Clear the state so a refresh or a new message does not jump again
      navigate(location.pathname, { replace: true, state: null })
      if (found) requestAnimationFrame(() => jumpToMessage(jumpTarget))
      else toast.info('Não foi possível encontrar a mensagem')
      return
    }

    jumpPagesRef.current++
    const el = scrollRef.current
    if (el) olderAnchorRef.current = { height: el.scrollHeight, top: el.scrollTop }
    fetchNextPage()
  }, [jumpTarget, data?.pages.length, isFetchingNextPage, hasNextPage, allMessages, fetchNextPage, jumpToMessage, navigate, location.pathname])

  const chatContext = useMemo(() => ({
    slug,
    currentUserId: userId,
    canModerate: isAdmin,
    memberNames,
    onReply: setReplyTo,
    jumpToMessage,
  }), [slug, userId, isAdmin, memberNames, jumpToMessage])

  return (
    <ChatContext.Provider value={chatContext}>
      <div className="flex h-full min-w-0 flex-col">
        <ChatHeader slug={slug} memberCount={members?.length} canManage={isAdmin} />
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
        >
          <MessagesList
            messages={allMessages}
            error={errorMessage}
            loading={isFetching && !allMessages.length}
            loadingOlder={isFetchingNextPage}
            hasOlder={hasNextPage}
            onLoadOlder={loadOlder}
            scrollRoot={scrollRef}
            firstUnreadId={firstUnreadId}
          />
        </div>
        <TypingIndicator text={typingText} />
        {isInactive ? (
          <p className="mx-3 mb-3 rounded-xl border bg-muted/50 px-4 py-3 text-sm text-muted-foreground lg:mx-4">
            Este canal está inativo: o histórico continua disponível, mas ninguém envia mensagens até um administrador reativá-lo.
          </p>
        ) : !errorMessage && (
          <CreateMessageForm
            channelId={channelId}
            members={mentionUsers}
            replyTo={replyTo}
            onCancelReply={() => setReplyTo(null)}
          />
        )}
      </div>
    </ChatContext.Provider>
  );
};
