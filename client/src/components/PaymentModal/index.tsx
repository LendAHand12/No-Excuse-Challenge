import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount, useConnect } from 'wagmi';
import Modal from 'react-modal';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  changeRate: number;
  orderId: string;
  onWalletPayment: () => void;
}

const PaymentModal = ({
  isOpen,
  onClose,
  totalAmount,
  changeRate,
  orderId,
  onWalletPayment,
}: PaymentModalProps) => {
  const { t } = useTranslation();
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'bank'>(
    'wallet',
  );
  const { connectors, connectAsync } = useConnect();
  const { address, isConnected } = useAccount();

  // Calculate VND amount
  const vndAmount = totalAmount * changeRate;

  // Generate QR Code URL
  const generateQRUrl = () => {
    const acc = (import.meta as any).env.VITE_BANK_ACCOUNT;
    const bank = (import.meta as any).env.VITE_BANK_NAME;
    const amount = Math.round(vndAmount);
    const des = encodeURIComponent(orderId);

    return `https://qr.sepay.vn/img?acc=${acc}&bank=${bank}&amount=${amount}&des=${des}`;
  };

  const qrCodeImage = generateQRUrl();

  const handleWalletConnect = async () => {
    try {
      const result = await connectAsync({ connector: connectors[0] });
      if (result?.accounts.length > 0) {
        onWalletPayment();
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="modal-content"
      overlayClassName="modal-overlay"
      contentLabel="Payment Method Modal"
    >
      <div className="payment-modal">
        <div className="payment-modal-header">
          <h2 className="payment-modal-title">{t('Select Payment Method')}</h2>
          <button
            onClick={onClose}
            className="payment-modal-close"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Payment Method Tabs */}
        <div className="payment-tabs">
          <button
            className={`payment-tab ${
              paymentMethod === 'wallet' ? 'active' : ''
            }`}
            onClick={() => setPaymentMethod('wallet')}
          >
            {t('E-Wallet')}
          </button>
          <button
            className={`payment-tab ${
              paymentMethod === 'bank' ? 'active' : ''
            }`}
            onClick={() => setPaymentMethod('bank')}
          >
            {t('Bank Transfer')}
          </button>
        </div>

        {/* Wallet Payment Method */}
        {paymentMethod === 'wallet' && (
          <div className="payment-method-content">
            <div className="payment-info">
              <p className="payment-amount">
                {t('Total Amount')}: {totalAmount} USDT
              </p>
              <p className="payment-note">
                {t('Connect your wallet to proceed')}
              </p>
            </div>

            {isConnected ? (
              <div className="wallet-connected">
                <p className="success-message">{t('Wallet Connected')}</p>
                <p className="wallet-address">{address}</p>
                <button onClick={onWalletPayment} className="payment-button">
                  {t('Proceed with Payment')}
                </button>
              </div>
            ) : (
              <button
                onClick={handleWalletConnect}
                className="payment-button connect-wallet-btn"
              >
                {t('Connect Wallet')}
              </button>
            )}
          </div>
        )}

        {/* Bank Transfer Payment Method */}
        {paymentMethod === 'bank' && (
          <div className="payment-method-content">
            <div className="payment-info">
              <p className="payment-amount">
                {t('Total Amount')}: {totalAmount} USDT
              </p>
              <p className="payment-amount vnd">
                ≈ {vndAmount.toLocaleString('vi-VN')} VND
              </p>
              <p className="payment-note">{t('Scan QR code to transfer')}</p>
            </div>

            {qrCodeImage ? (
              <div className="qr-code-container">
                <img src={qrCodeImage} alt="QR Code" className="qr-code" />
                <p className="qr-note">
                  {t('Please transfer the exact amount to the QR code above')}
                </p>
              </div>
            ) : (
              <div className="qr-placeholder">
                <p>{t('QR code will be displayed here')}</p>
              </div>
            )}

            <button onClick={onClose} className="payment-button secondary">
              {t('I have transferred')}
            </button>
          </div>
        )}

        <div className="payment-modal-footer">
          <button onClick={onClose} className="payment-button cancel">
            {t('Cancel')}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PaymentModal;
