import Modal from 'react-modal';
import { useState, useEffect } from 'react';
import LOGO from '@/images/logo/logo.png';
import { useTranslation } from 'react-i18next';
import Config from '@/api/Config';
import { toast } from 'react-toastify';

export default function WithdrawModal({
  showModal,
  closeModal,
  availableUsdt,
  claimUsdt,
  loadingClaimUsdt,
  userInfo,
}) {
  const { t } = useTranslation();
  const [amount, setAmount] = useState('');
  const [withdrawalType, setWithdrawalType] = useState('BANK'); // CRYPTO or BANK
  const [exchangeRate, setExchangeRate] = useState(0);
  const [loadingRate, setLoadingRate] = useState(false);

  useEffect(() => {
    if (showModal && withdrawalType === 'BANK') {
      fetchExchangeRate();
    }
  }, [showModal, withdrawalType]);

  const fetchExchangeRate = async () => {
    setLoadingRate(true);
    try {
      const response = await Config.getExchangeRate();
      if (response?.data?.exchangeRate) {
        setExchangeRate(response.data.exchangeRate);
      }
    } catch (error) {
      console.error('Failed to fetch exchange rate:', error);
      toast.error(t('withdrawModal.failedToFetchExchangeRate'));
    } finally {
      setLoadingRate(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    if (
      value === '' ||
      (Number(value) >= 0 && Number(value) <= availableUsdt)
    ) {
      setAmount(value);
    }
  };

  const calculateCryptoAmount = () => {
    if (!amount) return { amount: 0, tax: 0, fee: 0, received: 0 };
    const amountUsdt = Number(amount);
    const tax = amountUsdt * 0.1; // 10% tax
    const fee = 1; // Transaction fee 1 USDT
    const received = amountUsdt - tax - fee;
    return {
      amount: amountUsdt.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      tax: tax.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      fee: fee.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      received:
        received > 0
          ? received.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : '0.00',
      amountValue: amountUsdt,
      taxValue: tax,
      feeValue: fee,
      receivedValue: Math.max(0, received),
    };
  };

  const calculateBankAmount = () => {
    if (!amount || !exchangeRate)
      return { total: 0, tax: 0, fee: 0, received: 0 };
    // Calculate all values in USDT first
    const amountUsdt = Number(amount);
    const taxUsdt = amountUsdt * 0.1; // 10% tax (USDT)
    const feeUsdt = 1; // Transaction fee 1 USDT
    const receivedUsdt = amountUsdt - taxUsdt - feeUsdt; // Received amount (USDT)

    // Convert to VND for display
    const totalVND = amountUsdt * exchangeRate;
    const taxVND = taxUsdt * exchangeRate;
    const feeVND = feeUsdt * exchangeRate;
    const receivedVND = receivedUsdt * exchangeRate;

    // Làm tròn xuống đến hàng đơn vị (bỏ phần thập phân)
    return {
      total: Math.floor(totalVND).toLocaleString('vi-VN'),
      tax: Math.floor(taxVND).toLocaleString('vi-VN'),
      fee: Math.floor(feeVND).toLocaleString('vi-VN'),
      received: Math.floor(receivedVND).toLocaleString('vi-VN'),
      totalValue: Math.floor(totalVND),
      taxValue: Math.floor(taxVND),
      feeValue: Math.floor(feeVND),
      receivedValue: Math.floor(receivedVND),
    };
  };

  const hasBankInfo = () => {
    return (
      userInfo?.accountName &&
      userInfo?.accountNumber &&
      userInfo?.bankName &&
      userInfo?.bankCode
    );
  };

  const cryptoAmount = calculateCryptoAmount();
  const bankAmount = calculateBankAmount();

  return (
    <Modal
      isOpen={showModal}
      onRequestClose={closeModal}
      style={{
        content: {
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          transform: 'translate(-50%, -50%)',
          padding: 0,
          borderRadius: '1rem',
          border: 'none',
          background: 'transparent',
          maxWidth: '600px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'hidden',
        },
        overlay: { backgroundColor: 'rgba(0,0,0,0.5)' },
      }}
    >
      <div className="w-full bg-gray-900 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-700 flex-shrink-0">
          <h3 className="text-lg font-semibold text-white">
            {t('withdrawModal.title')}
          </h3>
          <button
            onClick={closeModal}
            className="text-gray-400 hover:text-gray-200 transition"
          >
            ✕
          </button>
        </div>

        {/* Logo + Icon - Scrollable content */}
        <div className="flex flex-col items-center p-6 space-y-4 overflow-y-auto flex-1 min-h-0">
          {/* Logo công ty */}
          {/* <img
            src={LOGO}
            alt="Company Logo"
            className="w-32 h-auto object-cover mb-3"
          /> */}
          {/* Icon tiền */}
          <p className="text-gray-300 mb-3">
            {t('withdrawModal.available')}:{' '}
            <span className="font-semibold">{availableUsdt} USDT</span>
          </p>

          {/* Withdrawal Type Selection */}
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('withdrawModal.withdrawalMethod')}
            </label>
            <div className="flex gap-2">
              {/* <button
                type="button"
                onClick={() => setWithdrawalType('CRYPTO')}
                className={`flex-1 px-4 py-2 rounded-lg border transition ${
                  withdrawalType === 'CRYPTO'
                    ? 'bg-green-600 border-green-500 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {t('withdrawModal.cryptoWallet')}
              </button> */}
              <button
                type="button"
                onClick={() => setWithdrawalType('BANK')}
                className={`flex-1 px-4 py-2 rounded-lg border transition ${
                  withdrawalType === 'BANK'
                    ? 'bg-green-600 border-green-500 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {t('withdrawModal.bankTransfer')}
              </button>
            </div>
          </div>

          {/* Bank Withdrawal Notice */}
          {withdrawalType === 'BANK' && (
            <div className="w-full bg-blue-900 border border-blue-700 rounded-lg p-3 text-blue-200 text-sm">
              <p className="font-semibold mb-1">
                {t('withdrawModal.bankProcessingNotice')}
              </p>
              <p>{t('withdrawModal.bankProcessingNoticeDesc')}</p>
            </div>
          )}

          {/* Bank Info Validation */}
          {withdrawalType === 'BANK' && !hasBankInfo() && (
            <div className="w-full bg-yellow-900 border border-yellow-700 rounded-lg p-3 text-yellow-200 text-sm">
              <p className="font-semibold mb-1">
                {t('withdrawModal.bankInfoRequired')}
              </p>
              <p>{t('withdrawModal.bankInfoRequiredDesc')}</p>
            </div>
          )}

          {/* Input */}
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('withdrawModal.amount')}
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              max={availableUsdt}
              value={amount}
              onChange={handleChange}
              placeholder={t('withdrawModal.amountPlaceholder')}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
          </div>

          {/* Crypto Amount Display */}
          {withdrawalType === 'CRYPTO' && amount && (
            <div className="w-full bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">
                  {t('withdrawModal.withdrawalAmount')}:
                </span>
                <span className="text-white font-semibold">
                  {cryptoAmount.amount} USDT
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">{t('withdrawModal.tax')}:</span>
                <span className="text-red-400">-{cryptoAmount.tax} USDT</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">
                  {t('withdrawModal.transactionFee')}:
                </span>
                <span className="text-red-400">-{cryptoAmount.fee} USDT</span>
              </div>
              <div className="border-t border-gray-700 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-gray-300 font-semibold">
                    {t('withdrawModal.youWillReceive')}:
                  </span>
                  <span className="text-green-400 font-bold text-lg">
                    {cryptoAmount.received} USDT
                  </span>
                </div>
              </div>
              {(cryptoAmount.receivedValue ?? 0) <= 0 && (
                <div className="mt-2 text-yellow-400 text-xs">
                  {t('withdrawModal.amountTooSmall')}
                </div>
              )}
            </div>
          )}

          {/* Bank Amount Display */}
          {withdrawalType === 'BANK' && amount && hasBankInfo() && (
            <div className="w-full bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-2">
              {loadingRate ? (
                <p className="text-gray-400 text-sm">
                  {t('withdrawModal.loadingExchangeRate')}
                </p>
              ) : (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">
                      {t('withdrawModal.exchangeRate')}:
                    </span>
                    <span className="text-white font-semibold">
                      1 USDT = {exchangeRate.toLocaleString('vi-VN')} VND
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">
                      {t('withdrawModal.totalAmount')}:
                    </span>
                    <span className="text-white">{bankAmount.total} VND</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">
                      {t('withdrawModal.tax')}:
                    </span>
                    <span className="text-red-400">-{bankAmount.tax} VND</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">
                      {t('withdrawModal.transactionFee')} (1 USDT):
                    </span>
                    <span className="text-red-400">-{bankAmount.fee} VND</span>
                  </div>
                  <div className="border-t border-gray-700 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300 font-semibold">
                        {t('withdrawModal.youWillReceive')}:
                      </span>
                      <span className="text-green-400 font-bold text-lg">
                        {bankAmount.received} VND
                      </span>
                    </div>
                  </div>
                  {(bankAmount.receivedValue ?? 0) <= 0 && (
                    <div className="mt-2 text-yellow-400 text-xs">
                      {t('withdrawModal.amountTooSmall')}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div className="flex justify-end space-x-3 p-5 border-t border-gray-700 flex-shrink-0">
          <button
            onClick={closeModal}
            disabled={loadingClaimUsdt}
            className="px-4 py-2 text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-800 transition"
          >
            {t('withdrawModal.cancel')}
          </button>
          <button
            onClick={() =>
              claimUsdt(
                amount,
                withdrawalType,
                withdrawalType === 'BANK' ? exchangeRate : null,
              )
            }
            disabled={
              loadingClaimUsdt ||
              !amount ||
              (withdrawalType === 'BANK' && !hasBankInfo()) ||
              (withdrawalType === 'BANK' && loadingRate) ||
              (withdrawalType === 'CRYPTO' &&
                (cryptoAmount.receivedValue ?? 0) <= 0) ||
              (withdrawalType === 'BANK' &&
                (bankAmount.receivedValue ?? 0) <= 0)
            }
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingClaimUsdt && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
            )}
            {t('withdrawModal.confirm')}
          </button>
        </div>
      </div>
    </Modal>
  );
}
