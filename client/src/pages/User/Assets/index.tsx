import { useEffect, useMemo, useState } from 'react';
import DefaultLayout from '@/layout/DefaultLayout';
import { useTranslation } from 'react-i18next';
import User from '@/api/User';
import { URL_API_WITHDRAW } from '@/api/URL';
import Payment from '@/api/Payment';
import { useNavigate } from 'react-router-dom';
import API from '@/api/API';

type WithdrawHistoryItem = {
  _id: string;
  coin: 'HEWE' | 'USDT';
  amount: number;
  address?: string;
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'REJECTED';
  createdAt: string;
  hash?: string;
};

export default function UserAssetsPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [balances, setBalances] = useState<{ hewe: number; usdt: number }>({
    hewe: 0,
    usdt: 0,
  });

  const [history, setHistory] = useState<WithdrawHistoryItem[]>([]);
  const [coin, setCoin] = useState<'HEWE' | 'USDT'>('HEWE');
  const [amount, setAmount] = useState<string>('');
  const [usdtMethod, setUsdtMethod] = useState<'WALLET' | 'BANK'>('WALLET');
  const [submitting, setSubmitting] = useState(false);
  const [rate, setRate] = useState<number>(0);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [hasBank, setHasBank] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [profileRes, withdrawsRes] = await Promise.all([
          User.getProfile(),
          User.withdraws(),
        ]);
        if (!mounted) return;

        const profile = profileRes?.data?.data || {};
        const hewe = Number(profile?.wallet?.hewe || profile?.hewe || 0);
        const usdt = Number(profile?.wallet?.usdt || profile?.usdt || 0);
        setBalances({ hewe, usdt });
        setWalletAddress(profile?.walletAddress || profile?.wallet || '');
        setHasBank(Boolean(profile?.bankName && profile?.accountNumber));

        const list = (withdrawsRes?.data?.data || []) as WithdrawHistoryItem[];
        setHistory(list);
        try {
          const payRes = await Payment.getPaymentInfo();
          const changeRate =
            payRes?.data?.data?.changeRate || payRes?.data?.changeRate;
          if (changeRate) setRate(Number(changeRate));
        } catch {}
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const maxAmount = useMemo(
    () => (coin === 'HEWE' ? balances.hewe : balances.usdt),
    [coin, balances],
  );

  const canSubmit = useMemo(() => {
    const n = Number(amount);
    if (!n || n <= 0) return false;
    if (n > maxAmount) return false;
    if (coin === 'USDT') {
      if (usdtMethod === 'WALLET' && !walletAddress) return false;
      if (usdtMethod === 'BANK' && !hasBank) return false;
    }
    return true;
  }, [amount, maxAmount, coin, usdtMethod, walletAddress, hasBank]);

  const submitWithdraw = async () => {
    if (!canSubmit || submitting) return;
    try {
      setSubmitting(true);
      if (coin === 'USDT' && usdtMethod === 'WALLET' && !walletAddress) {
        if (confirm(`${t('Please add your wallet address')}`)) {
          navigate('/user/profile');
        }
        return;
      }
      if (coin === 'USDT' && usdtMethod === 'BANK' && !hasBank) {
        alert(t('Please provide your bank account information') as string);
        navigate('/user/profile');
        return;
      }

      await API.post(`${URL_API_WITHDRAW}/request`, {
        coin,
        amount: Number(amount),
        method: coin === 'USDT' ? usdtMethod : 'WALLET',
      });

      const withdrawsRes = await User.withdraws();
      const list = (withdrawsRes?.data?.data || []) as WithdrawHistoryItem[];
      setHistory(list);

      setBalances((prev) => ({
        hewe: coin === 'HEWE' ? prev.hewe - Number(amount) : prev.hewe,
        usdt: coin === 'USDT' ? prev.usdt - Number(amount) : prev.usdt,
      }));

      setAmount('');
      alert(t('Withdraw request created successfully') as string);
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Withdraw failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DefaultLayout>
      <div className="w-full max-w-5xl mx-auto px-10 py-24">
        <h1 className="text-2xl font-semibold mb-6">{t('My Assets')}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="rounded-xl border p-5 bg-white">
            <div className="text-sm text-gray-500 mb-1">HEWE</div>
            <div className="text-3xl font-bold">
              {loading ? '...' : balances.hewe.toLocaleString()}
            </div>
          </div>
          <div className="rounded-xl border p-5 bg-white">
            <div className="text-sm text-gray-500 mb-1">USDT</div>
            <div className="text-3xl font-bold">
              {loading ? '...' : balances.usdt.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-5 mb-10">
          <h2 className="text-lg font-semibold mb-4">{t('Withdraw')}</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                {t('Coin')}
              </label>
              <select
                className="w-full border rounded-lg px-3 py-2"
                value={coin}
                onChange={(e) => setCoin(e.target.value as 'HEWE' | 'USDT')}
              >
                <option value="HEWE">HEWE</option>
                <option value="USDT">USDT</option>
              </select>
              <div className="text-xs text-gray-500 mt-1">
                {t('Available')}: {maxAmount.toLocaleString()}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                {t('Amount')}
              </label>
              <input
                className="w-full border rounded-lg px-3 py-2"
                type="number"
                min={0}
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
              />
              <div className="text-xs text-gray-500 mt-1">
                {t('Max')}: {maxAmount.toLocaleString()}
              </div>
              {coin === 'USDT' && rate > 0 && amount && (
                <div className="text-xs text-gray-500 mt-1">
                  {t('Exchange rate')}: 1 USDT ≈ {rate.toLocaleString('vi-VN')}{' '}
                  VND
                  <br />
                  {t('VND Equivalent')}: ≈{' '}
                  {(Number(amount) * rate).toLocaleString('vi-VN')} VND
                </div>
              )}
            </div>

            {coin === 'USDT' && (
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 mb-1">
                  {t('Withdraw method')}
                </label>
                <div className="flex gap-4">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      checked={usdtMethod === 'WALLET'}
                      onChange={() => setUsdtMethod('WALLET')}
                    />
                    <span>{t('Wallet')}</span>
                    {!walletAddress && (
                      <button
                        type="button"
                        className="ml-2 text-blue-600 underline text-xs"
                        onClick={() => navigate('/user/profile')}
                      >
                        {t('Go to Profile')}
                      </button>
                    )}
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      checked={usdtMethod === 'BANK'}
                      onChange={() => setUsdtMethod('BANK')}
                    />
                    <span>{t('Bank transfer')}</span>
                    {!hasBank && (
                      <button
                        type="button"
                        className="ml-2 text-blue-600 underline text-xs"
                        onClick={() => navigate('/user/profile')}
                      >
                        {t('Go to Profile')}
                      </button>
                    )}
                  </label>
                </div>
              </div>
            )}

            <div className="md:col-span-4">
              <button
                className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50"
                onClick={submitWithdraw}
                disabled={!canSubmit || submitting}
              >
                {submitting ? t('Submitting...') : t('Request Withdraw')}
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <h2 className="text-lg font-semibold mb-4">
            {t('Withdraw History')}
          </h2>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="py-2 pr-4">{t('Time')}</th>
                  <th className="py-2 pr-4">{t('Coin')}</th>
                  <th className="py-2 pr-4">{t('Amount')}</th>
                  <th className="py-2 pr-4">{t('Address')}</th>
                  <th className="py-2 pr-4">{t('Status')}</th>
                  <th className="py-2 pr-4">{t('Tx Hash')}</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 && (
                  <tr>
                    <td className="py-3 pr-4 text-gray-500" colSpan={6}>
                      {t('No withdraw records')}
                    </td>
                  </tr>
                )}
                {history.map((item) => (
                  <tr key={item._id} className="border-t">
                    <td className="py-3 pr-4">
                      {new Date(item.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 pr-4">{item.coin}</td>
                    <td className="py-3 pr-4">
                      {Number(item.amount).toLocaleString()}
                    </td>
                    <td className="py-3 pr-4">
                      {item.address ? (
                        <span className="truncate inline-block max-w-[220px] align-bottom">
                          {item.address}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${
                          item.status === 'SUCCESS'
                            ? 'bg-green-100 text-green-700'
                            : item.status === 'REJECTED'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      {item.hash ? (
                        <span className="truncate inline-block max-w-[220px] align-bottom">
                          {item.hash}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
