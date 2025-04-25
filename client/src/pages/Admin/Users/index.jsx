import { useCallback, useEffect, useState } from 'react';

import userStatus from '@/constants/userStatus';
import { useTranslation } from 'react-i18next';
import User from '@/api/User';
import { ToastContainer, toast } from 'react-toastify';
import NoContent from '@/components/NoContent';
import Loading from '@/components/Loading';
import { useNavigate, useLocation } from 'react-router-dom';
import DefaultLayout from '@/layout/DefaultLayout';
import Modal from 'react-modal';
import { shortenWalletAddress } from '@/utils';
import { useSelector } from 'react-redux';

const AdminUserPages = () => {
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentDeleteId, setCurrentDeleteId] = useState('');
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [currentKYCId, setCurrentKYCId] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [rejectReasonError, setRejectReasonError] = useState(false);

  const openModal = () => {
    setShowDeleteModal(true);
  };

  const closeModal = () => {
    setShowDeleteModal(false);
  };

  const openKYCModal = () => {
    setShowKYCModal(true);
  };

  const closeKYCModal = () => {
    setShowKYCModal(false);
  };

  const onRejectReasonChange = (e) => {
    setRejectReason(e.target.value);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { pageNumber, keyword, status } = objectFilter;
      await User.getAllUsers(pageNumber, keyword, status)
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

  const onChangeStatus = useCallback(
    (e) =>
      setObjectFilter({
        ...objectFilter,
        status: e.target.value,
        pageNumber: 1,
      }),
    [objectFilter],
  );

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
    const url = queryString ? `/admin/users?${queryString}` : '/admin/users';
    navigate(url);
  };

  const handleApprove = (id) => {
    setCurrentKYCId(id);
    setShowKYCModal(true);
  };

  const handleApproveUser = useCallback(async () => {
    await User.changeStatus({ id: currentKYCId, status: 'APPROVED' })
      .then((response) => {
        const { message } = response.data;
        setShowKYCModal(false);
        setRefresh(!refresh);
        toast.success(t(message));
      })
      .catch((error) => {
        let message =
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message;
        toast.error(t(message));
      });
  }, [currentKYCId]);

  const handleRejectUser = useCallback(async () => {
    if (!rejectReason) {
      setRejectReasonError(true);
    } else {
      await User.changeStatus({
        id: currentKYCId,
        status: 'REJECTED',
        reason: rejectReason,
      })
        .then((response) => {
          const { message } = response.data;
          setRefresh(!refresh);
          toast.success(t(message));
          setShowKYCModal(false);
        })
        .catch((error) => {
          let message =
            error.response && error.response.data.message
              ? error.response.data.message
              : error.message;
          toast.error(t(message));
        });
    }
  }, [currentKYCId, rejectReason]);

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

  const handleDelete = async (userId) => {
    setCurrentDeleteId(userId);
    setShowDeleteModal(true);
  };

  const handleDeleteUser = useCallback(async () => {
    await User.deleteUserById(currentDeleteId)
      .then((response) => {
        toast.success(t(response.data.message));
        setShowDeleteModal(false);
      })
      .catch((error) => {
        let message =
          error.response && error.response.data.error
            ? error.response.data.error
            : error.message;
        toast.error(t(message));
        setLoading(false);
      });
  }, [currentDeleteId]);

  const handleExportUsers = async () => {
    navigate('/admin/user/export');
  };

  return (
    <DefaultLayout>
      <ToastContainer />
      <Modal
        isOpen={showDeleteModal}
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
                className="text-gray-400 absolute top-2.5 right-2.5 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
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
              <svg
                className="text-gray-400 w-11 h-11 mb-3.5 mx-auto"
                aria-hidden="true"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                ></path>
              </svg>
              <p className="mb-4 text-gray-500 dark:text-gray-300">
                Are you sure you want to delete this user?
              </p>
              <div className="flex justify-center items-center space-x-4">
                <button
                  onClick={closeModal}
                  className="py-2 px-3 text-sm font-medium text-gray-500 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-primary-300 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
                >
                  No, cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  className="py-2 px-3 text-sm font-medium text-center text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 dark:bg-red-500 dark:hover:bg-red-600 dark:focus:ring-red-900"
                >
                  Yes, I'm sure
                </button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={showKYCModal}
        onRequestClose={closeKYCModal}
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
                onClick={closeKYCModal}
                className="text-gray-400 absolute top-2.5 right-2.5 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
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
              <svg
                fill="currentColor"
                width="26"
                height="26"
                viewBox="0 0 24 24"
                className="text-gray-400 w-11 h-11 mb-3.5 mx-auto"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M18.71,7.21a1,1,0,0,0-1.42,0L9.84,14.67,6.71,11.53A1,1,0,1,0,5.29,13l3.84,3.84a1,1,0,0,0,1.42,0l8.16-8.16A1,1,0,0,0,18.71,7.21Z" />
              </svg>
              <p className="mb-4 text-gray-500">Approve or Reject?</p>
              <div className="space-y-4">
                <div>
                  <textarea
                    id="message"
                    onChange={onRejectReasonChange}
                    rows="4"
                    className="block p-2.5 w-full min-w-62.5 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-yellow-500 focus:border-yellow-500"
                    placeholder="Write the reason for reject..."
                  ></textarea>
                  {rejectReasonError && (
                    <p className="text-sm text-red-500 mt-2">
                      Please input reject reason
                    </p>
                  )}
                </div>
                <div className="flex justify-center items-center space-x-4">
                  <button
                    onClick={handleRejectUser}
                    className="py-2 px-3 text-sm font-medium text-white bg-red-600 rounded-lg border border-red-200 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-primary-300 focus:z-10"
                  >
                    Reject
                  </button>
                  <button
                    onClick={handleApproveUser}
                    className="py-2 px-3 text-sm font-medium text-center text-white bg-green-600 rounded-lg hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-red-300 "
                  >
                    Approve
                  </button>
                </div>
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
                {userStatus.map((status) => (
                  <option value={status.status} key={status.status}>
                    {t(status.status)}
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
          <div className="flex items-center gap-2">
            {userInfo?.permissions
              ?.find((p) => p.page.path === '/admin/users')
              ?.actions.includes('export') && (
              <div>
                <button
                  onClick={handleExportUsers}
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
            {userInfo?.permissions
              ?.find((p) => p.page.path === '/admin/users')
              ?.actions.includes('create') && (
              <div>
                <button
                  onClick={() => navigate('/admin/users/create')}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white text-sm rounded-md hover:opacity-70"
                >
                  <svg
                    fill="currentColor"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    id="plus"
                    data-name="Flat Color"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      id="primary"
                      d="M12,20a1,1,0,0,1-1-1V13H5a1,1,0,0,1,0-2h6V5a1,1,0,0,1,2,0v6h6a1,1,0,0,1,0,2H13v6A1,1,0,0,1,12,20Z"
                    ></path>
                  </svg>
                  Create user
                </button>
              </div>
            )}
          </div>
        </div>
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">
                Username
              </th>
              <th scope="col" className="px-6 py-3">
                Email
              </th>
              <th scope="col" className="px-6 py-3">
                Wallet Address
              </th>
              <th scope="col" className="px-6 py-3">
                {t('status')}
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
                  <td className="px-6 py-4">{ele.email}</td>
                  <td className="px-6 py-4">
                    {shortenWalletAddress(ele.walletAddress, 12)}
                  </td>
                  <td className="px-6 py-4">
                    <div
                      className={`max-w-fit text-white rounded-sm py-1 px-2 text-sm ${
                        userStatus.find((item) => item.status === ele.status)
                          .color
                      } mr-2`}
                    >
                      {t(ele.status)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-6">
                      {userInfo?.permissions
                        .find((p) => p.page.pageName === 'admin-users-details')
                        ?.actions.includes('approve') &&
                        ele.status === 'PENDING' && (
                          <button
                            onClick={() => handleApprove(ele._id)}
                            className="font-medium text-gray-500 hover:text-NoExcuseChallenge"
                          >
                            <svg
                              fill="currentColor"
                              viewBox="0 0 24 24"
                              id="check"
                              data-name="Flat Line"
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-6 h-auto"
                            >
                              <polyline
                                id="primary"
                                points="5 12 10 17 19 8"
                                style={{
                                  fill: 'none',
                                  stroke: 'currentColor',
                                  strokeLinecap: 'round',
                                  strokeLinejoin: 'round',
                                  strokeWidth: 2,
                                }}
                              ></polyline>
                            </svg>
                          </button>
                        )}

                      {ele.status !== "DELETED" && userInfo?.permissions
                        .find((p) => p.page.pageName === 'admin-users-details')
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

                      {ele.status !== "DELETED" && userInfo?.permissions
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

                      {userInfo?.permissions
                        .find((p) => p.page.pageName === 'admin-users-details')
                        ?.actions.includes('delete') &&
                        ele.countPay === 0 &&
                        ele.status !== 'DELETED' && (
                          <button
                            onClick={() => handleDelete(ele._id)}
                            className="font-medium text-gray-500 hover:text-NoExcuseChallenge"
                          >
                            <svg
                              fill="currentColor"
                              className="w-6 h-auto"
                              viewBox="-3 -2 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                              preserveAspectRatio="xMinYMin"
                            >
                              <path d="M6 2V1a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1h4a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-.133l-.68 10.2a3 3 0 0 1-2.993 2.8H5.826a3 3 0 0 1-2.993-2.796L2.137 7H2a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h4zm10 2H2v1h14V4zM4.141 7l.687 10.068a1 1 0 0 0 .998.932h6.368a1 1 0 0 0 .998-.934L13.862 7h-9.72zM7 8a1 1 0 0 1 1 1v7a1 1 0 0 1-2 0V9a1 1 0 0 1 1-1zm4 0a1 1 0 0 1 1 1v7a1 1 0 0 1-2 0V9a1 1 0 0 1 1-1z" />
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
          <nav
            className="flex items-center justify-between pt-4"
            aria-label="Table navigation"
          >
            <span className="text-sm font-normal text-gray-500">
              Showing{' '}
              <span className="font-semibold text-gray-900">
                {objectFilter.pageNumber}
              </span>{' '}
              of{' '}
              <span className="font-semibold text-gray-900">{totalPage}</span>{' '}
              page
            </span>
            <ul className="inline-flex items-center -space-x-px">
              <li>
                <button
                  disabled={parseInt(objectFilter.pageNumber) === 1}
                  onClick={() => handleChangePage(parseInt(objectFilter.pageNumber) - 1)}
                  className={`block px-3 py-2 ml-0 leading-tight text-gray-500 ${
                    parseInt(objectFilter.pageNumber) === 1 ? 'bg-gray-100' : 'bg-white'
                  } border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700`}
                >
                  <span className="sr-only">Previous</span>
                  <svg
                    className="w-5 h-5"
                    aria-hidden="true"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </button>
              </li>
              <li>
                <button
                  disabled={parseInt(objectFilter.pageNumber) === totalPage}
                  onClick={() => handleChangePage(parseInt(objectFilter.pageNumber) + 1)}
                  className={`block px-3 py-2 leading-tight text-gray-500 ${
                    parseInt(objectFilter.pageNumber) === totalPage
                      ? 'bg-gray-100'
                      : 'bg-white'
                  } border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700`}
                >
                  <span className="sr-only">Next</span>
                  <svg
                    className="w-5 h-5"
                    aria-hidden="true"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </button>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </DefaultLayout>
  );
};

export default AdminUserPages;
