import { useOutletContext } from 'react-router'

import type { ChannelDetails } from '@/http/fetch-channel'

export type ManageContext = { channel: ChannelDetails }

/** The channel being managed, as resolved (and permission-checked) by ChannelManageLayout. */
export const useManagedChannel = () => useOutletContext<ManageContext>().channel
