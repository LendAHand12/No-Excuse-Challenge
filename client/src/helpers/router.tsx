import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

interface AuthState {
  accessToken: string | null;
  userInfo: Record<string, any> | null;
}

interface RootState {
  auth: AuthState;
}

export const PrivateRoute = () => {
  const { accessToken } = useSelector((state: RootState) => state.auth);

  return accessToken ? <Outlet /> : <Navigate to="/profile" />;
};

export const PublicRoute = () => {
  const { accessToken, userInfo } = useSelector(
    (state: RootState) => state.auth,
  );

  if (accessToken && userInfo) {
    if (userInfo && userInfo.role !== 'user') {
      return <Navigate to="/admin/transactions" />;
    } else if (userInfo && userInfo.role === 'user') {
      return <Navigate to="/user/profile" />;
    }
  }

  return <Outlet />;
};
