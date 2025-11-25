import { useCallback, useEffect, useState } from 'react';

import User from '@/api/User';
import KYC from '@/api/KYC';
import WildCard from '@/api/WildCard';
import Loading from '@/components/Loading';
import CreateWildCardModal from '@/components/CreateWildCardModal';
import USER_RANKINGS from '@/constants/userRankings';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import DefaultLayout from '../../../layout/DefaultLayout';
import { useSelector } from 'react-redux';
import DatePicker from 'react-datepicker';
import Switch from 'react-switch';
import PhoneInput from 'react-phone-number-input';
import banks from '@/lib/banks.json';

const UserProfile = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { pathname } = useLocation();
  const id = pathname.split('/')[3];
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [loadingCheckKyc, setLoadingCheckKyc] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [data, setData] = useState({});
  const [isEditting, setEditting] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [packageOptions, setPackageOptions] = useState([]);
  const [currentOpenLah, setCurrentOpenLah] = useState(null);
  const [currentCloseLah, setCurrentCloseLah] = useState(null);
  const [currentLockKyc, setCurrentLockKyc] = useState(null);
  const [currentTermDie, setCurrentTermDie] = useState(null);
  const [enablePaymentCrypto, setEnablePaymentCrypto] = useState(true);
  const [enablePaymentBank, setEnablePaymentBank] = useState(true);
  const [enableWithdrawCrypto, setEnableWithdrawCrypto] = useState(false);
  const [enableWithdrawBank, setEnableWithdrawBank] = useState(true);
  const [phone, setPhone] = useState('');
  const [errorPhone, setErrPhone] = useState(false);
  const [isBonusRef, setIsBonusRef] = useState(false);
  const [kycFee, setKycFee] = useState(false);
  const [walletChange, setWalletChange] = useState('');
  const [loadingChangeWallet, setLoadingChangeWallet] = useState(false);
  const createWildCardModal = CreateWildCardModal({
    userId: id,
    onSuccess: () => {
      setRefresh(!refresh);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
  } = useForm();

  const [wildCards, setWildCards] = useState([]);
  const [loadingWildCards, setLoadingWildCards] = useState(false);
  const [usingCardId, setUsingCardId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      await User.getUserById(id)
        .then((response) => {
          setLoading(false);
          setData(response.data);
          const {
            userId,
            email,
            phone,
            idCode,
            walletAddress,
            tier,
            openLah,
            closeLah,
            bonusRef,
            kycFee,
            changeCreatedAt,
            lockKyc,
            dieTimeTier1,
            dieTimeTier2,
            errLahCode,
            bankName,
            bankCode,
            accountName,
            accountNumber,
            dateOfBirth,
            enablePaymentCrypto,
            enablePaymentBank,
            enableWithdrawCrypto,
            enableWithdrawBank,
            wildCards,
          } = response.data;
          setWildCards(wildCards);
          setValue('userId', userId);
          setValue('email', email);
          setPhone(phone);
          setValue('idCode', idCode);
          setValue('tier', tier);
          setValue('walletAddress', walletAddress);
          setValue('changeCreatedAt', changeCreatedAt);
          // Set dieTimeTier1 và dieTimeTier2
          setValue('dieTimeTier1', dieTimeTier1 || null);
          setValue('dieTimeTier2', dieTimeTier2 || null);
          setValue('bankName', bankName);
          setValue('bankCode', bankCode);
          setValue('accountName', accountName);
          setValue('accountNumber', accountNumber);
          setValue('dateOfBirth', dateOfBirth);
          setCurrentOpenLah(openLah);
          setCurrentCloseLah(closeLah);
          setCurrentLockKyc(lockKyc);
          setEnablePaymentCrypto(
            enablePaymentCrypto !== undefined ? enablePaymentCrypto : true,
          );
          setEnablePaymentBank(
            enablePaymentBank !== undefined ? enablePaymentBank : true,
          );
          setEnableWithdrawCrypto(
            enableWithdrawCrypto !== undefined ? enableWithdrawCrypto : false,
          );
          setEnableWithdrawBank(
            enableWithdrawBank !== undefined ? enableWithdrawBank : true,
          );
          setCurrentTermDie(errLahCode === 'OVER45' ? true : false);
          setIsBonusRef(bonusRef);
          setKycFee(kycFee);
        })
        .catch((error) => {
          let message =
            error.response && error.response.data.message
              ? error.response.data.message
              : error.message;
          toast.error(t(message));
        });
    })();
  }, [id, refresh]);

  const onSubmit = useCallback(
    async (values) => {
      if (phone === '') {
        setErrPhone(true);
        return;
      }
      var formData = new FormData();

      if (values.totalHewe !== data.totalHewe) {
        formData.append('totalHewe', values.totalHewe);
      }
      if (values.hewePerDay !== data.hewePerDay) {
        formData.append('hewePerDay', values.hewePerDay);
      }
      if (values.availableHewe !== data.availableHewe) {
        formData.append('availableHewe', values.availableHewe);
      }
      if (values.userId !== data.userId) {
        formData.append('userId', values.userId);
      }
      if (values.note !== data.note) {
        formData.append('note', values.note);
      }
      if (values.email !== data.email) {
        formData.append('email', values.email);
      }
      if (data.phone !== phone) {
        formData.append('phone', phone);
      }
      if (values.idCode !== data.idCode) {
        formData.append('idCode', values.idCode);
      }
      if (values.tier !== data.tier) {
        formData.append('tier', values.tier);
      }
      if (values.walletAddress !== data.walletAddress) {
        formData.append('walletAddress', values.walletAddress);
      }
      if (currentOpenLah !== data.openLah) {
        formData.append('openLah', currentOpenLah);
      }
      if (currentLockKyc !== data.lockKyc) {
        formData.append('lockKyc', currentLockKyc);
      }
      if (currentTermDie) {
        formData.append('termDie', currentTermDie);
      }
      if (currentCloseLah !== data.closeLah) {
        formData.append('closeLah', currentCloseLah);
      }
      // Always send gateway settings if they exist (FormData converts boolean to string)
      // Compare with actual data value, using default values if data doesn't have the field
      const currentEnablePaymentCrypto =
        data.enablePaymentCrypto !== undefined &&
        data.enablePaymentCrypto !== null
          ? data.enablePaymentCrypto
          : true;
      const currentEnablePaymentBank =
        data.enablePaymentBank !== undefined && data.enablePaymentBank !== null
          ? data.enablePaymentBank
          : true;
      const currentEnableWithdrawCrypto =
        data.enableWithdrawCrypto !== undefined &&
        data.enableWithdrawCrypto !== null
          ? data.enableWithdrawCrypto
          : false;
      const currentEnableWithdrawBank =
        data.enableWithdrawBank !== undefined &&
        data.enableWithdrawBank !== null
          ? data.enableWithdrawBank
          : true;

      // Always send if value changed or if data doesn't have the field
      if (
        enablePaymentCrypto !== undefined &&
        enablePaymentCrypto !== currentEnablePaymentCrypto
      ) {
        formData.append('enablePaymentCrypto', String(enablePaymentCrypto));
        console.log(
          'Sending enablePaymentCrypto:',
          enablePaymentCrypto,
          'current:',
          currentEnablePaymentCrypto,
        );
      }
      if (
        enablePaymentBank !== undefined &&
        enablePaymentBank !== currentEnablePaymentBank
      ) {
        formData.append('enablePaymentBank', String(enablePaymentBank));
        console.log(
          'Sending enablePaymentBank:',
          enablePaymentBank,
          'current:',
          currentEnablePaymentBank,
        );
      }
      if (
        enableWithdrawCrypto !== undefined &&
        enableWithdrawCrypto !== currentEnableWithdrawCrypto
      ) {
        formData.append('enableWithdrawCrypto', String(enableWithdrawCrypto));
        console.log(
          'Sending enableWithdrawCrypto:',
          enableWithdrawCrypto,
          'current:',
          currentEnableWithdrawCrypto,
        );
      }
      if (
        enableWithdrawBank !== undefined &&
        enableWithdrawBank !== currentEnableWithdrawBank
      ) {
        formData.append('enableWithdrawBank', String(enableWithdrawBank));
        console.log(
          'Sending enableWithdrawBank:',
          enableWithdrawBank,
          'current:',
          currentEnableWithdrawBank,
        );
      }
      if (values.newStatus !== data.status) {
        formData.append('newStatus', values.newStatus);
      }
      if (values.newFine !== data.fine) {
        formData.append('newFine', values.newFine);
      }

      if (values.hold !== data.hold) {
        formData.append('hold', values.hold);
      }

      // Gửi dieTimeTier1 nếu có thay đổi
      if (values.dieTimeTier1 !== undefined) {
        const currentDieTimeTier1 = data.dieTimeTier1
          ? new Date(data.dieTimeTier1).toISOString()
          : null;
        const newDieTimeTier1 = values.dieTimeTier1
          ? new Date(values.dieTimeTier1).toISOString()
          : null;
        if (currentDieTimeTier1 !== newDieTimeTier1) {
          // Gửi chuỗi rỗng nếu muốn set null, backend sẽ xử lý
          formData.append('dieTimeTier1', newDieTimeTier1 || '');
        }
      }

      // Gửi dieTimeTier2 nếu có thay đổi
      if (values.dieTimeTier2 !== undefined) {
        const currentDieTimeTier2 = data.dieTimeTier2
          ? new Date(data.dieTimeTier2).toISOString()
          : null;
        const newDieTimeTier2 = values.dieTimeTier2
          ? new Date(values.dieTimeTier2).toISOString()
          : null;
        if (currentDieTimeTier2 !== newDieTimeTier2) {
          // Gửi chuỗi rỗng nếu muốn set null, backend sẽ xử lý
          formData.append('dieTimeTier2', newDieTimeTier2 || '');
        }
      }

      // Backward compatibility: nếu vẫn có dieTime (không có dieTimeTier1/dieTimeTier2)
      if (
        values.dieTime &&
        values.dieTime !== data.dieTime &&
        values.dieTimeTier1 === undefined &&
        values.dieTimeTier2 === undefined
      ) {
        formData.append('dieTime', values.dieTime);
      }

      if (values.changeCreatedAt !== data.changeCreatedAt) {
        formData.append('changeCreatedAt', values.changeCreatedAt);
      }

      if (values.availableUsdt !== data.availableUsdt) {
        formData.append('availableUsdt', values.availableUsdt);
      }

      if (values.holdLevel !== data.holdLevel) {
        formData.append('holdLevel', values.holdLevel);
      }

      if (values.level !== data.level) {
        formData.append('level', values.level);
      }

      if (values.bankName !== data.bankName) {
        const selectedBank = banks.find(
          (bank: any) => bank.name === values.bankName,
        );
        if (selectedBank) {
          formData.append('bankName', selectedBank.name);
          formData.append('bankCode', selectedBank.code);
        }
      }
      if (values.accountName !== data.accountName) {
        formData.append('accountName', values.accountName);
      }
      if (values.accountNumber !== data.accountNumber) {
        formData.append('accountNumber', values.accountNumber);
      }
      if (values.dateOfBirth !== data.dateOfBirth) {
        formData.append('dateOfBirth', values.dateOfBirth);
      }

      formData.append('isRegistered', values.isRegistered);

      formData.append('removeErrLahCode', values.removeErrLahCode);

      setLoadingUpdate(true);

      await User.adminUpdateUser(id, formData)
        .then((response) => {
          const { message } = response.data;
          setLoadingUpdate(false);
          toast.success(t(message));
          setEditting(false);
          setRefresh(!refresh);
        })
        .catch((error) => {
          let message =
            error.response && error.response.data.message
              ? error.response.data.message
              : error.message;
          toast.error(t(message));
          setLoadingUpdate(false);
          setEditting(false);
        });
    },
    [
      data,
      currentCloseLah,
      currentOpenLah,
      phone,
      currentLockKyc,
      currentTermDie,
      isBonusRef,
      kycFee,
      enablePaymentCrypto,
      enablePaymentBank,
      enableWithdrawCrypto,
      enableWithdrawBank,
    ],
  );

  const handleDeleteUser = async (onClose) => {
    setLoadingDelete(true);
    onClose();
    toast.warning(t('userProfile.modals.deleting'));
    await User.deleteUserById(id)
      .then((response) => {
        const { message } = response.data;
        setLoadingDelete(false);
        toast.success(t(message));
        navigate('/admin/users');
      })
      .catch((error) => {
        let message =
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message;
        toast.error(t(message));
        setLoadingDelete(false);
      });
  };

  const handleDelete = useCallback(async () => {
    confirmAlert({
      closeOnClickOutside: true,
      customUI: ({ onClose }) => {
        return (
          <div className="custom-ui">
            <div className="relative p-4 w-full max-w-md h-full md:h-auto mb-40">
              <div className="relative p-4 text-center bg-gray-100 rounded-lg shadow-lg sm:p-5">
                <button
                  onClick={onClose}
                  disabled={loadingDelete}
                  className="text-gray-400 absolute top-2.5 right-2.5 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
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
                  className="text-gray-400 dark:text-gray-500 w-11 h-11 mb-3.5 mx-auto"
                  aria-hidden="true"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <p className="mb-4 text-gray-500">
                  {t('userProfile.modals.deleteConfirm')}
                </p>
                <div className="flex justify-center items-center space-x-4">
                  <button
                    onClick={onClose}
                    disabled={loadingDelete}
                    className="py-2 px-3 text-sm font-medium text-gray-500 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-primary-300 hover:text-gray-900 focus:z-10 "
                  >
                    {t('userProfile.buttons.cancel')}
                  </button>
                  <button
                    onClick={() => handleDeleteUser(onClose)}
                    className="flex items-center py-2 px-3 text-sm font-medium text-center text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 "
                  >
                    {loadingDelete && <Loading />}
                    {t('userProfile.buttons.delete')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      },
    });
  }, [loadingDelete]);

  const handleApproveChangeWallet = useCallback(async () => {
    confirmAlert({
      closeOnClickOutside: true,
      customUI: ({ onClose }) => {
        return (
          <div className="custom-ui">
            <div className="relative p-4 w-full max-w-md h-full md:h-auto mb-40">
              <div className="relative p-4 text-center bg-gray-100 rounded-lg shadow-lg sm:p-5">
                <button
                  onClick={onClose}
                  disabled={loadingChangeWallet}
                  className="text-gray-400 absolute top-2.5 right-2.5 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
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
                  className="text-gray-400 w-11 h-11 mb-3.5 mx-auto"
                  viewBox="0 0 16 16"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill="currentColor"
                    d="M14.5 4h-12.12c-0.057 0.012-0.123 0.018-0.19 0.018-0.552 0-1-0.448-1-1 0-0.006 0-0.013 0-0.019l12.81-0.499v-1.19c0.005-0.041 0.008-0.089 0.008-0.138 0-0.652-0.528-1.18-1.18-1.18-0.049 0-0.097 0.003-0.144 0.009l-11.374 1.849c-0.771 0.289-1.31 1.020-1.31 1.877 0 0.011 0 0.023 0 0.034l-0 10.728c-0 0.003-0 0.006-0 0.010 0 0.828 0.672 1.5 1.5 1.5 0 0 0 0 0 0h13c0 0 0 0 0 0 0.828 0 1.5-0.672 1.5-1.5 0-0.004-0-0.007-0-0.011v-8.999c0-0.012 0.001-0.027 0.001-0.041 0-0.801-0.649-1.45-1.45-1.45-0.018 0-0.036 0-0.053 0.001zM13 11c-0.828 0-1.5-0.672-1.5-1.5s0.672-1.5 1.5-1.5c0.828 0 1.5 0.672 1.5 1.5s-0.672 1.5-1.5 1.5z"
                  ></path>
                </svg>
                <p className="mb-4 text-gray-500">
                  {t('userProfile.modals.changeWalletConfirm')}
                </p>
                <div className="flex justify-center items-center space-x-4">
                  <button
                    onClick={onClose}
                    disabled={loadingChangeWallet}
                    className="py-2 px-3 text-sm font-medium text-gray-500 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-primary-300 hover:text-gray-900 focus:z-10 "
                  >
                    {t('userProfile.buttons.cancel')}
                  </button>
                  <button
                    onClick={() => handleChangeWallet(onClose)}
                    className="flex items-center py-2 px-3 text-sm font-medium text-center text-white bg-green-600 rounded-lg hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 "
                  >
                    {loadingChangeWallet && <Loading />}
                    {t('userProfile.buttons.approve')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      },
    });
  }, [loadingChangeWallet]);

  const handleChangeWallet = async (onClose) => {
    setLoadingDelete(true);
    onClose();
    toast.warning(t('userProfile.modals.updating'));
    await User.adminChangeWalletUser({ userId: id })
      .then((response) => {
        const { message } = response.data;
        setLoadingChangeWallet(false);
        toast.success(t(message));
        setRefresh(!refresh);
      })
      .catch((error) => {
        let message =
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message;
        toast.error(t(message));
        setLoadingDelete(false);
      });
  };

  const handleCheckKyc = async () => {
    setLoadingCheckKyc(true);
    await KYC.checkKyc({ userId: id })
      .then((response) => {
        const { message, success } = response.data;
        setLoadingCheckKyc(false);
        if (success) {
          toast.success(t(message));
          setRefresh(!refresh);
        } else {
          toast.error(message);
        }
      })
      .catch((error) => {
        let message =
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message;
        toast.error(t(message));
        setLoadingCheckKyc(false);
      });
  };

  // const handlePushToPreTier2 = async () => {
  //   setLoadingPushToPreTier2(true);

  //   var formData = new FormData();

  //   formData.append('preTier2Status', 'PENDING');

  //   await User.adminUpdateUser(id, formData)
  //     .then((response) => {
  //       setLoadingPushToPreTier2(false);
  //       toast.success(t(response.data.message));
  //       setRefresh(!refresh);
  //     })
  //     .catch((error) => {
  //       let message =
  //         error.response && error.response.data.message
  //           ? error.response.data.message
  //           : error.message;
  //       toast.error(t(message));
  //       setLoadingPushToPreTier2(false);
  //     });
  // };

  const handleOpenCreateWildCardModal = useCallback(() => {
    createWildCardModal.openModal();
  }, [createWildCardModal]);

  const renderRank = (level) => {
    return USER_RANKINGS.find((ele) => level <= ele.value)?.label;
  };

  const handleChangeOpenLah = useCallback(
    () => setCurrentOpenLah(!currentOpenLah),
    [currentOpenLah],
  );

  const handleChangeCloseLah = useCallback(
    () => setCurrentCloseLah(!currentCloseLah),
    [currentCloseLah],
  );

  const handleChangeLockKyc = useCallback(
    () => setCurrentLockKyc(!currentLockKyc),
    [currentLockKyc],
  );

  const handleChangeTermDie = useCallback(
    () => setCurrentTermDie(!currentTermDie),
    [currentTermDie],
  );

  const handleChangeEnablePaymentCrypto = useCallback(
    () => setEnablePaymentCrypto(!enablePaymentCrypto),
    [enablePaymentCrypto],
  );

  const handleChangeEnablePaymentBank = useCallback(
    () => setEnablePaymentBank(!enablePaymentBank),
    [enablePaymentBank],
  );

  const handleChangeEnableWithdrawCrypto = useCallback(
    () => setEnableWithdrawCrypto(!enableWithdrawCrypto),
    [enableWithdrawCrypto],
  );

  const handleChangeEnableWithdrawBank = useCallback(
    () => setEnableWithdrawBank(!enableWithdrawBank),
    [enableWithdrawBank],
  );

  return (
    <DefaultLayout>
      <ToastContainer />
      {!loading && (
        <div className="container mx-10 my-24">
          {isBonusRef && (
            <div
              className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-5"
              role="alert"
            >
              <span className="block sm:inline">
                {t('You have received 10 USDT from DreamPool fund')}
              </span>
            </div>
          )}

          {walletChange && (
            <div
              className="w-full bg-orange-100 border border-orange-400 text-orange-700 px-4 py-3 rounded mb-5"
              role="alert"
            >
              <span className="block sm:inline">
                {t('Wallet information update is pending admin approval')}
              </span>
            </div>
          )}

          {/* {kycFee && (
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
          )} */}

          {(() => {
            // Hàm helper để chuyển đổi date sang giờ Việt Nam và set về 00:00:00
            const convertToVietnamDate = (
              dateString: string | Date | null | undefined,
            ): Date | null => {
              if (!dateString) return null;
              const date = new Date(dateString);
              if (isNaN(date.getTime())) return null;

              // Lấy UTC time (milliseconds)
              const utcTime = date.getTime() + date.getTimezoneOffset() * 60000;
              // Chuyển sang giờ Việt Nam (UTC+7 = 7 * 60 * 60 * 1000 ms)
              const vietnamOffset = 7 * 60 * 60 * 1000; // 7 giờ tính bằng milliseconds
              const vietnamTime = new Date(utcTime + vietnamOffset);

              // Set về 00:00:00 của ngày đó
              return new Date(
                vietnamTime.getFullYear(),
                vietnamTime.getMonth(),
                vietnamTime.getDate(),
              );
            };

            // Lấy ngày hiện tại theo giờ Việt Nam, set về 00:00:00
            const now = new Date();
            const today = convertToVietnamDate(now);
            if (!today) return null;

            const alerts = [];

            // Tính countdown cho tier 2 (nếu có dieTimeTier2)
            if (data.dieTimeTier2) {
              const tier2DieTime = convertToVietnamDate(data.dieTimeTier2);
              if (tier2DieTime) {
                const countdown = Math.ceil(
                  (tier2DieTime.getTime() - today.getTime()) /
                    (1000 * 60 * 60 * 24),
                );
                alerts.push(
                  <div
                    key="tier2"
                    className="w-full text-lg bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-5"
                    role="alert"
                  >
                    <span className="block sm:inline">
                      {countdown > 0 ? (
                        <>
                          You have only <b>{countdown}</b> days left to complete
                          the 62 required IDs to be eligible for Tier 2
                          benefits.
                        </>
                      ) : (
                        <>
                          Your Tier 2 deadline has passed. You need to complete
                          the 62 required IDs to be eligible for Tier 2
                          benefits.
                        </>
                      )}
                    </span>
                  </div>,
                );
              }
            }

            // Tính countdown cho tier 1 (nếu có dieTimeTier1)
            if (data.dieTimeTier1) {
              const tier1DieTime = convertToVietnamDate(data.dieTimeTier1);
              if (tier1DieTime) {
                const countdown = Math.ceil(
                  (tier1DieTime.getTime() - today.getTime()) /
                    (1000 * 60 * 60 * 24),
                );
                alerts.push(
                  <div
                    key="tier1"
                    className="w-full text-lg bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-5"
                    role="alert"
                  >
                    <span className="block sm:inline">
                      {countdown > 0 ? (
                        <>
                          You have only <b>{countdown}</b> days left to complete
                          referring at least 2 people in 2 different branches.
                        </>
                      ) : (
                        <>
                          Your Tier 1 deadline has passed. You need to refer at
                          least 2 people in 2 different branches.
                        </>
                      )}
                    </span>
                  </div>,
                );
              }
            }

            return alerts.length > 0 ? <>{alerts}</> : null;
          })()}

          <form onSubmit={handleSubmit(onSubmit)} className="md:flex no-wrap">
            <div className="w-full lg:w-3/12 lg:mx-2 mb-4 lg:mb-0">
              <div className="bg-white shadow-md p-3 border-t-4 border-NoExcuseChallenge">
                <ul className=" text-gray-600 py-2 px-3 mt-3 divide-y rounded">
                  <li className="flex items-center py-3">
                    <span>{t('adminUsers.table.status')}</span>
                    <span className="ml-auto">
                      {isEditting ? (
                        <select
                          className="block p-2 pr-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none active:outline-none"
                          {...register('newStatus')}
                          defaultValue={data.status}
                          disabled={loadingUpdate}
                        >
                          <option value="UNVERIFY">Unverify</option>
                          <option value="APPROVED">Approved</option>
                          <option value="LOCKED">Locked</option>
                        </select>
                      ) : (
                        <span
                          className={`${
                            data.status === 'UNVERIFY'
                              ? 'bg-red-600'
                              : data.status === 'PENDING'
                              ? 'bg-yellow-600'
                              : data.status === 'APPROVED'
                              ? 'bg-green-600'
                              : data.status === 'REJECTED'
                              ? 'bg-red-600'
                              : data.status === 'LOCKED'
                              ? 'bg-red-600'
                              : data.status === 'DELETED'
                              ? 'bg-red-600'
                              : ''
                          }  py-1 px-2 rounded text-white text-sm`}
                        >
                          {t(data.status)}
                        </span>
                      )}
                    </span>
                  </li>
                  <li className="flex items-center py-3">
                    <span>Hold Tier</span>
                    <span className="ml-auto">
                      {isEditting ? (
                        <select
                          className="block p-2 pr-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none active:outline-none"
                          {...register('hold')}
                          defaultValue={data.hold}
                          disabled={loadingUpdate}
                        >
                          <option value="no">{t('no')}</option>
                          <option value={1}>Tier 1</option>
                          <option value={2}>Tier 2</option>
                          <option value={3}>Tier 3</option>
                          <option value={4}>Tier 4</option>
                          <option value={5}>Tier 5</option>
                        </select>
                      ) : (
                        <span className={`py-1 px-2 text-sm`}>
                          {data.hold === 'no' ? t('no') : data.hold}
                        </span>
                      )}
                    </span>
                  </li>
                  <li className="flex items-center py-3">
                    <span>{t('holdLevel')}</span>
                    <span className="ml-auto">
                      {isEditting ? (
                        <select
                          className="block p-2 pr-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none active:outline-none"
                          {...register('holdLevel')}
                          defaultValue={data.holdLevel}
                          disabled={loadingUpdate}
                        >
                          <option value="no">{t('no')}</option>
                          <option value={0}>{t('level')} 0</option>
                          <option value={1}>{t('level')} 1</option>
                          <option value={2}>{t('level')} 2</option>
                          <option value={3}>{t('level')} 3</option>
                          <option value={4}>{t('level')} 4</option>
                          <option value={5}>{t('level')} 5</option>
                          <option value={6}>{t('level')} 6</option>
                          <option value={7}>{t('level')} 7</option>
                          <option value={8}>{t('level')} 8</option>
                          <option value={9}>{t('level')} 9</option>
                          <option value={10}>{t('level')} 10</option>
                          <option value={11}>{t('level')} 11</option>
                          <option value={12}>{t('level')} 12</option>
                        </select>
                      ) : (
                        <span className={`py-1 px-2 text-sm`}>
                          {data.holdLevel === 'no' ? t('no') : data.holdLevel}
                        </span>
                      )}
                    </span>
                  </li>

                  <li className="flex items-center py-3">
                    <span>{t('openLah')}</span>
                    <span className="ml-auto">
                      {isEditting ? (
                        <Switch
                          checked={currentOpenLah}
                          onChange={handleChangeOpenLah}
                        />
                      ) : currentOpenLah ? (
                        'True'
                      ) : (
                        'False'
                      )}
                    </span>
                  </li>
                  <li className="flex items-center py-3">
                    <span>{t('closeLah')}</span>
                    <span className="ml-auto">
                      {isEditting ? (
                        <Switch
                          checked={currentCloseLah}
                          onChange={handleChangeCloseLah}
                        />
                      ) : currentCloseLah ? (
                        'True'
                      ) : (
                        'False'
                      )}
                    </span>
                  </li>
                  <li className="flex items-center py-3">
                    <span>{t('Lock KYC')}</span>
                    <span className="ml-auto">
                      {isEditting ? (
                        <Switch
                          checked={currentLockKyc}
                          onChange={handleChangeLockKyc}
                        />
                      ) : currentLockKyc ? (
                        'True'
                      ) : (
                        'False'
                      )}
                    </span>
                  </li>
                  {/* Payment Gateway Settings */}
                  <li className="flex items-center py-3 border-t border-gray-200 mt-2">
                    <span className="font-semibold text-gray-700">
                      {t('Payment Gateways')}
                    </span>
                  </li>
                  <li className="flex items-center py-3">
                    <span>{t('Enable Payment - Crypto')}</span>
                    <span className="ml-auto">
                      {isEditting ? (
                        <Switch
                          checked={enablePaymentCrypto}
                          onChange={handleChangeEnablePaymentCrypto}
                        />
                      ) : enablePaymentCrypto ? (
                        'True'
                      ) : (
                        'False'
                      )}
                    </span>
                  </li>
                  <li className="flex items-center py-3">
                    <span>{t('Enable Payment - Bank')}</span>
                    <span className="ml-auto">
                      {isEditting ? (
                        <Switch
                          checked={enablePaymentBank}
                          onChange={handleChangeEnablePaymentBank}
                        />
                      ) : enablePaymentBank ? (
                        'True'
                      ) : (
                        'False'
                      )}
                    </span>
                  </li>

                  {/* Withdrawal Gateway Settings */}
                  <li className="flex items-center py-3 border-t border-gray-200 mt-2">
                    <span className="font-semibold text-gray-700">
                      {t('Withdrawal Gateways')}
                    </span>
                  </li>
                  <li className="flex items-center py-3">
                    <span>{t('Enable Withdraw - Crypto')}</span>
                    <span className="ml-auto">
                      {isEditting ? (
                        <Switch
                          checked={enableWithdrawCrypto}
                          onChange={handleChangeEnableWithdrawCrypto}
                        />
                      ) : enableWithdrawCrypto ? (
                        'True'
                      ) : (
                        'False'
                      )}
                    </span>
                  </li>
                  <li className="flex items-center py-3">
                    <span>{t('Enable Withdraw - Bank')}</span>
                    <span className="ml-auto">
                      {isEditting ? (
                        <Switch
                          checked={enableWithdrawBank}
                          onChange={handleChangeEnableWithdrawBank}
                        />
                      ) : enableWithdrawBank ? (
                        'True'
                      ) : (
                        'False'
                      )}
                    </span>
                  </li>

                  {data.status === 'LOCKED' && (
                    <li className="flex items-center py-3">
                      <span>{t('lockedTime')}</span>
                      <span className="ml-auto">
                        {new Date(data.lockedTime).toLocaleDateString('vi')}
                      </span>
                    </li>
                  )}
                  {data.status === 'DELETED' && (
                    <li className="flex items-center py-3">
                      <span>{t('deletedTime')}</span>
                      <span className="ml-auto">
                        {new Date(data.deletedTime).toLocaleDateString('vi')}
                      </span>
                    </li>
                  )}
                  <li className="flex items-center py-3">
                    <span>{t('memberSince')}</span>
                    <span className="ml-auto">
                      {isEditting ? (
                        <Controller
                          control={control}
                          name="changeCreatedAt"
                          render={({ field }) => (
                            <DatePicker
                              placeholderText={t('fromDate')}
                              onChange={(date) => field.onChange(date)}
                              selected={field.value}
                              dateFormat="dd/MM/yyyy"
                              className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                            />
                          )}
                        />
                      ) : (
                        new Date(data.changeCreatedAt).toLocaleDateString('vi')
                      )}
                    </span>
                  </li>
                  <li className="flex flex-col justify-between py-3">
                    <div className="flex items-center justify-between">
                      <div>Tier 1 :</div>
                      <div
                        className={`w-10 h-5 rounded-md ${(() => {
                          // Hàm helper để chuyển đổi date sang giờ Việt Nam và set về 00:00:00
                          const convertToVietnamDate = (
                            dateString: string | Date | null | undefined,
                          ): Date | null => {
                            if (!dateString) return null;
                            const date = new Date(dateString);
                            if (isNaN(date.getTime())) return null;

                            // Lấy UTC time (milliseconds)
                            const utcTime =
                              date.getTime() + date.getTimezoneOffset() * 60000;
                            // Chuyển sang giờ Việt Nam (UTC+7 = 7 * 60 * 60 * 1000 ms)
                            const vietnamOffset = 7 * 60 * 60 * 1000; // 7 giờ tính bằng milliseconds
                            const vietnamTime = new Date(
                              utcTime + vietnamOffset,
                            );

                            // Set về 00:00:00 của ngày đó
                            return new Date(
                              vietnamTime.getFullYear(),
                              vietnamTime.getMonth(),
                              vietnamTime.getDate(),
                            );
                          };

                          // Lấy ngày hiện tại theo giờ Việt Nam, set về 00:00:00
                          const now = new Date();
                          const today = convertToVietnamDate(now);
                          if (!today) return 'bg-[#009933]'; // Fallback nếu không tính được

                          // Kiểm tra tier 1
                          let tier1DaysRemaining: number | null = null;
                          if (data.dieTimeTier1) {
                            const tier1DieTime = convertToVietnamDate(
                              data.dieTimeTier1,
                            );
                            if (tier1DieTime) {
                              tier1DaysRemaining = Math.ceil(
                                (tier1DieTime.getTime() - today.getTime()) /
                                  (1000 * 60 * 60 * 24),
                              );
                            }
                          }

                          // Logic màu sắc mới
                          // Nếu user đã chết ở tier 1 (dieTime đã qua)
                          if (
                            tier1DaysRemaining !== null &&
                            tier1DaysRemaining <= 0
                          ) {
                            return 'bg-[#0033ff]'; // Màu xanh dương
                          }

                          // Nếu user tier 1 còn 10 ngày nữa chết
                          if (
                            tier1DaysRemaining !== null &&
                            tier1DaysRemaining > 0 &&
                            tier1DaysRemaining <= 10
                          ) {
                            return 'bg-[#ffcc00]'; // Màu vàng
                          }

                          // Còn lại màu xanh lá
                          return 'bg-[#009933]';
                        })()}`}
                      ></div>
                    </div>
                    {data.tier === 2 && (
                      <div className="flex items-center justify-between">
                        <div>Tier 2 :</div>
                        <div
                          className={`w-10 h-5 rounded-md ${(() => {
                            // Hàm helper để chuyển đổi date sang giờ Việt Nam và set về 00:00:00
                            const convertToVietnamDate = (
                              dateString: string | Date | null | undefined,
                            ): Date | null => {
                              if (!dateString) return null;
                              const date = new Date(dateString);
                              if (isNaN(date.getTime())) return null;

                              // Lấy UTC time (milliseconds)
                              const utcTime =
                                date.getTime() +
                                date.getTimezoneOffset() * 60000;
                              // Chuyển sang giờ Việt Nam (UTC+7 = 7 * 60 * 60 * 1000 ms)
                              const vietnamOffset = 7 * 60 * 60 * 1000; // 7 giờ tính bằng milliseconds
                              const vietnamTime = new Date(
                                utcTime + vietnamOffset,
                              );

                              // Set về 00:00:00 của ngày đó
                              return new Date(
                                vietnamTime.getFullYear(),
                                vietnamTime.getMonth(),
                                vietnamTime.getDate(),
                              );
                            };

                            // Lấy ngày hiện tại theo giờ Việt Nam, set về 00:00:00
                            const now = new Date();
                            const today = convertToVietnamDate(now);
                            if (!today) return 'bg-[#009933]'; // Fallback nếu không tính được

                            // Kiểm tra tier 2
                            let tier2DaysRemaining: number | null = null;
                            if (data.dieTimeTier2) {
                              const tier2DieTime = convertToVietnamDate(
                                data.dieTimeTier2,
                              );
                              if (tier2DieTime) {
                                tier2DaysRemaining = Math.ceil(
                                  (tier2DieTime.getTime() - today.getTime()) /
                                    (1000 * 60 * 60 * 24),
                                );
                              }
                            }

                            // Logic màu sắc cho tier 2
                            // Nếu user đã chết ở tier 2 (dieTime đã qua)
                            if (
                              tier2DaysRemaining !== null &&
                              tier2DaysRemaining <= 0
                            ) {
                              return 'bg-[#663300]'; // Màu nâu
                            }

                            // Nếu user tier 2 còn 1-5 ngày nữa chết
                            if (
                              tier2DaysRemaining !== null &&
                              tier2DaysRemaining > 0 &&
                              tier2DaysRemaining <= 5
                            ) {
                              return 'bg-[#ffcc00]'; // Màu vàng
                            }

                            // Còn lại màu xanh lá
                            return 'bg-[#009933]';
                          })()}`}
                        ></div>
                      </div>
                    )}
                  </li>
                  <li className="flex items-center py-3">
                    <span>Die Time (Tier 1)</span>
                    <span className="ml-auto">
                      {isEditting ? (
                        <div className="flex items-center gap-2">
                          <Controller
                            control={control}
                            name="dieTimeTier1"
                            render={({ field }) => (
                              <DatePicker
                                placeholderText={t('fromDate')}
                                onChange={(date) => field.onChange(date)}
                                selected={field.value}
                                dateFormat="dd/MM/yyyy"
                                isClearable
                                className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                              />
                            )}
                          />
                        </div>
                      ) : (
                        (() => {
                          // Hiển thị dieTime theo tier
                          const currentDieTime = data.dieTimeTier1;
                          return currentDieTime
                            ? new Date(currentDieTime).toLocaleDateString('vi')
                            : '';
                        })()
                      )}
                    </span>
                  </li>
                  {data.tier === 2 && (
                    <li className="flex items-center py-3">
                      <span>Die Time (Tier 2)</span>
                      <span className="ml-auto">
                        {isEditting ? (
                          <div className="flex items-center gap-2">
                            <Controller
                              control={control}
                              name="dieTimeTier2"
                              render={({ field }) => (
                                <DatePicker
                                  placeholderText={t('fromDate')}
                                  onChange={(date) => field.onChange(date)}
                                  selected={field.value}
                                  dateFormat="dd/MM/yyyy"
                                  isClearable
                                  className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                                />
                              )}
                            />
                          </div>
                        ) : (
                          (() => {
                            // Hiển thị dieTime theo tier
                            const currentDieTime = data.dieTimeTier2;
                            return currentDieTime
                              ? new Date(currentDieTime).toLocaleDateString(
                                  'vi',
                                )
                              : '';
                          })()
                        )}
                      </span>
                    </li>
                  )}

                  <li className="flex items-center py-3 border-t border-gray-200 mt-2">
                    <span className="font-semibold text-gray-700">
                      Wild Cards
                    </span>
                  </li>
                  <li className="py-3">
                    {loadingWildCards ? (
                      <div className="text-center py-4">
                        <Loading />
                      </div>
                    ) : wildCards.length === 0 ? (
                      <div className="text-center py-4 text-gray-500">
                        No wild cards available
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {wildCards.map((card: any) => (
                          <div
                            key={card._id}
                            className={`p-3 rounded-lg border ${
                              card.status === 'ACTIVE'
                                ? 'bg-green-50 border-green-200'
                                : card.status === 'USED'
                                ? 'bg-gray-50 border-gray-200'
                                : 'bg-yellow-50 border-yellow-200'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="font-semibold text-sm">
                                  {card.cardType}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                  {card.sourceInfo || 'No description'}
                                </p>
                                <div className="flex gap-4 mt-1 text-xs text-gray-500">
                                  <span>Days: {card.days}</span>
                                  <span>Tier: {card.targetTier}</span>
                                  {card.usedAt && (
                                    <span>
                                      Used:{' '}
                                      {new Date(card.usedAt).toLocaleDateString(
                                        'vi',
                                      )}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <span
                                  className={`px-2 py-1 rounded text-xs font-medium ${
                                    card.status === 'ACTIVE'
                                      ? 'bg-green-500 text-white'
                                      : card.status === 'USED'
                                      ? 'bg-gray-500 text-white'
                                      : 'bg-yellow-500 text-white'
                                  }`}
                                >
                                  {card.status}
                                </span>
                                {card.status === 'ACTIVE' && (
                                  <button
                                    onClick={async () => {
                                      if (
                                        !confirm(
                                          `Bạn có chắc chắn muốn sử dụng thẻ này cho user ${data.userId}? Thẻ sẽ cộng ${card.days} ngày vào dieTime của Tier ${card.targetTier}.`,
                                        )
                                      ) {
                                        return;
                                      }

                                      setUsingCardId(card._id);
                                      try {
                                        const response =
                                          await WildCard.useWildCard(
                                            card._id,
                                            id,
                                          );
                                        toast.success(
                                          response.data.message ||
                                            'Sử dụng Wild Card thành công!',
                                        );
                                        setRefresh(!refresh);
                                      } catch (error: any) {
                                        const message =
                                          error.response &&
                                          error.response.data.message
                                            ? error.response.data.message
                                            : error.message;
                                        toast.error(
                                          t(message) ||
                                            'Có lỗi xảy ra khi sử dụng Wild Card',
                                        );
                                      } finally {
                                        setUsingCardId(null);
                                      }
                                    }}
                                    disabled={usingCardId === card._id}
                                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {usingCardId === card._id ? (
                                      <Loading />
                                    ) : (
                                      'Use'
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </li>
                  <li className="flex items-center py-3">
                    <span>{t('tier2Time')}</span>
                    <span className="ml-auto">
                      {data.tier2Time
                        ? new Date(data.tier2Time).toLocaleDateString('vi')
                        : ''}
                    </span>
                  </li>
                  <li className="flex items-center py-3">
                    <span>{t('tier3Time')}</span>
                    <span className="ml-auto">
                      {data.tier3Time
                        ? new Date(data.tier3Time).toLocaleDateString('vi')
                        : ''}
                    </span>
                  </li>
                  <li className="flex items-center py-3">
                    <span>{t('tier4Time')}</span>
                    <span className="ml-auto">
                      {data.tier4Time
                        ? new Date(data.tier4Time).toLocaleDateString('vi')
                        : ''}
                    </span>
                  </li>
                  <li className="flex items-center py-3">
                    <span>{t('tier5Time')}</span>
                    <span className="ml-auto">
                      {data.tier5Time
                        ? new Date(data.tier5Time).toLocaleDateString('vi')
                        : ''}
                    </span>
                  </li>
                  {data.changeUser && (
                    <>
                      <li className="flex items-center py-3">
                        <span>{t('old user name')}</span>
                        <span className="ml-auto">
                          {data.changeUser.oldUserName}
                        </span>
                      </li>
                      <li className="flex items-center py-3">
                        <span>{t('old email')}</span>
                        <span className="ml-auto">
                          {data.changeUser.oldEmail}
                        </span>
                      </li>
                      <li className="flex items-center py-3">
                        <span>{t('changeDate')}</span>
                        <span className="ml-auto">
                          {new Date(
                            data.changeUser.updatedAt,
                          ).toLocaleDateString('vi')}
                        </span>
                      </li>
                    </>
                  )}
                </ul>
              </div>
              <div className="mt-10 bg-white shadow-md p-3 border-t-4 border-NoExcuseChallenge">
                <p className="uppercase mt-2 font-bold">{t('children')}</p>
                <div className="py-2">
                  <ul>
                    {data.listDirectUser
                      .filter((ele) => !ele.isSubId)
                      .map((ele) => (
                        <li
                          className="bg-white border-b hover:bg-gray-50"
                          key={ele.userId}
                        >
                          <div className="py-2">
                            <div className="text-base">
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
                                } py-1 px-2 rounded text-white text-sm`}
                              >
                                {ele.userId}{' '}
                                {ele.dieTime
                                  ? ' - ' +
                                    new Date(ele.dieTime).toLocaleDateString(
                                      'vi',
                                    )
                                  : ''}
                              </span>
                            </div>
                          </div>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
              <div className="mt-10 bg-white shadow-md p-3 border-t-4 border-NoExcuseChallenge">
                <p className="uppercase mt-2 font-bold">
                  direct referral sub member{' '}
                </p>
                <div className="py-2">
                  <ul>
                    {data.listDirectUser
                      .filter((ele) => ele.isSubId)
                      .map((ele) => (
                        <li
                          className="bg-white border-b hover:bg-gray-50"
                          key={ele.userId}
                        >
                          <div className="py-2">
                            <div className="text-base">
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
                                } py-1 px-2 rounded text-white text-sm`}
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
              <div className="mt-10 bg-white shadow-md p-3 border-t-4 border-NoExcuseChallenge">
                <p className="uppercase mt-2 font-bold">Tier 2 Users</p>
                <div className="py-2">
                  <p className="font-medium">Branch 1 :</p>
                  <ul className="flex flex-wrap gap-2">
                    {data?.tier2ChildUsers?.branch1?.map((ele) => (
                      <li
                        className="bg-white border-b hover:bg-gray-50"
                        key={ele}
                      >
                        <div className="py-2">
                          <div className="text-base">
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
                              } py-1 px-2 rounded text-white text-sm`}
                            >
                              {ele}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="py-2">
                  <p className="font-medium">Branch 2 :</p>
                  <ul className="flex flex-wrap gap-2">
                    {data?.tier2ChildUsers?.branch2?.map((ele) => (
                      <li
                        className="bg-white border-b hover:bg-gray-50"
                        key={ele}
                      >
                        <div className="py-2">
                          <div className="text-base">
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
                              } py-1 px-2 rounded text-white text-sm`}
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
              {data.tier === 2 && (
                <div className="mt-10 bg-white shadow-md p-3 border-t-4 border-NoExcuseChallenge">
                  <p className="uppercase mt-2 font-bold">{t('ACTIVE ID')}</p>
                  <div className="lg:py-2">
                    <ul className="flex flex-col list-disc">
                      <li className="ml-4">
                        Branch 1 : {data.notEnoughtChild?.countChild1} IDs
                      </li>
                      <li className="ml-4">
                        Branch 2 : {data.notEnoughtChild?.countChild2} IDs
                      </li>
                    </ul>
                  </div>
                  <div className="py-2">
                    <p className="uppercase mt-2 font-bold">
                      {t('NUMBERS OF ID REQUIRE')}
                    </p>
                    <div className="lg:py-2">
                      <ul className="flex flex-col list-disc">
                        {(() => {
                          const c1 = data?.notEnoughtChild?.countChild1 ?? 0;
                          const c2 = data?.notEnoughtChild?.countChild2 ?? 0;

                          let b1 = 0;
                          let b2 = 0;

                          if (c1 >= 20 && c2 >= 20 && c1 + c2 >= 62) {
                            // ✅ Đủ điều kiện, không cần bù
                            b1 = 0;
                            b2 = 0;
                          } else {
                            // ✅ Xác định nhánh mạnh và nhánh yếu
                            if (c1 >= c2) {
                              // Nhánh 1 mạnh (quota 42), nhánh 2 yếu (quota 20)
                              b1 = Math.max(42 - c1, 0);
                              b2 = Math.max(20 - c2, 0);
                            } else {
                              // Nhánh 2 mạnh (quota 42), nhánh 1 yếu (quota 20)
                              b1 = Math.max(20 - c1, 0);
                              b2 = Math.max(42 - c2, 0);
                            }
                          }

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
              <div className="mt-10 bg-white shadow-md p-3 border-t-4 border-NoExcuseChallenge">
                <p className="uppercase mt-2 font-bold">{t('refUserName')}</p>
                <div className="py-2">
                  <ul>
                    <li className="bg-white hover:bg-gray-50">
                      <div className="py-2">
                        <div className="text-base">
                          <span className="">
                            {data.refUserName}
                            <br></br>
                            <i className="text-xs">{data.refUserEmail}</i>
                          </span>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
              {data.tier > 1 && (
                <div className="mt-10 bg-white shadow-md p-3 border-t-4 border-NoExcuseChallenge">
                  <p className="uppercase mt-2 font-bold">
                    {data.subInfo?.subName}
                  </p>
                  <div className="py-2">
                    <ul className="flex flex-col list-disc">
                      <li className="ml-4">
                        Total Earned USDT : {data.subInfo?.totalAmountUsdt}
                      </li>
                      <li className="ml-4">
                        Total Earned HEWE : {data.subInfo?.totalAmountHewe}
                      </li>
                    </ul>
                  </div>
                  <p className="uppercase mt-2 font-bold">
                    {t('refUserName')} OF {data.subInfo?.subName}
                  </p>
                  <div className="py-2">
                    <ul>
                      {data.subInfo?.listDirectUser?.map((ele) => (
                        <li
                          className="bg-white border-b hover:bg-gray-50"
                          key={ele.userId}
                        >
                          <div className="py-2">
                            <div className="text-base">
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
                                } py-1 px-2 rounded text-white text-sm`}
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
              )}
              {/* <div className="py-10">
                <div className="max-w-sm">
                  <Doughnut
                    data={{
                      labels: [
                        'Group 1',
                        'Group 2',
                        'Group 3',
                        'Remaining target',
                      ],
                      datasets: [
                        {
                          label: 'Members',
                          data: [
                            ...adjustSales(chartData, targetSales),
                            targetSales - totalChild,
                          ],
                          backgroundColor: [
                            '#FFCF65',
                            '#02071B',
                            '#C1C9D3',
                            'red',
                          ],
                        },
                      ],
                    }}
                    plugins={[ChartDataLabels]}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'bottom' as const,
                        },
                        tooltip: {
                          enabled: false,
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
                <div className="w-full mt-6">
                  <ul className="flex flex-col items-center gap-3">
                    <li>
                      <span className="bg-[#FFCF65] px-2 py-1 text-sm">
                        Group 1 :
                      </span>{' '}
                      {chartData[0]} members
                    </li>
                    <li>
                      <span className="bg-[#02071B] text-white px-2 py-1 text-sm">
                        Group 2 :
                      </span>{' '}
                      {chartData[1]} members
                    </li>
                    <li>
                      <span className="bg-[#C1C9D3] px-2 py-1 text-sm">
                        Group 3 :
                      </span>{' '}
                      {chartData[2]} members
                    </li>
                  </ul>
                </div>
              </div> */}
            </div>
            <div className="w-full lg:w-2/3 lg:mx-2">
              <div className="bg-white p-6 shadow-md rounded-sm border-t-4 border-NoExcuseChallenge">
                <div className="text-gray-700">
                  <div className="grid grid-cols-1 text-sm">
                    <div className="grid lg:grid-cols-2 grid-cols-1">
                      <div className="px-4 py-2 font-semibold">
                        {t('user name')}
                      </div>
                      {isEditting ? (
                        <div className="px-4">
                          <input
                            className="w-full px-4 py-1.5 rounded-md border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                            {...register('userId', {
                              required: t('User ID is required'),
                            })}
                            autoComplete="off"
                          />
                          <p className="text-red-500 text-sm">
                            {errors.userId?.message}
                          </p>
                        </div>
                      ) : (
                        <div className="px-4 py-2">{data.userId}</div>
                      )}
                    </div>
                    <div className="grid lg:grid-cols-2 grid-cols-1">
                      <div className="px-4 py-2 font-semibold">Email</div>
                      {isEditting ? (
                        <div className="px-4">
                          <input
                            className="w-full px-4 py-1.5 rounded-md border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                            {...register('email', {
                              required: t('Email is required'),
                            })}
                            autoComplete="off"
                          />
                          <p className="text-red-500 text-sm">
                            {errors.email?.message}
                          </p>
                        </div>
                      ) : (
                        <div className="px-4 py-2">{data.email}</div>
                      )}
                    </div>
                    <div className="grid lg:grid-cols-2 grid-cols-1">
                      <div className="px-4 py-2 font-semibold">
                        {t('phone')}
                      </div>
                      <div className="py-2">
                        {isEditting ? (
                          <>
                            <PhoneInput
                              defaultCountry="VN"
                              placeholder={t('phone')}
                              value={phone}
                              onChange={setPhone}
                              className="-my-1 ml-4 w-full"
                            />
                            <p className="text-red-500 text-sm">
                              {errorPhone && t('Phone is required')}
                            </p>
                          </>
                        ) : (
                          <div className="px-4 py-2">{data.phone}</div>
                        )}
                      </div>
                    </div>
                    <div className="grid lg:grid-cols-2 grid-cols-1">
                      <div className="px-4 py-2 font-semibold">
                        {t('id code')}
                      </div>
                      {isEditting ? (
                        <div className="px-4">
                          <input
                            className="w-full px-4 py-1.5 rounded-md border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                            {...register('idCode', {
                              required: t('id code is required'),
                            })}
                            autoComplete="off"
                          />
                          <p className="text-red-500 text-sm">
                            {errors.idCode?.message}
                          </p>
                        </div>
                      ) : (
                        <div className="px-4 py-2">{data.idCode}</div>
                      )}
                    </div>
                    <div className="grid lg:grid-cols-2 grid-cols-1">
                      <div className="px-4 py-2 font-semibold">
                        {t('walletAddress')}
                      </div>
                      {isEditting ? (
                        <div className="px-4">
                          <input
                            className="w-full px-4 py-1.5 rounded-md border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                            {...register('walletAddress', {
                              validate: (value) => {
                                if (!value || value.trim() === '') {
                                  return true; // Optional field, empty is allowed
                                }
                                if (!/^0x[a-fA-F0-9]{40}$/g.test(value)) {
                                  return t(
                                    'Please enter the correct wallet format',
                                  );
                                }
                                return true;
                              },
                            })}
                            autoComplete="off"
                          />
                          <p className="text-red-500 text-sm">
                            {errors.walletAddress?.message}
                          </p>
                        </div>
                      ) : (
                        <div className="px-4 py-2 break-words">
                          {data.walletAddress || '-'}
                        </div>
                      )}
                    </div>
                    <div className="grid lg:grid-cols-2 grid-cols-1">
                      <div className="px-4 py-2 font-semibold">
                        {t('bank name')}
                      </div>
                      {isEditting ? (
                        <div className="px-4">
                          <select
                            className="w-full px-4 py-1.5 rounded-md border border-gray-200 text-sm focus:outline-none focus:border-gray-400"
                            {...register('bankName')}
                          >
                            <option value="">{t('Select bank name')}</option>
                            {banks.map((bank: any, index: number) => (
                              <option key={index} value={bank.name}>
                                {bank.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div className="px-4 py-2">{data.bankName || '-'}</div>
                      )}
                    </div>
                    <div className="grid lg:grid-cols-2 grid-cols-1">
                      <div className="px-4 py-2 font-semibold">
                        {t('bankCode')}
                      </div>
                      <div className="px-4 py-2">{data.bankCode || '-'}</div>
                    </div>
                    <div className="grid lg:grid-cols-2 grid-cols-1">
                      <div className="px-4 py-2 font-semibold">
                        {t('date of birth')}
                      </div>
                      {isEditting ? (
                        <div className="px-4">
                          <input
                            type="date"
                            className="w-full px-4 py-1.5 rounded-md border border-gray-200 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                            {...register('dateOfBirth')}
                          />
                        </div>
                      ) : (
                        <div className="px-4 py-2">
                          {data.dateOfBirth
                            ? new Date(data.dateOfBirth).toLocaleDateString(
                                'vi-Vn',
                                {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                },
                              )
                            : '-'}
                        </div>
                      )}
                    </div>
                    <div className="grid lg:grid-cols-2 grid-cols-1">
                      <div className="px-4 py-2 font-semibold">
                        {t('accountName')}
                      </div>
                      {isEditting ? (
                        <div className="px-4">
                          <input
                            className="w-full px-4 py-1.5 rounded-md border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                            {...register('accountName')}
                            autoComplete="off"
                          />
                        </div>
                      ) : (
                        <div className="px-4 py-2">
                          {data.accountName || '-'}
                        </div>
                      )}
                    </div>
                    <div className="grid lg:grid-cols-2 grid-cols-1">
                      <div className="px-4 py-2 font-semibold">
                        {t('accountNumber')}
                      </div>
                      {isEditting ? (
                        <div className="px-4">
                          <input
                            className="w-full px-4 py-1.5 rounded-md border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                            {...register('accountNumber')}
                            autoComplete="off"
                          />
                        </div>
                      ) : (
                        <div className="px-4 py-2">
                          {data.accountNumber || '-'}
                        </div>
                      )}
                    </div>
                    <div className="grid lg:grid-cols-2 grid-cols-1">
                      <div className="px-4 py-2 font-semibold">
                        {t('isRegistered')}
                      </div>
                      <div className="px-4 py-2">
                        {isEditting && data.countPay === 0 && (
                          <div className="flex gap-4">
                            <input
                              type="radio"
                              {...register('isRegistered')}
                            ></input>
                            <p>Finished</p>
                          </div>
                        )}
                        {!isEditting || data.countPay >= 1
                          ? data.countPay >= 1
                            ? t('finished')
                            : t('unfinished')
                          : ''}
                      </div>
                    </div>
                    <div className="grid lg:grid-cols-2 grid-cols-1">
                      <div className="px-4 py-2 font-semibold">
                        {t('count pay')}
                      </div>
                      <div className="px-4 py-2">
                        {data.countPay === 0 ? 0 : data.countPay - 3}{' '}
                        {t('times')}
                      </div>
                    </div>
                    <div className="grid lg:grid-cols-2 grid-cols-1">
                      <div className="px-4 py-2 font-semibold">Tier</div>
                      {isEditting ? (
                        <div className="px-4">
                          <input
                            className="w-full px-4 py-1.5 rounded-md border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                            {...register('tier', {
                              required: t('tier is required'),
                            })}
                            autoComplete="off"
                          />
                          <p className="text-red-500 text-sm">
                            {errors.tier?.message}
                          </p>
                        </div>
                      ) : (
                        <div className="px-4 py-2">{data.tier}</div>
                      )}
                    </div>
                    <div className="grid lg:grid-cols-2 grid-cols-1">
                      <div className="px-4 py-2 font-semibold">
                        {t('buyPackage')}
                      </div>
                      <div className="px-4 py-2">
                        {!isEditting ? (
                          data.buyPackage
                        ) : (
                          <select
                            {...register('buyPackage')}
                            defaultValue={data.buyPackage}
                            disabled={loadingUpdate}
                            className="block p-2 pr-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none active:outline-none"
                          >
                            {packageOptions.map((item) => (
                              <option key={item} value={item}>
                                {item}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                    <div className="grid lg:grid-cols-2 grid-cols-1">
                      <div className="px-4 py-2 font-semibold">Rank</div>
                      <div className="px-4 py-2">
                        {data.countPay !== 0 && (
                          <div
                            className={`p-2 max-w-fit text-sm bg-green-600 text-white rounded-[50px]`}
                          >
                            {renderRank(
                              data.currentLayer[0] ? data.currentLayer[0] : 0,
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="grid lg:grid-cols-2 grid-cols-1">
                      <div className="px-4 py-2 font-semibold">
                        Available HEWE
                      </div>
                      {isEditting ? (
                        <div className="px-4">
                          <input
                            className="w-full px-4 py-1.5 rounded-md border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                            {...register('availableHewe', {
                              required: 'Available Hewe is required',
                            })}
                            defaultValue={data.availableHewe}
                          />
                        </div>
                      ) : (
                        <div className="px-4 py-2">{data.availableHewe}</div>
                      )}
                    </div>
                    <div className="grid lg:grid-cols-2 grid-cols-1">
                      <div className="px-4 py-2 font-semibold">Total HEWE</div>
                      {isEditting ? (
                        <div className="px-4">
                          <input
                            className="w-full px-4 py-1.5 rounded-md border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                            {...register('totalHewe')}
                            defaultValue={data.totalHewe}
                          />
                        </div>
                      ) : (
                        <div className="px-4 py-2">{data.totalHewe}</div>
                      )}
                    </div>
                    <div className="grid lg:grid-cols-2 grid-cols-1">
                      <div className="px-4 py-2 font-semibold">Reward HEWE</div>
                      <div className="px-4 py-2">
                        {data.tier > 1
                          ? 0
                          : data.totalHewe > 0
                          ? parseInt(data.totalHewe) -
                            parseInt(data.claimedHewe)
                          : 0}
                      </div>
                    </div>
                    <div className="grid lg:grid-cols-2 grid-cols-1">
                      <div className="px-4 py-2 font-semibold">
                        HEWE Per Day
                      </div>
                      {isEditting ? (
                        <div className="px-4">
                          <input
                            className="w-full px-4 py-1.5 rounded-md border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                            {...register('hewePerDay')}
                            defaultValue={data.hewePerDay}
                          />
                        </div>
                      ) : (
                        <div className="px-4 py-2">{data.hewePerDay}</div>
                      )}
                    </div>
                    <div className="grid lg:grid-cols-2 grid-cols-1">
                      <div className="px-4 py-2 font-semibold">
                        Available USDT
                      </div>
                      {isEditting ? (
                        <div className="px-4">
                          <input
                            className="w-full px-4 py-1.5 rounded-md border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                            {...register('availableUsdt', {
                              required: 'Available Usdt is required',
                            })}
                            defaultValue={data.availableUsdt}
                          />
                        </div>
                      ) : (
                        <div className="px-4 py-2">
                          {data.availableUsdt} USDT
                        </div>
                      )}
                    </div>
                    <div className="grid lg:grid-cols-2 grid-cols-1">
                      <div className="px-4 py-2 font-semibold">
                        Processing USDT
                      </div>
                      <div className="px-4 py-2">
                        {data.withdrawPending} USDT
                      </div>
                    </div>
                    <div className="grid lg:grid-cols-2 grid-cols-1">
                      <div className="px-4 py-2 font-semibold">
                        Total Earned
                      </div>
                      <div className="px-4 py-2">{data.totalEarning} USDT</div>
                    </div>
                    <div className="grid lg:grid-cols-2 grid-cols-1">
                      <div className="px-4 py-2 font-semibold">Total Hold</div>
                      <div className="px-4 py-2">{data.totalHold} USDT</div>
                    </div>
                    <div className="grid lg:grid-cols-2 grid-cols-1">
                      <div className="px-4 py-2 font-semibold">
                        Outstanding Pre-Tier2 Pool Amount
                      </div>
                      <div className="px-4 py-2">
                        {data.shortfallAmount} USDT
                      </div>
                    </div>
                    {data.city === 'US' && (
                      <>
                        <div className="grid lg:grid-cols-2 grid-cols-1">
                          <div className="px-4 py-2 font-semibold">
                            Payout Gateway
                          </div>
                          <div className="px-4 py-2">{data.paymentMethod}</div>
                        </div>
                        <div className="grid lg:grid-cols-2 grid-cols-1">
                          <div className="px-4 py-2 font-semibold">
                            Payout Display Name
                          </div>
                          <div className="px-4 py-2">{data.accountName}</div>
                        </div>
                        <div className="grid lg:grid-cols-2 grid-cols-1">
                          <div className="px-4 py-2 font-semibold">
                            Payout Email or Phone Number
                          </div>
                          <div className="px-4 py-2">{data.accountNumber}</div>
                        </div>
                      </>
                    )}
                    <div className="grid lg:grid-cols-2 grid-cols-1">
                      <div className="px-4 py-2 font-semibold">{t('fine')}</div>
                      {isEditting ? (
                        <div className="px-4">
                          <input
                            className="w-full px-4 py-1.5 rounded-md border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                            {...register('newFine', {
                              required: 'Fine is required',
                            })}
                            defaultValue={data.fine}
                          />
                        </div>
                      ) : (
                        <div className="px-4 py-2">{data.fine}</div>
                      )}
                    </div>
                    <div className="grid lg:grid-cols-2 grid-cols-1">
                      <div className="px-4 py-2 font-semibold">Level</div>
                      {isEditting ? (
                        <div className="px-4">
                          <input
                            className="w-full px-4 py-1.5 rounded-md border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                            {...register('level', {
                              required: 'Level is required',
                            })}
                            defaultValue={
                              data.currentLayer[parseInt(data.tier) - 1]
                            }
                          />
                        </div>
                      ) : (
                        <div className="px-4 py-2">
                          {data.currentLayer[parseInt(data.tier) - 1]}
                        </div>
                      )}
                    </div>
                    <div className="grid lg:grid-cols-2 grid-cols-1">
                      <div className="px-4 py-2 font-semibold">{t('note')}</div>
                      {isEditting ? (
                        <div className="px-4">
                          <textarea
                            className="w-full px-4 py-1.5 rounded-md border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                            {...register('note')}
                            autoComplete="off"
                            rows="3"
                          />
                          <p className="text-red-500 text-sm">
                            {errors.note?.message}
                          </p>
                        </div>
                      ) : (
                        <div className="px-4 py-2">{data.note}</div>
                      )}
                    </div>
                    {/* <div className="grid lg:grid-cols-2 grid-cols-1">
                      <div className="px-4 py-2 font-semibold">
                        ID Image Front
                      </div>
                      <div className="px-4 py-2">
                        {data.imgFront !== '' ? (
                          <img
                            src={`${
                              import.meta.env.VITE_API_URL
                            }/uploads/CCCD/${data.imgFront}`}
                          />
                        ) : (
                          'No data'
                        )}
                      </div>
                    </div>
                    <div className="grid lg:grid-cols-2 grid-cols-1">
                      <div className="px-4 py-2 font-semibold">
                        ID Image Back
                      </div>
                      <div className="px-4 py-2">
                        {data.imgBack !== '' ? (
                          <img
                            src={`${
                              import.meta.env.VITE_API_URL
                            }/uploads/CCCD/${data.imgBack}`}
                          />
                        ) : (
                          'No data'
                        )}
                      </div>
                    </div> */}
                    <div className="w-full flex justify-center">
                      <div className="w-full grid lg:grid-cols-2 gap-2 lg:gap-0 items-center py-2 px-4">
                        <p className="font-semibold"> FaceTec Image :</p>
                        <div className="flex flex-col items-center justify-center w-full">
                          {data.facetecTid !== '' && (
                            <img
                              src={`${
                                import.meta.env.VITE_FACETEC_URL
                              }/api/liveness/image?tid=${data.facetecTid}`}
                              className="w-full h-full rounded-md object-cover"
                              alt="FaceTec image"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="w-full flex justify-center">
                      <div className="w-full grid lg:grid-cols-2 gap-2 lg:gap-0 items-center py-2 px-4">
                        <p className="font-semibold"> FaceTec Url :</p>
                        <div className="flex flex-col w-full">
                          {data.facetecTid !== '' && (
                            <a
                              target="_blank"
                              className="text-blue-500"
                              href={`${
                                import.meta.env.VITE_FACETEC_DASHBOARD_URL
                              }/session-details?path=%2Fenrollment-3d&externalDatabaseRefID=ID_${
                                data.id
                              }`}
                            >
                              {`${
                                import.meta.env.VITE_FACETEC_DASHBOARD_URL
                              }/session-details?path=%2Fenrollment-3d&externalDatabaseRefID=ID_${
                                data.id
                              }`}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* {data.status === 'PENDING' && (
                  <>
                    <div
                      onClick={() => handleApprove(id)}
                      className="w-full cursor-pointer flex justify-center items-center hover:underline bg-green-600 text-white font-bold rounded-full my-2 py-2 px-6 shadow-lg focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out"
                    >
                      {t('accept')}
                    </div>
                  </>
                )} */}
                {isEditting && (
                  <>
                    <button
                      onClick={() => setEditting(true)}
                      disabled={loading}
                      className="w-full flex justify-center items-center hover:underline bg-black text-NoExcuseChallenge font-semibold rounded-full my-2 py-2 px-6 shadow-lg focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out"
                    >
                      {loading && <Loading />}
                      {t('update')}
                    </button>
                    <button
                      onClick={() => setEditting(false)}
                      className="w-full flex justify-center items-center hover:underline border font-bold rounded-full my-2 py-2 px-6 shadow-lg focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out"
                    >
                      {t('cancel')}
                    </button>
                  </>
                )}
                {userInfo?.permissions
                  .find((p) => p.page.pageName === 'admin-users-details')
                  ?.actions.includes('update') &&
                  !isEditting &&
                  data.status !== 'DELETED' && (
                    <button
                      onClick={() => setEditting(true)}
                      className="w-full flex justify-center items-center hover:underline text-NoExcuseChallenge bg-black font-bold rounded-full my-2 py-2 px-6 shadow-lg focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out"
                    >
                      {t('edit')}
                    </button>
                  )}
                {userInfo?.permissions
                  .find((p) => p.page.pageName === 'admin-users-details')
                  ?.actions.includes('delete') &&
                  !isEditting &&
                  data.status !== 'DELETED' && (
                    <div
                      onClick={handleDelete}
                      className="w-full flex justify-center items-center cursor-pointer hover:underline border font-bold rounded-full my-2 py-2 px-6 shadow-lg focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out bg-red-500 text-white"
                    >
                      {t('delete')}
                    </div>
                  )}
                {userInfo?.permissions
                  .find((p) => p.page.pageName === 'admin-users-details')
                  ?.actions.includes('update') &&
                  walletChange && (
                    <div
                      onClick={handleApproveChangeWallet}
                      className="w-full flex justify-center items-center cursor-pointer hover:underline border font-bold rounded-full my-2 py-2 px-6 shadow-lg focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out bg-orange-500 text-white"
                    >
                      {t('Approve change wallet address')}
                    </div>
                  )}
                {userInfo?.permissions
                  .find((p) => p.page.pageName === 'admin-users-details')
                  ?.actions.includes('update') &&
                  data.facetecTid === '' &&
                  data.status === 'UNVERIFY' && (
                    <div
                      onClick={handleCheckKyc}
                      className="w-full flex justify-center items-center cursor-pointer hover:underline border font-bold rounded-full my-2 py-2 px-6 shadow-lg focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out bg-orange-500 text-white"
                    >
                      {loadingCheckKyc && <Loading />}
                      Check KYC
                    </div>
                  )}
                {userInfo?.permissions
                  ?.find((p) => p.page.pageName === 'admin-users-details')
                  ?.actions.includes('update') && (
                  <div
                    onClick={handleOpenCreateWildCardModal}
                    className="w-full flex justify-center items-center cursor-pointer hover:underline border font-bold rounded-full my-2 py-2 px-6 shadow-lg focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out bg-blue-500 text-white"
                  >
                    {t('userProfile.buttons.createWildCard')}
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>
      )}
    </DefaultLayout>
  );
};

export default UserProfile;
