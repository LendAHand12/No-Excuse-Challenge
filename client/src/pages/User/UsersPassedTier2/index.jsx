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
import { ChevronDown, ChevronUp } from 'lucide-react';

const UsersPassedTier2Page = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const key = searchParams.get('keyword') || '';
  const page = searchParams.get('page') || 1;

  const [totalPage, setTotalPage] = useState(0);
  const [keyword, setKeyword] = useState(key);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [objectFilter, setObjectFilter] = useState({
    pageNumber: page,
    keyword: key,
  });
  const [openIndex, setOpenIndex] = useState(null); // track accordion

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { pageNumber, keyword } = objectFilter;
      await PreTier2.getAllUsersPassed(pageNumber, keyword)
        .then((response) => {
          const { users, pages } = response.data;
          setData(users);
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

  const pushParamsToUrl = (pageNumber, searchKey) => {
    const searchParams = new URLSearchParams();
    if (pageNumber) {
      searchParams.set('page', pageNumber);
    }
    if (searchKey) {
      searchParams.set('keyword', searchKey);
    }
    const queryString = searchParams.toString();
    const url = queryString
      ? userInfo.role === 'user'
        ? `/user/users-passed-tier-2?${queryString}`
        : `/admin/users-passed-tier-2?${queryString}`
      : userInfo.role === 'user'
      ? '/user/users-passed-tier-2'
      : '/admin/users-passed-tier-2';
    navigate(url);
  };

  const handleChangePage = useCallback(
    (page) => setObjectFilter({ ...objectFilter, pageNumber: page }),
    [objectFilter],
  );

  const handleSearch = () => {
    setObjectFilter({ ...objectFilter, pageNumber: 1, keyword });
  };

  const calcBalance = (poolHistory) => {
    return poolHistory.reduce((sum, item) => {
      return item.status === 'IN' ? sum + item.amount : sum - item.amount;
    }, 0);
  };

  return (
    <DefaultLayout>
      <ToastContainer />
      <div className="relative overflow-x-auto py-24 px-10">
        <p className="text-2xl font-bold mb-10">Passed Tier 2 Users</p>
        {/* Search box */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="Search by username..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 w-64"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4"
          >
            {t('Search')}
          </button>
        </div>

        {loading && (
          <div className="w-full flex justify-center my-4">
            <Loading />
          </div>
        )}
        {!loading && data.length === 0 && <NoContent />}
        {!loading &&
          data.length > 0 &&
          data.map((user, idx) => {
            const balance = calcBalance(user.poolHistory || []);
            const isOpen = openIndex === idx;
            return (
              <div
                key={user.userId}
                className="border rounded-lg mb-4 bg-white shadow"
              >
                {/* Accordion Header */}
                <div
                  className="flex items-center justify-between px-4 py-3 cursor-pointer"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                >
                  <div className="">
                    <span className="font-bold lg:text-xl">{user.userId}</span>
                    <span className="ml-2 text-gray-500 hidden lg:inline">
                      {user.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm lg:text-lg">
                      {user.shortfallAmount} USDT
                    </p>
                    <div
                      className={`w-3 h-3 rounded-full ${
                        balance === 0 ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    />
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                </div>

                {/* Accordion Body */}
                {isOpen && (
                  <div className="px-6 py-4 border-t">
                    {user.poolHistory.length === 0 ? (
                      <p className="text-gray-500">
                        {t('No transaction history')}
                      </p>
                    ) : (
                      <ul className="space-y-2">
                        {user.poolHistory.map((h, idx2) => (
                          <li
                            key={idx2}
                            className="flex justify-between text-sm border-b pb-1"
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className={`text-white w-10 text-center p-1 rounded-sm ${
                                  h.status === 'IN'
                                    ? 'bg-green-500'
                                    : 'bg-red-500'
                                }`}
                              >
                                {h.status}
                              </div>
                              <div className="lg:text-xl">{h.amount} USDT</div>
                              <div className="text-gray-400">
                                {new Date(h.createdAt).toLocaleString()}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            );
          })}

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

export default UsersPassedTier2Page;
