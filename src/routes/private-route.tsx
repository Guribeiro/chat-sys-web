import { Header } from '@/components/header';
import { authSlice } from '@/store/auth';
import { Navigate, useLocation, Outlet } from 'react-router';

function PrivateRoute() {
  const { state } = useLocation();
  const { auth } = authSlice(state => state)


  if (!auth) {
    return <Navigate to="/" state={state} replace />;
  }

  return (
    <div className="min-h-screen max-w-7xl w-full mx-auto bg-background flex flex-col">
      <Header />
      <Outlet />
    </div>
  )
}

export default PrivateRoute;