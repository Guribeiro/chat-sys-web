import { Header } from '@/components/header';
import { authSlice } from '@/store/auth';
import { useEffect } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router';
import { connectSocket } from '@/socket';

function PrivateRoute() {
  const { state, pathname } = useLocation();
  const { auth } = authSlice(state => state)

  // Presence, invites and mentions are live on every private page, not only in the chat
  useEffect(() => {
    if (auth?.token) connectSocket(auth.token)
  }, [auth?.token])

  if (!auth) {
    return <Navigate to="/" state={state} replace />;
  }

  // The chat owns its own scrolling; every other page scrolls as a document
  const isChat = pathname.startsWith('/channels')

  return (
    <div className="flex h-dvh flex-col bg-background">
      <Header />
      <main className={isChat ? 'min-h-0 flex-1' : 'min-h-0 flex-1 overflow-y-auto'}>
        <Outlet />
      </main>
    </div>
  )
}

export default PrivateRoute;
