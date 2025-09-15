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
import ClaimModal from '../../../components/ClaimModal';
import { Link, useNavigate } from 'react-router-dom';

ChartJS.register(ArcElement, Tooltip, Legend);

const Profile = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  let {
    email,
    userId,
    changeCreatedAt,
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
    availableAmc,
    walletAddress,
    claimedHewe,
    ranking,
    totalEarning,
    totalHold,
    withdrawPending,
    bonusRef,
    currentLayer,
    facetecTid,
    errLahCode,
    pendingUpdateInfo,
    notEnoughtChild,
    tryToTier2,
    countdown,
    isMoveSystem,
    lockKyc,
    accountName,
    accountNumber,
    city,
    subUser,
    checkCanNextTier,
    preTier2Status,
    preTier2User,
    shortfallAmount,
    tier2ChildUsers,
  } = userInfo;

  const [phoneNumber, setPhoneNumber] = useState(phone);
  const [errorPhone, setErrPhone] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [loadingClaimHewe, setLoadingClaimHewe] = useState(false);
  const [loadingClaimUsdt, setLoadingClaimUsdt] = useState(false);
  const [loadingClaimAmc, setLoadingClaimAmc] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showFaceId, setShowFaceId] = useState(
    lockKyc === false && facetecTid === '' ? true : false,
  );
  const [showLockKyc, setShowLockKyc] = useState(lockKyc);
  const [showMoveSystem, setShowMoveSystem] = useState(false);
  const [errAgrre, setErrAgrre] = useState(false);
  const [valueCheckAgrree, setValueCheckAgrree] = useState('');
  const [showNextTier, setShowNextTier] = useState(false);
  const [showPreTier2Commit, setShowPreTier2Commit] = useState(
    tier === 1 &&
      (preTier2Status === 'APPROVED' || preTier2Status === 'ACHIEVED')
      ? true
      : false,
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
      accountName,
      accountNumber,
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

  // const claimHewe = async () => {
  //   setLoadingClaimHewe(true);
  //   await KYC.claim({ coin: 'hewe' })
  //     .then((response) => {
  //       if (response.data.url) {
  //         window.location.href = response.data.url;
  //       }
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

  const claimUsdt = async (amount) => {
    setLoadingClaimUsdt(true);
    await KYC.claim({ coin: 'usdt', amount })
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

  const claimHewe = async () => {
    setLoadingClaimHewe(true);
    await Claim.hewe()
      .then((response) => {
        toast.success(t(response.data.message));
        setLoadingClaimHewe(false);
        setRefresh(!refresh);
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

  const claimAmc = async () => {
    setLoadingClaimAmc(true);
    await KYC.claim({ coin: 'amc' })
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
        setLoadingClaimAmc(false);
      });
  };

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
          dispatch(UPDATE_USER_INFO(response.data));
          if (response.data.checkCanNextTier) {
            setShowNextTier(true);
          }
          if (response.data.preTier2Status === 'PASSED') {
            setShowPreTier2Commit(false);
          }
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

  const handleChangeTickAgrree = (e) => {
    setValueCheckAgrree(e.target.value);
  };

  const handleMoveSystem = useCallback(async () => {
    if (valueCheckAgrree === 'on') {
      await KYC.moveSystem()
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
        });
    } else {
      setErrAgrre(true);
    }
  }, [valueCheckAgrree]);

  return (
    <DefaultLayout>
      <ToastContainer />
      <ClaimModal
        showModal={showModal}
        closeModal={closeModal}
        availableUsdt={availableUsdt}
        claimUsdt={claimUsdt}
        loadingClaimUsdt={loadingClaimUsdt}
      />

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
                    account being <b>blocked</b> at 24:00.
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
      {/* <Modal
        isOpen={showNextTier}
        onRequestClose={() => setShowNextTier(false)}
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
                onClick={() => setShowNextTier(false)}
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
                  className="text-left text-gray-700 font-medium rounded relative mb-5"
                  role="alert"
                >
                  <span className="text-xl">🎉 Congratulations! </span>
                  <br></br>
                  You have conquered Tier 1 and are now qualified to rise into{' '}
                  <b>Tier 2</b>!<br></br>🚀 This achievement proves your
                  commitment, discipline, and belief in yourself. But this is
                  only the beginning — greater challenges bring greater rewards.
                  <br></br>🔥 Keep pushing. Keep growing. Keep conquering.
                  Because every step you take brings you closer to becoming a
                  Legend.
                </div>
                <div>
                  <button
                    onClick={() => navigate('/user/payment')}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:opacity-70"
                  >
                    Proceed to Payment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal> */}
      <Modal
        isOpen={showLockKyc}
        onRequestClose={() => {
          setShowLockKyc(false);
          setShowFaceId(false);
        }}
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
                onClick={() => {
                  setShowLockKyc(false);
                  setShowFaceId(false);
                }}
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
                  className="text-left text-lg text-red-700 rounded relative mb-5"
                  role="alert"
                >
                  <span className="block sm:inline">
                    KYC function for your account has been <b> locked</b>,
                    please
                    <b> contact admin to unlock</b> this function.
                  </span>
                </div>
                <div>
                  <button
                    onClick={() => {
                      setShowLockKyc(false);
                      setShowFaceId(false);
                    }}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:opacity-70"
                  >
                    Skip
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={showMoveSystem}
        onRequestClose={() => setShowMoveSystem(false)}
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
                onClick={() => setShowMoveSystem(false)}
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
                  className="text-left text-gray-900 rounded relative mb-5"
                  role="alert"
                >
                  Members agree to transfer ID at <b>No Excuse Challenge</b>{' '}
                  through
                  <b> DreamChain</b>.
                  <ul className="list-disc">
                    <li className="ml-4">
                      Participate in activities at <b>DreamChain</b> (completely
                      voluntary participation without being forced or influenced
                      by outside forces.)
                    </li>
                    <li className="ml-4">
                      {' '}
                      When participating in <b>DreamChain</b>, members
                      voluntarily give up all rights and claims related to{' '}
                      <b>No Excuse Challenge</b>.
                    </li>
                  </ul>
                  <div className="my-4 flex items-center justify-center gap-2">
                    <input
                      type="checkbox"
                      id="agree"
                      onChange={handleChangeTickAgrree}
                    />
                    <label htmlFor="agree">I have read and agree</label>
                  </div>
                  {errAgrre && (
                    <div className="text-center text-red-500 italic">
                      Please read and confirm{' '}
                    </div>
                  )}
                </div>
                <div>
                  <button
                    onClick={handleMoveSystem}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:opacity-70"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showPreTier2Commit}
        onRequestClose={() => setShowPreTier2Commit(false)}
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
                onClick={() => setShowPreTier2Commit(false)}
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
                  className="text-left text-gray-900 rounded relative mb-5"
                  role="alert"
                >
                  <div className="mb-4">
                    <p className="text-center font-semibold text-lg mb-2">
                      Pre-Tier 2 (Mutual Support Fund)
                    </p>
                    <ul className="list-disc">
                      <li className="ml-4">
                        To enter Pre-Tier 2, contribute 231 USDT to the Support
                        Fund.
                      </li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-center font-semibold text-lg mb-2">
                      Tier 2 (Global Fund)
                    </p>
                    <ul className="list-disc">
                      <li className="ml-4">
                        When you qualify for Tier 2, your{' '}
                        <b>
                          total package is 603 USDT for Tier 2 and recycle back
                          to tier 1
                        </b>
                        , which includes a <b>402 USDT</b> Support Pool loan.
                      </li>
                      <li className="ml-4">
                        The <b>402 USDT</b> loan will be{' '}
                        <b>deducted from your Tier 2 benefits</b> until it’s
                        fully repaid.
                      </li>
                      <li className="ml-4">
                        After completing Tier 2, you{' '}
                        <b>recycle back to Tier 1.</b>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="flex items-center gap-10">
                  <button
                    onClick={() => setShowPreTier2Commit(false)}
                    className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-md hover:opacity-70"
                  >
                    I DISAGREED
                  </button>
                  <button
                    onClick={handleMoveSystem}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:opacity-70"
                  >
                    <Link to="/user/payment-pre-tier-2">I AGREED</Link>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <div className="px-2 lg:px-24 py-24 space-y-6 lg:space-y-8">
        {/* {tier === 1 &&
          (preTier2Status === 'APPROVED' || preTier2Status === 'ACHIEVED') && (
            <div
              className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative mb-5 font-medium"
              role="alert"
            >
              <span className="block sm:inline">
                Congratulations! You’re eligible for Pre-Tier 2.{' '}
                <Link to="/user/payment-pre-tier-2" className="underline">
                  {' '}
                  Go to the payment page now.
                </Link>
              </span>
            </div>
          )} */}

        {tier === 1 && preTier2Status === 'PASSED' && !preTier2User && (
          <div
            className="bg-blue-100 border w-fit border-blue-400 text-blue-700 px-4 py-3 rounded relative mb-5 font-medium"
            role="alert"
          >
            <span className="block sm:inline">
              Congratulations! You’re on the waiting list for Tier 2 in the
              Pre-Tier2 program
            </span>
          </div>
        )}

        {preTier2User && (
          <div
            className="bg-blue-100 w-fit border border-blue-400 text-blue-700 px-4 py-3 rounded relative mb-5 font-medium"
            role="alert"
          >
            <span className="block sm:inline">
              Congratulations! You’re eligible for Tier 2 with the new Pre-Tier2
              program.{' '}
              <Link
                to="/user/payment-for-tier-with-pre-tier-2-pool"
                className="underline"
              >
                {' '}
                Go to the payment page now.
              </Link>
            </span>
          </div>
        )}

        {bonusRef && (
          <div
            className="bg-green-100 w-fit border border-green-400 text-green-700 px-4 py-3 rounded relative mb-5"
            role="alert"
          >
            <span className="block sm:inline">
              {t('Have received 10 USDT from DreamPool fund')}
            </span>
          </div>
        )}

        {pendingUpdateInfo && (
          <div
            className="bg-orange-100 w-fit border border-orange-400 text-orange-700 px-4 py-3 rounded relative mb-5"
            role="alert"
          >
            <span className="block sm:inline">
              {t('Your information update is awaiting admin approval')}
            </span>
          </div>
        )}

        {(phone === '' || idCode === '') && (
          <div
            className="bg-red-100 border w-fit border-red-400 text-red-700 px-4 py-3 rounded relative mb-5"
            role="alert"
          >
            <span className="block sm:inline">{t('infoAccountAlert')}</span>
          </div>
        )}

        {tier === 2 && tryToTier2 !== '' && tryToTier2 !== 'DONE' && (
          <div
            className="text-lg w-fit bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-5"
            role="alert"
          >
            <span className="block sm:inline">
              {tryToTier2 === 'YES'
                ? `You have only ${countdown} days left to complete the 62
              required IDs to be eligible for Tier 2 benefits.`
                : `You have run out of sales compensation time.`}
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
              availableHewe === 0 ? 'opacity-30' : ''
            }`}
            disabled={availableHewe === 0}
            onClick={claimHewe}
          >
            {loadingClaimHewe && <Loading />}
            WITHDRAW HEWE
          </button>
        </div>
        {/* <div className="bg-[#FAFBFC] p-4 rounded-2xl flex 2xl:flex-row flex-col items-start 2xl:items-center xl:justify-between gap-8">
          <div className="w-full flex gap-4 items-center justify-between lg:justify-center">
            <p className="font-medium">Available AMC</p>
            <input
              className="bg-black rounded-xl text-NoExcuseChallenge p-2 flex-1"
              readOnly
              value={availableAmc}
            />
          </div>
          <button
            className={`w-full border border-black rounded-2xl px-12 py-2 flex justify-center hover:bg-black hover:text-white ${
              availableAmc === 0 ? 'opacity-30' : ''
            }`}
            disabled={availableAmc === 0}
            onClick={claimAmc}
          >
            {loadingClaimAmc && <Loading />}
            WITHDRAW AMC
          </button>
        </div> */}
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
                <p> {new Date(changeCreatedAt).toLocaleDateString('vi')}</p>
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
              {
                <div className="flex items-center justify-between py-2 px-4 rounded-lg">
                  <p>Outstanding Pre-Tier2 Pool Amount</p>
                  <div
                    className={`p-2 text-sm bg-green-600 text-white rounded-[50px]`}
                  >
                    {shortfallAmount} USD
                  </div>
                </div>
              }
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
                                ele.isRed
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
            <div className="bg-[#FAFBFC] p-4 rounded-2xl">
              <div className="py-2 px-4">
                <p className="uppercase mt-2 font-bold">Tier 2 Users</p>
                <div className="lg:py-2">
                  <ul className="flex flex-row flex-wrap gap-2">
                    {tier2ChildUsers?.map((ele) => (
                      <li className="" key={ele}>
                        <div className="py-2">
                          <div className="text-base w-full">
                            <span
                              className={`${
                                ele.isRed
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
                              {ele}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            {tier === 2 && (
              <div className="bg-[#FAFBFC] p-4 rounded-2xl">
                <div className="py-2 px-4">
                  <p className="uppercase mt-2 font-bold">{t('ACTIVE ID')}</p>
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
                    {t('NUMBERS OF ID REQUIRE')}
                  </p>
                  <div className="lg:py-2">
                    <ul className="flex flex-col list-disc">
                      {(() => {
                        const c1 = notEnoughtChild?.countChild1 ?? 0;
                        const c2 = notEnoughtChild?.countChild2 ?? 0;

                        // Xác định nhánh mạnh / yếu
                        const isBranch1Strong = c1 >= c2;

                        const target1 = isBranch1Strong ? 42 : 20;
                        const target2 = isBranch1Strong ? 20 : 42;

                        const b1 = Math.max(target1 - c1, 0);
                        const b2 = Math.max(target2 - c2, 0);

                        return (
                          <>
                            <li className="ml-4">Branch 1 : {b1} IDs</li>
                            <li className="ml-4">Branch 2 : {b2} IDs</li>
                          </>
                        );
                      })()}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-between">
          {/* <button
            className={`bg-blue-900 text-white px-6 py-2 rounded-lg ${
              isMoveSystem ? 'opacity-40' : ''
            }`}
            onClick={() => setShowMoveSystem(true)}
            disabled={isMoveSystem}
          >
            Migrate ID to dreamchain
          </button> */}
          {tier >= 2 && subUser && (
            <button
              className={`bg-blue-600 text-white px-6 py-2 rounded-lg`}
              onClick={() => navigate(`/user/sub/${subUser._id}`)}
            >
              Profile {subUser.userName}
            </button>
          )}

          {errLahCode !== 'OVER45' && !isEdit && status === 'APPROVED' && (
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
          )}
        </div>
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
            {city === 'US' && (
              <>
                <div className="grid lg:grid-cols-2 gap-2 lg:gap-0 py-2 px-4 rounded-lg">
                  <p>Payout Display Name :</p>
                  <p>{accountName}</p>
                </div>
                <div className="grid lg:grid-cols-2 gap-2 lg:gap-0 bg-[#E5E9EE] py-2 px-4 rounded-lg">
                  <p>Payout Email or Phone Number :</p>
                  <p>{accountNumber}</p>
                </div>
              </>
            )}
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
