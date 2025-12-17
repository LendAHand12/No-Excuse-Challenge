import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import Modal from 'react-modal';
import Admin from '@/api/Admin';
import Loading from '@/components/Loading';

interface AdminFirstTimeSetupProps {
  isOpen: boolean;
  adminId: string;
  onComplete: () => void;
  callbackData?: {
    token: string;
    facetect_tid: string;
    admin_id: string;
  }; // Keep for backward compatibility but not used anymore
}

const AdminFirstTimeSetup: React.FC<AdminFirstTimeSetupProps> = ({
  isOpen,
  adminId,
  onComplete,
  callbackData,
}) => {
  const { t } = useTranslation();
  const [step, setStep] = useState<'2fa-setup' | '2fa-verify'>('2fa-setup');
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [twoFactorCode, setTwoFactorCode] = useState<string>('');

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('2fa-setup');
      setQrCode('');
      setSecret('');
      setTwoFactorCode('');
    }
  }, [isOpen]);

  const handleSetup2FA = async () => {
    setLoading(true);
    try {
      const response = await Admin.setup2FA({ adminId });
      setQrCode(response.data.qrCode);
      setSecret(response.data.secret);
      setStep('2fa-verify');
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || 'Failed to setup 2FA';
      toast.error(t(message));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndEnable2FA = async () => {
    if (!twoFactorCode || twoFactorCode.length !== 6) {
      toast.error(t('Please enter a valid 6-digit code'));
      return;
    }

    setLoading(true);
    try {
      const response = await Admin.verifyAndEnable2FA({
        adminId,
        twoFactorCode,
      });
      if (response.data.firstLoginCompleted) {
        toast.success(t('Setup completed successfully!'));
        onComplete();
      } else {
        toast.success(t('2FA enabled successfully'));
        setStep('2fa-setup');
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || 'Invalid 2FA code';
      toast.error(t(message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => {}}
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
      contentLabel="Admin First Time Setup"
    >
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {t('Admin First Time Setup')}
        </h2>

        {step === '2fa-setup' && (
          <div className="space-y-4">
            <p className="text-gray-700 mb-4">
              {t('Please setup Google Authenticator')}
            </p>
            <button
              onClick={handleSetup2FA}
              disabled={loading}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? <Loading /> : t('Generate QR Code')}
            </button>
          </div>
        )}

        {step === '2fa-verify' && qrCode && (
          <div className="space-y-4">
            <p className="text-gray-700 mb-2">
              {t('Scan this QR code with Google Authenticator')}
            </p>
            <div className="flex justify-center mb-4">
              <img src={qrCode} alt="QR Code" className="w-48 h-48" />
            </div>
            <p className="text-sm text-gray-600 mb-2">
              {t('Or enter this key manually')}: <code className="bg-gray-100 px-2 py-1 rounded">{secret}</code>
            </p>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {t('Enter 6-digit code from Google Authenticator')}
              </label>
              <input
                type="text"
                maxLength={6}
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="000000"
              />
            </div>
            <button
              onClick={handleVerifyAndEnable2FA}
              disabled={loading || twoFactorCode.length !== 6}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? <Loading /> : t('Verify and Enable 2FA')}
            </button>
          </div>
        )}

        <div className="mt-4 text-sm text-gray-500 text-center">
          {step === '2fa-setup' && <p>{t('Step 1 of 1: Setup 2FA')}</p>}
          {step === '2fa-verify' && <p>{t('Step 1 of 1: Verify 2FA')}</p>}
        </div>
      </div>
    </Modal>
  );
};

export default AdminFirstTimeSetup;

