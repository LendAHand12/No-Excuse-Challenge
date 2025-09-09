import { useCallback, useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';
import PreTier2 from '@/api/PreTier2';
import { ToastContainer, toast } from 'react-toastify';
import NoContent from '@/components/NoContent';
import Loading from '@/components/Loading';
import CustomPagination from '@/components/CustomPagination';
import { useNavigate, useLocation } from 'react-router-dom';
import DefaultLayout from '@/layout/DefaultLayout';
import { useSelector } from 'react-redux';

const AdminPreTier2UsersPages = () => {
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

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { pageNumber, keyword, status } = objectFilter;
      await PreTier2.getAllUsersPreTier2(pageNumber, keyword, status)
        .then((response) => {
          const { data, pages } = response.data;
          setData(data);
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
      ? `/admin/pre-tier-2-users?${queryString}`
      : '/admin/pre-tier-2-users';
    navigate(url);
  };

  const handleChangePage = useCallback(
    (page) => setObjectFilter({ ...objectFilter, pageNumber: page }),
    [objectFilter],
  );

  const handleSearch = useCallback(() => {
    setObjectFilter({ ...objectFilter, keyword, pageNumber: 1 });
  }, [keyword, objectFilter]);

  const handleChangeOrder = async (id, action) => {
    await PreTier2.changeOrder({ id, action })
      .then((response) => {
        toast.success(t(response.data.message));
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
  };

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
                  { status: 'ACHIEVED', color: 'bg-blue-600' },
                  { status: 'PASSED', color: 'bg-green-600' },
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
                Order
              </th>
              <th scope="col" className="px-6 py-3">
                Username
              </th>
              <th scope="col" className="px-6 py-3">
                Branch 1
              </th>
              <th scope="col" className="px-6 py-3">
                Branch 2
              </th>
              <th scope="col" className="px-6 py-3">
                {t('status')}
              </th>
              <th scope="col" className="px-6 py-3">
                Eligible Time
              </th>
              <th scope="col" className="px-6 py-3">
                Achieved Time
              </th>
              <th scope="col" className="px-6 py-3">
                Passed Time
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
                  <th className="px-6 py-4">{ele.order}</th>
                  <th
                    scope="row"
                    className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap "
                  >
                    <div className="">
                      <div className="text-base font-semibold">
                        {ele.userInfo.userId}
                      </div>
                      <div className="font-normal text-gray-500">{ele._id}</div>
                    </div>
                  </th>

                  <td className="px-6 py-4">
                    <span className="font-medium">{ele.countChild1}</span> ID
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium">{ele.countChild2}</span> ID
                  </td>
                  <td className="px-6 py-4">
                    <div
                      className={`max-w-fit text-white rounded-sm py-1 px-2 text-sm ${
                        [
                          { status: 'PENDING', color: 'bg-yellow-600' },
                          { status: 'PASSED', color: 'bg-green-600' },
                          { status: 'ACHIEVED', color: 'bg-blue-600' },
                        ].find((item) => item.status === ele.status).color
                      } mr-2`}
                    >
                      {ele.status}
                    </div>
                  </td>
                  <td className="px-6 py-4">{ele.createdAt}</td>
                  <td className="px-6 py-4">{ele.achievedTime}</td>
                  <td className="px-6 py-4">{ele.passedTime}</td>

                  <td className="px-6 py-4">
                    {userInfo?.permissions
                      .find((p) => p.page.pageName === 'admin-user-pre-tier-2')
                      ?.actions.includes('update') &&
                      ele.status === 'PENDING' && (
                        <div className="flex gap-6">
                          <button
                            onClick={() => handleChangeOrder(ele._id, 'down')}
                            className="font-medium text-gray-500 hover:text-NoExcuseChallenge"
                          >
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 15 15"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M7.49988 12L-0.00012207 4L14.9999 4L7.49988 12Z"
                                fill="currentColor"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleChangeOrder(ele._id, 'up')}
                            className="font-medium text-gray-500 hover:text-NoExcuseChallenge"
                          >
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 15 15"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M7.5 3L15 11H0L7.5 3Z"
                                fill="currentColor"
                              />
                            </svg>
                          </button>
                        </div>
                      )}
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

export default AdminPreTier2UsersPages;
