import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import DefaultLayout from '@/layout/DefaultLayout';
import Ticket from '@/api/Ticket';
import Loading from '@/components/Loading';
import { ToastContainer, toast } from 'react-toastify';
import { formatDateTimeVN } from '@/utils/dateFormat';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import CustomPagination from '@/components/CustomPagination';

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
};

export default function UserTicketsPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const fetchTickets = async (page = 1, status?: string) => {
    setLoading(true);
    try {
      const statusFilter = status === 'ALL' ? undefined : status;
      const response = await Ticket.getUserTickets(page, statusFilter);
      setTickets(response.data.tickets || []);
      setTotalPages(response.data.pages || 0);
      setCurrentPage(response.data.currentPage || 1);
    } catch (error: any) {
      const message =
        error.response?.data?.error || error.message || 'Failed to fetch tickets';
      toast.error(t(message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets(1, selectedStatus);
  }, [selectedStatus]);

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchTickets(page, selectedStatus === 'ALL' ? undefined : selectedStatus);
  };

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
            <h2 className="text-lg font-semibold">{t('ticket.myTickets')}</h2>
            <div className="flex items-center gap-4">
              <Select value={selectedStatus} onValueChange={handleStatusChange}>
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
              <Link
                to="/user/tickets/create"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                {t('ticket.createTicket')}
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loading />
            </div>
          ) : (
            <>
              {tickets.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {t('ticket.noTickets')}
                </div>
              ) : (
                <div className="space-y-4">
                  {tickets.map((ticket) => (
                    <Link
                      key={ticket._id}
                      to={`/user/tickets/${ticket._id}`}
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

              {totalPages > 1 && (
                <div className="mt-6">
                  <CustomPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
}

