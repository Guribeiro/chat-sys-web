import { authSlice } from "@/store/auth"
import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router"

import { SigninPage } from "@/pages/signin";
import { SignupPage } from "@/pages/signup";
import { ForgotPassword } from "@/pages/forgot-password";
import { Admin } from "@/pages/admin/admin";
import { ChannelsPage } from "@/pages/channels";
import PrivateRoute from "./private-route";
import { AnimatePresence } from 'framer-motion';

import { PageTransition } from "./transition";
import { Chat } from "@/components/chat";
import { AdminChannels } from "@/pages/admin/components/admin-channels";
import { ChannelManageLayout } from "@/pages/channel-manage/manage-layout";
import { MembersTab } from "@/pages/channel-manage/members-tab";
import { InvitesTab } from "@/pages/channel-manage/invites-tab";
import { SettingsTab } from "@/pages/channel-manage/settings-tab";
import { ResetPassword } from "@/pages/reset-password";
import { ProfilePage } from "@/pages/profile";

/** Old links (/admin/channels/:slug/...) now live inside the workspace. */
function LegacyManageRedirect() {
  const { slug, "*": rest } = useParams()
  return <Navigate to={`/channels/${slug}/manage/${rest || 'members'}`} replace />
}

export const IndexRoutes = () => {
  const { auth } = authSlice(state => state)
  return (
    <AnimatePresence mode="wait">
      <BrowserRouter>
        <Routes>
          {!auth ? (
            <Route>
              <Route path="/" element={<SigninPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:code" element={<ResetPassword />} />
            </Route>
          ) : (
            <Route
              element={<PrivateRoute />}
            >
              {/* The chat swaps channels in place: no page transition there.
                  Managing a channel happens in the same column, with the sidebar still visible. */}
              <Route path="/channels" element={<ChannelsPage />}>
                <Route path=":slug" element={<Chat />} />
                <Route path=":slug/manage" element={<ChannelManageLayout />}>
                  <Route index element={<Navigate to="members" replace />} />
                  <Route path="members" element={<MembersTab />} />
                  <Route path="invites" element={<InvitesTab />} />
                  <Route path="settings" element={<SettingsTab />} />
                </Route>
              </Route>

              <Route path="/profile" element={<PageTransition><ProfilePage /></PageTransition>} />

              <Route path="/admin" element={<PageTransition><Admin /></PageTransition>}>
                <Route index element={<Navigate to="/admin/channels" replace />} />
                <Route path="channels" element={<AdminChannels />} />
              </Route>
              <Route path="/admin/channels/:slug/*" element={<LegacyManageRedirect />} />
            </Route>
          )}
          <Route path="*" element={<Navigate to={auth ? '/channels' : '/'} />} />
        </Routes>
      </BrowserRouter>
    </AnimatePresence>

  )
}