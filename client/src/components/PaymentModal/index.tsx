import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount, useConnect } from 'wagmi';
import Modal from 'react-modal';
import Payment from '@/api/Payment';
import { toast } from 'react-toastify';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  changeRate: number;
  paymentIdsList: any[];
  onDonePayment: (transactionHash: string) => Promise<void>;
  onWalletPayment: () => void;
  // Optional API functions for bank transfer (if not provided, uses Payment API)
  createBankOrder?: (totalAmount: number) => Promise<any>;
  checkOrderStatus?: (orderId: string) => Promise<any>;
}

const PaymentModal = ({
  isOpen,
  onClose,
  totalAmount,
  changeRate,
  paymentIdsList,
  onDonePayment,
  onWalletPayment,
  createBankOrder: customCreateBankOrder,
  checkOrderStatus: customCheckOrderStatus,
}: PaymentModalProps) => {
  const { t } = useTranslation();
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'bank'>(
    'wallet',
  );
  const [orderId, setOrderId] = useState<string | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    'idle' | 'checking' | 'processing' | 'success' | 'pending'
  >('idle');
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const { connectors, connectAsync } = useConnect();
  const { address, isConnected } = useAccount();

  // Calculate VND amount
  const vndAmount = totalAmount * changeRate;

  // Create order when switching to bank transfer tab
  useEffect(() => {
    if (paymentMethod === 'bank' && !orderId && !loadingOrder && isOpen) {
      createOrder();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentMethod, isOpen]);

  // Reset orderId and payment status when modal closes
  useEffect(() => {
    if (!isOpen) {
      setOrderId(null);
      setPaymentMethod('wallet');
      setPaymentStatus('idle');
      setIsCheckingPayment(false);
    }
  }, [isOpen]);

  // Polling để check order status khi đang checking payment
  useEffect(() => {
    if (!isCheckingPayment || !orderId) {
      return;
    }

    let isMounted = true;
    let intervalId: NodeJS.Timeout | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    const stopPolling = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    const checkStatus = async () => {
      if (!isMounted) return;

      try {
        const response = customCheckOrderStatus
          ? await customCheckOrderStatus(orderId!)
          : await Payment.checkOrderStatus(orderId!);
        if (response.data.success && isMounted) {
          const status = response.data.order.status;
          if (status === 'SUCCESS') {
            stopPolling();
            setIsCheckingPayment(false);

            // Gọi donePayment với transferContent (nội dung chuyển khoản)
            const transferContent =
              response.data.order.transferContent || orderId;

            // Luôn gọi donePayment khi status = SUCCESS (transferContent sẽ là orderId nếu không có)
            if (paymentIdsList.length > 0) {
              try {
                setPaymentStatus('processing');
                // Chờ donePayment hoàn thành trước khi hiển thị thành công
                await onDonePayment(transferContent);

                // Chỉ khi donePayment thành công mới báo thành công
                setPaymentStatus('success');
                toast.success(t('Payment successful!'));
              } catch (error: any) {
                console.error('Error calling donePayment:', error);
                setPaymentStatus('idle');
                toast.error(
                  error.response?.data?.message ||
                    t(
                      'Payment processed but failed to update. Please refresh the page.',
                    ),
                );
              }
            } else {
              // Nếu không có paymentIdsList, chỉ hiển thị thông báo thành công
              console.warn('paymentIdsList is empty, skipping donePayment');
              setPaymentStatus('success');
              toast.success(t('Payment successful!'));
            }
          } else if (status === 'FAILED' || status === 'CANCELLED') {
            stopPolling();
            setPaymentStatus('idle');
            setIsCheckingPayment(false);
            toast.error(t('Payment failed'));
          }
          // Nếu PENDING, tiếp tục polling
        }
      } catch (error: any) {
        console.error('Error checking order status:', error);
        // Không throw error, chỉ log để tiếp tục polling
      }
    };

    // Check ngay lập tức
    checkStatus();

    // Polling mỗi 5 giây
    intervalId = setInterval(checkStatus, 5000);

    // Dừng polling sau 5 phút (300 giây)
    timeoutId = setTimeout(() => {
      if (isMounted) {
        stopPolling();
        setIsCheckingPayment(false);
        toast.info(t('Payment checking timeout. Please check manually later.'));
      }
    }, 300000); // 5 phút

    return () => {
      isMounted = false;
      stopPolling();
    };
  }, [isCheckingPayment, orderId, onClose, t]);

  const createOrder = async () => {
    setLoadingOrder(true);
    try {
      // Calculate VND amount to send to server
      const vndAmountToSend = Math.round(totalAmount * changeRate);
      const response = customCreateBankOrder
        ? await customCreateBankOrder(vndAmountToSend)
        : await Payment.createBankOrder(vndAmountToSend);
      if (response.data.success && response.data.orderId) {
        setOrderId(response.data.orderId);
        toast.success(t('Order created successfully'));
      }
    } catch (error: any) {
      console.error('Failed to create order:', error);
      toast.error(error.response?.data?.message || t('Failed to create order'));
      // Reset to wallet tab on error
      setPaymentMethod('wallet');
    } finally {
      setLoadingOrder(false);
    }
  };

  // Generate QR Code URL
  const generateQRUrl = () => {
    if (!orderId) return null;

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

  // Handle close modal - reload page nếu payment đã thành công
  const handleClose = () => {
    if (paymentStatus === 'success') {
      // Reload page khi đóng modal nếu thanh toán thành công
      window.location.reload();
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      className="modal-content"
      overlayClassName="modal-overlay"
      contentLabel="Payment Method Modal"
    >
      <div className="payment-modal">
        <div className="payment-modal-header">
          <h2 className="payment-modal-title">{t('Select Payment Method')}</h2>
          <button
            onClick={handleClose}
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
              <p
                className="payment-rate"
                style={{ fontSize: '12px', color: '#6b7280' }}
              >
                1 USDT ≈ {changeRate.toLocaleString('vi-VN')} VND
              </p>
              <p className="payment-amount vnd">
                ≈ {vndAmount.toLocaleString('vi-VN')} VND
              </p>
              <p className="payment-note">{t('Scan QR code to transfer')}</p>
            </div>

            {loadingOrder ? (
              <div className="qr-placeholder">
                <p>{t('Creating order...')}</p>
              </div>
            ) : qrCodeImage ? (
              <div className="qr-code-container">
                <img src={qrCodeImage} alt="QR Code" className="qr-code" />
                <p className="qr-note">
                  {t('Please transfer the exact amount to the QR code above')}
                </p>
                {orderId && (
                  <p
                    className="order-id-note"
                    style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      marginTop: '8px',
                    }}
                  >
                    Order ID: {orderId}
                  </p>
                )}
              </div>
            ) : (
              <div className="qr-placeholder">
                <p>{t('QR code will be displayed here')}</p>
              </div>
            )}

            <button
              onClick={() => {
                setIsCheckingPayment(true);
                setPaymentStatus('checking');
                toast.info(t('Checking payment status...'));
              }}
              disabled={isCheckingPayment || paymentStatus === 'checking'}
              className="payment-button secondary"
            >
              {isCheckingPayment || paymentStatus === 'checking'
                ? t('Checking payment...')
                : t('I have transferred')}
            </button>

            {/* Payment Status Display */}
            {paymentStatus === 'checking' && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700 text-center">
                  {t('Waiting for payment confirmation...')}
                </p>
                <p className="text-xs text-blue-500 text-center mt-2">
                  {t('This may take a few minutes')}
                </p>
              </div>
            )}

            {paymentStatus === 'processing' && (
              <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-700 text-center">
                  {t('Processing payment...')}
                </p>
                <p className="text-xs text-yellow-600 text-center mt-2">
                  {t('Please wait')}
                </p>
              </div>
            )}

            {paymentStatus === 'success' && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg border-2 border-green-200">
                <div className="flex items-center justify-center mb-2">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 48 48"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="24" cy="24" r="24" fill="#10B981" />
                    <path
                      d="M16 24L22 30L32 18"
                      stroke="white"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p className="text-lg text-green-700 text-center font-bold">
                  {t('Payment successful!')}
                </p>
                <p className="text-sm text-green-600 text-center mt-2">
                  {t('Page will refresh when you close this window')}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="payment-modal-footer">
          <button
            onClick={handleClose}
            className={`payment-button ${
              paymentStatus === 'success' ? 'success' : 'cancel'
            }`}
          >
            {paymentStatus === 'success' ? t('Close') : t('Cancel')}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PaymentModal;
