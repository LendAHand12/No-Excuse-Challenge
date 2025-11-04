import { useCallback, useEffect, useState } from 'react';

import Claim from '@/api/Claim';
import Loading from '@/components/Loading';
import NoContent from '@/components/NoContent';
import transStatus from '@/constants/transStatus';
import { useTranslation } from 'react-i18next';
import { ToastContainer, toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
// import { shortenWalletAddress } from "@/utils";
import DefaultLayout from '../../../layout/DefaultLayout';
import { shortenWalletAddress } from '../../../utils';
import { useSelector } from 'react-redux';
import CustomPagination from '../../../components/CustomPagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const AdminClaimsPage = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const key = searchParams.get('keyword') || '';
  const page = searchParams.get('page') || 1;
  const [keyword, setKeyword] = useState(key);
  const coin = searchParams.get('coin') || '';
  const [selectedCoin, setSelectedCoin] = useState(coin || 'ALL');
  const [totalPage, setTotalPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [objectFilter, setObjectFilter] = useState({
    pageNumber: page,
    coin: coin === 'ALL' ? '' : coin,
    keyword: key,
  });

  const onSearch = (e) => {
    setKeyword(e.target.value);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { pageNumber, coin, keyword } = objectFilter;
      await Claim.list(pageNumber, coin, keyword)
        .then((response) => {
          const { claims, pages } = response.data;
          setData(claims);
          setTotalPage(pages);
          setLoading(false);
          pushParamsToUrl(pageNumber, coin);
        })
        .catch((error) => {
          let message =
            error.response && error.response.data.message
              ? error.response.data.message
              : error.message;
          toast.error(t(message));
          setLoading(false);
        });
    })();
  }, [objectFilter]);

  const pushParamsToUrl = (pageNumber, coin) => {
    const searchParams = new URLSearchParams();
    if (pageNumber) {
      searchParams.set('page', pageNumber);
    }
    if (coin) {
      searchParams.set('coin', coin);
    }
    const queryString = searchParams.toString();
    const url = queryString ? `/admin/claims?${queryString}` : '/admin/claims';
    navigate(url);
  };

  const onChangeCoin = useCallback(
    (value) => {
      const coinValue = value === 'ALL' ? '' : value;
      setSelectedCoin(value);
      setObjectFilter({
        ...objectFilter,
        pageNumber: 1,
        coin: coinValue,
      });
    },
    [objectFilter],
  );

  const handleChangePage = useCallback(
    (page) =>
      setObjectFilter({
        ...objectFilter,
        pageNumber: page,
      }),
    [objectFilter],
  );

  const handleExportClaims = async () => {
    navigate('/admin/claims/export');
  };

  const handleSearch = useCallback(() => {
    setObjectFilter({ ...objectFilter, keyword, pageNumber: 1 });
  }, [keyword, objectFilter]);

  return (
    <DefaultLayout>
      <ToastContainer />
      <div className="py-24 px-10">
        <div className="bg-[#FAFBFC] p-4 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Select value={selectedCoin} onValueChange={onChangeCoin}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by coin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Coins</SelectItem>
                  <SelectItem value="HEWE">HEWE</SelectItem>
                  <SelectItem value="USDT">USDT</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-500"
                    aria-hidden="true"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    onChange={onSearch}
                    className="block p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50"
                    placeholder={t('search with user name or email')}
                    defaultValue={objectFilter.keyword}
                  />
                  <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="h-8 flex text-xs justify-center items-center hover:underline bg-black text-NoExcuseChallenge font-bold rounded-full py-1 px-4 shadow-lg focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out"
                  >
                    {t('search')}
                  </button>
                </div>
              </div>
            </div>

            {userInfo?.permissions
              ?.find((p) => p.page.path === '/admin/claims')
              ?.actions.includes('export') && (
              <div>
                <button
                  onClick={handleExportClaims}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white text-sm rounded-md hover:opacity-70"
                >
                  <svg
                    fill="currentColor"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M8.71,7.71,11,5.41V15a1,1,0,0,0,2,0V5.41l2.29,2.3a1,1,0,0,0,1.42,0,1,1,0,0,0,0-1.42l-4-4a1,1,0,0,0-.33-.21,1,1,0,0,0-.76,0,1,1,0,0,0-.33.21l-4,4A1,1,0,1,0,8.71,7.71ZM21,14a1,1,0,0,0-1,1v4a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V15a1,1,0,0,0-2,0v4a3,3,0,0,0,3,3H19a3,3,0,0,0,3-3V15A1,1,0,0,0,21,14Z" />
                  </svg>
                  Export Data
                </button>
              </div>
            )}
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
                      <th className="py-2 pr-4">{t('Claimer')}</th>
                      <th className="py-2 pr-4">{t('Withdraw Amount')}</th>
                      <th className="py-2 pr-4">{t('Tax')}</th>
                      <th className="py-2 pr-4">{t('Transaction Fee')}</th>
                      <th className="py-2 pr-4">{t('Received Amount')}</th>
                      <th className="py-2 pr-4">{t('Withdrawal Method')}</th>
                      <th className="py-2 pr-4">{t('Status')}</th>
                      <th className="py-2 pr-4">{t('Tx Hash')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.length === 0 && (
                      <tr>
                        <td className="py-3 pr-4 text-gray-500" colSpan={10}>
                          {t('No withdraw records')}
                        </td>
                      </tr>
                    )}
                    {data.map((item) => {
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
                          <td className="py-3 pr-4">
                            <div className="flex flex-col gap-1">
                              <span className="font-semibold">
                                {item.userInfo?.userId || '-'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {item.userInfo?.email || '-'}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 pr-4">
                            {isBank && exchangeRate > 0 ? (
                              <div className="flex flex-col gap-1">
                                <span className="font-medium">
                                  {Number(item.amount).toLocaleString()} USDT
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
                                ? Math.floor(receivedAmountVND).toLocaleString()
                                : Number(receivedAmount).toLocaleString()}{' '}
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
              {!loading && data.length > 0 && (
                <CustomPagination
                  currentPage={parseInt(objectFilter.pageNumber)}
                  totalPages={totalPage}
                  onPageChange={handleChangePage}
                />
              )}
            </>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default AdminClaimsPage;
