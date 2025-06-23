import { useDispatch, useSelector } from 'react-redux';
import DefaultLayout from '../../../layout/DefaultLayout';
import { shortenWalletAddress } from '../../../utils';
import { useTranslation } from 'react-i18next';
import Loading from '@/components/Loading';
import { UPDATE_USER_INFO } from '@/slices/auth';
import { useForm } from 'react-hook-form';
import User from '@/api/User';
import KYC from '@/api/KYC';
import Claim from '@/api/Claim';
import { useCallback, useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import USER_RANKINGS from '@/constants/userRankings';
import Modal from 'react-modal';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import PhoneInput from 'react-phone-number-input';
import './index.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const Profile = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  let {
    email,
    userId,
    createdAt,
    id,
    status,
    tier,
    fine,
    countPay,
    listDirectUser,
    phone,
    idCode,
    buyPackage,
    totalHewe,
    availableHewe,
    availableUsdt,
    walletAddress,
    claimedHewe,
    ranking,
    totalEarning,
    totalHold,
    withdrawPending,
    bonusRef,
    currentLayer,
    facetecTid,
    kycFee,
    errLahCode,
    pendingUpdateInfo,
    notEnoughtChild,
    tryToTier2,
    countdown,
  } = userInfo;

  const [phoneNumber, setPhoneNumber] = useState(phone);
  const [errorPhone, setErrPhone] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [loadingClaimHewe, setLoadingClaimHewe] = useState(false);
  const [loadingClaimUsdt, setLoadingClaimUsdt] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showFaceId, setShowFaceId] = useState(
    facetecTid === '' ? true : false,
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      idCode: status !== 'REJECTED' ? idCode : null,
      phone,
      email,
      walletAddress,
      imgBackData: '',
      imgFrontData: '',
    },
  });

  const onSubmit = useCallback(
    async (data) => {
      const { walletAddress, email } = data;
      if (!phoneNumber || phoneNumber === '') {
        setErrPhone(true);
      } else {
        setErrPhone(false);
        const callbackUrl = `${
          import.meta.env.VITE_URL
        }/user/update-info?walletAddress=${walletAddress}&phone=${phoneNumber}&email=${email}`;
        window.location.href = `${
          import.meta.env.VITE_FACETEC_URL
        }/verify.html?callback=${encodeURIComponent(
          callbackUrl,
        )}&user_id=${id}`;
      }
    },
    [phoneNumber],
  );

  const claimHewe = async () => {
    setLoadingClaimHewe(true);
    await KYC.claim({ coin: 'hewe' })
      .then((response) => {
        if (response.data.url) {
          window.location.href = response.data.url;
        }
      })
      .catch((error) => {
        let message =
          error.response && error.response.data.error
            ? error.response.data.error
            : error.message;
        toast.error(t(message));
        setLoadingClaimHewe(false);
      });
  };

  const claimUsdt = async () => {
    setLoadingClaimUsdt(true);
    await KYC.claim({ coin: 'usdt' })
      .then((response) => {
        if (response.data.url) {
          window.location.href = response.data.url;
        }
      })
      .catch((error) => {
        let message =
          error.response && error.response.data.error
            ? error.response.data.error
            : error.message;
        toast.error(t(message));
        setLoadingClaimHewe(false);
      });
  };

  // const claimHewe = async () => {
  //   setLoadingClaimHewe(true);
  //   await Claim.hewe()
  //     .then((response) => {
  //       toast.success(t(response.data.message));
  //       setLoadingClaimHewe(false);
  //       setRefresh(!refresh);
  //     })
  //     .catch((error) => {
  //       let message =
  //         error.response && error.response.data.error
  //           ? error.response.data.error
  //           : error.message;
  //       toast.error(t(message));
  //       setLoadingClaimHewe(false);
  //     });
  // };

  // const claimUsdt = async () => {
  //   setLoadingClaimUsdt(true);
  //   await Claim.usdt()
  //     .then((response) => {
  //       toast.success(t(response.data.message));
  //       setLoadingClaimUsdt(false);
  //       setShowModal(false);
  //       setRefresh(!refresh);
  //     })
  //     .catch((error) => {
  //       let message =
  //         error.response && error.response.data.error
  //           ? error.response.data.error
  //           : error.message;
  //       toast.error(t(message));
  //       setLoadingClaimUsdt(false);
  //     });
  // };

  useEffect(() => {
    (async () => {
      await User.getUserInfo()
        .then((response) => {
          if (response.data.facetecTid === '') {
            setShowFaceId(true);
          } else {
            setShowFaceId(false);
          }
          dispatch(UPDATE_USER_INFO(response.data));
        })
        .catch((error) => {
          let message =
            error.response && error.response.data.message
              ? error.response.data.message
              : error.message;
          toast.error(t(message));
        });
    })();
  }, [refresh]);

  const closeModal = () => {
    setShowModal(false);
  };

  const findNextRank = (level) => {
    const currentRankIndex = USER_RANKINGS.findIndex(
      (ele) => level <= ele.value,
    );
    return USER_RANKINGS[currentRankIndex + 1]?.label || 'PIONEER';
  };

  const renderRank = (level) => {
    return USER_RANKINGS.find((ele) => level <= ele.value).label;
  };

  const handleStartKYC = async () => {
    await KYC.startKYC()
      .then((response) => {
        if (response.data.url) {
          window.location.href = response.data.url;
        }
      })
      .catch((error) => {
        let message =
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message;
        toast.error(t(message));
      });
  };

  return (
    <DefaultLayout>
      <ToastContainer />
      <Modal
        isOpen={showModal}
        onRequestClose={closeModal}
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
              <button
                onClick={closeModal}
                className="text-gray-400 absolute top-2.5 right-2.5 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
              >
                <svg
                  aria-hidden="true"
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
              <svg
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-gray-400 w-11 h-11 mb-3.5 mx-auto"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M1.68542 6.65868C0.758716 6.96758 0.779177 8.28543 1.71502 8.56541L9.20844 10.8072L11.6551 18.5165C11.948 19.4394 13.2507 19.4488 13.5569 18.5302L18.8602 2.62029C19.1208 1.83853 18.3771 1.09479 17.5953 1.35538L1.68542 6.65868ZM5.31842 7.55586L16.3304 3.8852L12.6316 14.9817L10.9548 9.69826C10.8547 9.38295 10.6052 9.13754 10.2883 9.04272L5.31842 7.55586Z"
                  fill="currentColor"
                />
                <path
                  d="M17.7674 1.43951L18.8105 2.51742L9.98262 11.0605L8.93948 9.98265L17.7674 1.43951Z"
                  fill="currentColor"
                />
              </svg>
              <p className="mb-4 text-gray-500 ">
                Are you sure you want to claim {availableUsdt} USDT ?
              </p>
              <div className="flex justify-center items-center space-x-4">
                <button
                  onClick={closeModal}
                  disabled={loadingClaimUsdt}
                  className="py-2 px-3 text-sm font-medium text-gray-500 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-primary-300 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
                >
                  No, cancel
                </button>
                <button
                  onClick={claimUsdt}
                  disabled={loadingClaimUsdt}
                  className="flex items-center py-2 px-3 text-sm font-medium text-center text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 dark:bg-red-500 dark:hover:bg-red-600 dark:focus:ring-red-900"
                >
                  {loadingClaimUsdt && <Loading />}
                  Yes, I'm sure
                </button>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showFaceId}
        onRequestClose={() => setShowFaceId(false)}
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
              <button
                onClick={() => setShowFaceId(false)}
                className="text-gray-400 absolute top-2.5 right-2.5 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
              >
                <svg
                  aria-hidden="true"
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
              <div className="pr-6 flex flex-col items-center">
                <div
                  className="text-left text-red-700 rounded relative mb-5"
                  role="alert"
                >
                  <span className="block sm:inline">
                    <b>Attention:</b> To withdraw your assets, please ensure you
                    complete the KYC (Know Your Customer) diligence process.
                  </span>
                  <span>
                    Failure to complete the KYC process will result in your
                    account being <b>blocked</b> at 00:00.
                  </span>
                </div>
                <div>
                  <button
                    onClick={handleStartKYC}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:opacity-70"
                  >
                    <svg
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12.5 11V12.5L11.5 13M15 8V10M9 8V10M9 20H5C4.44772 20 4 19.5523 4 19V15M20 15V19C20 19.5523 19.5523 20 19 20H15M20 9V5C20 4.44772 19.5523 4 19 4H15M4 9V5C4 4.44772 4.44772 4 5 4H9M9 16C9 16 10 17 12 17C14 17 15 16 15 16"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Set Up Face ID
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
      <div className="px-2 lg:px-24 py-24 space-y-6 lg:space-y-8">
        {bonusRef && (
          <div
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-5"
            role="alert"
          >
            <span className="block sm:inline">
              {t('Have received 10 USDT from DreamPool fund')}
            </span>
          </div>
        )}

        {pendingUpdateInfo && (
          <div
            className="bg-orange-100 border border-orange-400 text-orange-700 px-4 py-3 rounded relative mb-5"
            role="alert"
          >
            <span className="block sm:inline">
              {t('Your information update is awaiting admin approval')}
            </span>
          </div>
        )}

        {kycFee && (
          <div
            className="w-full bg-orange-100 border border-orange-400 text-orange-700 px-4 py-3 rounded mb-5"
            role="alert"
          >
            <span className="block sm:inline">
              {t(
                'To enhance security, facial recognition verification and a 2 USDT/year fee will be applied. The fee will be auto-deducted annually. Thank you for your support!',
              )}
            </span>
          </div>
        )}

        {(phone === '' || idCode === '') && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-5"
            role="alert"
          >
            <span className="block sm:inline">{t('infoAccountAlert')}</span>
          </div>
        )}

        {tier === 2 && tryToTier2 === 'YES' && (
          <div
            className="w-full text-lg bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-5"
            role="alert"
          >
            <span className="block sm:inline">
              You have only <b>{countdown}</b> days left to complete the 128
              required IDs to be eligible for Tier 2 benefits.
            </span>
          </div>
        )}

        <div className="bg-[#FAFBFC] p-4 rounded-2xl flex 2xl:flex-row flex-col items-start 2xl:items-center xl:justify-between gap-8">
          <div className="w-full flex gap-4 items-center justify-between lg:justify-center">
            <p className="font-medium">Available HEWE</p>
            <input
              className="bg-black rounded-xl text-NoExcuseChallenge p-2 flex-1"
              readOnly
              value={availableHewe}
            />
          </div>
          <div className="w-full flex gap-4 items-center justify-between lg:justify-center">
            <p className="font-medium">Reward HEWE</p>
            <input
              className="bg-black rounded-xl text-NoExcuseChallenge p-2 flex-1"
              readOnly
              value={
                tier > 1
                  ? 0
                  : totalHewe > 0
                  ? totalHewe - claimedHewe - availableHewe
                  : availableHewe
              }
            />
          </div>
          <button
            className={`w-full border border-black rounded-2xl px-12 py-2 flex justify-center hover:bg-black hover:text-white ${
              availableHewe === 0 || status !== 'APPROVED' || facetecTid === ''
                ? 'opacity-30'
                : ''
            }`}
            disabled={
              availableHewe === 0 || status !== 'APPROVED' || facetecTid === ''
            }
            onClick={claimHewe}
          >
            {loadingClaimHewe && <Loading />}
            WITHDRAW HEWE
          </button>
        </div>
        <div className="bg-[#FAFBFC] p-4 rounded-2xl flex 2xl:flex-row flex-col items-start xl:items-center gap-8">
          <div className="w-full flex gap-4 items-center justify-between lg:justify-center">
            <p className="font-medium">Available USDT</p>
            <input
              className="bg-black rounded-xl text-NoExcuseChallenge p-2 flex-1"
              readOnly
              value={availableUsdt}
            />
          </div>
          <div className="w-full flex gap-4 items-center justify-between lg:justify-center">
            <p className="font-medium">Processing USDT</p>
            <input
              className="bg-black rounded-xl text-NoExcuseChallenge p-2 flex-1"
              readOnly
              value={withdrawPending}
            />
          </div>
          <button
            className={`w-full border border-black rounded-2xl px-12 py-2 flex justify-center hover:bg-black hover:text-white ${
              errLahCode === 'OVER45' ||
              availableUsdt === 0 ||
              status !== 'APPROVED' ||
              facetecTid === ''
                ? 'opacity-30'
                : ''
            }`}
            disabled={
              errLahCode === 'OVER45' ||
              availableUsdt === 0 ||
              status !== 'APPROVED' ||
              facetecTid === ''
            }
            onClick={() => setShowModal(true)}
          >
            WITHDRAW USDT
          </button>
        </div>
        <div className={`grid gap-10 font-semibold`}>
          <div className={`grid lg:grid-cols-2 gap-2`}>
            <div className="bg-[#FAFBFC] p-4 rounded-2xl">
              <div className="flex justify-between items-center py-2 px-4">
                <p>Status</p>
                <div
                  className={`p-2 text-sm ${
                    status === 'UNVERIFY'
                      ? 'bg-red-600'
                      : status === 'PENDING'
                      ? 'bg-yellow-600'
                      : status === 'APPROVED'
                      ? 'bg-green-600'
                      : status === 'REJECTED'
                      ? 'bg-red-600'
                      : status === 'LOCKED'
                      ? 'bg-red-600'
                      : ''
                  } text-white rounded-[50px]`}
                >
                  {status}
                </div>
              </div>
              <div className="flex justify-between bg-[#E5E9EE] py-2 px-4 rounded-lg">
                <p>Member since</p>
                <p> {new Date(createdAt).toLocaleDateString('vi')}</p>
              </div>
              <div className="flex justify-between py-2 px-4">
                <p>Completed ranking time</p>
                <p className="whitespace-nowrap">
                  {userInfo[`tier${ranking}Time`]}
                </p>
              </div>
            </div>
            <div className="bg-[#FAFBFC] p-4 rounded-2xl">
              <div className="flex justify-between items-center py-2 px-4">
                <p>Rank</p>
                {countPay !== 0 && (
                  <div
                    className={`p-2 text-sm bg-green-600 text-white rounded-[50px]`}
                  >
                    {renderRank(currentLayer[0] ? currentLayer[0] : 0)}
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center bg-[#E5E9EE] py-2 px-4 rounded-lg">
                <p>Next Rank</p>
                {countPay !== 0 && (
                  <div
                    className={`p-2 text-sm bg-green-600 text-white rounded-[50px]`}
                  >
                    {findNextRank(currentLayer[0] ? currentLayer[0] : 0)}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between py-2 px-4">
                <p>Total Earned</p>
                <div
                  className={`p-2 text-sm bg-green-600 text-white rounded-[50px]`}
                >
                  {totalEarning} USD
                </div>
              </div>
              <div className="flex items-center justify-between bg-[#E5E9EE] py-2 px-4 rounded-lg">
                <p>Total Hold</p>
                <div
                  className={`p-2 text-sm bg-green-600 text-white rounded-[50px]`}
                >
                  {totalHold} USD
                </div>
              </div>
            </div>

            <div className="bg-[#FAFBFC] p-4 rounded-2xl">
              <div className="py-2 px-4">
                <p className="uppercase mt-2 font-bold">{t('children')}</p>
                <div className="lg:py-2">
                  <ul className="flex flex-row flex-wrap gap-2">
                    {listDirectUser.map((ele) => (
                      <li className="" key={ele.userId}>
                        <div className="py-2">
                          <div className="text-base w-full">
                            <span
                              className={`${
                                ele.isGray
                                  ? 'bg-[#8c8c8c]'
                                  : ele.isRed
                                  ? 'bg-[#b91c1c]'
                                  : ele.isBlue
                                  ? 'bg-[#0000ff]'
                                  : ele.isYellow
                                  ? 'bg-[#F4B400]'
                                  : ele.isPink
                                  ? 'bg-[#e600769c]'
                                  : 'bg-[#16a34a]'
                              } py-1 px-2 rounded text-white text-sm min-w-fit`}
                            >
                              {ele.userId}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            {(currentLayer[0] === 5 || tier === 2) && (
              <div className="bg-[#FAFBFC] p-4 rounded-2xl">
                <div className="py-2 px-4">
                  <p className="uppercase mt-2 font-bold">
                    {t('Sales are working')}
                  </p>
                  <div className="lg:py-2">
                    <ul className="flex flex-col list-disc">
                      <li className="ml-4">
                        Branch 1 : {notEnoughtChild?.countChild1} IDs
                      </li>
                      <li className="ml-4">
                        Branch 2 : {notEnoughtChild?.countChild2} IDs
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="py-2 px-4">
                  <p className="uppercase mt-2 font-bold">
                    {t('Sales must be compensated')}
                  </p>
                  <div className="lg:py-2">
                    <ul className="flex flex-col list-disc">
                      <li className="ml-4">
                        Branch 1 :{' '}
                        {import.meta.env.VITE_MAX_IDS_OF_BRANCH -
                          notEnoughtChild?.countChild1 >
                        0
                          ? import.meta.env.VITE_MAX_IDS_OF_BRANCH -
                            notEnoughtChild?.countChild1
                          : 0 || 0}{' '}
                        IDs
                      </li>
                      <li className="ml-4">
                        Branch 2 :{' '}
                        {import.meta.env.VITE_MAX_IDS_OF_BRANCH -
                          notEnoughtChild?.countChild2 >
                        0
                          ? import.meta.env.VITE_MAX_IDS_OF_BRANCH -
                            notEnoughtChild?.countChild2
                          : 0 || 0}{' '}
                        IDs
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {errLahCode !== 'OVER45' && !isEdit && status === 'APPROVED' && (
          <div className="flex justify-end">
            <button
              onClick={() => setIsEdit(true)}
              className="flex gap-2 font-semibold py-2 px-4 rounded-lg"
            >
              Update{' '}
              <svg
                width="18"
                height="21"
                viewBox="0 0 18 21"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15.675 1.63718C15.3938 1.35583 15.0599 1.13267 14.6924 0.980441C14.325 0.828213 13.9311 0.749907 13.5333 0.75C13.1355 0.750093 12.7417 0.828583 12.3743 0.980982C12.0068 1.13338 11.6731 1.3567 11.392 1.63818L1.885 11.1582C1.31853 11.7259 1.00028 12.4951 1 13.2972V16.5002C1 16.9142 1.336 17.2502 1.75 17.2502H4.973C5.776 17.2502 6.546 16.9302 7.113 16.3632L16.613 6.85718C17.1797 6.28915 17.4979 5.51954 17.4979 4.71718C17.4979 3.91481 17.1797 3.1452 16.613 2.57718L15.675 1.63718ZM0.75 18.7502C0.551088 18.7502 0.360322 18.8292 0.21967 18.9698C0.0790175 19.1105 0 19.3013 0 19.5002C0 19.6991 0.0790175 19.8899 0.21967 20.0305C0.360322 20.1712 0.551088 20.2502 0.75 20.2502H16.75C16.9489 20.2502 17.1397 20.1712 17.2803 20.0305C17.421 19.8899 17.5 19.6991 17.5 19.5002C17.5 19.3013 17.421 19.1105 17.2803 18.9698C17.1397 18.8292 16.9489 18.7502 16.75 18.7502H0.75Z"
                  fill="#02071B"
                />
              </svg>
            </button>
          </div>
        )}
        {isEdit && (
          <div className="flex justify-end">
            <button
              onClick={() => setIsEdit(false)}
              className="flex gap-2 font-semibold py-2 px-4 rounded-lg"
            >
              Cancel
              <svg
                fill="currentColor"
                width="24"
                height="24"
                viewBox="-28 0 512 512"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>cancel</title>
                <path d="M64 388L196 256 64 124 96 92 228 224 360 92 392 124 260 256 392 388 360 420 228 288 96 420 64 388Z" />
              </svg>
            </button>
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          encType="multipart/form-data"
          className="grid gap-10 font-semibold"
        >
          <div className="bg-[#FAFBFC] p-4 rounded-2xl ">
            <div className="grid lg:grid-cols-2 gap-2 lg:gap-0 items-center py-2 px-4">
              <p>Referral code : </p>
              <p>{id}</p>
            </div>
            <div className="grid lg:grid-cols-2 gap-2 lg:gap-0 bg-[#E5E9EE] py-2 px-4 rounded-lg">
              <p>Name :</p>
              <p>{userId}</p>
            </div>
            <div className="grid lg:grid-cols-2 gap-2 lg:gap-0 items-center py-2 px-4">
              <p>Email :</p>
              {isEdit ? (
                <div className="">
                  <input
                    className="w-full px-4 py-1.5 rounded-md border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                    {...register('email', {
                      required: t('email is required'),
                    })}
                    autoComplete="off"
                  />
                  <p className="text-sm text-red-500">
                    {errors.email?.message}
                  </p>
                </div>
              ) : (
                <p>{email}</p>
              )}
            </div>
            <div className="grid lg:grid-cols-2 gap-2 lg:gap-0 bg-[#E5E9EE] py-2 px-4 rounded-lg">
              <p>Phone number :</p>
              {isEdit ? (
                <div className="">
                  <PhoneInput
                    defaultCountry="VN"
                    placeholder={t('phone')}
                    value={phoneNumber}
                    onChange={setPhoneNumber}
                    className="-my-1 ml-4 w-full"
                  />
                  <p className="text-red-500 text-sm">
                    {errorPhone && t('Phone is required')}
                  </p>
                </div>
              ) : (
                <p>{phone}</p>
              )}
            </div>
            <div className="grid lg:grid-cols-2 gap-2 lg:gap-0 items-center py-2 px-4">
              <p>ID/DL/Passport number :</p>
              {isEdit && status !== 'APPROVED' ? (
                <div className="">
                  <input
                    className="w-full px-4 py-1.5 rounded-md border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                    {...register('idCode', {
                      required: t('id code is required'),
                    })}
                    autoComplete="off"
                  />
                  <p className="text-sm text-red-500">
                    {errors.idCode?.message}
                  </p>
                </div>
              ) : (
                <p>{status !== 'REJECTED' && idCode}</p>
              )}
            </div>
            <div className="grid lg:grid-cols-2 gap-2 bg-[#E5E9EE] lg:gap-0 items-center py-2 px-4 rounded-lg">
              <p>Wallet Address :</p>
              {isEdit ? (
                <div className="">
                  <input
                    className="w-full px-4 py-1.5 rounded-md border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                    {...register('walletAddress', {
                      required: t('walletAddress is required'),
                    })}
                    autoComplete="off"
                  />
                  <p className="text-sm text-red-500">
                    {errors.walletAddress?.message}
                  </p>
                </div>
              ) : (
                <p>{shortenWalletAddress(walletAddress, 14)}</p>
              )}
            </div>
            <div className="grid lg:grid-cols-2 gap-2 lg:gap-0  py-2 px-4 rounded-lg">
              <p>Completed Registration :</p>
              <p>{countPay === 13 ? 'Finished' : 'Unfinished'}</p>
            </div>
            <div className="grid lg:grid-cols-2 gap-2 lg:gap-0 bg-[#E5E9EE]  py-2 px-4 rounded-lg">
              <p>Number of contribution :</p>
              <p>{countPay === 13 ? 10 : 0}</p>
            </div>
            <div className="grid lg:grid-cols-2 gap-2 lg:gap-0 py-2 px-4 rounded-lg">
              <p>Package :</p>
              <p>{buyPackage}</p>
            </div>
            <div className="grid lg:grid-cols-2 bg-[#E5E9EE] gap-2 lg:gap-0 rounded-lg py-2 px-4">
              <p>Fine :</p>
              <p>{fine} USDT</p>
            </div>
          </div>
          {isEdit && (
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center w-full px-8 py-3 my-6 font-medium border border-black transition duration-300 ease-in-out transform rounded-full shadow-lg hover:underline gradient focus:outline-none focus:shadow-outline hover:scale-105"
            >
              {loading && <Loading />}
              {t('update')}
            </button>
          )}
        </form>
      </div>
    </DefaultLayout>
  );
};

export default Profile;
