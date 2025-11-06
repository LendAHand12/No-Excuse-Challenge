import { useEffect, useState } from 'react';
import DefaultLayout from '@/layout/DefaultLayout';
import { useTranslation } from 'react-i18next';
import Claim from '@/api/Claim';
import KYC from '@/api/KYC';
import User from '@/api/User';
import Config from '@/api/Config';
import Loading from '@/components/Loading';
import ClaimModal from '@/components/ClaimModal';
import { ToastContainer, toast } from 'react-toastify';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { shortenWalletAddress } from '@/utils';

type ClaimHistoryItem = {
  _id: string;
  coin: 'HEWE' | 'USDT';
  amount: number;
  hash?: string;
  withdrawalType?: 'CRYPTO' | 'BANK';
  availableUsdtAfter?: number;
  tax?: number;
  fee?: number;
  exchangeRate?: number;
  receivedAmount?: number;
  createdAt: string;
};

export default function UserAssetsPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [loadingAssets, setLoadingAssets] = useState(true);
  const [loadingClaimHewe, setLoadingClaimHewe] = useState(false);
  const [loadingClaimUsdt, setLoadingClaimUsdt] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [history, setHistory] = useState<ClaimHistoryItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedCoin, setSelectedCoin] = useState<string>('ALL');

  // Assets state
  const [assets, setAssets] = useState({
    availableHewe: 0,
    availableUsdt: 0,
    totalHewe: 0,
    claimedHewe: 0,
    withdrawPending: 0,
    tier: 1,
    status: '',
    facetecTid: '',
    errLahCode: '',
    // Bank information
    accountName: '',
    accountNumber: '',
    bankCode: '',
    bankName: '',
  });
  const [limitAmountHewe, setLimitAmountHewe] = useState(0);

  // Calculate Reward HEWE
  const rewardHewe =
    assets.tier > 1
      ? 0
      : assets.totalHewe > 0
      ? assets.totalHewe - assets.claimedHewe
      : 0;

  // Fetch assets on component mount
  useEffect(() => {
    fetchAssets();
    fetchLimitAmountHewe();
  }, []);

  const fetchLimitAmountHewe = async () => {
    try {
      const response = await Config.getByLabel('LIMIT_AMOUNT_HEWE');
      if (response?.data?.value) {
        setLimitAmountHewe(Number(response.data.value));
      }
    } catch (error) {
      // Config không tồn tại hoặc lỗi, không ảnh hưởng
      console.log('LIMIT_AMOUNT_HEWE config not found or error:', error);
    }
  };

  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 when coin filter changes
  }, [selectedCoin]);

  useEffect(() => {
    fetchHistory();
  }, [currentPage, selectedCoin]);

  const fetchAssets = async () => {
    try {
      setLoadingAssets(true);
      const response = await User.getUserAssets();
      if (response?.data) {
        setAssets({
          availableHewe: response.data.availableHewe || 0,
          availableUsdt: response.data.availableUsdt || 0,
          totalHewe: response.data.totalHewe || 0,
          claimedHewe: response.data.claimedHewe || 0,
          withdrawPending: response.data.withdrawPending || 0,
          tier: response.data.tier || 1,
          status: response.data.status || '',
          facetecTid: response.data.facetecTid || '',
          errLahCode: response.data.errLahCode || '',
          // Bank information
          accountName: response.data.accountName || '',
          accountNumber: response.data.accountNumber || '',
          bankCode: response.data.bankCode || '',
          bankName: response.data.bankName || '',
        });
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to fetch assets',
      );
    } finally {
      setLoadingAssets(false);
    }
  };

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const coin = selectedCoin === 'ALL' ? '' : selectedCoin;
      const response = await Claim.user(currentPage, coin);
      if (response?.data) {
        setHistory(response.data.claims || []);
        setTotalPages(response.data.pages || 0);
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to fetch history',
      );
    } finally {
      setLoading(false);
    }
  };

  const claimHewe = async () => {
    setLoadingClaimHewe(true);
    await Claim.hewe()
      .then((response) => {
        toast.success(t(response.data.message) || 'Withdraw HEWE successful');
        setLoadingClaimHewe(false);
        // Refresh assets
        fetchAssets();
      })
      .catch((error) => {
        let message =
          error.response && error.response.data.error
            ? error.response.data.error
            : error.message;
        toast.error(t(message));
        setLoadingClaimHewe(false);
      });
  };

  const claimUsdt = async (
    amount: string,
    withdrawalType: string = 'BANK', // Mặc định là BANK, không cho phép CRYPTO
    exchangeRate: number | null = null,
  ) => {
    setLoadingClaimUsdt(true);
    await KYC.claim({ coin: 'usdt', amount, withdrawalType, exchangeRate })
      .then((response) => {
        if (response.data.url) {
          window.location.href = response.data.url;
        } else {
          toast.success(t('Withdraw request created successfully'));
          setLoadingClaimUsdt(false);
          setShowModal(false);
          // Refresh assets
          fetchAssets();
        }
      })
      .catch((error) => {
        let message =
          error.response && error.response.data.error
            ? error.response.data.error
            : error.message;
        toast.error(t(message));
        setLoadingClaimUsdt(false);
      });
  };

  const closeModal = () => {
    setShowModal(false);
  };

  // Check if can withdraw USDT
  const canWithdrawUsdt =
    !(assets.errLahCode === 'OVER45') &&
    assets.availableUsdt > 0 &&
    assets.status === 'APPROVED' &&
    assets.facetecTid !== '';

  // Check if can withdraw HEWE
  // Nếu có config giới hạn, chỉ cho phép rút khi availableHewe >= limitAmountHewe
  const canWithdrawHewe =
    assets.availableHewe > 0 &&
    (limitAmountHewe === 0 || assets.availableHewe >= limitAmountHewe);

  return (
    <DefaultLayout>
      <ToastContainer />
      <ClaimModal
        showModal={showModal}
        closeModal={closeModal}
        availableUsdt={assets.availableUsdt}
        claimUsdt={claimUsdt}
        loadingClaimUsdt={loadingClaimUsdt}
        userInfo={assets}
      />

      <div className="w-full max-w-6xl mx-auto px-10 py-24">
        <h1 className="text-2xl font-semibold mb-6">{t('My Assets')}</h1>

        {loadingAssets ? (
          <div className="flex justify-center py-8">
            <Loading />
          </div>
        ) : (
          <>
            {/* HEWE Section */}
            <div className="bg-[#FAFBFC] p-4 rounded-2xl flex 2xl:flex-row flex-col items-start 2xl:items-center xl:justify-between gap-8 mb-6">
              <div className="w-full flex gap-4 items-center justify-between lg:justify-center">
                <p className="font-medium">Available HEWE</p>
                <input
                  className="bg-black rounded-xl text-white p-2 flex-1"
                  readOnly
                  value={assets.availableHewe.toLocaleString()}
                />
              </div>
              <div className="w-full flex gap-4 items-center justify-between lg:justify-center">
                <p className="font-medium">Reward HEWE</p>
                <input
                  className="bg-black rounded-xl text-white p-2 flex-1"
                  readOnly
                  value={rewardHewe.toLocaleString()}
                />
              </div>
              <button
                className={`w-full border border-black rounded-2xl px-12 py-2 flex justify-center hover:bg-black hover:text-white ${
                  !canWithdrawHewe ? 'opacity-30' : ''
                }`}
                disabled={!canWithdrawHewe}
                onClick={claimHewe}
                title={
                  !canWithdrawHewe && limitAmountHewe > 0
                    ? `Minimum withdrawal amount is ${limitAmountHewe.toLocaleString()} HEWE. Your available balance is ${assets.availableHewe.toLocaleString()} HEWE.`
                    : ''
                }
              >
                {loadingClaimHewe && <Loading />}
                WITHDRAW HEWE
              </button>
            </div>

            {/* USDT Section */}
            <div className="bg-[#FAFBFC] p-4 rounded-2xl flex 2xl:flex-row flex-col items-start xl:items-center gap-8 mb-6">
              <div className="w-full flex gap-4 items-center justify-between lg:justify-center">
                <p className="font-medium">Available USDT</p>
                <input
                  className="bg-black rounded-xl text-white p-2 flex-1"
                  readOnly
                  value={assets.availableUsdt.toLocaleString()}
                />
              </div>
              <div className="w-full flex gap-4 items-center justify-between lg:justify-center">
                <p className="font-medium">Processing USDT</p>
                <input
                  className="bg-black rounded-xl text-white p-2 flex-1"
                  readOnly
                  value={assets.withdrawPending.toLocaleString()}
                />
              </div>
              <button
                className={`w-full border border-black rounded-2xl px-12 py-2 flex justify-center hover:bg-black hover:text-white ${
                  !canWithdrawUsdt ? 'opacity-30' : ''
                }`}
                disabled={!canWithdrawUsdt}
                onClick={() => setShowModal(true)}
              >
                WITHDRAW USDT
              </button>
            </div>

            {/* Withdraw History */}
            <div className="bg-[#FAFBFC] p-4 rounded-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">
                  {t('Withdraw History')}
                </h2>
                <Select value={selectedCoin} onValueChange={setSelectedCoin}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by coin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Coins</SelectItem>
                    <SelectItem value="HEWE">HEWE</SelectItem>
                    <SelectItem value="USDT">USDT</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <Loading />
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-600 border-b">
                          <th className="py-2 pr-4">{t('Time')}</th>
                          <th className="py-2 pr-4">{t('Coin')}</th>
                          <th className="py-2 pr-4">{t('Withdraw Amount')}</th>
                          <th className="py-2 pr-4">{t('Tax')}</th>
                          <th className="py-2 pr-4">{t('Transaction Fee')}</th>
                          <th className="py-2 pr-4">{t('Received Amount')}</th>
                          <th className="py-2 pr-4">
                            {t('Withdrawal Method')}
                          </th>
                          <th className="py-2 pr-4">{t('Status')}</th>
                          <th className="py-2 pr-4">{t('Tx Hash')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.length === 0 && (
                          <tr>
                            <td className="py-3 pr-4 text-gray-500" colSpan={9}>
                              {t('No withdraw records')}
                            </td>
                          </tr>
                        )}
                        {history.map((item) => {
                          // Determine if hash is a crypto transaction (starts with 0x)
                          const isCryptoHash =
                            item.hash && item.hash.startsWith('0x');
                          const withdrawalMethod =
                            item.withdrawalType ||
                            (isCryptoHash
                              ? 'CRYPTO'
                              : item.coin === 'USDT'
                              ? 'BANK'
                              : null);

                          // For BANK withdrawal: calculate amounts in VND
                          const isBank =
                            withdrawalMethod === 'BANK' && item.coin === 'USDT';
                          const exchangeRate = item.exchangeRate || 0;

                          // Calculate amounts - All values stored in USDT, calculate VND when displaying
                          const tax = item.tax || 0;
                          const fee = item.fee || 0;
                          const receivedAmount =
                            item.receivedAmount !== undefined
                              ? item.receivedAmount // Use value from backend (USDT)
                              : item.amount - tax - fee; // For both CRYPTO and BANK (USDT)

                          // Calculate VND values for BANK withdrawal display
                          const totalVND =
                            isBank && exchangeRate > 0
                              ? item.amount * exchangeRate
                              : 0;
                          const taxVND =
                            isBank && exchangeRate > 0 ? tax * exchangeRate : 0;
                          const feeVND =
                            isBank && exchangeRate > 0 ? fee * exchangeRate : 0;
                          const receivedAmountVND =
                            isBank && exchangeRate > 0
                              ? receivedAmount * exchangeRate
                              : 0;

                          return (
                            <tr key={item._id} className="border-b">
                              <td className="py-3 pr-4">
                                {new Date(item.createdAt).toLocaleString()}
                              </td>
                              <td className="py-3 pr-4">{item.coin}</td>
                              <td className="py-3 pr-4">
                                {isBank && exchangeRate > 0 ? (
                                  <div className="flex flex-col gap-1">
                                    <span className="font-medium">
                                      {Number(item.amount).toLocaleString()}{' '}
                                      USDT
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      ≈ {Number(totalVND).toLocaleString()} VND
                                    </span>
                                  </div>
                                ) : (
                                  <span className="font-medium">
                                    {Number(item.amount).toLocaleString()}{' '}
                                    {item.coin}
                                  </span>
                                )}
                              </td>
                              <td className="py-3 pr-4">
                                {tax > 0 ? (
                                  <span className="text-red-600">
                                    -
                                    {isBank && exchangeRate > 0
                                      ? Math.floor(taxVND).toLocaleString()
                                      : Number(tax).toLocaleString()}{' '}
                                    {isBank ? 'VND' : item.coin}
                                  </span>
                                ) : (
                                  '-'
                                )}
                              </td>
                              <td className="py-3 pr-4">
                                {fee > 0 ? (
                                  <span className="text-red-600">
                                    -
                                    {isBank && exchangeRate > 0
                                      ? Math.floor(feeVND).toLocaleString()
                                      : Number(fee).toLocaleString()}{' '}
                                    {isBank ? 'VND' : item.coin}
                                  </span>
                                ) : (
                                  '-'
                                )}
                              </td>
                              <td className="py-3 pr-4">
                                <span className="font-semibold text-green-600">
                                  {isBank && exchangeRate > 0
                                    ? Math.floor(
                                        receivedAmountVND,
                                      ).toLocaleString()
                                    : Number(
                                        receivedAmount,
                                      ).toLocaleString()}{' '}
                                  {isBank ? 'VND' : item.coin}
                                </span>
                              </td>
                              <td className="py-3 pr-4">
                                {withdrawalMethod ? (
                                  <span className="px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700">
                                    {withdrawalMethod === 'CRYPTO'
                                      ? t('Crypto Wallet')
                                      : t('Bank Transfer')}
                                  </span>
                                ) : (
                                  '-'
                                )}
                              </td>
                              <td className="py-3 pr-4">
                                <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-700">
                                  SUCCESS
                                </span>
                              </td>
                              <td className="py-3 pr-4">
                                {item.hash ? (
                                  isCryptoHash ? (
                                    <a
                                      href={`https://bscscan.com/tx/${item.hash}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-blue-600 hover:text-blue-800 underline truncate inline-block max-w-[220px] align-bottom"
                                    >
                                      {shortenWalletAddress(item.hash, 12)}
                                    </a>
                                  ) : (
                                    <span className="truncate inline-block max-w-[220px] align-bottom">
                                      {item.hash}
                                    </span>
                                  )
                                ) : (
                                  '-'
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-4">
                      <button
                        className="px-3 py-1 border rounded disabled:opacity-50"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => p - 1)}
                      >
                        Previous
                      </button>
                      <span className="px-3 py-1">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        className="px-3 py-1 border rounded disabled:opacity-50"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((p) => p + 1)}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </DefaultLayout>
  );
}
