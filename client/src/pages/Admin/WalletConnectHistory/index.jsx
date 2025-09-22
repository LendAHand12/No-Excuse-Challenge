import { useCallback, useEffect, useState } from 'react';

import withdrawStatus from '@/constants/withdrawStatus';
import { useTranslation } from 'react-i18next';
import { ToastContainer, toast } from 'react-toastify';
import NoContent from '@/components/NoContent';
import Loading from '@/components/Loading';
import { useNavigate, useLocation } from 'react-router-dom';
import DefaultLayout from '@/layout/DefaultLayout';
import Modal from 'react-modal';
import UserHistory from '@/api/UserHistory';
import { shortenWalletAddress } from '@/utils';
import { transfer } from '@/utils/smartContract';
import { useSelector } from 'react-redux';
import CustomPagination from '@/components/CustomPagination';

const AdminWalletConnectHistoryPages = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const page = searchParams.get('page') || 1;
  const [totalPage, setTotalPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const key = searchParams.get('keyword') || '';
  const [objectFilter, setObjectFilter] = useState({
    pageNumber: page,
    keyword: key,
  });
  const [keyword, setKeyword] = useState(key);

  const onSearch = (e) => {
    setKeyword(e.target.value);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { pageNumber, keyword } = objectFilter;
      await UserHistory.listConnectWallet(objectFilter)
        .then((response) => {
          const { list, pages } = response.data;
          setData(list);
          setTotalPage(pages);
          setLoading(false);
          pushParamsToUrl(pageNumber, keyword);
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

  const pushParamsToUrl = (pageNumber, keyword) => {
    const searchParams = new URLSearchParams();
    if (pageNumber) {
      searchParams.set('page', pageNumber);
    }
    if (keyword) {
      searchParams.set('keyword', keyword);
    }
    const queryString = searchParams.toString();
    const url = queryString
      ? `/admin/wallet-connect-list?${queryString}`
      : '/admin/wallet-connect-list';
    navigate(url);
  };

  const handleChangePage = useCallback(
    (page) => setObjectFilter({ ...objectFilter, pageNumber: page }),
    [objectFilter],
  );

  const handleSearch = useCallback(() => {
    setObjectFilter({ ...objectFilter, keyword, pageNumber: 1 });
  }, [keyword, objectFilter]);

  return (
    <DefaultLayout>
      <ToastContainer />
      <div className="relative overflow-x-auto py-24 px-10">
        <div className="flex items-center justify-between pb-4 bg-white">
          <div className="flex items-center gap-4">
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
        </div>
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">
                Username
              </th>
              <th scope="col" className="px-6 py-3">
                Connector
              </th>
              <th scope="col" className="px-6 py-3">
                {t('time')}
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
                      <div className="flex items-center gap-4 text-base font-semibold">
                        {ele.accountUser?.userId || 'Unknow'}
                        {ele.walletAddress !== ele.userWalletAddress && (
                          <div className="w-4 h-4 rounded-full bg-red-500"></div>
                        )}
                      </div>
                      <div className="font-normal text-gray-500">
                        {ele.accountUser?.walletAddress || 'Unknow'}
                      </div>
                    </div>
                  </th>
                  <td className="px-6 py-4 ">
                    <div className="">
                      <div className="text-base font-semibold">
                        {ele.connectorUser?.userId || 'Unknow'}
                      </div>
                      <div className="font-normal text-gray-500">
                        {ele.walletAddress || 'Unknow'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {new Date(ele.createdAt).toLocaleString('vi')}
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
            currentPage={parseInt(objectFilter.pageNumber)}
            totalPages={totalPage}
            onPageChange={handleChangePage}
          />
        )}
      </div>
    </DefaultLayout>
  );
};

export default AdminWalletConnectHistoryPages;
