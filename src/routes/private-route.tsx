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
    <div className="min-h-screen max-w-7xl w-full mx-auto bg-background flex flex-col py-2 px-6">
      <Header />
      <main className='mt-4'>
        <Outlet />
      </main>
    </div>
  )
}

export default PrivateRoute;