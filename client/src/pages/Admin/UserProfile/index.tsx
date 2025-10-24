import { useCallback, useEffect, useState } from 'react';

import User from '@/api/User';
import KYC from '@/api/KYC';
import Loading from '@/components/Loading';
import USER_RANKINGS from '@/constants/userRankings';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import DefaultLayout from '../../../layout/DefaultLayout';
import UserProfileCard from '@/components/UserProfileCard';
import { useSelector } from 'react-redux';

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
  const [phone, setPhone] = useState('');
  const [errorPhone, setErrPhone] = useState(false);
  const [isBonusRef, setIsBonusRef] = useState(false);
  const [kycFee, setKycFee] = useState(false);
  const [walletChange, setWalletChange] = useState('');
  const [loadingChangeWallet, setLoadingChangeWallet] = useState(false);
  const [loadingPushToPreTier2, setLoadingPushToPreTier2] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

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
            dieTime,
            errLahCode,
          } = response.data;
          setValue('userId', userId);
          setValue('email', email);
          setPhone(phone);
          setValue('idCode', idCode);
          setValue('tier', tier);
          setValue('walletAddress', walletAddress);
          setValue('changeCreatedAt', changeCreatedAt);
          setValue('dieTime', dieTime);
          setCurrentOpenLah(openLah);
          setCurrentCloseLah(closeLah);
          setCurrentLockKyc(lockKyc);
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
    async (formData) => {
      setLoadingUpdate(true);

      console.log({ formData });

      // // Check for changes and only append fields that have changed
      // const form = new FormData();
      // let hasChanges = false;

      // // Basic fields
      // if (
      //   formData.userId !== data.userId &&
      //   formData.userId !== undefined &&
      //   formData.userId !== null
      // ) {
      //   form.append('userId', formData.userId);
      //   hasChanges = true;
      // }

      // if (
      //   formData.email !== data.email &&
      //   formData.email !== undefined &&
      //   formData.email !== null
      // ) {
      //   form.append('email', formData.email);
      //   hasChanges = true;
      // }

      // if (phone !== data.phone && phone !== undefined && phone !== null) {
      //   form.append('phone', phone);
      //   hasChanges = true;
      // }

      // if (
      //   formData.idCode !== data.idCode &&
      //   formData.idCode !== undefined &&
      //   formData.idCode !== null
      // ) {
      //   form.append('idCode', formData.idCode);
      //   hasChanges = true;
      // }

      // if (
      //   formData.tier !== data.tier &&
      //   formData.tier !== undefined &&
      //   formData.tier !== null
      // ) {
      //   form.append('tier', formData.tier);
      //   hasChanges = true;
      // }

      // if (
      //   formData.walletAddress !== data.walletAddress &&
      //   formData.walletAddress !== undefined &&
      //   formData.walletAddress !== null
      // ) {
      //   form.append('walletAddress', formData.walletAddress);
      //   hasChanges = true;
      // }

      // // Financial fields
      // if (
      //   formData.availableUsdt !== data.availableUsdt &&
      //   formData.availableUsdt !== undefined &&
      //   formData.availableUsdt !== null
      // ) {
      //   form.append('availableUsdt', formData.availableUsdt);
      //   hasChanges = true;
      // }

      // if (
      //   formData.availableHewe !== data.availableHewe &&
      //   formData.availableHewe !== undefined &&
      //   formData.availableHewe !== null
      // ) {
      //   form.append('availableHewe', formData.availableHewe);
      //   hasChanges = true;
      // }

      // if (
      //   formData.hewePerDay !== data.hewePerDay &&
      //   formData.hewePerDay !== undefined &&
      //   formData.hewePerDay !== null
      // ) {
      //   form.append('hewePerDay', formData.hewePerDay);
      //   hasChanges = true;
      // }

      // if (
      //   formData.newFine !== data.newFine &&
      //   formData.newFine !== undefined &&
      //   formData.newFine !== null
      // ) {
      //   form.append('newFine', formData.newFine);
      //   hasChanges = true;
      // }

      // if (
      //   formData.level !== data.level &&
      //   formData.level !== undefined &&
      //   formData.level !== null
      // ) {
      //   form.append('level', formData.level);
      //   hasChanges = true;
      // }

      // if (
      //   formData.note !== data.note &&
      //   formData.note !== undefined &&
      //   formData.note !== null
      // ) {
      //   form.append('note', formData.note);
      //   hasChanges = true;
      // }

      // // Date fields
      // if (
      //   formData.changeCreatedAt !== data.changeCreatedAt &&
      //   formData.changeCreatedAt !== undefined &&
      //   formData.changeCreatedAt !== null
      // ) {
      //   form.append('changeCreatedAt', formData.changeCreatedAt);
      //   hasChanges = true;
      // }

      // if (
      //   formData.dieTime !== data.dieTime &&
      //   formData.dieTime !== undefined &&
      //   formData.dieTime !== null
      // ) {
      //   form.append('dieTime', formData.dieTime);
      //   hasChanges = true;
      // }

      // if (
      //   formData.memberSince !== data.memberSince &&
      //   formData.memberSince !== undefined &&
      //   formData.memberSince !== null
      // ) {
      //   form.append('memberSince', formData.memberSince);
      //   hasChanges = true;
      // }

      // // Checkbox fields
      // if (
      //   currentOpenLah !== data.openLah &&
      //   currentOpenLah !== undefined &&
      //   currentOpenLah !== null
      // ) {
      //   form.append('openLah', currentOpenLah);
      //   hasChanges = true;
      // }

      // if (
      //   currentCloseLah !== data.closeLah &&
      //   currentCloseLah !== undefined &&
      //   currentCloseLah !== null
      // ) {
      //   form.append('closeLah', currentCloseLah);
      //   hasChanges = true;
      // }

      // if (
      //   currentLockKyc !== data.lockKyc &&
      //   currentLockKyc !== undefined &&
      //   currentLockKyc !== null
      // ) {
      //   form.append('lockKyc', currentLockKyc);
      //   hasChanges = true;
      // }

      // if (
      //   currentTermDie !== data.termDie &&
      //   currentTermDie !== undefined &&
      //   currentTermDie !== null
      // ) {
      //   form.append('termDie', currentTermDie);
      //   hasChanges = true;
      // }

      // if (
      //   isBonusRef !== data.bonusRef &&
      //   isBonusRef !== undefined &&
      //   isBonusRef !== null
      // ) {
      //   form.append('bonusRef', isBonusRef);
      //   hasChanges = true;
      // }

      // if (kycFee !== data.kycFee && kycFee !== undefined && kycFee !== null) {
      //   form.append('kycFee', kycFee);
      //   hasChanges = true;
      // }

      // // Hold fields
      // if (
      //   formData.hold !== data.hold &&
      //   formData.hold !== undefined &&
      //   formData.hold !== null
      // ) {
      //   form.append('hold', formData.hold);
      //   hasChanges = true;
      // }

      // if (
      //   formData.holdLevel !== data.holdLevel &&
      //   formData.holdLevel !== undefined &&
      //   formData.holdLevel !== null
      // ) {
      //   form.append('holdLevel', formData.holdLevel);
      //   hasChanges = true;
      // }

      // // If no changes, show message and return
      // if (!hasChanges) {
      //   setLoadingUpdate(false);
      //   toast.info(t('No changes detected'));
      //   setEditting(false);
      //   return;
      // }

      // await User.adminUpdateUser(id, form)
      //   .then((response) => {
      //     const { message } = response.data;
      //     setLoadingUpdate(false);
      //     toast.success(t(message));
      //     setEditting(false);
      //     setRefresh(!refresh);
      //   })
      //   .catch((error) => {
      //     let message =
      //       error.response && error.response.data.message
      //         ? error.response.data.message
      //         : error.message;
      //     toast.error(t(message));
      //     setLoadingUpdate(false);
      //     setEditting(false);
      //   });
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

  const handlePushToPreTier2 = async () => {
    setLoadingPushToPreTier2(true);

    var formData = new FormData();

    formData.append('preTier2Status', 'PENDING');

    await User.adminUpdateUser(id, formData)
      .then((response) => {
        setLoadingPushToPreTier2(false);
        toast.success(t(response.data.message));
        setRefresh(!refresh);
      })
      .catch((error) => {
        let message =
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message;
        toast.error(t(message));
        setLoadingPushToPreTier2(false);
      });
  };

  const renderRank = (level) => {
    return USER_RANKINGS.find((ele) => level <= ele.value)?.label;
  };

  return (
    <DefaultLayout>
      <ToastContainer />
      {!loading && (
        <div className="container px-10 mt-24 pb-10">
          <div className="w-full">
            <UserProfileCard
              data={data}
              isEditting={isEditting}
              loading={loading}
              loadingUpdate={loadingUpdate}
              register={register}
              errors={errors}
              phone={phone}
              setPhone={setPhone}
              errorPhone={errorPhone}
              packageOptions={packageOptions}
              renderRank={renderRank}
              onEdit={() => setEditting(true)}
              onSave={handleSubmit(onSubmit)}
              onCancel={() => setEditting(false)}
              onDelete={handleDelete}
              onApproveChangeWallet={handleApproveChangeWallet}
              onCheckKyc={handleCheckKyc}
              onPushToPreTier2={handlePushToPreTier2}
              loadingCheckKyc={loadingCheckKyc}
              loadingPushToPreTier2={loadingPushToPreTier2}
              walletChange={walletChange}
              userInfo={userInfo}
              // Checkbox setters
              setCurrentOpenLah={setCurrentOpenLah}
              setCurrentCloseLah={setCurrentCloseLah}
              setCurrentLockKyc={setCurrentLockKyc}
              setCurrentTermDie={setCurrentTermDie}
              setIsBonusRef={setIsBonusRef}
              setKycFee={setKycFee}
            />
          </div>
        </div>
      )}
    </DefaultLayout>
  );
};

export default UserProfile;
