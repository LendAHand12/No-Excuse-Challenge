import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import Modal from 'react-modal';
import Admin from '@/api/Admin';
import Loading from '@/components/Loading';

interface AdminVerificationProps {
  isOpen: boolean;
  tempToken: string;
  onSuccess: (data: any) => void;
  onCancel: () => void;
  callbackData?: {
    token: string;
    facetect_tid: string;
  };
}

const AdminVerification: React.FC<AdminVerificationProps> = ({
  isOpen,
  tempToken,
  onSuccess,
  onCancel,
  callbackData,
}) => {
  const { t } = useTranslation();
  const [step, setStep] = useState<'face' | '2fa'>('face');
  const [loading, setLoading] = useState(false);
  const [faceVerified, setFaceVerified] = useState(false);
  const [facetect_tid, setFacetect_tid] = useState<string>('');
  const [twoFactorCode, setTwoFactorCode] = useState<string>('');

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('face');
      setFaceVerified(false);
      setFacetect_tid('');
      setTwoFactorCode('');
      
      // If we have callback data, process face verification
      if (callbackData && callbackData.token && callbackData.facetect_tid) {
        setFacetect_tid(callbackData.facetect_tid);
        setFaceVerified(true);
        setStep('2fa');
      }
    }
  }, [isOpen, callbackData]);

  const handleStartFaceVerification = async () => {
    setLoading(true);
    try {
      const response = await Admin.startFaceVerification({ tempToken });
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || 'Failed to start face verification';
      toast.error(t(message));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyLogin = async () => {
    if (!twoFactorCode || twoFactorCode.length !== 6) {
      toast.error(t('Please enter a valid 6-digit code'));
      return;
    }

    if (!facetect_tid) {
      toast.error(t('Face verification is required'));
      return;
    }

    setLoading(true);
    try {
      const response = await Admin.verifyLogin({
        tempToken,
        facetect_tid,
        twoFactorCode,
      });
      if (response.data.success) {
        toast.success(t('Login successful!'));
        onSuccess(response.data);
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || 'Verification failed';
      toast.error(t(message));
    } finally {
      setLoading(false);
    }
  };

  // Callback handling is done via props (callbackData)

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onCancel}
      style={{
        content: {
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          marginRight: '-50%',
          transform: 'translate(-50%, -50%)',
          maxWidth: '500px',
          width: '90%',
          borderRadius: '8px',
        },
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
        },
      }}
      contentLabel="Admin Verification"
    >
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {t('Admin Verification')}
        </h2>

        {step === 'face' && (
          <div className="space-y-4">
            <p className="text-gray-700 mb-4">
              {t('Please verify your face using FaceTec')}
            </p>
            <button
              onClick={handleStartFaceVerification}
              disabled={loading}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? <Loading /> : t('Start Face Verification')}
            </button>
            <button
              onClick={onCancel}
              className="w-full px-4 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              {t('Cancel')}
            </button>
          </div>
        )}

        {step === '2fa' && (
          <div className="space-y-4">
            {faceVerified && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 text-sm">
                  ✓ {t('Face verification successful')}
                </p>
              </div>
            )}
            <p className="text-gray-700 mb-2">
              {t('Enter 6-digit code from Google Authenticator')}
            </p>
            <input
              type="text"
              maxLength={6}
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-4"
              placeholder="000000"
            />
            <button
              onClick={handleVerifyLogin}
              disabled={loading || twoFactorCode.length !== 6 || !faceVerified}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? <Loading /> : t('Verify and Login')}
            </button>
            <button
              onClick={onCancel}
              className="w-full px-4 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 mt-2"
            >
              {t('Cancel')}
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AdminVerification;

