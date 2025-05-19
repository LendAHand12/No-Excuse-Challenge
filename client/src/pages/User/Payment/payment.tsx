import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Payment from '@/api/Payment';
import Loading from '@/components/Loading';
import { ToastContainer, toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import Modal from 'react-modal';
import DefaultLayout from '../../../layout/DefaultLayout';
import { transfer } from '../../../utils/smartContract';

Modal.setAppElement('#root');

const PaymentPage = () => {
  const { t } = useTranslation();
  const [total, setTotal] = useState(0);
  const [loadingPaymentInfo, setLoadingPaymentInfo] = useState(true);
  const [paymentsList, setPaymentsList] = useState([]);
  const [paymentIdsList, setPaymentIdsList] = useState([]);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  const {
    formState: { errors },
  } = useForm();

  const onGetPaymentInfo = async () => {
    setLoadingPaymentInfo(true);
    await Payment.getPaymentInfo()
      .then((response) => {
        const { payments, paymentIds, message } = response.data;
        if (message) {
          toast.success(message);
          setShowPayment(false);
        } else {
          const totalPayment = paymentIds.reduce(
            (accumulator, currentValue) => accumulator + currentValue.amount,
            0,
          );
          setTotal(totalPayment + 0.2 + 2);
          setPaymentIdsList(paymentIds);
          setPaymentsList(payments);
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
    onGetPaymentInfo();
  }, []);

  const paymentMetamask = useCallback(async () => {
    setLoadingPayment(true);
    try {
      // const referralTransaction = await transfer(
      //   import.meta.env.VITE_MAIN_WALLET_ADDRESS,
      //   total,
      // );
      // if (referralTransaction) {
      //   const { transactionHash } = referralTransaction;
        await donePayment("transactionHash");
        setPaymentCompleted(true);
        window.location.reload();
      // } else {
      //   setLoadingPayment(false);
      //   throw new Error(t('payment error'));
      // }
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
            {!paymentCompleted && showPayment && (
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
                        <span className="font-bold">Total</span> : {total} USDT
                      </p>
                    </div>
                  </div>
                  {!loadingPaymentInfo &&
                    paymentIdsList.map((payment, i) => (
                      <div
                        key={payment.id}
                        className={`flex items-center p-4 mb-4 text-sm rounded-lg ${
                          payment.type === 'REGISTER'
                            ? 'bg-green-50 text-green-800'
                            : payment.type === 'DIRECT'
                            ? 'bg-yellow-50 text-yellow-800'
                            : payment.type === 'FINE'
                            ? 'bg-red-50 text-red-800'
                            : payment.type === 'PIG'
                            ? 'bg-pink-100'
                            : payment.type === 'COMPANY'
                            ? 'bg-purple-100'
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
                                ? t('Membership')
                                : payment.type === 'DIRECT'
                                ? t('commissionFee')
                                : payment.type === 'FINE'
                                ? t('fine')
                                : payment.type === 'PIG'
                                ? 'Dream Pool'
                                : payment.type === 'COMPANY'
                                ? 'HEWE'
                                : t('Foundation Contribution')}
                              <span> : </span>
                            </span>
                            <span>{payment.amount} USDT</span>
                          </div>
                          <div className="">
                            <span className="mx-2 text-black">
                              <span className="font-medium mr-2">To : </span>
                              <span className="">{payment.to}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  <button
                    type="submit"
                    onClick={paymentMetamask}
                    disabled={loadingPayment}
                    className="w-2xl mx-auto flex justify-center border border-black items-center hover:underline  font-medium rounded-full my-6 py-4 px-8 shadow-lg focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out"
                  >
                    {loadingPayment && <Loading />}
                    {t('payment')}
                  </button>
                </div>
              </>
            )}
            {paymentCompleted && (
              <div>
                <div className="flex flex-col items-center lg:gap-10 gap-4">
                  <svg
                    width="78"
                    height="78"
                    viewBox="0 0 78 78"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M39 71.5C43.2688 71.5053 47.4965 70.667 51.4402 69.0334C55.384 67.3998 58.9661 65.003 61.9808 61.9808C65.003 58.9661 67.3998 55.384 69.0334 51.4402C70.667 47.4965 71.5053 43.2688 71.5 39C71.5053 34.7313 70.667 30.5036 69.0334 26.5598C67.3998 22.616 65.003 19.0339 61.9808 16.0193C58.9661 12.997 55.384 10.6003 51.4402 8.96664C47.4965 7.33302 43.2688 6.49476 39 6.50002C34.7313 6.49476 30.5036 7.33302 26.5598 8.96664C22.616 10.6003 19.0339 12.997 16.0193 16.0193C12.997 19.0339 10.6003 22.616 8.96664 26.5598C7.33302 30.5036 6.49476 34.7313 6.50002 39C6.49476 43.2688 7.33302 47.4965 8.96664 51.4402C10.6003 55.384 12.997 58.9661 16.0193 61.9808C19.0339 65.003 22.616 67.3998 26.5598 69.0334C30.5036 70.667 34.7313 71.5053 39 71.5Z"
                      fill="#02071B"
                    />
                    <path
                      d="M26 39L35.75 48.75L55.25 29.25"
                      stroke="#36BA02"
                      strokeWidth="6.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                  <p className="text-md lg:text-2xl font-bold">
                    Contribution Completed
                  </p>
                  <p className="text-md lg:text-2xl font-bold">Thank You </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DefaultLayout>
  );
};

export default PaymentPage;
