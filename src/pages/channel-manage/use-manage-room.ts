import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router'
import { toast } from 'sonner'

import { channelKeys } from '@/hooks/use-channel-details'
import { ADMIN_CHANNELS_KEY } from '@/hooks/use-admin-channels'
import { socket } from '@/socket'
import { authSlice } from '@/store/auth'

/**
 * Keeps the manage screen live: joins the channel room (the chat is not mounted here)
 * and refreshes members, invites and permissions when someone else changes them.
 */
export function useManageRoom(slug: string | undefined, channelId: string | undefined) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  // Read at event time: switching tabs must not leave and re-join the room
  const { pathname } = useLocation()
  const pathnameRef = useRef(pathname)
  pathnameRef.current = pathname
  const userId = authSlice(state => state.auth?.user?.id)

  useEffect(() => {
    if (!slug || !channelId) return

    const join = () => socket.emit('channel:join', { slug })
    const mine = (payload: { channelId: string }) => payload.channelId === channelId
    const refresh = (...keys: ReadonlyArray<readonly unknown[]>) =>
      keys.forEach(queryKey => queryClient.invalidateQueries({ queryKey }))

    const handleMemberAdded = (payload: { channelId: string }) => {
      if (mine(payload)) refresh(channelKeys.members(slug), channelKeys.invites(slug))
    }
    const handleMemberRemoved = (payload: { channelId: string; userId: string }) => {
      if (!mine(payload)) return
      if (payload.userId === userId) {
        toast.warning('Você foi removido deste canal')
        navigate('/channels')
        return
      }
      refresh(channelKeys.members(slug))
    }
    const handleMemberUpdated = (payload: { channelId: string; userId: string }) => {
      if (!mine(payload)) return
      refresh(channelKeys.members(slug))
      // My own role changed: permissions (and the guard) follow
      if (payload.userId === userId) refresh(channelKeys.details(slug), ADMIN_CHANNELS_KEY)
    }
    const handleOwnerChanged = (payload: { channelId: string }) => {
      if (mine(payload)) refresh(channelKeys.details(slug), channelKeys.members(slug), ADMIN_CHANNELS_KEY)
    }
    const handleUpdated = (payload: { channelId: string; slug: string }) => {
      if (!mine(payload)) return
      refresh(['channels'], ADMIN_CHANNELS_KEY)
      if (payload.slug !== slug) navigate(pathnameRef.current.replace(`/channels/${slug}/`, `/channels/${payload.slug}/`), { replace: true })
      else refresh(channelKeys.details(slug))
    }
    const handleDeleted = (payload: { channelId: string }) => {
      if (!mine(payload)) return
      // I deleted it myself: the settings tab already confirms and navigates
      if (queryClient.isMutating({ mutationKey: ['delete-channel', slug] })) return
      refresh(['channels'], ADMIN_CHANNELS_KEY)
      toast.warning('Este canal foi excluído')
      navigate('/channels')
    }

    join()
    socket.on('connect', join)
    socket.on('channel:member_added', handleMemberAdded)
    socket.on('channel:member_removed', handleMemberRemoved)
    socket.on('channel:member_updated', handleMemberUpdated)
    socket.on('channel:owner_changed', handleOwnerChanged)
    socket.on('channel:updated', handleUpdated)
    socket.on('channel:deleted', handleDeleted)
    return () => {
      socket.emit('channel:leave', { slug })
      socket.off('connect', join)
      socket.off('channel:member_added', handleMemberAdded)
      socket.off('channel:member_removed', handleMemberRemoved)
      socket.off('channel:member_updated', handleMemberUpdated)
      socket.off('channel:owner_changed', handleOwnerChanged)
      socket.off('channel:updated', handleUpdated)
      socket.off('channel:deleted', handleDeleted)
    }
  }, [slug, channelId, userId, navigate, queryClient])
}
