import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import DefaultLayout from '@/layout/DefaultLayout';
import Ticket from '@/api/Ticket';
import Loading from '@/components/Loading';
import { ToastContainer, toast } from 'react-toastify';
import CustomPagination from '@/components/CustomPagination';
import { formatDateTimeVN } from '@/utils/dateFormat';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type TicketItem = {
  _id: string;
  subject: string;
  message: string;
  images: string[];
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  adminResponse?: string;
  adminResponseAt?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
  userInfo: {
    _id: string;
    userId: string;
    email: string;
  };
};

const AdminTicketsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const key = searchParams.get('keyword') || '';
  const page = searchParams.get('page') || 1;
  const [keyword, setKeyword] = useState(key);
  const status = searchParams.get('status') || '';
  const [selectedStatus, setSelectedStatus] = useState(status || 'ALL');
  const [totalPage, setTotalPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<TicketItem[]>([]);
  const [objectFilter, setObjectFilter] = useState({
    pageNumber: page,
    status: status === 'ALL' ? '' : status,
    keyword: key,
  });

  const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { pageNumber, status, keyword } = objectFilter;
      await Ticket.getAllTickets(pageNumber, status || undefined, keyword || undefined)
        .then((response) => {
          const { tickets, pages } = response.data;
          setData(tickets || []);
          setTotalPage(pages || 0);
          setLoading(false);
          pushParamsToUrl(pageNumber, status);
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
  }, [objectFilter]);

  const pushParamsToUrl = (pageNumber: string | number, status: string) => {
    const searchParams = new URLSearchParams();
    if (pageNumber) {
      searchParams.set('page', String(pageNumber));
    }
    if (status) {
      searchParams.set('status', status);
    }
    if (keyword) {
      searchParams.set('keyword', keyword);
    }
    const queryString = searchParams.toString();
    const url = queryString ? `/admin/tickets?${queryString}` : '/admin/tickets';
    navigate(url);
  };

  const onChangeStatus = useCallback(
    (value: string) => {
      const statusValue = value === 'ALL' ? '' : value;
      setSelectedStatus(value);
      setObjectFilter({
        ...objectFilter,
        pageNumber: 1,
        status: statusValue,
      });
    },
    [objectFilter],
  );

  const handleChangePage = useCallback(
    (page: number) =>
      setObjectFilter({
        ...objectFilter,
        pageNumber: page,
      }),
    [objectFilter],
  );

  const handleSearch = useCallback(() => {
    setObjectFilter({ ...objectFilter, keyword, pageNumber: 1 });
  }, [keyword, objectFilter]);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      PENDING: { label: t('ticket.status.pending'), className: 'bg-yellow-100 text-yellow-700' },
      IN_PROGRESS: {
        label: t('ticket.status.inProgress'),
        className: 'bg-blue-100 text-blue-700',
      },
      RESOLVED: { label: t('ticket.status.resolved'), className: 'bg-green-100 text-green-700' },
      CLOSED: { label: t('ticket.status.closed'), className: 'bg-gray-100 text-gray-700' },
    };
    const statusInfo = statusMap[status] || statusMap.PENDING;
    return (
      <span
        className={`px-2 py-1 rounded text-xs font-medium ${statusInfo.className}`}
      >
        {statusInfo.label}
      </span>
    );
  };

  return (
    <DefaultLayout>
      <ToastContainer />
      <div className="py-24 px-10">
        <div className="bg-[#FAFBFC] p-4 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{t('ticket.adminTickets')}</h2>
            <div className="flex items-center gap-4">
              <Select value={selectedStatus} onValueChange={onChangeStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('ticket.filterByStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{t('ticket.all')}</SelectItem>
                  <SelectItem value="PENDING">{t('ticket.status.pending')}</SelectItem>
                  <SelectItem value="IN_PROGRESS">{t('ticket.status.inProgress')}</SelectItem>
                  <SelectItem value="RESOLVED">{t('ticket.status.resolved')}</SelectItem>
                  <SelectItem value="CLOSED">{t('ticket.status.closed')}</SelectItem>
                </SelectContent>
              </Select>
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
                    placeholder={t('ticket.searchPlaceholder')}
                    defaultValue={objectFilter.keyword}
                  />
                  <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="h-8 flex text-xs justify-center items-center hover:underline bg-black text-white font-bold rounded-full py-1 px-4 shadow-lg focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out"
                  >
                    {t('search')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loading />
            </div>
          ) : (
            <>
              {data.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {t('ticket.noTickets')}
                </div>
              ) : (
                <div className="space-y-4">
                  {data.map((ticket) => (
                    <Link
                      key={ticket._id}
                      to={`/admin/tickets/${ticket._id}`}
                      className="block bg-white p-4 rounded-lg border border-gray-200 hover:border-green-500 transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900">{ticket.subject}</h3>
                            {getStatusBadge(ticket.status)}
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                            {ticket.message}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                            <span>
                              <strong>{t('ticket.user')}:</strong> {ticket.userInfo?.userId || '-'}
                            </span>
                            <span>
                              <strong>{t('ticket.email')}:</strong> {ticket.userInfo?.email || '-'}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>
                              {t('ticket.createdAt')}: {formatDateTimeVN(ticket.createdAt)}
                            </span>
                            {ticket.adminResponseAt && (
                              <span>
                                {t('ticket.repliedAt')}: {formatDateTimeVN(ticket.adminResponseAt)}
                              </span>
                            )}
                          </div>
                          {ticket.images && ticket.images.length > 0 && (
                            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                              <span>
                                {ticket.images.length} {t('ticket.image')}
                                {ticket.images.length > 1 ? 's' : ''}
                              </span>
                            </div>
                          )}
                        </div>
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {totalPage > 1 && (
                <div className="mt-6">
                  <CustomPagination
                    currentPage={parseInt(objectFilter.pageNumber as string)}
                    totalPages={totalPage}
                    onPageChange={handleChangePage}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default AdminTicketsPage;

