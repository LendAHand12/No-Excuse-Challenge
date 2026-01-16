import { useDispatch, useSelector } from 'react-redux';
import DefaultLayout from '../../../layout/DefaultLayout';
import { shortenWalletAddress } from '../../../utils';
import { useTranslation } from 'react-i18next';
import Loading from '@/components/Loading';
import { UPDATE_USER_INFO } from '@/slices/auth';
import { useForm } from 'react-hook-form';
import User from '@/api/User';
import KYC from '@/api/KYC';
import WildCard from '@/api/WildCard';
import Contract from '@/api/Contract';
import { useCallback, useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import USER_RANKINGS from '@/constants/userRankings';
import Modal from 'react-modal';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import SignaturePad from '@/components/SignaturePad';
import './index.css';
import { Link, useNavigate } from 'react-router-dom';
import banks from '@/lib/banks.json';
import wildCardTopImage from '@/images/cover/wildcard.png';
import wildCardTopImage2 from '@/images/cover/wildcard2.png';

ChartJS.register(ArcElement, Tooltip, Legend);

const Profile = () => {
  const { t, i18n } = useTranslation();
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
    walletAddress,
    ranking,
    totalEarning,
    totalHold,
    bonusRef,
    currentLayer,
    errLahCode,
    pendingUpdateInfo,
    notEnoughtChild,
    lockKyc,
    accountName,
    accountNumber,
    bankName,
    bankCode,
    dateOfBirth,
    city,
    subUser,
    preTier2Status,
    preTier2User,
    shortfallAmount,
    tier2ChildUsers,
    enablePaymentBank,
    enableWithdrawBank,
    dieTimeTier1,
    dieTimeTier2,
    tier1,
    tier2,
    isDisableTier2,
    imgFront,
    imgBack,
    // CCCD Information
    currentAddress,
    fullName,
    isProfileComplete,
  } = userInfo;

  const [phoneNumber, setPhoneNumber] = useState(phone);
  const [errorPhone, setErrPhone] = useState(false);
  // Removed isEdit state - now using popup for all updates
  const [refresh, setRefresh] = useState(false);
  const [showFaceId, setShowFaceId] = useState(false);
  const [showLockKyc, setShowLockKyc] = useState(lockKyc);
  const [showMoveSystem, setShowMoveSystem] = useState(false);
  const [bankSearch, setBankSearch] = useState('');
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const [selectedBank, setSelectedBank] = useState<any>(null);
  const [errAgrre, setErrAgrre] = useState(false);
  const [valueCheckAgrree, setValueCheckAgrree] = useState('');
  const [showNextTier, setShowNextTier] = useState(false);
  const [showCCCDModal, setShowCCCDModal] = useState(false);
  const [loadingCCCD, setLoadingCCCD] = useState(false);
  const [wildCards, setWildCards] = useState([]);
  const [loadingWildCards, setLoadingWildCards] = useState(false);
  const [usingCardId, setUsingCardId] = useState<string | null>(null);
  const [currentTier, setCurrentTier] = useState(1);
  const [showDirectUsers, setShowDirectUsers] = useState(false);
  const [showSubReferralUsers, setShowSubReferralUsers] = useState(false);
  const [showBranch1Users, setShowBranch1Users] = useState(false);
  const [showBranch2Users, setShowBranch2Users] = useState(false);

  // Profile completion popup states
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [cccdFrontFile, setCccdFrontFile] = useState<File | null>(null);
  const [cccdBackFile, setCccdBackFile] = useState<File | null>(null);
  const [cccdFrontPreview, setCccdFrontPreview] = useState(imgFront || '');
  const [cccdBackPreview, setCccdBackPreview] = useState(imgBack || '');
  const [savingProfile, setSavingProfile] = useState(false);
  // Terms and Signature states
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [uploadingSignature, setUploadingSignature] = useState(false);
  const [contractContent, setContractContent] = useState<string>('');
  const [contractCSS, setContractCSS] = useState<string>('');
  const [loadingContract, setLoadingContract] = useState(false);

  // Fetch contract content when component mounts
  useEffect(() => {
    const fetchContractContent = async () => {
      if (!userInfo?.id) {
        return;
      }

      // Only fetch contract if user has complete information
      const hasCompleteInfo = userInfo.fullName && userInfo.phone && userInfo.currentAddress;
      if (!hasCompleteInfo) {
        setContractContent('<p style="text-align: center; color: #666;">Vui lòng hoàn thiện thông tin cá nhân để xem hợp đồng.</p>');
        return;
      }

      try {
        setLoadingContract(true);

        const response = await Contract.getContractContent(userInfo.id);

        if (response.data.success) {
          setContractContent(response.data.content);
          setContractCSS(response.data.css || '');
        } else {
          // console.error('❌ API returned success: false');
          setContractContent('<p style="color: red;">Không thể tải nội dung hợp đồng.</p>');
        }
      } catch (error: any) {
        console.error('❌ Error fetching contract:', error);
        setContractContent('<p style="color: red;">Lỗi: ' + (error?.message || 'Không thể tải hợp đồng') + '</p>');
      } finally {
        setLoadingContract(false);
      }
    };

    fetchContractContent();
  }, [userInfo?.id, userInfo?.fullName, userInfo?.phone, userInfo?.currentAddress]);

  // Inject contract CSS into document head
  useEffect(() => {
    if (!contractCSS) return;

    console.log('💅 Injecting contract CSS into document head');
    const styleId = 'contract-preview-styles';

    // Remove existing style tag if any
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }

    // Create and inject new style tag
    const styleTag = document.createElement('style');
    styleTag.id = styleId;
    styleTag.textContent = contractCSS;
    document.head.appendChild(styleTag);

    // Cleanup on unmount
    return () => {
      const style = document.getElementById(styleId);
      if (style) {
        style.remove();
      }
    };
  }, [contractCSS]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      idCode: status !== 'REJECTED' ? idCode : null,
      phone,
      email,
      fullName: fullName || '',
      walletAddress,
      accountName,
      accountNumber,
      bankName: bankName || '',
      dateOfBirth: dateOfBirth
        ? new Date(dateOfBirth).toISOString().split('T')[0]
        : '',
      // CCCD fields
      currentAddress: currentAddress || '',
    },
  });

  const onSubmit = useCallback(
    async (data: any) => {
      const {
        walletAddress,
        email,
        fullName,
        bankName,
        accountName,
        accountNumber,
        dateOfBirth,
        currentAddress,
      } = data;
      if (!phoneNumber || phoneNumber === '') {
        setErrPhone(true);
        return;
      }
      setErrPhone(false);

      setLoading(true);
      try {
        // Find bank info
        const selectedBank = banks.find((bank: any) => bank.name === bankName);

        const bankCode = selectedBank ? selectedBank.code : '';
        const finalBankName = selectedBank ? selectedBank.name : bankName;

        // Prepare update data for face scan
        const updateData: any = {};
        if (phoneNumber) updateData.phone = phoneNumber;
        if (walletAddress) updateData.walletAddress = walletAddress;
        if (email) updateData.email = email;
        if (fullName?.trim()) updateData.fullName = fullName.trim();
        if (finalBankName) updateData.bankName = finalBankName;
        if (bankCode) updateData.bankCode = bankCode;
        if (currentAddress?.trim()) updateData.currentAddress = currentAddress.trim();
        if (accountName?.trim()) updateData.accountName = accountName.trim();
        if (accountNumber?.trim()) updateData.accountNumber = accountNumber.trim();
        if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;

        // Start face scan verification
        const response = await KYC.startUpdateInfo(updateData);
        if (response.data.url) {
          // Redirect to face scan
          window.location.href = response.data.url;
        } else {
          throw new Error('Failed to get face scan URL');
        }
      } catch (error: any) {
        let message =
          error.response && error.response.data.error
            ? error.response.data.error
            : error.response && error.response.data.message
              ? error.response.data.message
              : error.message;
        toast.error(t(message));
        setLoading(false);
      }
    },
    [phoneNumber, id, currentTier, dispatch],
  );

  useEffect(() => {
    (async () => {
      await User.getUserInfo(currentTier)
        .then((response) => {
          dispatch(UPDATE_USER_INFO(response.data));
          if (response.data.checkCanNextTier) {
            setShowNextTier(true);
          }

          // Priority 1: Check if Face ID needs setup
          if (response.data.lockKyc === false && response.data.facetecTid === '') {
            setShowFaceId(true);
            setShowProfilePopup(false);
            setShowTermsModal(false);
            setShowSignatureModal(false);
          }
          // Priority 2: Check if profile is incomplete
          else if (response.data.isProfileComplete === false) {
            setShowProfilePopup(true);
            setShowFaceId(false);
            setShowTermsModal(false);
            setShowSignatureModal(false);
          }
          // Priority 3: Check if signature is missing for Tier 1
          else if (response.data.countPay === 0 && !response.data.signatureImage) {
            setShowTermsModal(true);
            setShowFaceId(false);
            setShowProfilePopup(false);
          }

          // if (response.data.preTier2Status === 'PASSED') {
          //   setShowPreTier2Commit(false);
          // }
          // Bank info modal will only show when user clicks "Update Bank Information" button
          // No longer auto-show when bank info is missing
        })
        .catch((error) => {
          let message =
            error.response && error.response.data.message
              ? error.response.data.message
              : error.message;
          toast.error(t(message));
        });
    })();
  }, [refresh, currentTier]);

  // Fetch wild cards
  useEffect(() => {
    (async () => {
      setLoadingWildCards(true);
      try {
        const response = await WildCard.getUserWildCards();
        setWildCards(response.data.wildCards || []);
      } catch (error: any) {
        console.error('Error fetching wild cards:', error);
      } finally {
        setLoadingWildCards(false);
      }
    })();
  }, [refresh]);

  // Initialize bank search with current bank name
  useEffect(() => {
    if (bankName && bankCode) {
      const currentBank = banks.find((bank: any) => bank.name === bankName || bank.code === bankCode);
      if (currentBank) {
        setBankSearch(`${currentBank.code} ${currentBank.name}`);
        setSelectedBank(currentBank);
      }
    }
  }, [bankName, bankCode]);

  // Sync profile popup fields with userInfo when it changes or popup opens
  useEffect(() => {
    if (imgFront) setCccdFrontPreview(imgFront);
    if (imgBack) setCccdBackPreview(imgBack);

    // Sync useForm fields correctly
    if (fullName) setValue('fullName', fullName);
    if (walletAddress) setValue('walletAddress', walletAddress);
    if (currentAddress) setValue(currentAddress);
    if (dateOfBirth) {
      try {
        const dobFormatted = new Date(dateOfBirth).toISOString().split('T')[0];
        setValue('dateOfBirth', dobFormatted);
      } catch (e) {
        console.error('Error formatting dateOfBirth:', e);
      }
    }
    if (bankName) setValue('bankName', bankName);
    if (accountName) setValue('accountName', accountName);
    if (accountNumber) setValue('accountNumber', accountNumber);
    if (idCode) setValue('idCode', idCode);
    if (phone) setValue('phone', phone);
    if (email) setValue('email', email);
  }, [userInfo, showProfilePopup, setValue]);

  const findNextRank = (level) => {
    const currentRankIndex = USER_RANKINGS.findIndex(
      (ele) => level <= ele.value,
    );
    return USER_RANKINGS[currentRankIndex + 1]?.label || 'PIONEER';
  };

  const renderRank = (level) => {
    return USER_RANKINGS.find((ele) => level <= ele.value).label;
  };

  const hasCompleteBankInfo = () => {
    return (
      userInfo?.accountName &&
      userInfo?.accountNumber &&
      userInfo?.bankName &&
      userInfo?.bankCode
    );
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

  const handleAcceptTerms = () => {
    if (termsAccepted) {
      setShowTermsModal(false);
      // For tier 1 (countPay === 0), show signature modal if signature doesn't exist
      if (userInfo?.countPay === 0 && !userInfo?.signatureImage) {
        setShowSignatureModal(true);
      }
    }
  };

  const handleSaveSignature = async (signatureDataUrl: string) => {
    setUploadingSignature(true);
    try {
      const fetchResponse = await fetch(signatureDataUrl);
      const blob = await fetchResponse.blob();
      const formData = new FormData();
      formData.append('signature', blob, 'signature.png');

      await User.uploadSignature(formData);

      const userInfoResponse = await User.getUserInfo(1);
      if (userInfoResponse?.data) {
        dispatch(UPDATE_USER_INFO(userInfoResponse.data));
        setShowSignatureModal(false);
        toast.success(t('Signature saved successfully'));
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message;
      toast.error(t(message || 'Failed to save signature'));
    } finally {
      setUploadingSignature(false);
    }
  };

  const handleCancelSignature = () => {
    toast.warning(
      t('Signature is required for Tier 1. Please provide your signature.'),
    );
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

  const handleSaveProfileCompletion = async () => {
    // Validate personal information
    const fullNameValue = watch('fullName') as string;

    if (!fullNameValue) {
      toast.error('Vui lòng nhập họ và tên');
      return;
    }

    const walletAddressValue = watch('walletAddress') as string;
    if (!walletAddressValue) {
      toast.error('Vui lòng nhập địa chỉ ví');
      return;
    }

    const dateOfBirthValue = watch('dateOfBirth') as string;
    if (!dateOfBirthValue) {
      toast.error('Vui lòng nhập ngày tháng năm sinh');
      return;
    }

    // Validate CCCD fields only for VN users
    if (city === 'VN') {

      // Only validate CCCD images if user doesn't have them yet (profile completion)
      if (!imgFront && !imgBack) {
        if (!cccdFrontPreview && !cccdFrontFile) {
          toast.error('Vui lòng upload ảnh CCCD mặt trước');
          return;
        }
        if (!cccdBackPreview && !cccdBackFile) {
          toast.error('Vui lòng upload ảnh CCCD mặt sau');
          return;
        }
      }
    }

    // Validate bank information only for VN users
    if (city === 'VN') {
      const bankNameValue = watch('bankName') as string;
      if (!bankNameValue) {
        toast.error('Vui lòng chọn ngân hàng');
        return;
      }

      const accountNameValue = watch('accountName') as string;
      if (!accountNameValue) {
        toast.error('Vui lòng nhập tên chủ tài khoản');
        return;
      }

      const accountNumberValue = watch('accountNumber') as string;
      if (!accountNumberValue) {
        toast.error('Vui lòng nhập số tài khoản');
        return;
      }

      const currentAddressValue = watch('currentAddress') as string;
      if (!currentAddressValue) {
        toast.error('Vui lòng nhập địa chỉ hiện tại');
        return;
      }
    }

    setSavingProfile(true);
    try {
      // Step 1: Upload CCCD images if new files selected
      if ((cccdFrontFile || cccdBackFile) && (!imgFront || !imgBack)) {
        const imageFormData = new FormData();
        if (cccdFrontFile) {
          imageFormData.append('imgFront', cccdFrontFile);
        }
        if (cccdBackFile) {
          imageFormData.append('imgBack', cccdBackFile);
        }

        await User.uploadCCCD(imageFormData);
        toast.success('Upload ảnh CCCD thành công!');
      }

      // Step 3: Close popup and trigger form submission (KYC face scan)
      setShowProfilePopup(false);
      setSavingProfile(false);

      // Trigger form submission for KYC face scan
      toast.info('Đang chuyển đến trang xác thực khuôn mặt...');
      handleSubmit(onSubmit)();

    } catch (error: any) {
      let message =
        error.response && error.response.data.error
          ? error.response.data.error
          : error.response && error.response.data.message
            ? error.response.data.message
            : error.message;
      toast.error(t(message));
      setSavingProfile(false);
    }
  };

  const handleCccdImageChange = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Vui lòng chọn file hình ảnh');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước file không được vượt quá 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        if (side === 'front') {
          setCccdFrontFile(file);
          setCccdFrontPreview(reader.result as string);
        } else {
          setCccdBackFile(file);
          setCccdBackPreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };


  return (
    <DefaultLayout>
      <ToastContainer style={{ zIndex: 10000 }} />

      {/* Profile Completion Modal - Cannot be closed until complete */}
      <Modal
        isOpen={showProfilePopup}
        onRequestClose={() => { }} // Prevent closing
        shouldCloseOnOverlayClick={false}
        shouldCloseOnEsc={false}
        style={{
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            zIndex: 9000,
          },
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header with logout button */}
          <div className="flex justify-between items-center p-4 border-b border-gray-300">
            <h2 className="text-2xl font-bold text-red-600">
              {isProfileComplete ? 'Cập nhật thông tin cá nhân' : 'Hoàn thiện thông tin bắt buộc'}
            </h2>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                window.location.href = '/login';
              }}
              className="px-4 py-2 text-sm text-white bg-red-500 rounded-md hover:bg-red-600 transition"
            >
              Đăng xuất
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <p className="mb-6 text-gray-700">
              {isProfileComplete
                ? (city === 'VN'
                  ? 'Cập nhật thông tin cá nhân của bạn. Lưu ý: Ảnh CCCD không thể thay đổi. Sau khi cập nhật, bạn sẽ cần xác thực khuôn mặt để hoàn tất.'
                  : 'Cập nhật thông tin cá nhân của bạn. Sau khi cập nhật, bạn sẽ cần xác thực khuôn mặt để hoàn tất.')
                : (city === 'VN'
                  ? 'Vui lòng cung cấp đầy đủ thông tin CCCD và ngân hàng. Sau khi upload ảnh CCCD, bạn sẽ cần xác thực khuôn mặt để hoàn tất cập nhật.'
                  : 'Vui lòng cung cấp đầy đủ thông tin cá nhân. Sau khi cập nhật, bạn sẽ cần xác thực khuôn mặt để hoàn tất.')}
            </p>

            <div className="space-y-4">
              {/* Họ và tên */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('fullName', { required: true })}
                  placeholder="Nhập họ và tên đầy đủ"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Wallet Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Địa chỉ ví <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('walletAddress', { required: true })}
                  placeholder="Nhập địa chỉ ví"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* CCCD Information - Only for VN */}
              {city === 'VN' && (
                <>
                  {/* Divider */}
                  <div className="border-t border-gray-300 my-4"></div>
                  <p className="text-lg font-semibold text-gray-800 mb-2">Thông tin CCCD</p>

                  {/* Chỗ ở hiện tại */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chỗ ở hiện tại <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      {...register('currentAddress', { required: true })}
                      placeholder="Nhập địa chỉ chỗ ở hiện tại"
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}

              {/* Ngày tháng năm sinh */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày tháng năm sinh <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  {...register('dateOfBirth')}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Bank Information - Only for VN */}
              {city === 'VN' && (
                <>
                  {/* Divider */}
                  <div className="border-t border-gray-300 my-4"></div>
                  <p className="text-lg font-semibold text-gray-800 mb-2">Thông tin ngân hàng</p>

                  {/* Bank Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên ngân hàng <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={bankSearch}
                        onChange={(e) => {
                          setBankSearch(e.target.value);
                          setShowBankDropdown(true);
                        }}
                        onFocus={() => setShowBankDropdown(true)}
                        placeholder="Tìm kiếm ngân hàng..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {showBankDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                          {banks
                            .filter((bank: any) =>
                              bankSearch
                                ? `${bank.code} ${bank.name}`.toLowerCase().includes(bankSearch.toLowerCase())
                                : true
                            )
                            .slice(0, 10)
                            .map((bank: any) => (
                              <div
                                key={bank.code}
                                onClick={() => {
                                  setSelectedBank(bank);
                                  setBankSearch(`${bank.code} ${bank.name}`);
                                  setShowBankDropdown(false);
                                  setValue('bankName', bank.name);
                                }}
                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                              >
                                <div className="font-medium">{bank.code}</div>
                                <div className="text-sm text-gray-600">{bank.name}</div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Account Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên chủ tài khoản <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('accountName')}
                      placeholder="Nhập tên chủ tài khoản"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Account Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số tài khoản <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('accountNumber')}
                      placeholder="Nhập số tài khoản"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}

              {/* CCCD Images Section - Only show if VN and user doesn't have CCCD images yet */}
              {city === 'VN' && (!imgFront || !imgBack) && (
                <>
                  {/* Divider */}
                  <div className="border-t border-gray-300 my-4"></div>
                  <p className="text-lg font-semibold text-gray-800 mb-2">Hình ảnh CCCD</p>

                  {/* CCCD mặt trước */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CCCD mặt trước <span className="text-red-500">*</span>
                    </label>
                    {!imgFront ? (
                      <>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleCccdImageChange(e, 'front')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {cccdFrontPreview && (
                          <img
                            src={cccdFrontPreview}
                            alt="CCCD Front Preview"
                            className="mt-2 max-w-full h-auto rounded border"
                            style={{ maxHeight: '200px' }}
                          />
                        )}
                      </>
                    ) : (
                      <div>
                        <img
                          src={`${import.meta.env.VITE_API_URL}/uploads/CCCD/${imgFront}`}
                          alt="CCCD Front"
                          className="mt-2 max-w-full h-auto rounded border"
                          style={{ maxHeight: '200px' }}
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Đã có ảnh CCCD mặt trước. Liên hệ admin nếu cần thay đổi.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* CCCD mặt sau */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CCCD mặt sau <span className="text-red-500">*</span>
                    </label>
                    {!imgBack ? (
                      <>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleCccdImageChange(e, 'back')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {cccdBackPreview && (
                          <img
                            src={cccdBackPreview}
                            alt="CCCD Back Preview"
                            className="mt-2 max-w-full h-auto rounded border"
                            style={{ maxHeight: '200px' }}
                          />
                        )}
                      </>
                    ) : (
                      <div>
                        <img
                          src={`${import.meta.env.VITE_API_URL}/uploads/CCCD/${imgBack}`}
                          alt="CCCD Back"
                          className="mt-2 max-w-full h-auto rounded border"
                          style={{ maxHeight: '200px' }}
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Đã có ảnh CCCD mặt sau. Liên hệ admin nếu cần thay đổi.
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Submit Button */}
            <div className="mt-6">
              <button
                onClick={handleSaveProfileCompletion}
                disabled={savingProfile}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {savingProfile ? 'Đang lưu...' : 'Hoàn thành'}
              </button>
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

      <div className="px-2 lg:px-24 py-24 space-y-6 lg:space-y-8">
        {/* Tier Selector */}
        {userInfo && (
          <div className="flex items-center gap-4 mb-6">
            {[...Array(Math.min(tier || 1, 5))].map((item, i) => (
              <button
                key={i}
                onClick={() => setCurrentTier(i + 1)}
                className={`flex justify-center items-center hover:underline font-medium ${currentTier === i + 1 ? 'bg-black text-NoExcuseChallenge' : ''
                  } rounded-full py-4 px-8 border focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out`}
              >
                {t('tier')} {i + 1}
              </button>
            ))}
          </div>
        )}

        {tier === 1 && preTier2Status === 'PASSED' && !preTier2User && (
          <div
            className="bg-blue-100 border w-fit border-blue-400 text-blue-700 px-4 py-3 rounded relative mb-5 font-medium"
            role="alert"
          >
            <span className="block sm:inline">
              {t(
                "Congratulations! You're on the waiting list for Tier 2 in the Pre-Tier2 program",
              )}
            </span>
          </div>
        )}

        {preTier2User && (
          <div
            className="bg-blue-100 w-fit border border-blue-400 text-blue-700 px-4 py-3 rounded relative mb-5 font-medium"
            role="alert"
          >
            <span className="block sm:inline">
              {t(
                "Congratulations! You're eligible for Tier 2 with the new Pre-Tier2 program.",
              )}{' '}
              <Link
                to="/user/payment-for-tier-with-pre-tier-2-pool"
                className="underline"
              >
                {' '}
                {t('Go to the payment page now.')}
              </Link>
            </span>
          </div>
        )}

        {bonusRef && currentTier === 1 && (
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

          // Tính countdown cho tier 2 (nếu có dieTimeTier2) - chỉ hiển thị khi currentTier === 2
          if (currentTier === 2 && dieTimeTier2) {
            const tier2DieTime = convertToVietnamDate(dieTimeTier2);
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
                        the 62 required IDs to be eligible for Tier 2 benefits.
                      </>
                    ) : (
                      <>
                        Your Tier 2 deadline has passed. You need to complete
                        the 62 required IDs to be eligible for Tier 2 benefits.
                      </>
                    )}
                  </span>
                </div>,
              );
            }
          }

          // Tính countdown cho tier 1 (nếu có dieTimeTier1) - chỉ hiển thị khi currentTier === 1
          if (currentTier === 1 && dieTimeTier1) {
            const tier1DieTime = convertToVietnamDate(dieTimeTier1);
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

        {/* Bank Information Warning */}
        {enablePaymentBank &&
          enableWithdrawBank &&
          errLahCode !== 'OVER45' &&
          !hasCompleteBankInfo() && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-yellow-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <span className="font-semibold">
                      {t('Bank information required for bank withdrawal')}
                    </span>
                    <br />
                    {t(
                      'Please update your bank information (Bank Name, Account Name, Account Number) via the profile completion form above.',
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

        <div className={`grid gap-10 font-semibold`}>
          <div className="grid lg:grid-cols-3 gap-2">
            <div className="bg-[#FAFBFC] p-4 rounded-2xl">
              <div className="flex justify-between items-center py-2 px-4">
                <p>Status</p>
                <div
                  className={`p-2 text-sm ${status === 'UNVERIFY'
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
              {/* Tier 1: Member Since */}
              {currentTier === 1 && (
                <div className="flex justify-between bg-[#E5E9EE] py-2 px-4 rounded-lg">
                  <p>Member since</p>
                  <p> {new Date(changeCreatedAt).toLocaleDateString('vi')}</p>
                </div>
              )}
              {/* Tier 2: Tier 2 Entered */}
              {currentTier === 2 && tier >= 2 && userInfo.tier2Time && (
                <div className="flex justify-between bg-[#E5E9EE] py-2 px-4 rounded-lg">
                  <p>{t('Tier 2 entered')}</p>
                  <p>
                    {' '}
                    {new Date(userInfo.tier2Time).toLocaleDateString('vi')}
                  </p>
                </div>
              )}
              <div className="flex justify-between py-2 px-4">
                <p>{t('Completed ranking time')}</p>
                <p className="whitespace-nowrap">
                  {userInfo[`tier${ranking}Time`]}
                </p>
              </div>
              {/* Tier 1: Màu tier 1 */}
              {currentTier === 1 && (
                <>
                  <div className="flex flex-col justify-between py-3 px-4">
                    <div className="flex items-center justify-between">
                      <div>{t('Tier 1 :')}</div>
                      <div
                        className={`w-10 h-5 rounded-md ${tier1?.isRed
                          ? 'bg-[#ee0000]' // Màu đỏ
                          : tier1?.isBlue
                            ? 'bg-[#0033ff]' // Màu xanh dương
                            : tier1?.isYellow
                              ? 'bg-[#ffcc00]' // Màu vàng
                              : tier1?.isPink
                                ? 'bg-[#ff3399]' // Màu hồng
                                : 'bg-[#009933]' // Màu xanh lá (mặc định)
                          }`}
                      ></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2 px-4">
                    <span>{t('Disqualified (Tier 1)')}</span>
                    <span className="ml-auto">
                      {dieTimeTier1
                        ? new Date(dieTimeTier1).toLocaleDateString('vi')
                        : '-'}
                    </span>
                  </div>
                </>
              )}
              {/* Tier 2: Màu tier 2 */}
              {currentTier === 2 && tier >= 2 && (
                <>
                  <div className="flex flex-col justify-between py-3 px-4">
                    <div className="flex items-center justify-between">
                      <div>{t('Tier 2 :')}</div>
                      <div
                        className={`w-10 h-5 rounded-md ${isDisableTier2
                          ? 'bg-[#663300]' // Màu nâu (disable)
                          : tier2?.isYellow
                            ? 'bg-[#ffcc00]' // Màu vàng
                            : tier2?.isBlue
                              ? 'bg-[#0033ff]' // Màu xanh dương
                              : 'bg-[#009933]' // Màu xanh lá (mặc định)
                          }`}
                      ></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2 px-4 bg-[#E5E9EE] rounded-lg">
                    <span>Disqualified (Tier 2)</span>
                    <span className="ml-auto">
                      {dieTimeTier2
                        ? new Date(dieTimeTier2).toLocaleDateString('vi')
                        : '-'}
                    </span>
                  </div>
                </>
              )}
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

            {/* Cột 3: Wild Cards - Chỉ hiển thị ở Tier 2 */}
            {currentTier === 2 && (
              <div className="bg-[#FAFBFC] p-4 rounded-2xl">
                <div className="py-2 px-4">
                  <p className="uppercase mt-2 font-bold">Wild Cards</p>
                  {loadingWildCards ? (
                    <div className="py-4 text-center">
                      <Loading />
                    </div>
                  ) : wildCards.length === 0 ? (
                    <div className="py-4 text-center text-gray-500">
                      No wild cards available
                    </div>
                  ) : (
                    <div className="py-2">
                      <div className="space-y-4">
                        {wildCards.map((card: any) => {
                          const isPromoTier2 = card.cardType === 'PROMO_TIER_2';
                          return (
                            <div
                              key={card._id}
                              className={`rounded-lg overflow-hidden shadow-lg max-w-[250px] mx-auto ${isPromoTier2 ? 'bg-yellow-600' : 'bg-green-600'
                                }`}
                            >
                              {/* Top Section - Image */}
                              <div className="w-full">
                                <img
                                  src={
                                    isPromoTier2
                                      ? wildCardTopImage2
                                      : wildCardTopImage
                                  }
                                  alt="Wild Card Top"
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              {/* Bottom Section - Background based on cardType */}
                              <div
                                className={`${isPromoTier2
                                  ? 'bg-yellow-600'
                                  : 'bg-green-600'
                                  } p-4 text-white`}
                              >
                                <div className="flex flex-col items-center space-y-2">
                                  {/* WILDCARD Text */}
                                  <p className="text-2xl font-black uppercase tracking-wider">
                                    WILDCARD
                                  </p>

                                  {/* Days */}
                                  <p className="text-xl font-bold uppercase">
                                    {card.days} DAYS
                                  </p>

                                  {/* CLAIM Button */}
                                  {card.status === 'ACTIVE' && (
                                    <button
                                      onClick={async () => {
                                        if (
                                          !confirm(
                                            `Bạn có chắc chắn muốn sử dụng thẻ này? Thẻ sẽ cộng ${card.days} ngày vào dieTime của Tier ${card.targetTier}.`,
                                          )
                                        ) {
                                          return;
                                        }

                                        setUsingCardId(card._id);
                                        try {
                                          const response =
                                            await WildCard.useWildCard(
                                              card._id,
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
                                      className={`w-full max-w-xs text-white uppercase font-bold py-2 px-6 rounded-full hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${isPromoTier2
                                        ? 'bg-white/20 backdrop-blur-sm border-2 border-white/50 hover:bg-white/30'
                                        : 'bg-black hover:bg-gray-800'
                                        }`}
                                    >
                                      {usingCardId === card._id ? (
                                        <Loading />
                                      ) : (
                                        'CLAIM'
                                      )}
                                    </button>
                                  )}

                                  {/* Status for USED cards */}
                                  {card.status === 'USED' && card.usedAt && (
                                    <p className="text-sm opacity-75">
                                      Used:{' '}
                                      {new Date(card.usedAt).toLocaleDateString(
                                        'vi',
                                      )}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tier 1: Danh sách user trực tiếp */}
            {currentTier === 1 && (
              <div className="bg-[#FAFBFC] p-4 rounded-2xl">
                <div className="py-2 px-4">
                  <div className="flex items-center gap-3 mt-2">
                    <p className="uppercase font-bold">{t('children')}</p>
                    <button
                      type="button"
                      onClick={() => setShowDirectUsers(!showDirectUsers)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors flex items-center gap-1"
                    >
                      <span>{listDirectUser?.length || 0} users</span>
                      <svg
                        className={`w-4 h-4 transition-transform ${showDirectUsers ? 'rotate-180' : ''
                          }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  </div>
                  {showDirectUsers && (
                    <div className="lg:py-2">
                      <ul className="flex flex-row flex-wrap gap-2">
                        {listDirectUser.map((ele) => (
                          <li className="" key={ele.userId}>
                            <div className="py-2">
                              <div className="text-base w-full">
                                <span
                                  className={`${ele.isRed
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
                  )}
                </div>
              </div>
            )}

            {/* Tier 2: Sub Referral Members */}
            {currentTier === 2 && (
              <div className="bg-[#FAFBFC] p-4 rounded-2xl">
                <div className="py-2 px-4">
                  <div className="flex items-center gap-3 mt-2">
                    <p className="uppercase font-bold">
                      Sub Referral Members
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowSubReferralUsers(!showSubReferralUsers)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors flex items-center gap-1"
                    >
                      <span>{listDirectUser?.filter((ele) => ele.isSubId)?.length || 0} users</span>
                      <svg
                        className={`w-4 h-4 transition-transform ${showSubReferralUsers ? 'rotate-180' : ''
                          }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  </div>
                  {showSubReferralUsers && (
                    <div className="lg:py-2">
                      <ul className="flex flex-row flex-wrap gap-2">
                        {listDirectUser
                          .filter((ele) => ele.isSubId)
                          .map((ele) => (
                            <li className="" key={ele.userId}>
                              <div className="py-2">
                                <div className="text-base w-full">
                                  <span
                                    className={`${ele.isRed
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
                  )}
                </div>
              </div>
            )}

            {/* Tier 2: Tier 2 Users */}
            {currentTier === 2 && tier >= 2 && (
              <div className="bg-[#FAFBFC] p-4 rounded-2xl">
                <div className="py-2 px-4">
                  <p className="uppercase mt-2 font-bold">
                    {t('Tier 2 Users')}
                  </p>

                  {/* Branch 1 */}
                  <div className="py-2">
                    <div className="flex items-center gap-3">
                      <p className="font-medium">Branch 1 :</p>
                      <button
                        type="button"
                        onClick={() => setShowBranch1Users(!showBranch1Users)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors flex items-center gap-1"
                      >
                        <span>{tier2ChildUsers?.branch1?.length || 0} users</span>
                        <svg
                          className={`w-4 h-4 transition-transform ${showBranch1Users ? 'rotate-180' : ''
                            }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                    </div>
                    {showBranch1Users && (
                      <ul className="flex flex-row flex-wrap gap-2 mt-2">
                        {tier2ChildUsers
                          ? tier2ChildUsers?.branch1?.map((ele) => (
                            <li className="" key={ele}>
                              <div className="py-2">
                                <div className="text-base w-full">
                                  <span
                                    className={`${ele.isRed
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
                          ))
                          : ''}
                      </ul>
                    )}
                  </div>

                  {/* Branch 2 */}
                  <div className="py-2">
                    <div className="flex items-center gap-3">
                      <p className="font-medium">Branch 2 :</p>
                      <button
                        type="button"
                        onClick={() => setShowBranch2Users(!showBranch2Users)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors flex items-center gap-1"
                      >
                        <span>{tier2ChildUsers?.branch2?.length || 0} users</span>
                        <svg
                          className={`w-4 h-4 transition-transform ${showBranch2Users ? 'rotate-180' : ''
                            }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                    </div>
                    {showBranch2Users && (
                      <ul className="flex flex-row flex-wrap gap-2 mt-2">
                        {tier2ChildUsers
                          ? tier2ChildUsers?.branch2?.map((ele) => (
                            <li className="" key={ele}>
                              <div className="py-2">
                                <div className="text-base w-full">
                                  <span
                                    className={`${ele.isRed
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
                          ))
                          : ''}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tier 2: Active ID */}
            {currentTier === 2 && tier >= 2 && (
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
          </div>
        </div>

        {currentTier === 1 && (
          <>
            {/* Tier 2: SubId Info */}
            {tier >= 2 && subUser && (
              <div className="bg-[#FAFBFC] p-4 rounded-2xl">
                <div className="py-2 px-4">
                  <p className="uppercase mt-2 font-bold">Sub ID Information</p>
                  <div className="lg:py-2">
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium">Sub ID Name:</p>
                        <p className="text-sm">{subUser.userName || '-'}</p>
                      </div>
                      {subUser._id && (
                        <div>
                          <p className="text-sm font-medium">Sub ID ID:</p>
                          <p className="text-sm">{subUser._id}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-between">
              {tier >= 2 && subUser && (
                <button
                  className={`bg-blue-600 text-white px-6 py-2 rounded-lg`}
                  onClick={() => navigate(`/user/sub/${subUser._id}`)}
                >
                  Profile {subUser.userName}
                </button>
              )}

              {errLahCode !== 'OVER45' && status === 'APPROVED' && (
                <button
                  onClick={() => setShowProfilePopup(true)}
                  className="flex gap-2 font-semibold py-2 px-4 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
                >
                  Cập nhật thông tin{' '}
                  <svg
                    width="18"
                    height="21"
                    viewBox="0 0 18 21"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15.675 1.63718C15.3938 1.35583 15.0599 1.13267 14.6924 0.980441C14.325 0.828213 13.9311 0.749907 13.5333 0.75C13.1355 0.750093 12.7417 0.828583 12.3743 0.980982C12.0068 1.13338 11.6731 1.3567 11.392 1.63818L1.885 11.1582C1.31853 11.7259 1.00028 12.4951 1 13.2972V16.5002C1 16.9142 1.336 17.2502 1.75 17.2502H4.973C5.776 17.2502 6.546 16.9302 7.113 16.3632L16.613 6.85718C17.1797 6.28915 17.4979 5.51954 17.4979 4.71718C17.4979 3.91481 17.1797 3.1452 16.613 2.57718L15.675 1.63718ZM0.75 18.7502C0.551088 18.7502 0.360322 18.8292 0.21967 18.9698C0.0790175 19.1105 0 19.3013 0 19.5002C0 19.6991 0.0790175 19.8899 0.21967 20.0305C0.360322 20.1712 0.551088 20.2502 0.75 20.2502H16.75C16.9489 20.2502 17.1397 20.1712 17.2803 20.0305C17.421 19.8899 17.5 19.6991 17.5 19.5002C17.5 19.3013 17.421 19.1105 17.2803 18.9698C17.1397 18.8292 16.9489 18.7502 16.75 18.7502H0.75Z"
                      fill="white"
                    />
                  </svg>
                </button>
              )}
            </div>

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
                  <p>{status !== 'REJECTED' && idCode}</p>
                </div>
                <div className="grid lg:grid-cols-2 gap-2 bg-[#E5E9EE] lg:gap-0 items-center py-2 px-4 rounded-lg">
                  <p>Wallet Address :</p>
                  <p>{shortenWalletAddress(walletAddress, 14)}</p>
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
                {/* Always show Date of Birth and Full Name */}
                <div className="grid lg:grid-cols-2 gap-2 lg:gap-0 py-2 px-4 rounded-lg">
                  <p>{t('date of birth')} :</p>
                  <p>
                    {dateOfBirth
                      ? new Date(dateOfBirth).toLocaleDateString('vi-Vn', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })
                      : '-'}
                  </p>
                </div>
                <div className="grid lg:grid-cols-2 gap-2 lg:gap-0 bg-[#E5E9EE] py-2 px-4 rounded-lg">
                  <p>Họ và tên :</p>
                  <p>{fullName || '-'}</p>
                </div>

                {/* Bank and CCCD Info - Only for VN */}
                {city === 'VN' && (
                  <>
                    <div className="grid lg:grid-cols-2 gap-2 lg:gap-0 py-2 px-4 rounded-lg">
                      <p>{t('bank name')} :</p>
                      <p>{bankName}</p>
                    </div>
                    <div className="grid lg:grid-cols-2 gap-2 lg:gap-0 bg-[#E5E9EE] py-2 px-4 rounded-lg">
                      <p>{t('bankCode')} :</p>
                      <p>{bankCode || '-'}</p>
                    </div>
                    <div className="grid lg:grid-cols-2 gap-2 lg:gap-0 py-2 px-4 rounded-lg">
                      <p>{t('accountName')} :</p>
                      <p>{accountName || '-'}</p>
                    </div>
                    <div className="grid lg:grid-cols-2 gap-2 lg:gap-0 py-2 px-4 rounded-lg">
                      <p>{t('accountNumber')} :</p>
                      <p>{accountNumber || '-'}</p>
                    </div>
                    <div className="grid lg:grid-cols-2 gap-2 lg:gap-0 bg-[#E5E9EE] py-2 px-4 rounded-lg">
                      <p>Chỗ ở hiện tại :</p>
                      <p>{currentAddress || '-'}</p>
                    </div>
                  </>
                )}
              </div>
              {/* Contract Completed Status */}
              {city === 'VN' && userInfo?.contractCompleted && (
                <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded mt-6">
                  <div className="flex items-center">
                    <svg
                      className="h-5 w-5 text-green-400 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-green-700 font-medium">
                      {t('Contract has been completed')}
                    </p>
                  </div>
                </div>
              )}

            </form>
          </>
        )}


        {/* CCCD Upload Modal */}
        {city === 'VN' && (
          <Modal
            isOpen={showCCCDModal}
            onRequestClose={() => setShowCCCDModal(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            overlayClassName="fixed inset-0 z-40"
            contentLabel="CCCD Upload Modal"
          >
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {t('Upload CCCD (Citizen ID Card)')}
              </h2>
              <p className="text-gray-600 mb-4">
                {t('Please upload both front and back of your CCCD for contract processing')}
              </p>

              {/* Display existing images if available */}
              {(imgFront || imgBack) && (
                <div className="mb-4 grid grid-cols-2 gap-4">
                  {imgFront && (
                    <div>
                      <p className="text-sm font-medium mb-2">{t('CCCD Front')}</p>
                      <img
                        src={`${import.meta.env.VITE_API_URL}/uploads/CCCD/${imgFront}`}
                        alt="CCCD Front"
                        className="w-full h-auto border-2 border-gray-300 rounded-lg"
                        style={{ maxHeight: '300px' }}
                      />
                    </div>
                  )}
                  {imgBack && (
                    <div>
                      <p className="text-sm font-medium mb-2">{t('CCCD Back')}</p>
                      <img
                        src={`${import.meta.env.VITE_API_URL}/uploads/CCCD/${imgBack}`}
                        alt="CCCD Back"
                        className="w-full h-auto border-2 border-gray-300 rounded-lg"
                        style={{ maxHeight: '300px' }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Upload form - only show if no images or images were deleted */}
              {(!imgFront || !imgBack) && (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target as HTMLFormElement);

                    setLoadingCCCD(true);
                    try {
                      await User.uploadCCCD(formData)
                        .then((response) => {
                          toast.success(t(response.data.message || 'CCCD uploaded successfully'));
                          setShowCCCDModal(false);
                          setRefresh(!refresh);
                          // Refresh user info
                          User.getUserInfo(currentTier)
                            .then((response) => {
                              dispatch(UPDATE_USER_INFO(response.data));
                            })
                            .catch((error) => {
                              console.error('Error refreshing user info:', error);
                            });
                        })
                        .catch((error: any) => {
                          let message =
                            error.response && error.response.data.error
                              ? error.response.data.error
                              : error.response && error.response.data.message
                                ? error.response.data.message
                                : error.message;
                          toast.error(t(message));
                        });
                    } catch (error: any) {
                      toast.error(t(error.message || 'Upload failed'));
                    } finally {
                      setLoadingCCCD(false);
                    }
                  }}
                >
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {!imgFront && (
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {t('CCCD Front')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="file"
                          name="imgFront"
                          accept="image/png,image/jpg,image/jpeg"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-gray-400"
                          required={!imgFront}
                        />
                      </div>
                    )}
                    {!imgBack && (
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {t('CCCD Back')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="file"
                          name="imgBack"
                          accept="image/png,image/jpg,image/jpeg"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-gray-400"
                          required={!imgBack}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCCCDModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                    >
                      {t('Cancel')}
                    </button>
                    <button
                      type="submit"
                      disabled={loadingCCCD}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loadingCCCD ? <Loading /> : t('Upload')}
                    </button>
                  </div>
                </form>
              )}

              {/* Show message if both images exist */}
              {imgFront && imgBack && (
                <div className="text-center py-4">
                  <p className="text-green-600 font-medium">
                    {t('CCCD images uploaded successfully')}
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowCCCDModal(false)}
                    className="mt-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    {t('Close')}
                  </button>
                </div>
              )}
            </div>
          </Modal>
        )}

        {/* CCCD Section in Profile */}
        {city === 'VN' && (
          <div className="bg-[#FAFBFC] p-4 rounded-2xl mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">{t('CCCD (Citizen ID Card)')}</h3>
              {(!imgFront || !imgBack) && (
                <button
                  onClick={() => setShowCCCDModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  {imgFront || imgBack ? t('Update CCCD') : t('Upload CCCD')}
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {imgFront ? (
                <div>
                  <p className="text-sm font-medium mb-2">{t('CCCD Front')}</p>
                  <img
                    src={`${import.meta.env.VITE_API_URL}/uploads/CCCD/${imgFront}`}
                    alt="CCCD Front"
                    className="w-full h-auto border-2 border-gray-300 rounded-lg bg-white"
                    style={{ maxHeight: '300px' }}
                  />
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <p className="text-gray-500">{t('No front image')}</p>
                </div>
              )}

              {imgBack ? (
                <div>
                  <p className="text-sm font-medium mb-2">{t('CCCD Back')}</p>
                  <img
                    src={`${import.meta.env.VITE_API_URL}/uploads/CCCD/${imgBack}`}
                    alt="CCCD Back"
                    className="w-full h-auto border-2 border-gray-300 rounded-lg bg-white"
                    style={{ maxHeight: '300px' }}
                  />
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <p className="text-gray-500">{t('No back image')}</p>
                </div>
              )}
            </div>
          </div>
        )}
        {/* Terms and Commitment Modal */}
        <Modal
          isOpen={showTermsModal}
          onRequestClose={() => {
            // Prevent closing without accepting
            if (!termsAccepted) {
              return;
            }
            setShowTermsModal(false);
          }}
          style={{
            content: {
              top: '50%',
              left: '50%',
              right: 'auto',
              bottom: 'auto',
              marginRight: '-50%',
              transform: 'translate(-50%, -50%)',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto',
              borderRadius: '8px',
              padding: '0',
              backgroundColor: '#fff',
            },
            overlay: {
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              zIndex: 1000,
            },
          }}
          contentLabel="Terms and Commitment"
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex-shrink-0 p-4 border-b border-gray-200">
              <h2 className="text-xl text-blue-800">{t('paymentTerms.title')}</h2>
            </div>

            {/* Content - scrollable area */}
            <div className="flex-1 overflow-y-auto p-6" style={{ paddingBottom: '140px' }}>
              <div className="prose max-w-none text-gray-700 text-sm">
                {loadingContract ? (
                  <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="ml-4 text-gray-600">Đang tải nội dung hợp đồng...</p>
                  </div>
                ) : (
                  <div
                    className="contract-content"
                    dangerouslySetInnerHTML={{ __html: contractContent }}
                    style={{
                      fontFamily: "'Times New Roman', Times, serif",
                      lineHeight: '1.6',
                      textAlign: 'justify'
                    }}
                  />
                )}
              </div>
            </div>

            {/* Footer - Fixed at bottom using sticky */}
            <div
              className="flex-shrink-0 p-6 border-t border-gray-200 bg-white"
              style={{
                position: 'sticky',
                bottom: 0,
                zIndex: 10,
                boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div className="flex items-start mb-4">
                <input
                  type="checkbox"
                  id="termsCheckbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1 mr-3 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="termsCheckbox"
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  {t('paymentTerms.agreeText')}
                </label>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleAcceptTerms}
                  disabled={!termsAccepted}
                  className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('paymentTerms.confirm')}
                </button>
              </div>
            </div>
          </div>
        </Modal>

        {/* Signature Modal for Tier 1 */}
        <Modal
          isOpen={showSignatureModal}
          onRequestClose={() => {
            toast.warning(
              t('Signature is required for Tier 1. Please provide your signature.'),
            );
          }}
          style={{
            content: {
              top: '50%',
              left: '50%',
              right: 'auto',
              bottom: 'auto',
              marginRight: '-50%',
              transform: 'translate(-50%, -50%)',
              maxWidth: '700px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto',
              borderRadius: '8px',
              padding: '24px',
              backgroundColor: '#fff',
            },
            overlay: {
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              zIndex: 1001,
            },
          }}
          contentLabel="Signature"
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex-shrink-0 mb-6">
              <h2 className="text-xl text-blue-800 font-bold">
                {t('Please provide your signature')}
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                {t('Your signature will be used for contract signing purposes')}
              </p>
            </div>

            {/* Signature Pad */}
            <div className="flex-1">
              {uploadingSignature ? (
                <div className="flex justify-center items-center py-10">
                  <Loading />
                </div>
              ) : (
                <SignaturePad
                  onSave={handleSaveSignature}
                  onCancel={handleCancelSignature}
                />
              )}
            </div>
          </div>
        </Modal>
      </div>
    </DefaultLayout >
  );
};

export default Profile;
