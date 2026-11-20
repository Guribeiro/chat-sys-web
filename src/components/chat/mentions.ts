/**
 * Mentions travel as Slack-style tokens (`<@user-uuid>`) inside the message content.
 * The composer works with readable `@Name` text and converts at the edges.
 */
export type MentionUser = { id: string; name: string | null; avatarUrl?: string | null }

export const MENTION_TOKEN = /<@([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})>/gi

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Lowercase without accents, for forgiving search ("joao" finds "João"). */
export const normalize = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/** `@Name` -> `<@id>` for every known user typed in full. Longest names first ("Ana Luiza" before "Ana"). */
export function toMentionTokens(text: string, users: MentionUser[]): string {
  return [...users]
    .filter((user): user is { id: string; name: string } => !!user.name)
    .sort((a, b) => b.name.length - a.name.length)
    .reduce(
      (result, user) =>
        result.replace(
          new RegExp(`(^|[^\\p{L}\\p{N}_])@${escapeRegExp(user.name)}(?![\\p{L}\\p{N}_])`, 'gu'),
          (_match, before: string) => `${before}<@${user.id}>`,
        ),
      text,
    )
}

/** `<@id>` -> `@Name` (for editing, quotes and plain previews). */
export function toMentionText(content: string, names: Map<string, string | null>): string {
  return content.replace(MENTION_TOKEN, (_token, id: string) => `@${names.get(id.toLowerCase()) ?? 'alguém'}`)
}

/** If the caret sits right after `@query`, returns the query and where the `@` starts. */
export function getMentionQuery(text: string, caret: number): { query: string; start: number } | null {
  const before = text.slice(0, caret)
  // Up to two words after the @, so "@Ana Lu" keeps matching "Ana Luiza"
  const match = before.match(/(?:^|\s)@([\p{L}\p{N}_.-]*(?: [\p{L}\p{N}_.-]*)?)$/u)
  if (!match) return null
  return { query: match[1], start: caret - match[1].length - 1 }
}
