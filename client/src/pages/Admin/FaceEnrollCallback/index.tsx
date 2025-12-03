import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Loading from '@/components/Loading';

const FaceEnrollCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Get params from URL (FaceTec uses user_id, not admin_id)
    const token = searchParams.get('token');
    const facetect_tid = searchParams.get('facetect_tid');
    const user_id = searchParams.get('user_id'); // FaceTec uses user_id
    const admin_id = searchParams.get('admin_id') || user_id; // Fallback to user_id

    // Redirect back to admin login with params
    if (token && facetect_tid && admin_id) {
      navigate(`/admin/login?token=${token}&facetect_tid=${facetect_tid}&admin_id=${admin_id}`, {
        replace: true,
      });
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

export default FaceEnrollCallbackPage;

