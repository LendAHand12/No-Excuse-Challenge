import Modal from 'react-modal';
import { useState } from 'react';
import LOGO from '@/images/logo/logo.png';

export default function WithdrawModal({
  showModal,
  closeModal,
  availableUsdt,
  claimUsdt,
  loadingClaimUsdt,
}) {
  const [amount, setAmount] = useState('');

  const handleChange = (e) => {
    const value = e.target.value;
    if (
      value === '' ||
      (Number(value) >= 0 && Number(value) <= availableUsdt)
    ) {
      setAmount(value);
    }
  };

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
        },
        overlay: { backgroundColor: 'rgba(0,0,0,0.5)' },
      }}
    >
      <div className="w-full bg-gray-900 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Withdraw USDT</h3>
          <button
            onClick={closeModal}
            className="text-gray-400 hover:text-gray-200 transition"
          >
            ✕
          </button>
        </div>

        {/* Logo + Icon */}
        <div className="flex flex-col items-center p-6">
          {/* Logo công ty */}
          <img
            src={LOGO}
            alt="Company Logo"
            className="w-32 h-auto object-cover mb-3"
          />
          {/* Icon tiền */}
          <p className="text-gray-300 mb-3">
            Available:{' '}
            <span className="font-semibold">{availableUsdt} USDT</span>
          </p>

          {/* Input */}
          <input
            type="number"
            min="0"
            max={availableUsdt}
            value={amount}
            onChange={handleChange}
            placeholder="Enter amount to withdraw"
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
          />
        </div>

        {/* Footer buttons */}
        <div className="flex justify-end space-x-3 p-5 border-t border-gray-700">
          <button
            onClick={closeModal}
            disabled={loadingClaimUsdt}
            className="px-4 py-2 text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => claimUsdt(amount)}
            disabled={loadingClaimUsdt || !amount}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center"
          >
            {loadingClaimUsdt && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
            )}
            Confirm
          </button>
        </div>
      </div>
    </Modal>
  );
}
