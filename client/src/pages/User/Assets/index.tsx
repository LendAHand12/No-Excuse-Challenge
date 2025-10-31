import { useEffect, useState } from 'react';
import DefaultLayout from '@/layout/DefaultLayout';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import Claim from '@/api/Claim';
import KYC from '@/api/KYC';
import Loading from '@/components/Loading';
import ClaimModal from '@/components/ClaimModal';
import { ToastContainer, toast } from 'react-toastify';

type ClaimHistoryItem = {
  _id: string;
  coin: 'HEWE' | 'USDT';
  amount: number;
  hash?: string;
  createdAt: string;
};

export default function UserAssetsPage() {
  const { t } = useTranslation();
  const { userInfo } = useSelector((state: any) => state.auth);
  const [loading, setLoading] = useState(false);
  const [loadingClaimHewe, setLoadingClaimHewe] = useState(false);
  const [loadingClaimUsdt, setLoadingClaimUsdt] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [history, setHistory] = useState<ClaimHistoryItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const {
    availableHewe = 0,
    availableUsdt = 0,
    totalHewe = 0,
    claimedHewe = 0,
    withdrawPending = 0,
    tier = 1,
    status = '',
    facetecTid = '',
    errLahCode = '',
  } = userInfo || {};

  // Calculate Reward HEWE
  const rewardHewe = tier > 1 ? 0 : totalHewe > 0 ? totalHewe - claimedHewe : 0;

  useEffect(() => {
    fetchHistory();
  }, [currentPage]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await Claim.user(currentPage, '');
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
        // Refresh user info
        window.location.reload();
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

  const claimUsdt = async (amount: string) => {
    setLoadingClaimUsdt(true);
    await KYC.claim({ coin: 'usdt', amount })
      .then((response) => {
        if (response.data.url) {
          window.location.href = response.data.url;
        } else {
          toast.success(t('Withdraw request created successfully'));
          setLoadingClaimUsdt(false);
          setShowModal(false);
          // Refresh user info
          window.location.reload();
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
    !(errLahCode === 'OVER45') &&
    availableUsdt > 0 &&
    status === 'APPROVED' &&
    facetecTid !== '';

  return (
    <DefaultLayout>
      <ToastContainer />
      <ClaimModal
        showModal={showModal}
        closeModal={closeModal}
        availableUsdt={availableUsdt}
        claimUsdt={claimUsdt}
        loadingClaimUsdt={loadingClaimUsdt}
      />

      <div className="w-full max-w-7xl mx-auto px-4 py-24">
        <h1 className="text-2xl font-semibold mb-6">{t('My Assets')}</h1>

        {/* HEWE Section */}
        <div className="bg-[#FAFBFC] p-4 rounded-2xl flex 2xl:flex-row flex-col items-start 2xl:items-center xl:justify-between gap-8 mb-6">
          <div className="w-full flex gap-4 items-center justify-between lg:justify-center">
            <p className="font-medium">Available HEWE</p>
            <input
              className="bg-black rounded-xl text-NoExcuseChallenge p-2 flex-1"
              readOnly
              value={availableHewe.toLocaleString()}
            />
          </div>
          <div className="w-full flex gap-4 items-center justify-between lg:justify-center">
            <p className="font-medium">Reward HEWE</p>
            <input
              className="bg-black rounded-xl text-NoExcuseChallenge p-2 flex-1"
              readOnly
              value={rewardHewe.toLocaleString()}
            />
          </div>
          <button
            className={`w-full border border-black rounded-2xl px-12 py-2 flex justify-center hover:bg-black hover:text-white ${
              availableHewe === 0 ? 'opacity-30' : ''
            }`}
            disabled={availableHewe === 0}
            onClick={claimHewe}
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
              className="bg-black rounded-xl text-NoExcuseChallenge p-2 flex-1"
              readOnly
              value={availableUsdt.toLocaleString()}
            />
          </div>
          <div className="w-full flex gap-4 items-center justify-between lg:justify-center">
            <p className="font-medium">Processing USDT</p>
            <input
              className="bg-black rounded-xl text-NoExcuseChallenge p-2 flex-1"
              readOnly
              value={withdrawPending.toLocaleString()}
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
          <h2 className="text-lg font-semibold mb-4">
            {t('Withdraw History')}
          </h2>

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
                      <th className="py-2 pr-4">{t('Amount')}</th>
                      <th className="py-2 pr-4">{t('Status')}</th>
                      <th className="py-2 pr-4">{t('Tx Hash')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.length === 0 && (
                      <tr>
                        <td className="py-3 pr-4 text-gray-500" colSpan={5}>
                          {t('No withdraw records')}
                        </td>
                      </tr>
                    )}
                    {history.map((item) => (
                      <tr key={item._id} className="border-b">
                        <td className="py-3 pr-4">
                          {new Date(item.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3 pr-4">{item.coin}</td>
                        <td className="py-3 pr-4">
                          {Number(item.amount).toLocaleString()}
                        </td>
                        <td className="py-3 pr-4">
                          <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-700">
                            SUCCESS
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
      </div>
    </DefaultLayout>
  );
}
