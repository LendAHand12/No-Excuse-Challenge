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
  const { t } = useTranslation(); // Reserved for future translations
  const [searchOrderId, setSearchOrderId] = useState('');
  const [searchUserId, setSearchUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [bankTransactionId, setBankTransactionId] = useState('');
  const [transferContent, setTransferContent] = useState('');
  const [approving, setApproving] = useState(false);

  const handleSearch = async () => {
    if (!searchOrderId && !searchUserId) {
      toast.error('Please enter Order ID or User ID');
      return;
    }

    setLoading(true);
    try {
      const response = await Payment.searchPendingOrder(searchOrderId, searchUserId);
      setOrders(response.data.orders || []);
      setTransactions(response.data.transactions || []);
      
      if (response.data.orders.length === 0 && response.data.transactions.length === 0) {
        toast.info('No pending orders or transactions found');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to search pending orders');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!bankTransactionId) {
      toast.error('Bank Transaction ID is required');
      return;
    }

    if (orders.length === 0 && transactions.length === 0) {
      toast.error('No pending orders or transactions to approve');
      return;
    }

    setApproving(true);
    try {
      const transactionIds = transactions.map((trans: any) => trans._id);

      // Approve all orders one by one
      for (const order of orders as any[]) {
        await Payment.approveBankPayment({
          orderId: order.orderId,
          transactionIds: null, // Transactions will be approved separately
          bankTransactionId,
          transferContent: transferContent || '',
        });
      }

      // Approve all transactions if no orders or after orders are approved
      if (transactionIds.length > 0) {
        await Payment.approveBankPayment({
          orderId: null,
          transactionIds: transactionIds,
          bankTransactionId,
          transferContent: transferContent || '',
        });
      }

      toast.success('All payments approved successfully');
      
      // Reset form
      setBankTransactionId('');
      setTransferContent('');
      
      // Refresh search
      await handleSearch();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to approve payment');
    } finally {
      setApproving(false);
    }
  };

  return (
    <DefaultLayout>
      <ToastContainer />
      <div className="px-10 py-24 space-y-6">
        <h1 className="text-2xl font-bold">Approve Bank Payment</h1>

        {/* Search Section */}
        <Card>
          <CardHeader>
            <CardTitle>Search Pending Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">Order ID</label>
                  <Input
                    placeholder="Enter Order ID"
                    value={searchOrderId}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchOrderId(e.target.value)}
                    onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSearch()}
                  />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">User ID</label>
                  <Input
                    placeholder="Enter User ID"
                    value={searchUserId}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchUserId(e.target.value)}
                    onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSearch()}
                  />
              </div>
              <div className="flex items-end">
                <Button onClick={handleSearch} disabled={loading} className="text-white">
                  <Search className="w-4 h-4 mr-2" />
                  Search
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
              <CardTitle>Pending Orders ({orders.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.map((order: any) => (
                  <div
                    key={order._id}
                    className="p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">Order ID: {order.orderId}</span>
                      <Badge variant="outline">{order.status}</Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <strong>User:</strong> {order.userId?.userId || order.userId}
                      </p>
                      <p>
                        <strong>Email:</strong> {order.userId?.email || 'N/A'}
                      </p>
                      <p>
                        <strong>Phone:</strong> {order.userId?.phone || 'N/A'}
                      </p>
                      <p>
                        <strong>Amount:</strong> {order.amount} VND
                      </p>
                      <p>
                        <strong>Created:</strong>{' '}
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
              <CardTitle>Pending Transactions ({transactions.length})</CardTitle>
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
                      <Badge variant="outline">{trans.status}</Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <strong>Amount:</strong> {trans.amount} USDT
                      </p>
                      <p>
                        <strong>To:</strong> {trans.userId_to?.userId || trans.username_to || 'N/A'}
                      </p>
                      <p>
                        <strong>Created:</strong>{' '}
                        {new Date(trans.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Approve Section */}
        {!loading && (orders.length > 0 || transactions.length > 0) && (
          <Card>
            <CardHeader>
              <CardTitle>Approve Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Bank Transaction ID <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Enter bank transaction ID"
                    value={bankTransactionId}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBankTransactionId(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Transfer Content (Optional)
                  </label>
                  <Input
                    placeholder="Enter transfer content"
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
                      Approving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve All Payments ({orders.length + transactions.length} items)
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!loading && orders.length === 0 && transactions.length === 0 && (
          <NoContent message="No pending orders or transactions found" />
        )}
      </div>
    </DefaultLayout>
  );
};

export default ApprovePayment;

