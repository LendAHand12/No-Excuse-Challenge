import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Payment from '@/api/Payment';
import Loading from '@/components/Loading';
import { ToastContainer, toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import Modal from 'react-modal';
import DefaultLayout from '../../../layout/DefaultLayout';
import { transfer } from '../../../utils/smartContract';
import { useSelector } from 'react-redux';
import PaymentModal from '@/components/PaymentModal';
import '@/components/PaymentModal/index.css';

Modal.setAppElement('#root');

const PaymentPage = () => {
  const { t, i18n } = useTranslation();
  const { userInfo } = useSelector((state) => state.auth);
  const [total, setTotal] = useState(0);
  const [loadingPaymentInfo, setLoadingPaymentInfo] = useState(true);
  const [paymentsList, setPaymentsList] = useState([]);
  const [paymentIdsList, setPaymentIdsList] = useState([]);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(0);

  const {
    formState: { errors },
  } = useForm();

  const onGetPaymentInfo = async () => {
    setLoadingPaymentInfo(true);
    await Payment.getPaymentInfo()
      .then((response) => {
        const { payments, paymentIds, message, exchangeRate } = response.data;
        if (message) {
          toast.success(message);
          setShowPayment(false);
        } else {
          const totalPayment = paymentIds.reduce(
            (accumulator, currentValue) => accumulator + currentValue.amount,
            0,
          );
          const fee = 0;
          setTotal(totalPayment + fee);
          setPaymentIdsList(paymentIds);
          setPaymentsList(payments);
          setExchangeRate(exchangeRate || 0);
          setShowPayment(true);
        }

        setLoadingPaymentInfo(false);
      })
      .catch((error) => {
        let message =
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message;
        toast.error(t(message));
      });
  };

  useEffect(() => {
    // 4-Step Onboarding Enforcement:
    // Step 1: Face ID
    if (userInfo?.facetecTid === '' && userInfo?.lockKyc === false) {
      toast.error('Vui lòng đăng ký Face ID trước khi thanh toán');
      window.location.href = '/user/profile';
      return;
    }

    // Step 2: Profile Info
    if (userInfo?.isProfileComplete === false) {
      toast.error('Vui lòng hoàn thiện thông tin CCCD trước khi thanh toán');
      window.location.href = '/user/profile';
      return;
    }

    // Step 3: Signature
    if (userInfo?.countPay === 0 && !userInfo?.signatureImage) {
      toast.error('Vui lòng ký xác nhận hợp đồng trước khi thanh toán');
      window.location.href = '/user/profile';
      return;
    }

    onGetPaymentInfo();
    setShowPayment(true);
  }, [userInfo?.isProfileComplete, userInfo?.signatureImage]);

  const handleOpenPaymentModal = () => {
    setShowPaymentModal(true);
  };

  const paymentMetamask = useCallback(async () => {
    setLoadingPayment(true);
    try {
      const referralTransaction = await transfer(
        import.meta.env.VITE_MAIN_WALLET_ADDRESS,
        total,
      );
      if (referralTransaction) {
        const { transactionHash } = referralTransaction;
        await donePayment(transactionHash);
        setPaymentCompleted(true);
        window.location.reload();
      } else {
        setLoadingPayment(false);
        throw new Error(t('payment error'));
      }
    } catch (error) {
      toast.error(t(error.message));
      setLoadingPayment(false);
    }
  }, [paymentsList, total]);

  const donePayment = useCallback(
    async (transactionHash) => {
      await Payment.onDonePayment({
        transIds: paymentIdsList,
        transactionHash,
      })
        .then((response) => {
          toast.success(t(response.data.message));
        })
        .catch((error) => {
          let message =
            error.response && error.response.data.message
              ? error.response.data.message
              : error.message;
          toast.error(t(message));
        });
    },
    [paymentIdsList],
  );

  return (
    <DefaultLayout>
      <ToastContainer />
      <div className="py-24 lg:p-24">
        {loadingPaymentInfo ? (
          <div className="w-xl flex justify-center">
            <Loading />
          </div>
        ) : (
          <>
            {!paymentCompleted &&
              showPayment && (
                <>
                  <div className="w-full max-w-203 mx-auto rounded-lg bg-white p-10 text-gray-700 mt-4">
                    <div className="mb-10">
                      <h1 className="text-center font-bold text-4xl">
                        {t('paymentTitle')}
                      </h1>
                    </div>

                    <div className="flex justify-between">
                      <div className="mb-3">
                        <p className="text-lg mb-2 ml-1">
                          <span className="font-bold">{t('buyPackage')}</span> :
                          NoExcuseChallenge
                        </p>
                      </div>
                      <div className="mb-3">
                        <p className="text-lg mb-2 ml-1">
                          <span className="font-bold">{t('Total')}</span> :{' '}
                          {total} USDT
                        </p>
                      </div>
                    </div>
                    {!loadingPaymentInfo &&
                      paymentIdsList.map((payment, i) => (
                        <div
                          key={payment.id}
                          className={`flex items-center p-4 mb-4 text-sm rounded-lg ${payment.type === 'REGISTER'
                            ? 'bg-green-50 text-green-800'
                            : payment.type === 'DIRECT'
                              ? 'bg-yellow-50 text-yellow-800'
                              : payment.type === 'FINE'
                                ? 'bg-red-50 text-red-800'
                                : payment.type === 'PIG'
                                  ? 'bg-pink-100'
                                  : payment.type === 'COMPANY'
                                    ? 'bg-purple-100'
                                    : payment.type === 'KYC'
                                      ? 'bg-teal-100'
                                      : 'bg-blue-50 text-blue-800'
                            }`}
                          role="alert"
                        >
                          <svg
                            className="flex-shrink-0 inline w-4 h-4 me-3"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M6 2h12v2H6V2zM4 6V4h2v2H4zm0 12V6H2v12h2zm2 2v-2H4v2h2zm12 0v2H6v-2h12zm2-2v2h-2v-2h2zm0-12h2v12h-2V6zm0 0V4h-2v2h2zm-9-1h2v2h3v2h-6v2h6v6h-3v2h-2v-2H8v-2h6v-2H8V7h3V5z"
                              fill="currentColor"
                            />
                          </svg>
                          <div className="w-full flex flex-col sm:flex-row justify-between gap-2">
                            <div className="">
                              <span className="font-medium">
                                {payment.type === 'REGISTER'
                                  ? t('REGISTRATION & MANAGEMENT FEE')
                                  : payment.type === 'DIRECT'
                                    ? t('COMMUNITY REWARD')
                                    : payment.type === 'FINE'
                                      ? t('fine')
                                      : payment.type === 'PIG'
                                        ? t('REWARD POOL')
                                        : payment.type === 'COMPANY'
                                          ? t('EXCHANGE FOR HEWE')
                                          : payment.type === 'KYC'
                                            ? t('KYC Fee')
                                            : t('COMMUNITY SUPPORT REWARDS')}
                                <span> : </span>
                              </span>
                              <span>{payment.amount} USDT</span>
                            </div>
                            <div className="">
                              {(payment.type === 'DIRECT' ||
                                payment.type === 'REFERRAL') && (
                                  <span className="mx-2 text-black">
                                    <span className="font-medium mr-2">
                                      {t('To')} :{' '}
                                    </span>
                                    <span className="">{payment.to}</span>
                                  </span>
                                )}
                            </div>
                          </div>
                        </div>
                      ))}
                    <button
                      type="submit"
                      onClick={handleOpenPaymentModal}
                      disabled={loadingPayment}
                      className="w-2xl mx-auto flex justify-center border border-black items-center hover:underline  font-medium rounded-full my-6 py-4 px-8 shadow-lg focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out"
                    >
                      {loadingPayment && <Loading />}
                      {t('signin.confirm')}
                    </button>
                  </div>
                </>
              )}
            <PaymentModal
              isOpen={showPaymentModal}
              onClose={() => setShowPaymentModal(false)}
              totalAmount={total}
              changeRate={exchangeRate}
              paymentIdsList={paymentIdsList}
              onDonePayment={donePayment}
              onWalletPayment={() => {
                setShowPaymentModal(false);
                paymentMetamask();
              }}
            />
          </>
        )}
      </div>
    </DefaultLayout>
  );
};

export default PaymentPage;
