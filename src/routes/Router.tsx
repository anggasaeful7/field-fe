import { lazy } from 'react';
import { Navigate, createBrowserRouter } from 'react-router';
import Loadable from '../layouts/full/shared/loadable/Loadable';
import { useAuth } from '../context/AuthContext';

const FullLayout = Loadable(lazy(() => import('../layouts/full/FullLayout')));
const BlankLayout = Loadable(lazy(() => import('../layouts/blank/BlankLayout')));

const DashboardOverview = Loadable(lazy(() => import('../views/dashboard/DashboardOverview')));
const ReportDashboard = Loadable(lazy(() => import('../views/reports/ReportDashboard')));
const UserManagement = Loadable(lazy(() => import('../views/users/UserManagement')));

const Login = Loadable(lazy(() => import('../views/auth/auth2/login')));
const Error = Loadable(lazy(() => import('../views/auth/error')));

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/auth/auth2/login" replace />;
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/auth/auth2/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const Router = [
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <FullLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '/', element: <DashboardOverview /> },
      { path: '/dashboard', element: <DashboardOverview /> },
      { path: '/reports', element: <ReportDashboard /> },
      { path: '/admin/users', element: <AdminRoute><UserManagement /></AdminRoute> },
      { path: '*', element: <Navigate to="/auth/404" /> },
    ],
  },
  {
    path: '/',
    element: <BlankLayout />,
    children: [
      { path: '/auth/auth2/login', element: <Login /> },
      { path: '/auth/login', element: <Navigate to="/auth/auth2/login" replace /> },
      { path: '/auth/404', element: <Error /> },
      { path: '*', element: <Navigate to="/auth/404" /> },
    ],
  },
];

const router = createBrowserRouter(Router);

export default router;
