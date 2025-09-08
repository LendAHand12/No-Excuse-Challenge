import { useCallback, useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { ToastContainer, toast } from 'react-toastify';
import NoContent from '@/components/NoContent';
import Loading from '@/components/Loading';
import { useNavigate, useLocation } from 'react-router-dom';
import DefaultLayout from '@/layout/DefaultLayout';
import PreTier2 from '@/api/PreTier2';
import { shortenWalletAddress } from '@/utils';
import CustomPagination from '@/components/CustomPagination';

const AdminPreTier2Pool = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const page = searchParams.get('page') || 1;
  const status = searchParams.get('status') || 'all';
  const [totalPage, setTotalPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const key = searchParams.get('keyword') || '';
  const [objectFilter, setObjectFilter] = useState({
    pageNumber: page,
    status,
    keyword: key,
  });
  const [keyword, setKeyword] = useState(key);
  const [total, setTotal] = useState(0);

  const onSearch = (e) => {
    setKeyword(e.target.value);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { pageNumber, keyword } = objectFilter;
      await PreTier2.getPoolInfo(pageNumber, keyword)
        .then((response) => {
          const { results, pages, totalAmount } = response.data;
          setData(results);
          setTotalPage(pages);
          setTotal(totalAmount);
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
      ? `/user/pre-tier-2-pool?${queryString}`
      : '/user/pre-tier-2-pool';
    navigate(url);
  };

  const handleChangePage = useCallback(
    (page) => setObjectFilter({ ...objectFilter, pageNumber: page }),
    [objectFilter],
  );

  const onChangeStatus = useCallback(
    (e) =>
      setObjectFilter({
        ...objectFilter,
        status: e.target.value,
        pageNumber: 1,
      }),
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
          <h1 className="text-2xl font-bold">Pre-Tier 2 Pool</h1>
        </div>
        <h1 className="text-xl my-4 font-medium">
          Balance in pool : <span className="font-bold">{total}</span> USDT{' '}
        </h1>
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">
                Username
              </th>
              <th scope="col" className="px-6 py-3">
                Amount
              </th>
              <th scope="col" className="px-6 py-3">
                {t('time')}
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
                  <th
                    scope="row"
                    className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap "
                  >
                    <div className="">
                      <div className="text-base font-semibold">
                        {ele.userInfo.userId}
                      </div>
                    </div>
                  </th>
                  <td className="px-6 py-4">
                    <b>{ele.amount}</b> USDT
                  </td>
                  <td className="px-6 py-4">
                    {new Date(ele.createdAt).toLocaleString('vi')}
                  </td>
                  <td className="px-6 py-4">
                    <div
                      className={`max-w-fit text-white rounded-sm py-1 px-2 text-sm ${
                        [
                          { status: 'IN', color: 'bg-green-600' },
                          { status: 'OUT', color: 'bg-red-600' },
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
            currentPage={parseInt(objectFilter.pageNumber)}
            totalPages={totalPage}
            onPageChange={handleChangePage}
          />
        )}
      </div>
    </DefaultLayout>
  );
};

export default AdminPreTier2Pool;
