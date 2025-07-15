import { authSlice } from "@/store/auth"
import { BrowserRouter, Navigate, Route, Routes } from "react-router"

import { SigninPage } from "@/pages/signin";
import { ForgotPassword } from "@/pages/forgot-password";
import { Admin } from "@/pages/admin/admin";
import { ChannelsPage } from "@/pages/channels";
import PrivateRoute from "./private-route";
import { AnimatePresence } from 'framer-motion';

import { PageTransition } from "./transition";
import { Chat } from "@/components/chat";
import { AdminChannels } from "@/pages/admin/components/admin-channels";
import { AdminChannelMembers } from "@/pages/admin/components/admin-channel-members";
import { ChannelDetailsPage } from "@/pages/admin/channel-page/channel-page";
import { ChannelSettingsPage } from "@/pages/admin/settings-page";
import { ResetPassword } from "@/pages/reset-password";

export const IndexRoutes = () => {
  const { auth } = authSlice(state => state)
  return (
    <AnimatePresence mode="wait">
      <BrowserRouter>
        <Routes>
          {!auth ? (
            <Route>
              <Route path="/" element={<SigninPage />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:code" element={<ResetPassword />} />
            </Route>
          ) : (
            <Route
              element={<PrivateRoute />}
            >
              <Route
                path="/channels"
                element={
                  <PageTransition>
                    <ChannelsPage />
                  </PageTransition>
                }
              >
                <Route
                  path="/channels/:slug"
                  element={
                    <PageTransition>
                      <Chat />
                    </PageTransition>
                  }
                />
              </Route>

              <Route
                path="/admin"
                element={
                  <Admin />
                }
              >
                <Route
                  path="/admin/channels"
                  element={
                    <AdminChannels />
                  }
                />
                <Route
                  path="/admin/channels/:slug"
                  element={<ChannelDetailsPage />}
                >
                  <Route
                    path="/admin/channels/:slug/members"
                    element={<AdminChannelMembers />}
                  />
                  <Route
                    path="/admin/channels/:slug/settings"
                    element={<ChannelSettingsPage />}
                  />
                </Route>
              </Route>
            </Route>
          )}
          <Route path="*" element={<Navigate to={auth ? '/channels' : '/'} />} />
        </Routes>
      </BrowserRouter>
    </AnimatePresence>

  )
}