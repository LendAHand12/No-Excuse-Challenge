import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Loading from '@/components/Loading';

const FaceVerifyCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Get params from URL
    const token = searchParams.get('token');
    const tempToken = searchParams.get('tempToken');

    // Redirect back to admin login with params
    // Only token and tempToken are required
    if (token && tempToken) {
      navigate(`/admin/login?token=${token}&tempToken=${tempToken}`, {
        replace: true,
      });
    } else {
      // If missing required params, redirect to login
      navigate('/admin/login', { replace: true });
    }
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loading />
    </div>
  );
};

export default FaceVerifyCallbackPage;

