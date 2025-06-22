import { useCallback, useEffect, useState } from 'react';

import userStatus from '@/constants/userStatus';
import { useTranslation } from 'react-i18next';
import User from '@/api/User';
import { ToastContainer, toast } from 'react-toastify';
import NoContent from '@/components/NoContent';
import Loading from '@/components/Loading';
import CustomPagination from '@/components/CustomPagination';
import { useNavigate, useLocation } from 'react-router-dom';
import DefaultLayout from '@/layout/DefaultLayout';
import Modal from 'react-modal';
import { shortenWalletAddress } from '@/utils';
import { useSelector } from 'react-redux';

const UsersTier2Page = () => {
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
      await User.getAllUsersTier2(pageNumber, keyword, status)
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
    if (pageNumber) {
      searchParams.set('page', pageNumber);
    }
    const queryString = searchParams.toString();
    const url = queryString
      ? userInfo.role === 'user'
        ? `/user/tier2?${queryString}`
        : `/admin/user/tier2?${queryString}`
      : userInfo.role === 'user'
      ? '/user/tier2'
      : 'admin/user/tier2';
    navigate(url);
  };

  const handleChangePage = useCallback(
    (page) => setObjectFilter({ ...objectFilter, pageNumber: page }),
    [objectFilter],
  );

  return (
    <DefaultLayout>
      <ToastContainer />
      <div className="relative overflow-x-auto py-24 px-10">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">
                Order
              </th>
              <th scope="col" className="px-6 py-3">
                Username
              </th>
              <th scope="col" className="px-6 py-3">
                Email
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
                  <td className="px-6 py-4">{ele.order}</td>
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
                    {shortenWalletAddress(ele.email, 12)}
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

export default UsersTier2Page;
