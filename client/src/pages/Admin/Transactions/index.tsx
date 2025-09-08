import { useCallback, useEffect, useState } from 'react';

import Payment from '@/api/Payment';
import Loading from '@/components/Loading';
import NoContent from '@/components/NoContent';
import transStatus from '@/constants/transStatus';
import { useTranslation } from 'react-i18next';
import { ToastContainer, toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
// import { shortenWalletAddress } from "@/utils";
import DefaultLayout from '../../../layout/DefaultLayout';
import { useSelector } from 'react-redux';
import CustomPagination from '../../../components/CustomPagination';

const AdminTransactionsPage = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const key = searchParams.get('keyword') || '';
  const page = searchParams.get('page') || 1;
  const status = searchParams.get('status') || 'ALL';
  const paramsTier = searchParams.get('tier') || 1;
  const [totalPage, setTotalPage] = useState(0);
  const [keyword, setKeyword] = useState(key);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [objectFilter, setObjectFilter] = useState({
    pageNumber: page,
    keyword: key,
    status,
    tier: parseInt(paramsTier),
  });

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { pageNumber, keyword, status, tier } = objectFilter;
      await Payment.getAllPayments(pageNumber, keyword, status, tier)
        .then((response) => {
          const { payments, pages } = response.data;
          setData(payments);
          setTotalPage(pages);
          setLoading(false);
          pushParamsToUrl(pageNumber, keyword, status, tier);
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

  const pushParamsToUrl = (pageNumber, searchKey, searchStatus, tier) => {
    const searchParams = new URLSearchParams();
    if (searchKey) {
      searchParams.set('keyword', searchKey);
    }
    if (pageNumber) {
      searchParams.set('page', pageNumber);
    }
    if (searchStatus) {
      searchParams.set('status', searchStatus);
    }
    if (tier) {
      searchParams.set('tier', tier);
    }
    const queryString = searchParams.toString();
    const url = queryString
      ? `/admin/transactions?${queryString}`
      : '/admin/transactions';
    navigate(url);
  };

  const onChangeStatus = useCallback(
    (e) =>
      setObjectFilter({
        ...objectFilter,
        pageNumber: 1,
        status: e.target.value,
      }),
    [objectFilter],
  );

  const onSearch = (e) => {
    setTimeout(() => {
      setKeyword(e.target.value);
    }, 1000);
  };

  const handleChangePage = useCallback(
    (page) =>
      setObjectFilter({
        ...objectFilter,
        pageNumber: page,
      }),
    [objectFilter],
  );

  const handleRowClick = (id) => {
    userInfo?.permissions
      .find((p) => p.page.pageName === 'admin-transactions-details')
      ?.actions.includes('read') && navigate(`/admin/transactions/${id}`);
  };

  const handleSearch = useCallback(() => {
    setObjectFilter({
      ...objectFilter,
      pageNumber: 1,
      keyword,
    });
  }, [keyword, objectFilter]);

  const handleChangeTier = useCallback(
    (newTier) => {
      setObjectFilter({
        ...objectFilter,
        pageNumber: 1,
        tier: newTier,
      });
    },
    [objectFilter],
  );

  const handleExportTrans = async () => {
    navigate('/admin/transaction/export');
  };

  return (
    <DefaultLayout>
      <ToastContainer />
      <div className="py-24 px-10">
        <div className="flex items-center gap-4">
          {[...Array(5)].map((item, i) => (
            <button
              key={i}
              onClick={() => handleChangeTier(i + 1)}
              className={`flex justify-center items-center hover:underline font-medium ${
                parseInt(objectFilter.tier) === i + 1
                  ? 'bg-black text-NoExcuseChallenge'
                  : ''
              } rounded-full py-4 px-8 border focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out`}
            >
              {t('tier')} {i + 1}
            </button>
          ))}
        </div>
        <div className="relative overflow-x-auto py-10">
          <div className="flex items-center justify-between pb-4 bg-white">
            <div className="flex items-center gap-2">
              <div>
                <select
                  className="block p-2 pr-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none active:outline-none"
                  onChange={onChangeStatus}
                  defaultValue={objectFilter.status}
                >
                  <option value="ALL" key="ALL">
                    All
                  </option>
                  <option value="REGISTER" key="REGISTER">
                    Membership
                  </option>
                  <option value="COMPANY" key="COMPANY">
                    Hewe
                  </option>
                  <option value="PIG" key="PIG">
                    DreamPool
                  </option>
                  <option value="KYC" key="KYC">
                    KYC Fee
                  </option>
                  <option value="DIRECT" key="DIRECT">
                    {t('DIRECT')}{' '}
                  </option>
                  <option value="REFERRAL" key="REFERRAL">
                    {t('REFERRAL')}{' '}
                  </option>
                  <option value="FINE" key="FINE">
                    {t('FINE')}{' '}
                  </option>
                  <option value="HOLD" key="HOLD">
                    {t('HOLD')}{' '}
                  </option>
                </select>
              </div>
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
                    placeholder={t('search with user ref code')}
                    defaultValue={objectFilter.keyword}
                  />
                  <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="h-8 flex text-xs justify-center items-center hover:underline text-black font-medium rounded-full py-1 px-4 border focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out"
                  >
                    {t('search')}
                  </button>
                </div>
              </div>
            </div>
            {userInfo?.permissions
              ?.find((p) => p.page.path === '/admin/transactions')
              ?.actions.includes('export') && (
              <div>
                <button
                  onClick={handleExportTrans}
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
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">
                  {t('send')}
                </th>
                {objectFilter.status !== 'REGISTER' &&
                  objectFilter.status !== 'FINE' && (
                    <>
                      <th scope="col" className="px-6 py-3">
                        {t('receive')}
                      </th>
                      <th scope="col" className="px-6 py-3">
                        {t('count pay')}
                      </th>
                    </>
                  )}
                <th scope="col" className="px-6 py-3">
                  {t('tier')}
                </th>
                <th scope="col" className="px-6 py-3">
                  {t('amount')}
                </th>
                <th scope="col" className="px-6 py-3">
                  {t('type')}
                </th>
                <th scope="col" className="px-6 py-3">
                  {t('time')}
                </th>
                {objectFilter.status === 'HOLD' && (
                  <th scope="col" className="px-6 py-3">
                    {t('refundStatus')}
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {data.length > 0 &&
                !loading &&
                data.map((ele) => (
                  <tr
                    className="bg-white border-b hover:bg-gray-50"
                    key={ele._id}
                    onClick={() => handleRowClick(ele._id)}
                  >
                    <th
                      scope="row"
                      className="px-6 py-4 text-gray-900 whitespace-nowrap "
                    >
                      <div className="">
                        <div className="text-base font-semibold">
                          {ele.userId}{' '}
                        </div>
                        <div className="font-normal text-gray-500">
                          {ele.email}
                        </div>
                      </div>
                    </th>
                    {objectFilter.searchStatus !== 'REGISTER' &&
                      objectFilter.searchStatus !== 'FINE' && (
                        <>
                          <td className="px-6 py-4">
                            {ele.type === 'REGISTER' ? (
                              'Registration Fee'
                            ) : ele.type === 'PIG' ? (
                              'DreamPool'
                            ) : ele.type === 'PRETIER2' ? (
                              'Pre-Tier 2 Pool'
                            ) : ele.type === 'COMPANY' ? (
                              'Purchase HEWE'
                            ) : ele.type === 'KYC' ? (
                              'Amfatec KYC'
                            ) : (
                              <div className="">
                                <div className="text-base flex items-center gap-2 font-semibold">
                                  {ele.userReceiveId}{' '}
                                  <div
                                    className={`w-4 h-4 rounded-full ${
                                      ele.isOk && ele.isOk === true
                                        ? 'bg-green-500'
                                        : ele.isOk && ele.isOk === false
                                        ? 'bg-red-500'
                                        : ''
                                    }`}
                                  ></div>
                                </div>
                                <div className="font-normal text-gray-500">
                                  {ele.userReceiveEmail}
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {ele.userCountPay} {t('times')}
                          </td>
                        </>
                      )}
                    <td className="px-6 py-4">{ele.tier}</td>
                    {/* <td className="px-6 py-4 text-blue-600">
                    <a
                      href={`https://bscscan.com/tx/${ele.hash}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {shortenWalletAddress(ele.hash)}
                    </a>
                  </td> */}

                    <td className="px-6 py-4">{ele.amount} USDT</td>
                    <td className="px-6 py-4">
                      <div
                        className={`max-w-fit text-white rounded-sm py-1 px-2 text-sm ${
                          transStatus.find((item) => item.status === ele.type)
                            .color
                        } mr-2`}
                      >
                        {t(ele.type)}
                      </div>
                    </td>
                    <td className="px-6 py-4">{ele.createdAt}</td>
                    {objectFilter.status === 'HOLD' && (
                      <td className="px-6 py-4">
                        <div
                          className={`max-w-fit text-white rounded-sm py-1 px-2 text-sm ${
                            ele.isHoldRefund ? 'bg-green-500' : 'bg-red-500'
                          } mr-2`}
                        >
                          {ele.isHoldRefund ? t('refunded') : t('not refunded')}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
          {loading && (
            <div className="w-full flex justify-center my-4">
              <Loading />
            </div>
          )}
          {!loading && data.length === 0 && <NoContent />}
          {!loading && data.length > 0 && (
            <CustomPagination
              currentPage={parseInt(objectFilter.pageNumber)}
              totalPages={totalPage}
              onPageChange={handleChangePage}
            />
          )}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default AdminTransactionsPage;
