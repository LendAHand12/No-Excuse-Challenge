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
  const [loading, setLoading] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState<string>('');

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setTwoFactorCode('');
    }
  }, [isOpen]);

  const handleVerifyLogin = async () => {
    if (!twoFactorCode || twoFactorCode.length !== 6) {
      toast.error(t('Please enter a valid 6-digit code'));
      return;
    }

    setLoading(true);
    try {
      const response = await Admin.verifyLogin({
        tempToken,
        twoFactorCode,
        // Face verification token is no longer required
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

        <div className="space-y-4">
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
            disabled={loading || twoFactorCode.length !== 6}
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
      </div>
    </Modal>
  );
};

export default AdminVerification;

