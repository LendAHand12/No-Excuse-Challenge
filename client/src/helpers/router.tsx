import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

interface AuthState {
  accessToken: string | null;
  user: Record<string, any> | null;
}

interface RootState {
  auth: AuthState;
}

export const PrivateRoute = () => {
  const { accessToken } = useSelector((state: RootState) => state.auth);

  return accessToken ? <Outlet /> : <Navigate to="/" />;
};

export const PublicRoute = () => {
  const { accessToken, user } = useSelector((state: RootState) => state.auth);

  if (accessToken && user) {
    return <Navigate to="/dashboard" />;
  }

  return <Outlet />;
};
