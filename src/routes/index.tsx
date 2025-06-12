import { authSlice } from "@/store/auth"
import { BrowserRouter, Navigate, Route, Routes } from "react-router"

import { SigninPage } from "@/pages/signin";
import { HomePage } from "@/pages/home";
import { ChannelsPage } from "@/pages/channels";
import PrivateRoute from "./private-route";
import { AnimatePresence } from 'framer-motion';

import { PageTransition } from "./transition";
import { Chat } from "@/components/chat";

export const IndexRoutes = () => {
  const { auth } = authSlice(state => state)
  return (
    <AnimatePresence mode="wait">
      <BrowserRouter>
        <Routes>
          {!auth ? (
            <Route path="/" element={<SigninPage />} />
          ) : (
            <Route
              element={<PrivateRoute />}
            >
              <Route
                path="/channels"
                element={
                  <ChannelsPage />
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

            </Route>
          )}
          <Route path="*" element={<Navigate to={auth ? '/channels' : '/'} />} />
        </Routes>
      </BrowserRouter>
    </AnimatePresence>

  )
}