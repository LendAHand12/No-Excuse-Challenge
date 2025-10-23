import { useCallback, useEffect, useState } from 'react';

import userStatus from '@/constants/userStatus';
import { useTranslation } from 'react-i18next';
import User from '@/api/User';
import { ToastContainer, toast } from 'react-toastify';
import NoContent from '@/components/NoContent';
import Loading from '@/components/Loading';
import CustomPagination from '@/components/CustomPagination';
import AdminUsersTable from '@/components/AdminUsersTable';
import { useNavigate, useLocation } from 'react-router-dom';
import DefaultLayout from '@/layout/DefaultLayout';
import Modal from 'react-modal';
import { shortenWalletAddress } from '@/utils';
import { useSelector } from 'react-redux';
import Payment from '../../../api/Payment';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Download, Plus } from 'lucide-react';

const AdminUserPages = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const key = searchParams.get('keyword') || '';
  const page = searchParams.get('page') || 1;
  const status = searchParams.get('status') || 'all';
  const coin = searchParams.get('coin') || 'all';
  const [totalPage, setTotalPage] = useState(0);
  const [keyword, setKeyword] = useState(key);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [objectFilter, setObjectFilter] = useState({
    pageNumber: page,
    keyword: key,
    status,
    coin,
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentDeleteId, setCurrentDeleteId] = useState('');
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [currentKYCId, setCurrentKYCId] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [rejectReasonError, setRejectReasonError] = useState(false);
  const [showApprovePayment, setShowApprovePayment] = useState(false);
  const [currentApprovePaymentId, setCurrentApprovePaymentId] = useState('');

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
      const { pageNumber, keyword, status, coin } = objectFilter;
      await User.getAllUsers(pageNumber, keyword, status, coin)
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

  const handleMoveSystem = (id) => {
    navigate(`/admin/move-system/${id}`);
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

  const handleApprovePayment = useCallback(async () => {
    await Payment.donePayWithCash({ userId: currentApprovePaymentId })
      .then((response) => {
        const { message } = response.data;
        setShowApprovePayment(false);
        toast.success(t(message));
        setRefresh(!refresh);
      })
      .catch((error) => {
        let message =
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message;
        toast.error(t(message));
      });
  }, [currentApprovePaymentId]);

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
                <div>
                  FaceTec Url :{' '}
                  <a
                    target="_blank"
                    className="text-blue-500"
                    href={`${
                      import.meta.env.VITE_FACETEC_DASHBOARD_URL
                    }/session-details?path=%2Fenrollment-3d&externalDatabaseRefID=ID_${currentKYCId}`}
                  >
                    Link
                  </a>
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
      <Modal
        isOpen={showApprovePayment}
        onRequestClose={() => setShowApprovePayment(false)}
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
                onClick={() => setShowApprovePayment(false)}
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
              <p className="mb-4 text-gray-500">
                {t('adminUsers.modals.approvePayment')}
              </p>
              <div className="space-y-4">
                <div className="flex justify-center items-center space-x-4">
                  <button
                    onClick={handleApprovePayment}
                    className="py-2 px-3 text-sm font-medium text-center text-white bg-green-600 rounded-lg hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-red-300 "
                  >
                    {t('adminUsers.modals.approveButton')}
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
              <Select
                value={objectFilter.status}
                onValueChange={(value) => setObjectFilter({
                  ...objectFilter,
                  status: value,
                  pageNumber: 1,
                })}
                disabled={loading}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('adminUsers.buttons.all')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('adminUsers.buttons.all')}</SelectItem>
                  {userStatus.map((status) => (
                    <SelectItem value={status.status} key={status.status}>
                      {t(status.status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select
                value={objectFilter.coin}
                onValueChange={(value) => setObjectFilter({
                  ...objectFilter,
                  coin: value,
                  pageNumber: 1,
                })}
                disabled={loading}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder={t('adminUsers.buttons.all')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('adminUsers.buttons.all')}</SelectItem>
                  <SelectItem value="usdt">USDT</SelectItem>
                  <SelectItem value="hewe">HEWE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  onChange={onSearch}
                  className="pl-10 w-80"
                  placeholder={t('adminUsers.placeholders.searchUser')}
                  defaultValue={objectFilter.keyword}
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={loading}
                className="bg-black text-white hover:bg-gray-800"
              >
                <Search className="w-4 h-4 mr-2" />
                {t('adminUsers.buttons.search')}
              </Button>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            {userInfo?.permissions
              ?.find((p) => p.page.path === '/admin/users')
              ?.actions.includes('export') && (
              <div>
                <Button
                  onClick={handleExportUsers}
                  className="bg-green-600 text-white hover:bg-green-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t('adminUsers.buttons.exportData')}
                </Button>
              </div>
            )}
            {userInfo?.permissions
              ?.find((p) => p.page.path === '/admin/users')
              ?.actions.includes('create') && (
              <div>
                <Button
                  onClick={() => navigate('/admin/users/create')}
                  className="bg-blue-500 text-white hover:bg-blue-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('adminUsers.buttons.createUser')}
                </Button>
              </div>
            )}
          </div>
        </div>
        {loading && (
          <div className="w-full flex justify-center my-4">
            <Loading />
          </div>
        )}
        {!loading && data.length === 0 && <NoContent />}
        {!loading && data.length > 0 && (
          <>
            <AdminUsersTable
              data={data}
              loading={loading}
              onApprove={handleApprove}
              onDetail={handleDetail}
              onTree={handleTree}
              onMoveSystem={handleMoveSystem}
              onDelete={handleDelete}
              onApprovePayment={(id) => {
                setShowApprovePayment(true);
                setCurrentApprovePaymentId(id);
              }}
              objectFilter={objectFilter}
            />
            <CustomPagination
              currentPage={objectFilter.pageNumber}
              totalPages={totalPage}
              onPageChange={handleChangePage}
            />
          </>
        )}
      </div>
    </DefaultLayout>
  );
};

export default AdminUserPages;
