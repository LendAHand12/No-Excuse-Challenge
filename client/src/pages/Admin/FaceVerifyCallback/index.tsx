import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Loading from '@/components/Loading';

const FaceVerifyCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Get params from URL
    const token = searchParams.get('token');
    const facetect_tid = searchParams.get('facetect_tid');
    const tempToken = searchParams.get('tempToken');

    // Redirect back to admin login with params
    if (token && facetect_tid && tempToken) {
      navigate(
        `/admin/login?token=${token}&facetect_tid=${facetect_tid}&tempToken=${tempToken}`,
        {
          replace: true,
        },
      );
    } else {
      // If missing params, redirect to login
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

