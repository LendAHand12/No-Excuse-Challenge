import { useCallback, useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';
import PreTier2 from '@/api/PreTier2';
import { ToastContainer, toast } from 'react-toastify';
import NoContent from '@/components/NoContent';
import Loading from '@/components/Loading';
import CustomPagination from '@/components/CustomPagination';
import { useNavigate, useLocation } from 'react-router-dom';
import DefaultLayout from '@/layout/DefaultLayout';

const AdminPreTier2UsersPages = () => {
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
      await PreTier2.getUsersPreTier2(pageNumber, keyword, status)
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
      ? `/user/pre-tier-2-users?${queryString}`
      : '/user/pre-tier-2-users';
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
          <h1 className="text-2xl font-bold">Pre-Tier 2 Users</h1>
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
