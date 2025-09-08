import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import PreTier2 from '@/api/PreTier2';
import User from '@/api/User';
import Loading from '@/components/Loading';
import { ToastContainer, toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import Modal from 'react-modal';
import DefaultLayout from '../../../layout/DefaultLayout';
import { transfer } from '../../../utils/smartContract';
import { useSelector } from 'react-redux';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';

Modal.setAppElement('#root');

const PaymentTier2WithPrePoolPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const [loadingPaymentInfo, setLoadingPaymentInfo] = useState(true);
  const [paymentsList, setPaymentsList] = useState([]);
  const [paymentIdsList, setPaymentIdsList] = useState([]);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [resMessage, setResMessage] = useState('');
  const [resStatus, setResStatus] = useState('');
  const [total, setTotal] = useState(0);
  const [step, setStep] = useState(0);
  const [listChild, setListChild] = useState([]);
  const [errSubId, setErrSubId] = useState(false);
  const [childId, setChildId] = useState('');
  const [loadingListPayment, setLoadingListPayment] = useState(false);
  const [showCommit, setShowCommit] = useState(false);
  const [notEnoughtChild1, setNotEnoughtChild1] = useState(0);
  const [notEnoughtChild2, setNotEnoughtChild2] = useState(0);

  const topRef = useRef(null);

  const {
    formState: { errors },
  } = useForm();

  const onGetPaymentInfo = async (childId) => {
    if (childId) {
      setLoadingListPayment(true);
    } else {
      setLoadingPaymentInfo(true);
    }
    await PreTier2.getPaymentTier2Info(childId)
      .then((response) => {
        const {
          status,
          payments,
          paymentIds,
          message,
          userStepPayment,
          holdForNotEnoughLevel,
          notEnoughtChild,
        } = response.data;
        setResMessage(message);
        // if (userStepPayment === 0 && holdForNotEnoughLevel) {
        //   setShowCommit(holdForNotEnoughLevel);
        //   setNotEnoughtChild1(notEnoughtChild.countChild1);
        //   setNotEnoughtChild2(notEnoughtChild.countChild2);
        // }
        setResStatus(status);

        if (status === 'OK') {
          const totalPayment = paymentIds.reduce(
            (accumulator, currentValue) => accumulator + currentValue.amount,
            0,
          );
          setTotal(totalPayment + (userStepPayment === 0 ? 2 : 1));
          setPaymentIdsList(paymentIds);
          setPaymentsList(payments);
          setStep(userStepPayment);
        }

        setLoadingPaymentInfo(false);
        setLoadingListPayment(false);
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
    console.log({ childId });
    onGetPaymentInfo(childId);
  }, [childId]);

  useEffect(() => {
    (async () => {
      await User.getListChildLteBranch()
        .then((response) => {
          const listChild = [...response.data];
          setListChild(listChild);
        })
        .catch((error) => {
          let message =
            error.response && error.response.data.error
              ? error.response.data.error
              : error.message;
          toast.error(t(message));
        });
    })();
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
      await doneNextTierPayment({
        transactionHash: '',
        childId,
      });
      setLoadingPayment(false);
      setStep(step + 1);
      // } else {
      //   setLoadingPayment(false);
      //   throw new Error(t('payment error'));
      // }
    } catch (error) {
      toast.error(t(error.message));
      setLoadingPayment(false);
    }
  }, [paymentsList, total, childId, step]);

  const doneNextTierPayment = useCallback(
    async ({ transactionHash, childId }) => {
      await PreTier2.onDonePayment({
        transIds: paymentIdsList,
        transactionHash,
        childId,
      })
        .then((response) => {
          toast.success(t(response.data.message));
          if (response.data.message === 'Payment successful') {
            setResStatus('DONE');
          }
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
      <div className="py-24 px-10 lg:py-24" ref={topRef}>
        {loadingPaymentInfo ? (
          <div className="w-xl flex justify-center">
            <Loading />
          </div>
        ) : (
          <>
            <Modal
              isOpen={showCommit}
              style={{
                content: {
                  top: '50%',
                  left: '50%',
                  right: 'auto',
                  bottom: 'auto',
                  marginRight: '-50%',
                  transform: 'translate(-50%, -50%)',
                },
              }}
            >
              <div className="overflow-y-auto overflow-x-hidden justify-center items-center w-full md:inset-0 h-modal md:h-full">
                <div className="relative w-full max-w-md h-full md:h-auto">
                  <div className="relative text-center bg-white rounded-lg sm:p-5">
                    <div className="flex flex-col items-center">
                      <div
                        className="text-left text-gray-700 rounded relative mb-5"
                        role="alert"
                      >
                        <div className="font-bold mb-4 text-red-900">
                          ⚠️ Warning:
                        </div>
                        Please check the number of IDs in Tier 1 that need to be
                        fulfilled within <b>45 days</b>. <br></br>
                        <ul className="my-1 list-disc">
                          <li className="font-medium ml-4">
                            Branch 1 to fulfill :{' '}
                            {import.meta.env.VITE_MAX_IDS_OF_BRANCH -
                              notEnoughtChild1 >
                            0
                              ? import.meta.env.VITE_MAX_IDS_OF_BRANCH -
                                notEnoughtChild1
                              : 0}{' '}
                            IDs
                          </li>
                          <li className="font-medium ml-4">
                            Branch 2 to fulfill :{' '}
                            {import.meta.env.VITE_MAX_IDS_OF_BRANCH -
                              notEnoughtChild2 >
                            0
                              ? import.meta.env.VITE_MAX_IDS_OF_BRANCH -
                                notEnoughtChild2
                              : 0}{' '}
                            IDs
                          </li>
                        </ul>
                        By clicking <b>"Yes"</b>, the member agrees to complete
                        <b> 128 active IDs</b> in both <b> Branch 1</b> and{' '}
                        <b> Branch 2</b>.
                      </div>
                      <div className="w-full flex justify-around items-center">
                        <button
                          onClick={() => navigate('/user/profile')}
                          className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-md hover:opacity-70"
                        >
                          No
                        </button>
                        <button
                          onClick={() => setShowCommit(false)}
                          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:opacity-70"
                        >
                          Yes
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Modal>
            {resStatus === 'PENDING' && (
              <div
                className="bg-orange-100 border border-orange-400 text-orange-700 px-4 py-3 rounded relative mb-5"
                role="alert"
              >
                <span className="block sm:inline">{resMessage}</span>
              </div>
            )}
            {resStatus === 'OK' && (
              <>
                <div
                  className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-5"
                  role="alert"
                >
                  <span className="block sm:inline">{resMessage}</span>
                </div>
                <div className="w-full max-w-203 mx-auto rounded-lg bg-white p-10 text-gray-700 mt-4">
                  <div className="mb-10">
                    <h1 className="text-center font-bold text-4xl">
                      Secure payment for Tier {userInfo.tier + 1 - step}
                    </h1>
                  </div>
                  {step !== 0 && (
                    <div className="space-y-2  mb-10">
                      <h1 className="text-lg font-semibold">
                        Please select the subordinate to assign a sub ID :
                      </h1>
                      <Select
                        options={listChild.map((ele) => ({
                          value: ele.id,
                          label: ele.userName,
                        }))}
                        onChange={(e) => {
                          setChildId(e.value);
                        }}
                        className="w-full mb-1 border text-black border-black rounded-md focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                      />
                      {errSubId && (
                        <p className="text-red-500 mt-1 text-sm">
                          Please select a subordinate
                        </p>
                      )}
                    </div>
                  )}

                  {(step === 0 || (step <= userInfo.tier && childId)) && (
                    <>
                      {loadingListPayment ? (
                        <div className="w-xl flex justify-center">
                          <Loading />
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between">
                            <div className="mb-3">
                              <p className="text-lg mb-2 ml-1">
                                <span className="font-bold">Total</span> :{' '}
                                {total} USDT
                              </p>
                            </div>
                          </div>
                          {paymentIdsList.map((payment, i) => (
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
                                    <span className="font-medium mr-2">
                                      To :{' '}
                                    </span>
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
                        </>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
            {resStatus === 'DONE' && (
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

export default PaymentTier2WithPrePoolPage;
