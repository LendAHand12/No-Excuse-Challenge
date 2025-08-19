import { useEffect, useState } from 'react';
import LOGO from '@/images/logo/logo.png';
import USDT from '@/images/icon/usdt.svg';
import Claim from '@/api/Claim';
import { ToastContainer, toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function SwapPage() {
  const { t } = useTranslation();
  const { userInfo } = useSelector((state) => state.auth);
  const { availableHewe, availableUsdt, availableAmc } = userInfo;
  const [toCoin, setToCoin] = useState('HEWE'); // mặc định HEWE
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState(0); // giá token
  const [loading, setLoading] = useState(false);

  const fetchPrice = async (coin) => {
    setLoading(true);
    await Claim.price({ coin })
      .then((response) => {
        const { price } = response.data;
        setPrice(price);
        setLoading(false);
      })
      .catch((error) => {
        let message =
          error.response && error.response.data.error
            ? error.response.data.error
            : error.message;
        toast.error(t(message));
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPrice(toCoin);
  }, [toCoin]);

  const getReceivedAmount = () => {
    if (!amount || !price) return '';
    return (Number(amount) * price).toFixed(4);
  };

  return (
    <>
      <ToastContainer />
      <div className="">
        <div className="relative min-h-screen w-full overflow-auto">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            src="/bg.mp4"
          />
          <div className="absolute inset-0 bg-black/50"></div>
          {/* Swap Box */}
          <div className="relative z-10 flex justify-end items-center min-h-screen px-4">
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-6 shadow-2xl w-full max-w-[450px]">
              {/* Logo công ty */}
              <div className="flex justify-center mb-4">
                <img
                  src={LOGO}
                  alt="Logo"
                  className="w-32 h-auto object-contain"
                />
              </div>

              {/* Balances info */}
              <div className="bg-gray-700 p-3 rounded-xl mb-4 text-gray-300 space-y-1">
                <div>Available USDT : {availableUsdt}</div>
                <div>Available HEWE : {availableHewe}</div>
                <div>Available AMC : {availableAmc}</div>
              </div>

              {/* From */}
              <div className="bg-gray-700 p-4 rounded-xl mb-3">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400 text-sm">From</span>
                  <div className="flex items-center bg-gray-600 text-white rounded px-2 py-1">
                    <img src={USDT} alt="USDT" className="w-5 h-5 mr-1" />
                    USDT
                  </div>
                </div>
                <input
                  type="number"
                  value={amount}
                  min={0}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setAmount(
                      val <= 0
                        ? ''
                        : val >= availableUsdt
                        ? availableUsdt
                        : val,
                    );
                  }}
                  placeholder="0.0"
                  className="w-full text-2xl bg-transparent text-white outline-none appearance-none"
                  style={{
                    MozAppearance: 'textfield',
                  }}
                />
              </div>

              {/* Switch icon */}
              <div className="flex justify-center my-2">
                <div className="p-2 bg-gray-700 rounded-full">
                  <svg
                    fill="none"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    className="w-5 h-5 text-white"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5"
                    ></path>
                  </svg>
                </div>
              </div>

              {/* To */}
              <div className="bg-gray-700 p-4 rounded-xl mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400 text-sm">To</span>
                  <select
                    value={toCoin}
                    onChange={(e) => {
                      setToCoin(e.target.value);
                      setAmount(0);
                    }}
                    className="bg-gray-600 text-white rounded px-2 py-1 flex items-center"
                  >
                    <option value="HEWE">HEWE</option>
                    <option value="AMC">AMC</option>
                  </select>
                </div>
                <div className="flex items-center">
                  {toCoin === 'HEWE' && (
                    <img
                      src="https://s2.coinmarketcap.com/static/img/coins/64x64/30470.png"
                      alt="HEWE"
                      className="w-5 h-5 mr-2"
                    />
                  )}
                  {toCoin === 'AMC' && (
                    <img
                      src="https://explorer.amchain.net/static/media/footer-logo.2ef25624.png"
                      alt="AMC"
                      className="w-5 h-5 mr-2"
                    />
                  )}
                  <input
                    type="text"
                    value={getReceivedAmount()}
                    readOnly
                    className="w-full text-2xl bg-transparent text-white outline-none"
                  />
                </div>
              </div>

              {/* Price info */}
              <div className="text-gray-300 mb-4">
                {loading
                  ? 'Fetching price...'
                  : price
                  ? `1 USDT = ${price} ${toCoin}`
                  : 'No price data'}
              </div>

              {/* Swap button */}
              <button
                disabled={!amount || loading}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold transition disabled:bg-gray-600"
              >
                Swap
              </button>
              <div className="mt-4">
                <Link to="/user/profile" className="text-gray-400">
                  {t('Back to Profile')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
