import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Payment from '@/api/Payment';
import DefaultLayout from '@/layout/DefaultLayout';
import Loading from '@/components/Loading';
import NoContent from '@/components/NoContent';
import { ToastContainer, toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, CheckCircle } from 'lucide-react';

const ApprovePayment = () => {
  const { t } = useTranslation();
  const [searchOrderId, setSearchOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [bankTransactionId, setBankTransactionId] = useState('');
  const [transferContent, setTransferContent] = useState('');
  const [approving, setApproving] = useState(false);

  const handleSearch = async () => {
    if (!searchOrderId) {
      toast.error(t('approvePayment.errors.orderIdRequired'));
      return;
    }

    setLoading(true);
    try {
      const response = await Payment.searchPendingOrder(searchOrderId);
      setOrders(response.data.orders || []);
      setTransactions(response.data.transactions || []);
      
      if (response.data.orders.length === 0 && response.data.transactions.length === 0) {
        toast.info(t('approvePayment.info.noOrdersFound'));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || t('approvePayment.errors.searchFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!bankTransactionId) {
      toast.error(t('approvePayment.errors.bankTransactionIdRequired'));
      return;
    }

    // Only allow approve if there are pending transactions or pending orders
    const pendingOrders = orders.filter((order: any) => order.status === 'PENDING');
    const hasPendingItems = transactions.length > 0 || pendingOrders.length > 0;

    if (!hasPendingItems) {
      toast.error(t('approvePayment.errors.noPendingItems'));
      return;
    }

    setApproving(true);
    try {
      const transactionIds = transactions.map((trans: any) => trans._id);

      // Approve only PENDING orders one by one
      for (const order of pendingOrders) {
        await Payment.approveBankPayment({
          orderId: order.orderId,
          transactionIds: null, // Transactions will be approved separately
          bankTransactionId,
          transferContent: transferContent || '',
        });
      }

      // Approve all transactions if any exist
      if (transactionIds.length > 0) {
        await Payment.approveBankPayment({
          orderId: null,
          transactionIds: transactionIds,
          bankTransactionId,
          transferContent: transferContent || '',
        });
      }

      toast.success(t('approvePayment.success.approved'));
      
      // Reset form
      setBankTransactionId('');
      setTransferContent('');
      
      // Refresh search
      await handleSearch();
    } catch (error: any) {
      toast.error(error.response?.data?.error || t('approvePayment.errors.approveFailed'));
    } finally {
      setApproving(false);
    }
  };

  return (
    <DefaultLayout>
      <ToastContainer />
      <div className="px-10 py-24 space-y-6">
        <h1 className="text-2xl font-bold">{t('approvePayment.title')}</h1>

        {/* Search Section */}
        <Card>
          <CardHeader>
            <CardTitle>{t('approvePayment.search.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">{t('approvePayment.search.orderId')}</label>
                  <Input
                    placeholder={t('approvePayment.search.orderIdPlaceholder')}
                    value={searchOrderId}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchOrderId(e.target.value)}
                    onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSearch()}
                  />
              </div>
              <div className="flex items-end">
                <Button onClick={handleSearch} disabled={loading} className="text-white">
                  <Search className="w-4 h-4 mr-2" />
                  {t('approvePayment.search.button')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {loading && <Loading />}

        {/* Orders Section */}
        {!loading && orders.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>
                {t('approvePayment.orders.title', { count: orders.length })}
                {orders[0]?.status === 'SUCCESS' && transactions.length > 0 && (
                  <> - {t('approvePayment.orders.successButPending')}</>
                )}
                {orders[0]?.status === 'PENDING' && (
                  <> - {t('approvePayment.orders.pending')}</>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.map((order: any) => (
                  <div
                    key={order._id}
                    className="p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">{t('approvePayment.orders.orderId')}: {order.orderId}</span>
                      <Badge
                        variant="outline"
                        className={
                          order.status === 'SUCCESS'
                            ? 'bg-green-100 text-green-800 border-green-300'
                            : order.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                            : order.status === 'FAILED'
                            ? 'bg-red-100 text-red-800 border-red-300'
                            : order.status === 'CANCELLED'
                            ? 'bg-gray-100 text-gray-800 border-gray-300'
                            : ''
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <strong>{t('approvePayment.orders.user')}:</strong> {order.userId?.userId || order.userId}
                      </p>
                      <p>
                        <strong>{t('approvePayment.orders.email')}:</strong> {order.userId?.email || t('approvePayment.common.notAvailable')}
                      </p>
                      <p>
                        <strong>{t('approvePayment.orders.phone')}:</strong> {order.userId?.phone || t('approvePayment.common.notAvailable')}
                      </p>
                      <p>
                        <strong>{t('approvePayment.orders.amount')}:</strong> {order.amount} VND
                      </p>
                      {order.transferContent && (
                        <p>
                          <strong>{t('approvePayment.orders.transferContent')}:</strong> {order.transferContent}
                        </p>
                      )}
                      <p>
                        <strong>{t('approvePayment.orders.created')}:</strong>{' '}
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Transactions Section */}
        {!loading && transactions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{t('approvePayment.transactions.title', { count: transactions.length })}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {transactions.map((trans: any) => (
                  <div
                    key={trans._id}
                    className="p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{trans.type}</span>
                      <Badge
                        variant="outline"
                        className={
                          trans.status === 'SUCCESS'
                            ? 'bg-green-100 text-green-800 border-green-300'
                            : trans.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                            : trans.status === 'FAILED'
                            ? 'bg-red-100 text-red-800 border-red-300'
                            : trans.status === 'CANCELLED'
                            ? 'bg-gray-100 text-gray-800 border-gray-300'
                            : ''
                        }
                      >
                        {trans.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <strong>{t('approvePayment.transactions.amount')}:</strong> {trans.amount} USDT
                      </p>
                      <p>
                        <strong>{t('approvePayment.transactions.to')}:</strong> {trans.userId_to?.userId || trans.username_to || t('approvePayment.common.notAvailable')}
                      </p>
                      <p>
                        <strong>{t('approvePayment.transactions.created')}:</strong>{' '}
                        {new Date(trans.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Approve Section - Only show if there are pending transactions or pending orders */}
        {!loading && (transactions.length > 0 || orders.some((order: any) => order.status === 'PENDING')) && (
          <Card>
            <CardHeader>
              <CardTitle>{t('approvePayment.approve.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('approvePayment.approve.bankTransactionId')} <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder={t('approvePayment.approve.bankTransactionIdPlaceholder')}
                    value={bankTransactionId}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBankTransactionId(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('approvePayment.approve.transferContent')}
                  </label>
                  <Input
                    placeholder={t('approvePayment.approve.transferContentPlaceholder')}
                    value={transferContent}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTransferContent(e.target.value)}
                  />
                </div>

                <Button
                  onClick={handleApprove}
                  disabled={approving || !bankTransactionId}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {approving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      {t('approvePayment.approve.approving')}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {t('approvePayment.approve.button', { 
                        count: orders.filter((order: any) => order.status === 'PENDING').length + transactions.length 
                      })}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!loading && orders.length === 0 && transactions.length === 0 && (
          <NoContent message={t('approvePayment.noContent')} />
        )}
      </div>
    </DefaultLayout>
  );
};

export default ApprovePayment;


