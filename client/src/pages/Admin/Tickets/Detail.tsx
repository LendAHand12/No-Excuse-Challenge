import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import DefaultLayout from '@/layout/DefaultLayout';
import Ticket from '@/api/Ticket';
import Loading from '@/components/Loading';
import { ToastContainer, toast } from 'react-toastify';
import { formatDateTimeVN } from '@/utils/dateFormat';

type TicketDetail = {
  _id: string;
  subject: string;
  message: string;
  images: string[];
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  adminResponse?: string;
  adminResponseAt?: string;
  resolvedAt?: string;
  resolvedBy?: {
    userId: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  userId: {
    userId: string;
    email: string;
  };
};

export default function AdminTicketDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [showReplyForm, setShowReplyForm] = useState(false);

  useEffect(() => {
    if (!id) {
      navigate('/admin/tickets');
      return;
    }

    const fetchTicket = async () => {
      setLoading(true);
      try {
        const response = await Ticket.getTicketById(id);
        setTicket(response.data.ticket);
        setAdminResponse(response.data.ticket.adminResponse || '');
        setShowReplyForm(!response.data.ticket.adminResponse);
      } catch (error: any) {
        const message =
          error.response?.data?.error ||
          error.message ||
          'Failed to fetch ticket';
        toast.error(t(message));
        navigate('/admin/tickets');
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id, navigate]);

  const handleReply = async () => {
    if (!adminResponse.trim()) {
      toast.error(t('ticket.responseRequired'));
      return;
    }

    if (!id) return;

    setSubmitting(true);
    try {
      await Ticket.replyTicket(id!, adminResponse);
      // Refresh ticket data
      const ticketResponse = await Ticket.getTicketById(id!);
      setTicket(ticketResponse.data.ticket);
      setShowReplyForm(false);
      toast.success(t('ticket.replySent'));
    } catch (error: any) {
      const message =
        error.response?.data?.error || error.message || 'Failed to send reply';
      toast.error(t(message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkResolved = async () => {
    if (!id) return;

    if (!window.confirm(t('ticket.confirmResolve'))) {
      return;
    }

    setSubmitting(true);
    try {
      await Ticket.markResolved(id!);
      // Refresh ticket data
      const ticketResponse = await Ticket.getTicketById(id!);
      setTicket(ticketResponse.data.ticket);
      toast.success(t('ticket.markedResolved'));
    } catch (error: any) {
      const message =
        error.response?.data?.error ||
        error.message ||
        'Failed to mark as resolved';
      toast.error(t(message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!id) return;

    if (!window.confirm(t('ticket.confirmClose'))) {
      return;
    }

    setSubmitting(true);
    try {
      await Ticket.closeTicket(id!);
      // Refresh ticket data
      const ticketResponse = await Ticket.getTicketById(id!);
      setTicket(ticketResponse.data.ticket);
      toast.success(t('ticket.closed'));
    } catch (error: any) {
      const message =
        error.response?.data?.error ||
        error.message ||
        'Failed to close ticket';
      toast.error(t(message));
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      PENDING: {
        label: t('ticket.status.pending'),
        className: 'bg-yellow-100 text-yellow-700',
      },
      IN_PROGRESS: {
        label: t('ticket.status.inProgress'),
        className: 'bg-blue-100 text-blue-700',
      },
      RESOLVED: {
        label: t('ticket.status.resolved'),
        className: 'bg-green-100 text-green-700',
      },
      CLOSED: {
        label: t('ticket.status.closed'),
        className: 'bg-gray-100 text-gray-700',
      },
    };
    const statusInfo = statusMap[status] || statusMap.PENDING;
    return (
      <span
        className={`px-3 py-1 rounded text-sm font-medium ${statusInfo.className}`}
      >
        {statusInfo.label}
      </span>
    );
  };

  if (loading) {
    return (
      <DefaultLayout>
        <div className="py-24 px-10 flex justify-center">
          <Loading />
        </div>
      </DefaultLayout>
    );
  }

  if (!ticket) {
    return null;
  }

  return (
    <DefaultLayout>
      <ToastContainer />
      <div className="py-24 px-10">
        <div className="bg-[#FAFBFC] p-6 rounded-2xl max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">{ticket.subject}</h2>
            {getStatusBadge(ticket.status)}
          </div>

          {/* User Info */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
            <h3 className="font-semibold mb-2">{t('ticket.userInfo')}</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                <strong>{t('ticket.user')}:</strong> {ticket.userId.userId}
              </p>
              <p>
                <strong>{t('ticket.email')}:</strong> {ticket.userId.email}
              </p>
            </div>
          </div>

          {/* User Message */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 mb-4">
            <div className="mb-4">
              <h3 className="font-semibold mb-2">{t('ticket.userMessage')}</h3>
              <p className="text-gray-700 whitespace-pre-wrap">
                {ticket.message}
              </p>
            </div>

            {ticket.images && ticket.images.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">{t('ticket.images')}</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {ticket.images.map((image, index) => (
                    <a
                      key={index}
                      href={`${import.meta.env.VITE_API_URL}${image}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <img
                        src={`${import.meta.env.VITE_API_URL}${image}`}
                        alt={`Image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg hover:opacity-80 transition"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 text-sm text-gray-500">
              {t('ticket.createdAt')}: {formatDateTimeVN(ticket.createdAt)}
            </div>
          </div>

          {/* Admin Response */}
          {ticket.adminResponse && (
            <div className="bg-green-50 p-6 rounded-lg border border-green-200 mb-4">
              <div className="mb-4">
                <h3 className="font-semibold mb-2 text-green-800">
                  {t('ticket.adminResponse')}
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {ticket.adminResponse}
                </p>
              </div>
              <div className="text-sm text-gray-500">
                {t('ticket.repliedAt')}:{' '}
                {ticket.adminResponseAt
                  ? formatDateTimeVN(ticket.adminResponseAt)
                  : '-'}
              </div>
            </div>
          )}

          {/* Reply Form */}
          {showReplyForm && (
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mb-4">
              <h3 className="font-semibold mb-4 text-blue-800">
                {ticket.adminResponse
                  ? t('ticket.updateResponse')
                  : t('ticket.replyToTicket')}
              </h3>
              <textarea
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 mb-4"
                placeholder={t('ticket.responsePlaceholder')}
                rows={6}
              />
              <div className="flex gap-4">
                <button
                  onClick={handleReply}
                  disabled={submitting}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <Loading />
                      {t('ticket.sending')}
                    </span>
                  ) : (
                    t('ticket.sendReply')
                  )}
                </button>
                {ticket.adminResponse && (
                  <button
                    onClick={() => setShowReplyForm(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    {t('ticket.cancel')}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/admin/tickets')}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              {t('ticket.back')}
            </button>
            {!ticket.adminResponse && (
              <button
                onClick={() => setShowReplyForm(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                {t('ticket.reply')}
              </button>
            )}
            {ticket.adminResponse && !showReplyForm && (
              <button
                onClick={() => setShowReplyForm(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                {t('ticket.updateResponse')}
              </button>
            )}
            {ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && (
              <button
                onClick={handleMarkResolved}
                disabled={submitting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('ticket.markResolved')}
              </button>
            )}
            {ticket.status !== 'CLOSED' && (
              <button
                onClick={handleCloseTicket}
                disabled={submitting}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('ticket.closeTicket')}
              </button>
            )}
          </div>

          {ticket.resolvedAt && (
            <div className="mt-4 text-sm text-gray-500">
              {t('ticket.resolvedAt')}: {formatDateTimeVN(ticket.resolvedAt)}
              {ticket.resolvedBy && (
                <span className="ml-2">
                  ({t('ticket.by')} {ticket.resolvedBy.userId})
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
}
