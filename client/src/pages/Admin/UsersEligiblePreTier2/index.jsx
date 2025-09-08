import { useCallback, useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';
import User from '@/api/User';
import PreTier2 from '@/api/PreTier2';
import { ToastContainer, toast } from 'react-toastify';
import NoContent from '@/components/NoContent';
import Loading from '@/components/Loading';
import CustomPagination from '@/components/CustomPagination';
import { useNavigate, useLocation } from 'react-router-dom';
import DefaultLayout from '@/layout/DefaultLayout';
import Modal from 'react-modal';
import { shortenWalletAddress } from '@/utils';
import { useSelector } from 'react-redux';

const AdminEligiblePreTier2UsersPages = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const key = searchParams.get('keyword') || '';
  const page = searchParams.get('page') || 1;
  const status = searchParams.get('status') || 'all';
  const [totalPage, setTotalPage] = useState(0);
  const [keyword, setKeyword] = useState(key);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [objectFilter, setObjectFilter] = useState({
    pageNumber: page,
    keyword: key,
    status,
  });
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [currentApproveId, setCurrentApproveId] = useState('');

  const closeModal = () => {
    setShowApproveModal(false);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { pageNumber, keyword, status } = objectFilter;
      await User.getAllUsersPreTier2(pageNumber, keyword, status)
        .then((response) => {
          const { users, pages } = response.data;
          setData(users);
          setTotalPage(pages);
          setLoading(false);
          pushParamsToUrl(pageNumber, keyword, status);
        })
        .catch((error) => {
          let message =
            error.response && error.response.data.error
              ? error.response.data.error
              : error.message;
          toast.error(t(message));
          setLoading(false);
        });
    })();
  }, [objectFilter, refresh]);

  const onSearch = (e) => {
    setKeyword(e.target.value);
  };

  const pushParamsToUrl = (pageNumber, searchKey, searchStatus) => {
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
    const queryString = searchParams.toString();
    const url = queryString
      ? `/admin/eligible-pre-tier-2?${queryString}`
      : '/admin/eligible-pre-tier-2';
    navigate(url);
  };

  const handleDetail = (id) => {
    navigate(`/admin/users/${id}`);
  };

  const handleTree = (id) => {
    navigate(`/admin/system/${id}`);
  };

  const handleChangePage = useCallback(
    (page) => setObjectFilter({ ...objectFilter, pageNumber: page }),
    [objectFilter],
  );

  const handleSearch = useCallback(() => {
    setObjectFilter({ ...objectFilter, keyword, pageNumber: 1 });
  }, [keyword, objectFilter]);

  const handleApprove = async (userId) => {
    setCurrentApproveId(userId);
    setShowApproveModal(true);
  };

  const handleApproveUser = useCallback(async () => {
    await PreTier2.approve(currentApproveId)
      .then((response) => {
        toast.success(t(response.data.message));
        setShowApproveModal(false);
        setRefresh(!refresh);
      })
      .catch((error) => {
        let message =
          error.response && error.response.data.error
            ? error.response.data.error
            : error.message;
        toast.error(t(message));
        setLoading(false);
      });
  }, [currentApproveId]);

  const onChangeStatus = useCallback(
    (e) =>
      setObjectFilter({
        ...objectFilter,
        status: e.target.value,
        pageNumber: 1,
      }),
    [objectFilter],
  );

  return (
    <DefaultLayout>
      <ToastContainer />
      <Modal
        isOpen={showApproveModal}
        onRequestClose={closeModal}
        style={{
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
          },
        }}
      >
        <div className="overflow-y-auto overflow-x-hidden justify-center items-center w-full md:inset-0 h-modal md:h-full">
          <div className="relative w-full max-w-md h-full md:h-auto">
            <div className="relative text-center bg-white rounded-lg sm:p-5">
              <button
                onClick={closeModal}
                className="text-gray-400 absolute top-0 right-2 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
              >
                <svg
                  aria-hidden="true"
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
              <p className="mb-4 text-gray-500">
                Are you sure you want to approve this user to Pre-Tier 2?
              </p>
              <div className="flex justify-center items-center space-x-4">
                <button
                  onClick={closeModal}
                  className="py-2 px-3 text-sm font-medium text-gray-500 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-primary-300 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
                >
                  No, cancel
                </button>
                <button
                  onClick={handleApproveUser}
                  className="py-2 px-3 text-sm font-medium text-center text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 dark:bg-red-500 dark:hover:bg-red-600 dark:focus:ring-red-900"
                >
                  Yes, I'm sure
                </button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
      <div className="relative overflow-x-auto py-24 px-10">
        <div className="flex items-center justify-between pb-4 bg-white">
          <div className="flex gap-4">
            <div>
              <select
                className="block p-2 pr-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none active:outline-none"
                onChange={onChangeStatus}
                defaultValue={objectFilter.status}
                disabled={loading}
              >
                <option value="all">All</option>
                {[
                  { status: 'PENDING', color: 'bg-yellow-600' },
                  { status: 'APPROVED', color: 'bg-green-600' },
                  { status: 'ACHIEVED', color: 'bg-blue-600' },
                ].map((status) => (
                  <option value={status.status} key={status.status}>
                    {status.status}
                  </option>
                ))}
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
                  placeholder={t('search with user name or email or wallet')}
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
        </div>
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">
                Username
              </th>
              <th scope="col" className="px-6 py-3">
                Wallet Address
              </th>
              <th scope="col" className="px-6 py-3">
                {t('status')}
              </th>
              <th scope="col" className="px-6 py-3">
                Eligible Time
              </th>
              <th scope="col" className="px-6 py-3">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 &&
              !loading &&
              data.map((ele) => (
                <tr
                  className="bg-white border-b hover:bg-gray-50"
                  key={ele._id}
                >
                  <th
                    scope="row"
                    className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap "
                  >
                    <div className="">
                      <div className="text-base font-semibold">
                        {ele.userId}
                      </div>
                      <div className="font-normal text-gray-500">{ele._id}</div>
                    </div>
                  </th>
                  <td className="px-6 py-4">
                    {shortenWalletAddress(ele.walletAddress, 12)}
                  </td>
                  <td className="px-6 py-4">
                    <div
                      className={`max-w-fit text-white rounded-sm py-1 px-2 text-sm ${
                        [
                          { status: 'PENDING', color: 'bg-yellow-600' },
                          { status: 'APPROVED', color: 'bg-green-600' },
                          { status: 'ACHIEVED', color: 'bg-blue-600' },
                        ].find((item) => item.status === ele.preTier2Status)
                          .color
                      } mr-2`}
                    >
                      {ele.preTier2Status}
                    </div>
                  </td>
                  <td className="px-6 py-4">{ele.timeOkPreTier2}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-6">
                      {ele.status !== 'DELETED' &&
                        userInfo?.permissions
                          .find(
                            (p) => p.page.pageName === 'admin-users-details',
                          )
                          ?.actions.includes('read') && (
                          <button
                            onClick={() => handleDetail(ele._id)}
                            className="font-medium text-gray-500 hover:text-NoExcuseChallenge"
                          >
                            <svg
                              fill="currentColor"
                              className="w-6 h-auto"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M21.92,11.6C19.9,6.91,16.1,4,12,4S4.1,6.91,2.08,11.6a1,1,0,0,0,0,.8C4.1,17.09,7.9,20,12,20s7.9-2.91,9.92-7.6A1,1,0,0,0,21.92,11.6ZM12,18c-3.17,0-6.17-2.29-7.9-6C5.83,8.29,8.83,6,12,6s6.17,2.29,7.9,6C18.17,15.71,15.17,18,12,18ZM12,8a4,4,0,1,0,4,4A4,4,0,0,0,12,8Zm0,6a2,2,0,1,1,2-2A2,2,0,0,1,12,14Z" />
                            </svg>
                          </button>
                        )}

                      {ele.status !== 'DELETED' &&
                        userInfo?.permissions
                          .find((p) => p.page.pageName === 'admin-system')
                          ?.actions.includes('read') && (
                          <button
                            onClick={() => handleTree(ele._id)}
                            className="font-medium text-gray-500 hover:text-NoExcuseChallenge"
                          >
                            <svg
                              className="w-6 h-auto"
                              viewBox="0 0 48 48"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <rect
                                width="48"
                                height="48"
                                fill="white"
                                fillOpacity="0.01"
                              />
                              <path
                                d="M13.0448 14C13.5501 8.3935 18.262 4 24 4C29.738 4 34.4499 8.3935 34.9552 14H35C39.9706 14 44 18.0294 44 23C44 27.9706 39.9706 32 35 32H13C8.02944 32 4 27.9706 4 23C4 18.0294 8.02944 14 13 14H13.0448Z"
                                stroke="currentColor"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M24 28L29 23"
                                stroke="currentColor"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M24 25L18 19"
                                stroke="currentColor"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M24 44V18"
                                stroke="currentColor"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                        )}

                      {ele.preTier2Status === 'PENDING' &&
                        userInfo?.permissions
                          .find(
                            (p) => p.page.pageName === 'admin-user-pre-tier-2',
                          )
                          ?.actions.includes('update') && (
                          <button
                            onClick={() => handleApprove(ele._id)}
                            className="font-medium text-gray-500 hover:text-NoExcuseChallenge"
                          >
                            <svg
                              fill="currentColor"
                              width="24"
                              height="24"
                              viewBox="0 -4.5 33 33"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="m0 10.909 4.364-4.364 8.727 8.727 15.273-15.273 4.364 4.364-19.636 19.636z" />
                            </svg>
                          </button>
                        )}
                    </div>
                  </td>
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
            currentPage={objectFilter.pageNumber}
            totalPages={totalPage}
            onPageChange={handleChangePage}
          />
        )}
      </div>
    </DefaultLayout>
  );
};

export default AdminEligiblePreTier2UsersPages;
