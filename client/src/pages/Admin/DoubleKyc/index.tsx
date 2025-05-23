import { useCallback, useEffect, useState } from 'react';

import KYC from '@/api/KYC';
import Loading from '@/components/Loading';
import NoContent from '@/components/NoContent';
import { useTranslation } from 'react-i18next';
import { ToastContainer, toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
// import { shortenWalletAddress } from "@/utils";
import DefaultLayout from '../../../layout/DefaultLayout';
import { shortenWalletAddress } from '../../../utils';
import { useSelector } from 'react-redux';
import CustomPagination from '../../../components/CustomPagination';
import userStatus from '../../../constants/userStatus';

const AdminDoubleKycPage = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const key = searchParams.get('keyword') || '';
  const page = searchParams.get('page') || 1;
  const [keyword, setKeyword] = useState(key);
  const [totalPage, setTotalPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [objectFilter, setObjectFilter] = useState({
    pageNumber: page,
    keyword: key,
  });

  const onSearch = (e) => {
    setKeyword(e.target.value);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { pageNumber, keyword } = objectFilter;
      await KYC.getDouble(pageNumber, keyword)
        .then((response) => {
          const { doubleKycs, pages } = response.data;
          setData(doubleKycs);
          setTotalPage(pages);
          setLoading(false);
          pushParamsToUrl(pageNumber);
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

  const pushParamsToUrl = (pageNumber) => {
    const searchParams = new URLSearchParams();
    if (pageNumber) {
      searchParams.set('page', pageNumber);
    }
    const queryString = searchParams.toString();
    const url = queryString
      ? `/admin/double-kyc?${queryString}`
      : '/admin/claims';
    navigate(url);
  };

  const handleChangePage = useCallback(
    (page) =>
      setObjectFilter({
        ...objectFilter,
        pageNumber: page,
      }),
    [objectFilter],
  );

  const handleSearch = useCallback(() => {
    setObjectFilter({ ...objectFilter, keyword, pageNumber: 1 });
  }, [keyword, objectFilter]);

  return (
    <DefaultLayout>
      <ToastContainer />
      <div className="py-24 px-10">
        <div className="relative overflow-x-auto p-10">
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
                  User 1
                </th>
                <th scope="col" className="px-6 py-3">
                  User 2
                </th>
                <th scope="col" className="px-6 py-3">
                  Time
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
                      className="px-6 py-4 text-gray-900 whitespace-nowrap "
                    >
                      <div className="">
                        <div className="text-base font-semibold">
                          <div className="flex items-center gap-2">
                            {ele.userIdFrom?.userId || 'DELETED'}
                            {ele.userIdFrom.status && (
                              <div
                                className={`max-w-fit text-white rounded-sm font-normal text-xs p-0.5 ${
                                  userStatus.find(
                                    (item) =>
                                      item.status === ele.userIdFrom.status,
                                  ).color
                                } mr-2`}
                              >
                                {t(ele.userIdFrom.status)}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="font-normal text-gray-500">
                          {ele.userIdFrom?.email || ''}
                        </div>
                      </div>
                    </th>
                    <th
                      scope="row"
                      className="px-6 py-4 text-gray-900 whitespace-nowrap "
                    >
                      <div className="">
                        <div className="text-base font-semibold">
                          <div className='flex items-center gap-2'>
                            {ele.userIdTo?.userId || 'DELETED'}
                            {ele.userIdTo?.status && (
                              <div
                                className={`max-w-fit text-white rounded-sm text-xs font-normal p-0.5 ${
                                  userStatus.find(
                                    (item) =>
                                      item.status === ele.userIdTo.status,
                                  ).color
                                } mr-2`}
                              >
                                {t(ele.userIdTo.status)}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="font-normal text-gray-500">
                          {ele.userIdTo?.email || ''}
                        </div>
                      </div>
                    </th>
                    <td className="px-6 py-4">{ele.createdAt}</td>
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

export default AdminDoubleKycPage;
