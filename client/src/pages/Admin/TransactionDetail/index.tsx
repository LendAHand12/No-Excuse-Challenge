import { useCallback, useEffect, useState } from 'react';

import Loading from '@/components/Loading';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import Payment from '@/api/Payment';
import { transfer, getAccount } from '@/utils/smartContract.js';
import { useSelector } from 'react-redux';
import DefaultLayout from '../../../layout/DefaultLayout';

const AdminTransactionDetail = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const transId = pathname.split('/')[3];
  if (!transId) {
    navigate('/admin/transactions');
  }
  const [trans, setTrans] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const [refresh, setRefresh] = useState(false);
  const [checkRefundMess, setCheckRefundMess] = useState('');
  const [loadingChangeToRefunded, setLoadingChangeToRefunded] = useState(false);
  const [loadingCheckCanRefund, setLoadingCheckCanRefund] = useState(false);
  const [refunding, setRefunding] = useState(false);
  const [loadingRefund, setLoadingRefund] = useState(false);
  const [loadingUntilRefund, setLoadingUntilRefund] = useState(false);
  const [refundAmount, setRefundAmount] = useState(0);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Payment.getPaymentDetail(transId)
        .then((response) => {
          setTrans(response.data);
          setLoading(false);
        })
        .catch((error) => {
          let message =
            error.response && error.response.data.message
              ? error.response.data.message
              : error.message;
          toast.error(t(message));
          setLoading(false);
        });
    })();
  }, [transId, refresh]);

  const changeToRefunded = async () => {
    setLoadingChangeToRefunded(true);
    await Payment.changeToRefunded({ id: transId })
      .then((response) => {
        toast.success(t(response.data.message));
        setLoadingChangeToRefunded(false);
      })
      .catch((error) => {
        let message =
          error.response && error.response.data.error
            ? error.response.data.error
            : error.message;
        toast.error(t(message));
        setLoadingChangeToRefunded(false);
      });
  };

  const checkCanRefund = useCallback(async () => {
    setLoadingCheckCanRefund(true);
    await Payment.checkCanRefund({ id: transId })
      .then((response) => {
        setCheckRefundMess(response.data.message);
        response.data.amount && setRefundAmount(response.data.amount);
        setLoadingCheckCanRefund(false);
        setRefunding(true);
      })
      .catch((error) => {
        let message =
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message;
        setCheckRefundMess(message);
        setLoadingCheckCanRefund(false);
      });
  }, [transId]);

  const handRefund = useCallback(
    async (type) => {
      const account = await getAccount();
      if (account) {
        type === 'A' ? setLoadingRefund(true) : setLoadingUntilRefund(true);
        try {
          const refundTrans = await transfer(
            trans.address_to,
            refundAmount > 0 ? refundAmount : trans.amount,
          );
          const { transactionHash } = refundTrans;
          await adminDoneRefund(
            transId,
            transactionHash,
            trans.type,
            account,
            trans.address_to,
          );
        } catch (error) {
          setLoadingRefund(false);
          setLoadingUntilRefund(false);
        }
      } else {
        toast.error(t('Please login your registered wallet'));
      }
    },
    [trans, refundAmount],
  );

  const adminDoneRefund = async (
    transId,
    transHash,
    transType,
    fromWallet,
    receiveWallet,
  ) => {
    await Payment.onAdminDoneRefund({
      transId,
      transHash,
      transType,
      fromWallet,
      receiveWallet,
    })
      .then((response) => {
        toast.success(response.data.message);
        setLoadingRefund(false);
        setLoadingUntilRefund(false);
        setRefunding(false);
        setRefresh(!refresh);
      })
      .catch((error) => {
        let message =
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message;
        toast.error(t(message));
        setLoadingRefund(true);
        setLoadingUntilRefund(false);
      });
  };

  return (
    <DefaultLayout>
      <ToastContainer />
      <div className="px-12 py-24">
        {loading && (
          <div className="w-full flex justify-center">
            <Loading />
          </div>
        )}
        {!loading && trans !== null && (
          <div className="container mx-auto p-5">
            <div className="md:flex no-wrap md:-mx-2 ">
              <div className="w-full lg:w-3/12 lg:mx-2 mb-4 lg:mb-0">
                <div className="">
                  <ul className="bg-gray-100 text-gray-600 hover:text-gray-700 hover:shadow py-2 px-3 mt-3 divide-y rounded shadow-sm">
                    <li className="flex items-center py-3">
                      <span>{t('status')}</span>
                      <span className="ml-auto">
                        <span className="bg-green-600 py-1 px-2 rounded text-white text-sm">
                          {t(trans.status)}
                        </span>
                      </span>
                    </li>
                    <li className="flex items-center py-3">
                      <span>{t('transType')}</span>
                      <span className="ml-auto">
                        <span
                          className={`${
                            trans.type === 'DIRECTHOLD' ||
                            trans.type === 'REFERRALHOLD'
                              ? 'bg-yellow-600'
                              : 'bg-green-600'
                          } py-1 px-2 rounded text-white text-sm`}
                        >
                          {trans.type === 'DIRECTHOLD'
                            ? t('DIRECTHOLDt')
                            : trans.type === 'REFERRALHOLD'
                            ? t('REFERRALHOLDt')
                            : t(trans.type)}
                        </span>
                      </span>
                    </li>
                    {trans.type.includes('HOLD') && (
                      <li className="flex items-center py-3">
                        <span>{t('refundStatus')}</span>
                        <span className="ml-auto">
                          <span
                            className={`${
                              trans.isHoldRefund ? 'bg-green-600' : 'bg-red-500'
                            } py-1 px-2 rounded text-white text-sm`}
                          >
                            {trans.isHoldRefund
                              ? t('refunded')
                              : t('not refunded')}
                          </span>
                        </span>
                      </li>
                    )}
                    <li className="flex items-center py-3">
                      <span>{t('createTime')}</span>
                      <span className="ml-auto">
                        {new Date(trans.createdAt).toLocaleDateString('vi')}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="w-full lg:w-9/12 lg:mx-2">
                <div className="bg-gray-100 text-gray-600 hover:text-gray-700 hover:shadow py-2 px-3 mt-3 divide-y rounded-md shadow-sm">
                  <div className="text-gray-700">
                    <ul className="divide-y">
                      <div className="grid lg:grid-cols-2 grid-cols-1">
                        <div className="px-4 py-2">{t('Send User Name')}</div>
                        <div className="px-4 py-2 font-semibold">
                          {trans.userId}
                        </div>
                      </div>
                      <div className="grid lg:grid-cols-2 grid-cols-1">
                        <div className="px-4 py-2">{t('Send User Email')}</div>
                        <div className="px-4 py-2 font-semibold">
                          {trans.email}
                        </div>
                      </div>
                      <div className="grid lg:grid-cols-2 grid-cols-1">
                        <div className="px-4 py-2">{t('Send User Wallet')}</div>
                        <div className="px-4 py-2 font-semibold">
                          {trans.address_from}
                        </div>
                      </div>
                      {trans.type !== 'REGISTER' && (
                        <>
                          <div className="grid lg:grid-cols-2 grid-cols-1">
                            <div className="px-4 py-2">
                              {t('Receive User Name')}
                            </div>
                            <div className="px-4 py-2 font-semibold">
                              {trans.userReceiveId}
                            </div>
                          </div>
                          <div className="grid lg:grid-cols-2 grid-cols-1">
                            <div className="px-4 py-2">
                              {t('Receive User Email')}
                            </div>
                            <div className="px-4 py-2 font-semibold">
                              {trans.userReceiveEmail}
                            </div>
                          </div>
                          <div className="grid lg:grid-cols-2 grid-cols-1">
                            <div className="px-4 py-2">
                              {t('Receive User Wallet')}
                            </div>
                            <div className="px-4 py-2 font-semibold">
                              {trans.address_to}
                            </div>
                          </div>
                        </>
                      )}
                      <div className="grid lg:grid-cols-2 grid-cols-1">
                        <div className="px-4 py-2">{t('amount')}</div>
                        <div className="px-4 py-2 font-semibold">
                          {trans.amount} USDT
                        </div>
                      </div>
                      {trans.type !== 'REGISTER' && (
                        <div className="grid lg:grid-cols-2 grid-cols-1">
                          <div className="px-4 py-2">{t('count pay')}</div>
                          <div className="px-4 py-2 font-semibold">
                            {t('times')} {trans.userCountPay}
                          </div>
                        </div>
                      )}

                      <div className="grid lg:grid-cols-2 grid-cols-1">
                        <div className="px-4 py-2">Hash</div>
                        <div className="px-4 py-2 font-semibold">
                          <a
                            href={`https://bscscan.com/tx/${trans.hash}`}
                            target="_blank"
                            rel="noreferrer"
                            className="break-words text-blue-500"
                          >
                            {trans.hash}
                          </a>
                        </div>
                      </div>
                    </ul>
                  </div>

                  {!trans.isHoldRefund && trans.type.includes('HOLD') && (
                    <button
                      onClick={changeToRefunded}
                      className="w-xl flex justify-center items-center hover:underline bg-black text-dreamchain font-bold rounded-full my-6 py-4 px-8 shadow-lg focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out"
                    >
                      {loadingChangeToRefunded && <Loading />}
                      {t('changeToRefunded')}
                    </button>
                  )}
                  {!trans.isHoldRefund &&
                    trans.type.includes('HOLD') &&
                    checkRefundMess !== '' && <p>{checkRefundMess}</p>}
                  {!trans.isHoldRefund &&
                    trans.type.includes('HOLD') &&
                    trans.userReceiveId !== 'Unknow' &&
                    trans.userReceiveEmail !== 'Unknow' && (
                      <button
                        onClick={checkCanRefund}
                        className="w-xl bg-yellow-500 text-white flex justify-center items-center hover:underline border font-bold rounded-full my-6 py-4 px-8 shadow-lg focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out"
                      >
                        {loadingCheckCanRefund && <Loading />}
                        {t('checkCanRefund')}
                      </button>
                    )}
                  {refunding && (
                    <button
                      onClick={() => handRefund('A')}
                      className="w-xl flex bg-green-600 text-white justify-center items-center hover:underline border font-bold rounded-full my-6 py-4 px-8 shadow-lg focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out"
                    >
                      {loadingRefund && <Loading />}
                      {t('refund')}
                    </button>
                  )}
                  {
                    <button
                      onClick={() => handRefund('B')}
                      className="w-xl bg-red-600 text-white flex justify-center items-center hover:underline border font-bold rounded-full my-6 py-4 px-8 shadow-lg focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out"
                    >
                      {loadingUntilRefund && <Loading />}
                      {t('untilRefunds')}
                    </button>
                  }
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DefaultLayout>
  );
};

export default AdminTransactionDetail;
