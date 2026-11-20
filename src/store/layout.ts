import { create } from 'zustand'

type LayoutState = {
  /** Members panel on wide screens (persists between channels) */
  membersOpen: boolean
  /** Members sheet on narrow screens */
  membersSheetOpen: boolean
  searchOpen: boolean
  toggleMembers: () => void
  setSearchOpen: (open: boolean | ((current: boolean) => boolean)) => void
  setMembersSheetOpen: (open: boolean) => void
}

export const useLayout = create<LayoutState>()((set) => ({
  membersOpen: true,
  membersSheetOpen: false,
  searchOpen: false,
  setSearchOpen: (open) => set(state => ({ searchOpen: typeof open === 'function' ? open(state.searchOpen) : open })),
  toggleMembers: () => set(state => ({ membersOpen: !state.membersOpen })),
  setMembersSheetOpen: (open) => set({ membersSheetOpen: open }),
}))
