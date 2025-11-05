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
  createdAt: string;
  updatedAt: string;
  userId: {
    userId: string;
    email: string;
  };
};

export default function TicketDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [ticket, setTicket] = useState<TicketDetail | null>(null);

  useEffect(() => {
    if (!id) {
      navigate('/user/tickets');
      return;
    }

    const fetchTicket = async () => {
      setLoading(true);
      try {
        const response = await Ticket.getTicketById(id);
        setTicket(response.data.ticket);
      } catch (error: any) {
        const message =
          error.response?.data?.error ||
          error.message ||
          'Failed to fetch ticket';
        toast.error(t(message));
        navigate('/user/tickets');
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id, navigate]);

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

          <div className="bg-white p-6 rounded-lg border border-gray-200 mb-4">
            <div className="mb-4">
              <h3 className="font-semibold mb-2">{t('ticket.yourMessage')}</h3>
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

          <div className="flex gap-4">
            <button
              onClick={() => navigate('/user/tickets')}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              {t('ticket.back')}
            </button>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
