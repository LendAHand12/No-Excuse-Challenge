import { useDispatch, useSelector } from 'react-redux';
import DefaultLayout from '../../../layout/DefaultLayout';
import { shortenWalletAddress } from '../../../utils';
import { useTranslation } from 'react-i18next';
import Loading from '@/components/Loading';
import { UPDATE_USER_INFO } from '@/slices/auth';
import { useForm } from 'react-hook-form';
import UploadFile from './UploadInfo';
import User from '@/api/User';
import Claim from '@/api/Claim';
import { useCallback, useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import USER_RANKINGS from '@/constants/userRankings';
import Modal from 'react-modal';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(ArcElement, Tooltip, Legend);

const Profile = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  let {
    email,
    userId,
    walletAddress1,
    walletAddress2,
    walletAddress3,
    walletAddress4,
    walletAddress5,
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
    packages,
    tier1Time,
    tier2Time,
    tier3Time,
    tier4Time,
    tier5Time,
    isSerepayWallet,
    totalHewe,
    availableHewe,
    availableUsdt,
    walletAddress,
    heweWallet,
    claimedHewe,
    ranking,
    totalEarning,
    withdrawPending,
    chartData,
    targetSales,
  } = userInfo;
  const totalChild = chartData.reduce((acc, num) => acc + num, 0);
  const [imgFront, setImgFront] = useState('');
  const [imgBack, setImgBack] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(phone);
  const [errorPhone, setErrPhone] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [loadingClaimHewe, setLoadingClaimHewe] = useState(false);
  const [loadingClaimUsdt, setLoadingClaimUsdt] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const data = {
    labels: ['Group 1', 'Group 2', 'Group 3', 'Remaining target'],
    datasets: [
      {
        label: 'Members',
        data: [...chartData, targetSales - totalChild],
        backgroundColor: ['#FFCF65', '#02071B', '#C1C9D3', 'red'],
      },
    ],
  };

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      idCode,
      phone,
      imgBackData: '',
      imgFrontData: '',
    },
  });

  const onSubmit = useCallback(
    async (data) => {
      const { idCode } = data;
      if (!phoneNumber || phoneNumber === '') {
        setErrPhone(true);
      } else {
        setErrPhone(false);
        setLoading(true);
        var formData = new FormData();

        const { imgFront } = data;
        const [fileObjectImgFront] = imgFront;

        const { imgBack } = data;
        const [fileObjectImgBack] = imgBack;

        formData.append('phone', phoneNumber.trim());
        formData.append('idCode', idCode.trim());
        formData.append('imgFront', fileObjectImgFront);
        formData.append('imgBack', fileObjectImgBack);

        await User.update(id, formData)
          .then((response) => {
            setLoading(false);
            toast.success(t(response.data.message));
            dispatch(UPDATE_USER_INFO(response.data.data));
            setIsEdit(false);
          })
          .catch((error) => {
            let message =
              error.response && error.response.data.error
                ? error.response.data.error
                : error.message;
            toast.error(t(message));
            setLoading(false);
          });
      }
    },
    [imgFront, imgBack, phoneNumber],
  );

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

  const claimUsdt = async () => {
    setLoadingClaimUsdt(true);
    await Claim.usdt()
      .then((response) => {
        toast.success(t(response.data.message));
        setLoadingClaimUsdt(false);
        setShowModal(false);
        setRefresh(!refresh);
      })
      .catch((error) => {
        let message =
          error.response && error.response.data.error
            ? error.response.data.error
            : error.message;
        toast.error(t(message));
        setLoadingClaimUsdt(false);
      });
  };

  useEffect(() => {
    (async () => {
      await User.getUserInfo()
        .then((response) => {
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
                  className="py-2 px-3 text-sm font-medium text-gray-500 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-primary-300 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
                >
                  No, cancel
                </button>
                <button
                  onClick={claimUsdt}
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
      <div className="px-2 lg:px-24 py-24 space-y-6 lg:space-y-8">
        {status === 'UNVERIFY' && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-5"
            role="alert"
          >
            <span className="block sm:inline">{t('verifyAccountAlert')}</span>
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

        {(phone === '' || idCode === '') && (
          <div
            className="relative px-4 py-3 mb-5 text-red-700 bg-red-100 border border-red-400 rounded"
            role="alert"
          >
            <span className="block sm:inline">{t('infoAccountAlert')}</span>
          </div>
        )}

        <div className="bg-[#FAFBFC] p-4 rounded-2xl flex xl:flex-row flex-col items-start 2xl:items-center xl:justify-between gap-8">
          <div className="w-full flex gap-4 items-center justify-between lg:justify-center">
            <p className="font-medium">Available HEWE</p>
            <input
              className="bg-black rounded-xl text-dreamchain p-2 flex-1"
              readOnly
              value={availableHewe}
            />
          </div>
          <div className="w-full flex gap-4 items-center justify-between lg:justify-center">
            <p className="font-medium">Reward HEWE</p>
            <input
              className="bg-black rounded-xl text-dreamchain p-2 flex-1"
              readOnly
              value={totalHewe - claimedHewe - availableHewe}
            />
          </div>
          <button
            className={`w-full border border-black rounded-2xl px-12 py-2 flex justify-center hover:bg-black hover:text-white ${
              availableHewe === 0 || status !== 'APPROVED' ? 'opacity-30' : ''
            }`}
            disabled={availableHewe === 0 || status !== 'APPROVED'}
            onClick={claimHewe}
          >
            {loadingClaimHewe && <Loading />}
            WITHDRAW HEWE
          </button>
        </div>
        <div className="bg-[#FAFBFC] p-4 rounded-2xl flex xl:flex-row flex-col items-start xl:items-center gap-8">
          <div className="w-full flex gap-4 items-center justify-between lg:justify-center">
            <p className="font-medium">Available USDT</p>
            <input
              className="bg-black rounded-xl text-dreamchain p-2 flex-1"
              readOnly
              value={availableUsdt}
            />
          </div>
          <div className="w-full flex gap-4 items-center justify-between lg:justify-center">
            <p className="font-medium">Processing USDT</p>
            <input
              className="bg-black rounded-xl text-dreamchain p-2 flex-1"
              readOnly
              value={withdrawPending}
            />
          </div>
          <button
            className={`w-full border border-black rounded-2xl px-12 py-2 flex justify-center hover:bg-black hover:text-white ${
              availableUsdt === 0 || status !== 'APPROVED' ? 'opacity-30' : ''
            }`}
            disabled={availableUsdt === 0 || status !== 'APPROVED'}
            onClick={() => setShowModal(true)}
          >
            WITHDRAW USDT
          </button>
        </div>
        <div
          className={`grid ${
            ranking >= 2 ? 'lg:grid-cols-2' : ''
          }  gap-10 font-semibold`}
        >
          <div className={`${ranking >= 2 ? '' : 'grid grid-cols-2 gap-2'}`}>
            <div className="bg-[#FAFBFC] p-4 rounded-2xl mb-4">
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
              {/* <div className="flex justify-between py-2 px-4">
              <p>Completed tier 1</p>
              <p>{tier1Time}</p>
            </div> */}
            </div>
            <div className="bg-[#FAFBFC] p-4 rounded-2xl ">
              <div className="flex justify-between items-center py-2 px-4">
                <p>Rank</p>
                {ranking !== 0 && (
                  <div
                    className={`p-2 text-sm bg-green-600 text-white rounded-[50px]`}
                  >
                    {USER_RANKINGS.find((ele) => ele.value === ranking).label}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between bg-[#E5E9EE] py-2 px-4 rounded-lg">
                <p>Total Earned</p>
                <div
                  className={`p-2 text-sm bg-green-600 text-white rounded-[50px]`}
                >
                  {totalEarning} USD
                </div>
              </div>
              {/* <div className="flex justify-between py-2 px-4">
              <p>Completed tier 1</p>
              <p>{tier1Time}</p>
            </div> */}
            </div>
          </div>
          {ranking >= 2 && (
            <div className="bg-[#FAFBFC] p-4 rounded-2xl max-w-sm">
              <Doughnut
                data={data}
                plugins={[ChartDataLabels]}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom' as const,
                    },
                    tooltip: {
                      enabled: true,
                    },
                    datalabels: {
                      color: '#ffffff',
                      anchor: 'center',
                      font: { size: 16, weight: 'bold' },
                      formatter: (value) => {
                        return value <= 0
                          ? ''
                          : Math.round((value / targetSales) * 100) + '%';
                      },
                    },
                  },
                }}
              />
            </div>
          )}
        </div>
        {!isEdit && (
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
              <p>{email}</p>
            </div>
            <div className="grid lg:grid-cols-2 gap-2 lg:gap-0 bg-[#E5E9EE] py-2 px-4 rounded-lg">
              <p>Phone number :</p>
              <p>{phone}</p>
            </div>
            <div className="grid lg:grid-cols-2 gap-2 lg:gap-0 items-center py-2 px-4">
              <p>ID/DL/Passport number :</p>
              <p>{idCode}</p>
            </div>
            {/* <div className="grid lg:grid-cols-2 gap-2 lg:gap-0  py-2 px-4 rounded-lg">
              <p>Serepay wallet (USDT) :</p>
              <p>{shortenWalletAddress(walletAddress1, 14)}</p>
            </div> */}
            {/* <div className="grid lg:grid-cols-2 gap-2 lg:gap-0 bg-[#E5E9EE] py-2 px-4 rounded-lg">
              <p>Serepay wallet (HEWE) :</p>
              <p>{shortenWalletAddress(heweWallet, 14)}</p>
            </div> */}
            <div className="grid lg:grid-cols-2 gap-2 bg-[#E5E9EE] lg:gap-0 items-center py-2 px-4 rounded-lg">
              <p>Wallet Address :</p>
              <p>{shortenWalletAddress(walletAddress, 14)}</p>
            </div>
            {/* <div className="grid lg:grid-cols-2 gap-2 lg:gap-0 items-center py-2 px-4">
              <p>Wallet address Tier 2</p>
              <p>{shortenWalletAddress(walletAddress2, 14)}</p>
            </div>
            <div className="grid lg:grid-cols-2 gap-2 lg:gap-0 bg-[#E5E9EE] py-2 px-4 rounded-lg">
              <p>Wallet address Tier 3</p>
              <p>{shortenWalletAddress(walletAddress3, 14)}</p>
            </div>
            <div className="grid lg:grid-cols-2 gap-2 lg:gap-0 items-center py-2 px-4">
              <p>Wallet address Tier 4</p>
              <p>{shortenWalletAddress(walletAddress4, 14)}</p>
            </div>
            <div className="grid lg:grid-cols-2 gap-2 lg:gap-0 bg-[#E5E9EE] py-2 px-4 rounded-lg">
              <p>Wallet address Tier 5</p>
              <p>{shortenWalletAddress(walletAddress5, 14)}</p>
            </div> */}
            <div className="grid lg:grid-cols-2 gap-2 lg:gap-0  py-2 px-4 rounded-lg">
              <p>Completed Registration :</p>
              <p>{countPay === 13 ? 'Finished' : 'Unfinished'}</p>
            </div>
            <div className="grid lg:grid-cols-2 gap-2 lg:gap-0 bg-[#E5E9EE]  py-2 px-4 rounded-lg">
              <p>Number of contribution :</p>
              <p>{countPay === 13 ? 10 : 0}</p>
            </div>
            {/* <div className="grid grid-cols-2 bg-[#E5E9EE] py-2 px-4">
              <p>Tier :</p>
              <p>{tier}</p>
            </div> */}
            <div className="grid lg:grid-cols-2 gap-2 lg:gap-0 py-2 px-4 rounded-lg">
              <p>Package :</p>
              <p>{buyPackage}</p>
            </div>
            <div className="grid lg:grid-cols-2 bg-[#E5E9EE] gap-2 lg:gap-0 rounded-lg py-2 px-4">
              <p>Fine :</p>
              <p>{fine} USDT</p>
            </div>
            {status === 'UNVERIFY' ? (
              <>
                <div className="w-full flex justify-center">
                  <div className="w-full grid lg:grid-cols-2 gap-2 lg:gap-0 items-center py-2 px-4">
                    <p> {t('idCardFront')} :</p>
                    {isEdit && (
                      <div className="flex flex-col items-center justify-center w-full">
                        <UploadFile
                          register={register}
                          watch={watch}
                          required={false}
                          name="imgFront"
                        />
                        <p className="text-red-500 text-sm">
                          {errors.imgFront?.message}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-center bg-[#E5E9EE] rounded-lg">
                  <div className="w-full grid lg:grid-cols-2 gap-2 lg:gap-0 items-center py-2 px-4">
                    <p> {t('idCardBack')} :</p>
                    {isEdit && (
                      <div className="flex items-center justify-center w-full">
                        <UploadFile
                          register={register}
                          watch={watch}
                          required={false}
                          name="imgBack"
                        />
                        <p className="text-red-500 text-sm">
                          {errors.imgBack?.message}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="px-4 py-2 font-semibold">
                    {t('idCardFront')}
                  </div>
                  <img
                    src={`${
                      userInfo.imgFront.includes('cloudinary')
                        ? userInfo.imgFront
                        : import.meta.env.VITE_API_URL +
                          '/uploads/CCCD/' +
                          userInfo.imgFront
                    }`}
                    className="w-full px-4 py-2"
                  />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="px-4 py-2 font-semibold">
                    {t('idCardBack')}
                  </div>
                  <img
                    src={`${
                      userInfo.imgBack.includes('cloudinary')
                        ? userInfo.imgBack
                        : import.meta.env.VITE_API_URL +
                          '/uploads/CCCD/' +
                          userInfo.imgBack
                    }`}
                    className="w-full px-4 py-2"
                  />
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
