import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Payment from '@/api/Payment';
import Loading from '@/components/Loading';
import { ToastContainer, toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import Modal from 'react-modal';
import DefaultLayout from '../../../layout/DefaultLayout';
import { transfer } from '../../../utils/smartContract';
import { shortenWalletAddress } from '../../../utils';
import { useSelector, useDispatch } from 'react-redux';
import { UPDATE_USER_INFO } from '@/slices/auth';
import PaymentModal from '@/components/PaymentModal';
import SignaturePad from '@/components/SignaturePad';
import User from '@/api/User';
import '@/components/PaymentModal/index.css';

Modal.setAppElement('#root');

const PaymentPage = () => {
  const { t, i18n } = useTranslation();
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const isVietnamese = i18n.language === 'vi';
  const [total, setTotal] = useState(0);
  const [loadingPaymentInfo, setLoadingPaymentInfo] = useState(true);
  const [paymentsList, setPaymentsList] = useState([]);
  const [paymentIdsList, setPaymentIdsList] = useState([]);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(0);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [uploadingSignature, setUploadingSignature] = useState(false);

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
    // Check if Face ID and profile are complete before allowing payment
    if (userInfo?.facetecTid === '' && userInfo?.lockKyc === false) {
      toast.error('Vui lòng đăng ký Face ID trước khi thanh toán');
      window.location.href = '/user/profile';
      return;
    }

    if (userInfo?.isProfileComplete === false) {
      toast.error('Vui lòng hoàn thiện thông tin CCCD trước khi thanh toán');
      window.location.href = '/user/profile';
      return;
    }

    onGetPaymentInfo();
    // Show terms modal when payment info is loaded
    setShowTermsModal(true);
  }, [userInfo?.isProfileComplete]);

  const handleAcceptTerms = () => {
    if (termsAccepted) {
      setShowTermsModal(false);
      // For tier 1 (countPay === 0), show signature modal first if signature not exists
      // User MUST upload signature before seeing payment info
      if (userInfo?.countPay === 0 && !userInfo?.signatureImage) {
        setShowSignatureModal(true);
        // Don't show payment info yet - wait for signature upload
        setShowPayment(false);
      } else {
        setShowPayment(true);
      }
    }
  };

  const handleSaveSignature = async (signatureDataUrl: string) => {
    setUploadingSignature(true);
    try {
      // Convert data URL to blob
      const fetchResponse = await fetch(signatureDataUrl);
      const blob = await fetchResponse.blob();

      // Create FormData
      const formData = new FormData();
      formData.append('signature', blob, 'signature.png');

      // Upload signature
      await User.uploadSignature(formData);

      // Refresh user info to get updated signatureImage
      const userInfoResponse = await User.getUserInfo(1);
      if (userInfoResponse?.data) {
        // Update userInfo in Redux store
        dispatch(UPDATE_USER_INFO(userInfoResponse.data));
        // Close modal and show payment info
        setShowSignatureModal(false);
        setShowPayment(true);
        toast.success(t('Signature saved successfully'));
      }
    } catch (error: any) {
      let message =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      toast.error(t(message || 'Failed to save signature'));
    } finally {
      setUploadingSignature(false);
    }
  };

  const handleCancelSignature = () => {
    // For tier 1, signature is REQUIRED - don't allow canceling
    // User must upload signature to proceed
    toast.warning(
      t(
        'Signature is required for Tier 1 payment. Please provide your signature.',
      ),
    );
    // Keep modal open - don't close it
  };

  const handleOpenPaymentModal = () => {
    if (termsAccepted) {
      setShowPaymentModal(true);
    } else {
      setShowTermsModal(true);
    }
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
              showPayment &&
              termsAccepted &&
              // For tier 1, only show payment if signature exists
              (userInfo?.countPay !== 0 || userInfo?.signatureImage) && (
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
                    {t('Contribution Completed')}
                  </p>
                  <p className="text-md lg:text-2xl font-bold">
                    {t('Thank You')}{' '}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

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

          {/* Content - User will add content here */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="prose max-w-none text-gray-700 text-sm">
              {isVietnamese ? (
                <>
                  {/* Vietnamese Content */}
                  <p>
                    <b>Ngày hiệu lực</b>: 12 tháng 4, 2025
                  </p>
                  <br></br>
                  <p>
                    <b>Thỏa thuận & Xác nhận Thành viên</b> ("Thỏa thuận") này
                    quy định các điều khoản và điều kiện mà các cá nhân ("Thành
                    viên") có thể tham gia vào{' '}
                    <b>Chương trình No Excuse Challenge</b>, một chương trình
                    được tạo và vận hành bởi <b>Ameritec IPS (Hoa Kỳ)</b> và{' '}
                    <b>America Technology (Việt Nam)</b> (sau đây gọi chung là
                    "Tổ chức").
                  </p>
                  <br></br>
                  <p>
                    Thỏa thuận này mô tả quyền lợi, nghĩa vụ và trách nhiệm của
                    cả Tổ chức và Thành viên, đồng thời xác định bản chất của
                    việc tham gia, cơ chế cộng đồng, cách phân phối quyền lợi và
                    chính sách bảo vệ dữ liệu cá nhân trong khuôn khổ Chương
                    trình <b>Chương trình No Excuse Challenge.</b>
                  </p>
                  <br></br>
                  <p className="text-lg text-blue-800">
                    Tổng quan về Tư cách Thành viên
                  </p>
                  <p>
                    Để tham gia <b>No Excuse Challenge</b>, bạn trước tiên phải
                    trở thành một thành viên đã đăng ký hợp lệ.
                  </p>
                  <p>
                    Phí thành viên của bạn được xác định dựa trên quốc gia cư
                    trú của bạn — một bước nhỏ mở ra cánh cửa cho một hành trình
                    phi thường của sự phát triển, đổi mới và cơ hội.
                  </p>
                  <br></br>
                  <p className="text-lg text-blue-800">Lợi ích Thành viên</p>
                  <p>
                    Là một thành viên của cộng đồng <b>No Excuse Challenge</b>,
                    bạn sẽ nhận được các lợi ích sau:
                  </p>
                  <ul className="list-disc list-inside">
                    <li>
                      <b>Truy cập vào Nền tảng No Excuse Challenge</b> — nơi sự
                      chuyển đổi bắt đầu.
                    </li>
                    <li>
                      <b>Truy cập vào Ứng dụng Đi bộ Cao cấp của chúng tôi</b> —
                      đi bộ cho sức khỏe của bạn, kiếm tiền cho sự phát triển
                      của bạn.
                    </li>
                    <li>
                      <b>Truy cập vào AmChain Blockchain</b> — được xây dựng cho
                      tốc độ, bảo mật và sử dụng thực tế.
                    </li>
                    <li>
                      <b>Truy cập vào Quantum Wallet của chúng tôi</b> — một ví
                      bảo mật hậu lượng tử được xây dựng cho tương lai.
                    </li>
                    <li>
                      <b>Sở hữu 100 USDT trị giá HEWE Coin</b> — tài sản kỹ
                      thuật số Sức khỏe & Tài sản của bạn.
                    </li>
                    <li>
                      <b>
                        Đủ điều kiện để Nâng cấp và Duy trì Thành viên Cao cấp
                      </b>{' '}
                      — cho phép tiếp tục tham gia vào Chương trình Challenge,
                      bao gồm đóng góp cộng đồng, phần thưởng đánh giá cao, và
                      tiền thưởng độc quyền của công ty.
                    </li>
                  </ul>
                  <br></br>
                  <p className="text-lg text-blue-800">
                    Thành viên Cao cấp: Nâng cấp & Duy trì
                  </p>
                  <p>
                    <b>Không có phí bổ sung</b> nào được yêu cầu để nâng cấp lên
                    Thành viên Cao cấp.
                  </p>
                  <p>
                    Để đủ điều kiện làm <b>Thành viên Cao cấp</b>, bạn phải:
                  </p>
                  <ul className="list-disc list-inside">
                    <li>
                      Giới thiệu <b>hai (2) thành viên mới</b> tham gia
                      Challenge.
                    </li>
                    <li>
                      Duy trì <b>hai (2) Thành viên Cao cấp hoạt động</b> mọi
                      lúc để tiếp tục đủ điều kiện nhận lợi ích.
                    </li>
                  </ul>
                  <br></br>
                  <p className="text-lg text-blue-800">
                    No Excuse Challenge – Điều khoản & Điều kiện
                  </p>
                  <p className="font-semibold">1. Chấp nhận Điều khoản</p>
                  <p>
                    Bằng cách truy cập hoặc sử dụng{' '}
                    <b>website No Excuse Challenge</b> (noexcuse.live), các dịch
                    vụ, sản phẩm công nghệ, hoặc chương trình quản lý của chúng
                    tôi, bạn ("Người dùng" hoặc "bạn") đồng ý bị ràng buộc bởi
                    các Điều khoản & Điều kiện này.
                  </p>
                  <p>
                    Nếu bạn không đồng ý với tất cả các Điều khoản này, vui lòng
                    không sử dụng Dịch vụ.
                  </p>
                  <p className="font-semibold">2. Đủ điều kiện</p>
                  <p>
                    Bạn phải ít nhất đủ tuổi trưởng thành trong khu vực pháp lý
                    của bạn để sử dụng Dịch vụ.
                  </p>
                  <p>
                    Bằng cách sử dụng Trang web, bạn tuyên bố và đảm bảo rằng
                    bạn có năng lực pháp lý để tham gia vào một thỏa thuận ràng
                    buộc và tất cả thông tin bạn cung cấp là chính xác và trung
                    thực.
                  </p>
                  <p className="font-semibold">3. Thay đổi Điều khoản</p>
                  <p>
                    Tổ chức bảo lưu quyền, theo quyết định của mình, sửa đổi,
                    cập nhật, hoặc thay thế các Điều khoản này bất cứ lúc nào.
                    Mọi thay đổi có hiệu lực ngay lập tức khi được đăng. Trách
                    nhiệm của bạn là xem xét các Điều khoản này định kỳ để cập
                    nhật.
                  </p>
                  <p>
                    Việc bạn tiếp tục sử dụng Dịch vụ sau khi các thay đổi được
                    đăng tải thể hiện sự chấp nhận của bạn đối với các Điều
                    khoản đã cập nhật.
                  </p>
                  <p className="font-semibold">4. Sở hữu Trí tuệ</p>
                  <p>
                    Tất cả nội dung, logo, thiết kế, văn bản, đồ họa, hình ảnh
                    và các tài liệu khác trên Trang web là tài sản của No Excuse
                    Challenge hoặc các bên cấp phép của nó và được bảo vệ bởi
                    luật sở hữu trí tuệ. Bạn đồng ý không sao chép, phân phối,
                    sửa đổi, tạo tác phẩm phái sinh, hoặc khai thác bất kỳ nội
                    dung nào mà không có sự cho phép bằng văn bản rõ ràng.
                  </p>
                  <p className="font-semibold">5. Hành vi Người dùng</p>
                  <p>
                    Bạn đồng ý không sử dụng Trang web hoặc Dịch vụ cho bất kỳ
                    mục đích bất hợp pháp nào hoặc theo cách vi phạm các Điều
                    khoản này.
                  </p>
                  <p>Các hoạt động bị cấm bao gồm, nhưng không giới hạn:</p>
                  <ul className="list-disc list-inside">
                    <li>
                      Mạo danh bất kỳ người hoặc thực thể nào, hoặc trình bày
                      sai về mối quan hệ của bạn với bất kỳ người hoặc thực thể
                      nào.
                    </li>
                    <li>
                      Đăng hoặc truyền nội dung bất hợp pháp, có hại, đe dọa,
                      phỉ báng, khiêu dâm, hoặc không phù hợp khác.
                    </li>
                    <li>
                      Cố gắng truy cập trái phép vào hệ thống của chúng tôi hoặc
                      tài khoản của người dùng khác.
                    </li>
                  </ul>
                  <p className="font-semibold">6. Liên kết Bên thứ ba</p>
                  <p>
                    Trang web có thể chứa liên kết đến các trang web hoặc tài
                    nguyên bên thứ ba. No Excuse Challenge không chứng thực và
                    không chịu trách nhiệm về độ chính xác hoặc nội dung của các
                    trang web bên ngoài này. Việc sử dụng các trang web bên thứ
                    ba là rủi ro của bạn và tuân theo các điều khoản và điều
                    kiện tương ứng của chúng.
                  </p>
                  <p className="font-semibold">7. Từ chối Trách nhiệm</p>
                  <p>
                    Dịch vụ được cung cấp trên cơ sở "nguyên trạng" và "theo khả
                    năng", không có bảo đảm nào, rõ ràng hay ngụ ý.
                  </p>
                  <p>
                    No Excuse Challenge không đảm bảo rằng Dịch vụ sẽ an toàn,
                    không có lỗi, không bị gián đoạn, hoặc đáp ứng các yêu cầu
                    cụ thể của bạn.
                  </p>
                  <p className="font-semibold">8. Giới hạn Trách nhiệm</p>
                  <p>
                    Trong phạm vi tối đa được pháp luật cho phép, No Excuse
                    Challenge, các giám đốc, nhân viên, đại lý và các công ty
                    liên kết của nó sẽ không chịu trách nhiệm về bất kỳ thiệt
                    hại gián tiếp, ngẫu nhiên, đặc biệt, hậu quả, hoặc trừng
                    phạt nào phát sinh từ việc bạn sử dụng Dịch vụ.
                  </p>
                  <p className="font-semibold">9. Bồi thường</p>
                  <p>
                    Bạn đồng ý bồi thường và giữ cho No Excuse Challenge, các
                    công ty liên kết, giám đốc, nhân viên và đại lý của nó không
                    bị tổn hại khỏi bất kỳ khiếu nại, trách nhiệm pháp lý, thiệt
                    hại, tổn thất hoặc chi phí nào phát sinh từ việc bạn sử dụng
                    Dịch vụ hoặc vi phạm các Điều khoản này.
                  </p>
                  <p className="font-semibold">10. Luật Điều chỉnh</p>
                  <p>
                    Thỏa thuận này sẽ được điều chỉnh và giải thích theo luật
                    pháp của Hoa Kỳ, không tính đến các nguyên tắc xung đột pháp
                    luật. Mọi tranh chấp sẽ được giải quyết độc quyền tại các
                    tòa án của Hoa Kỳ, phù hợp với luật quốc tế khi áp dụng.
                  </p>
                  <p className="font-semibold">11. Chấm dứt</p>
                  <p>
                    Chúng tôi có thể, theo quyết định riêng của mình, tạm ngưng
                    hoặc chấm dứt quyền truy cập của bạn vào Dịch vụ bất cứ lúc
                    nào, có hoặc không có thông báo, vì bất kỳ lý do nào, bao
                    gồm vi phạm các Điều khoản này.
                  </p>
                  <p className="font-semibold">12. Tính Độc lập</p>
                  <p>
                    Nếu bất kỳ điều khoản nào của Thỏa thuận này được coi là
                    không hợp lệ hoặc không thể thực thi, điều khoản đó sẽ được
                    thực thi ở mức độ tối đa có thể, và các điều khoản còn lại
                    sẽ vẫn có hiệu lực đầy đủ.
                  </p>
                  <p className="font-semibold">
                    13. Xử lý & Chuyển Dữ liệu Cá nhân
                  </p>
                  <p>
                    "Dữ liệu cá nhân" đề cập đến thông tin điện tử dưới dạng ký
                    hiệu, chữ cái, số, hình ảnh, âm thanh hoặc tương đương liên
                    quan đến một cá nhân hoặc được sử dụng để xác định một cá
                    nhân. Điều này bao gồm cả dữ liệu cá nhân chung và nhạy cảm,
                    theo định nghĩa của các luật áp dụng. Bằng cách sử dụng nền
                    tảng No Excuse Challenge, bạn thừa nhận và đồng ý rằng dữ
                    liệu cá nhân của bạn có thể được thu thập, lưu trữ, xử lý và
                    chuyển cho các bên thứ ba liên quan nhằm mục đích cung cấp,
                    duy trì và cải thiện Dịch vụ. Dữ liệu như vậy có thể được
                    chuyển ra ngoài Việt Nam, nơi đặt máy chủ hoặc nhà cung cấp
                    dịch vụ của chúng tôi. Chúng tôi tuân thủ tất cả các luật
                    bảo vệ dữ liệu áp dụng và yêu cầu các bên nhận triển khai
                    các biện pháp bảo mật phù hợp để bảo vệ dữ liệu của bạn.
                  </p>
                  <p className="font-semibold">14. Thỏa thuận Toàn bộ</p>
                  <p>
                    Thỏa thuận này tạo thành toàn bộ sự hiểu biết giữa bạn và No
                    Excuse Challenge và thay thế tất cả các thỏa thuận trước đó.
                  </p>
                  <br></br>
                  <p className="text-lg text-blue-800">
                    Quy tắc & Quy định No Excuse Challenge
                  </p>
                  <p>
                    <b>1. Chính sách Nền tảng</b>
                  </p>
                  <ul className="list-disc list-inside">
                    <li>
                      Chúng tôi cung cấp một nền tảng cho đóng góp ngang hàng và
                      hỗ trợ do cộng đồng thúc đẩy.
                    </li>
                    <li>
                      Tất cả quyết định được thực hiện độc lập bởi người tham
                      gia.
                    </li>
                    <li>
                      Ameritec IPS, một công ty Hoa Kỳ, tự hào vận hành nền tảng
                      này theo quy định của Hoa Kỳ.
                    </li>
                  </ul>
                  <p>
                    <b>2. Điều khoản Chung</b>
                  </p>
                  <ul className="list-disc list-inside">
                    <li>
                      Một ID cho mỗi người. Tài khoản trùng lặp hoặc giả mạo bị
                      cấm.
                    </li>
                    <li>
                      Nói xấu hoặc phỉ báng về công ty, chương trình hoặc thành
                      viên không được phép.
                    </li>
                    <li>
                      Thao túng, gian lận hoặc khai thác hệ thống dẫn đến chấm
                      dứt ngay lập tức.
                    </li>
                    <li>
                      Tuyển dụng thành viên No Excuse Challenge vào các chương
                      trình hoặc MLM khác bị cấm.
                    </li>
                    <li>Thành viên phải duy trì hoạt động để giữ lợi ích.</li>
                    <li>Phải tôn trọng và liêm chính mọi lúc.</li>
                    <li>Chuyển nhượng trái phép hoặc bán tài khoản bị cấm.</li>
                  </ul>
                  <p>
                    <b>3. Yêu cầu Tham gia</b>
                  </p>
                  <ul className="list-disc list-inside">
                    <li>
                      Thành viên phải giới thiệu hai (2) thành viên trực tiếp
                      trong vòng 30 ngày kể từ ngày đăng ký để đủ điều kiện làm
                      Premium.
                    </li>
                    <li>
                      Thành viên Premium phải duy trì hai (2) thành viên hoạt
                      động mọi lúc.
                    </li>
                    <li>
                      Không tuân thủ có thể dẫn đến loại bỏ và mất phần thưởng
                      cộng đồng.
                    </li>
                  </ul>
                  <p>
                    <b>4. Đủ điều kiện Premium</b>
                  </p>
                  <ul className="list-disc list-inside">
                    <li>
                      Thành viên phải duy trì 62 ID hoạt động (trực tiếp và gián
                      tiếp) ở Tier 1 để mở khóa Tier 2 và xa hơn.
                    </li>
                    <li>
                      Tài khoản chính đủ điều kiện cho khuyến mãi và phần
                      thưởng.
                    </li>
                    <li>
                      Tài khoản phụ chỉ dành cho hỗ trợ hệ thống và không đủ
                      điều kiện nhận tiền thưởng.
                    </li>
                  </ul>
                  <p>
                    <b>5. Lưu ý Pháp lý</b>
                  </p>
                  <ul className="list-disc list-inside">
                    <li>
                      <b>
                        No Excuse Challenge, DreamChain, Ameritec IPS, và
                        America Technology
                      </b>{' '}
                      không phải là cố vấn tài chính.
                    </li>
                    <li>
                      Chương trình hoạt động như một{' '}
                      <b>mô hình đóng góp ngang hàng</b>, không phải đầu tư.
                    </li>
                    <li>
                      Tham gia là tự nguyện; thành viên chịu trách nhiệm về sức
                      khỏe tài chính và tinh thần của chính họ.
                    </li>
                    <li>
                      Người tổ chức không chịu trách nhiệm về bất kỳ tổn thất,
                      thương tích hoặc thiệt hại cá nhân nào.
                    </li>
                  </ul>
                  <p>
                    <b>6. Đăng ký & Liêm chính</b>
                  </p>
                  <ul className="list-disc list-inside">
                    <li>
                      Đăng ký phải được hoàn thành thông qua các nền tảng chính
                      thức.
                    </li>
                    <li>
                      Tất cả nhiệm vụ và thử thách phải được hoàn thành một cách
                      trung thực.
                    </li>
                    <li>Thành viên phải từ 18 tuổi trở lên.</li>
                    <li>
                      Thành viên mở cửa toàn cầu trừ khi bị pháp luật cấm.
                    </li>
                  </ul>
                  <p>
                    <b>7. Tuân thủ & Thực thi</b>
                  </p>
                  <p>
                    Không tuân thủ các điều khoản này có thể dẫn đến loại bỏ
                    ngay lập tức. Tổ chức bảo lưu quyền thực hiện các hành động
                    cần thiết để bảo vệ tính toàn vẹn của cộng đồng.
                  </p>
                  <p>
                    <b>Nguyên tắc Cốt lõi: R.O.S.C.A.</b>
                  </p>
                  <br></br>
                  <ul className="list-disc list-inside">
                    <li>
                      <b>Rotate (Xoay vòng)</b>: Di chuyển tài sản để giữ hệ
                      thống sống động.
                    </li>
                    <li>
                      <b>Offer (Cung cấp)</b>: Giúp đỡ người khác thông qua đóng
                      góp.
                    </li>
                    <li>
                      <b>Support (Hỗ trợ)</b>: Lưu thông tài sản trong cộng
                      đồng.
                    </li>
                    <li>
                      <b>Contribute (Đóng góp)</b>: Tích cực đóng vai trò của
                      bạn.
                    </li>
                    <li>
                      <b>Advance (Tiến bộ)</b>: Bạn càng cho đi nhiều, cộng đồng
                      càng phát triển.
                    </li>
                  </ul>
                  <br></br>
                  <p className="text-lg text-blue-800">Thông báo Quan trọng</p>
                  <p>
                    <b>No Excuse Challenge</b> là một{' '}
                    <b>chương trình thử thách do cộng đồng thúc đẩy</b>, không
                    phải đầu tư hoặc MLM.
                  </p>
                  <p>
                    Nó đại diện cho một phong trào toàn cầu của những người mơ
                    ước, hành động và tin tưởng đang nỗ lực đánh thức tiềm năng,
                    chia sẻ giá trị và thay đổi cuộc sống.
                  </p>
                  <p>
                    Tuyển dụng là <b>tùy chọn</b>, không bắt buộc.
                  </p>
                  <p>
                    Tuy nhiên, để mở khóa đầy đủ lợi ích và tiềm năng phát
                    triển, thành viên được khuyến khích nâng cấp lên trạng thái{' '}
                    <b>Thành viên Cao cấp</b>.
                  </p>
                  <br></br>
                  <p className="text-lg text-blue-800">Thừa nhận</p>
                  <p>
                    Bằng cách trở thành thành viên của{' '}
                    <b>No Excuse Challenge</b>, tôi xin thừa nhận rằng tôi đã
                    đọc, hiểu và đồng ý tuân thủ tất cả{' '}
                    <b>
                      Điều khoản & Điều kiện, Quy tắc & Quy định, và Hướng dẫn
                      Thành viên
                    </b>{' '}
                    được thiết lập bởi tổ chức. Tôi hiểu rằng sự tham gia là tự
                    nguyện.
                  </p>
                </>
              ) : (
                <>
                  {/* English Content */}
                  <p>
                    <b>Effective Date</b>: April 12, 2025
                  </p>
                  <br></br>
                  <p>
                    This <b>Member Acknowledgment & Agreement</b> ("Agreement")
                    establishes the terms and conditions under which individuals
                    ("Members") may participate in the{' '}
                    <b>No Excuse Challenge Program</b>, a program created and
                    operated by <b>Ameritec IPS (United States)</b> and{' '}
                    <b>America Technology (Vietnam)</b> (collectively referred
                    to as "the Organization").
                  </p>
                  <br></br>
                  <p>
                    This Agreement outlines the rights, obligations, and
                    responsibilities of both the Organization and its Members.
                    It defines the nature of participation, community
                    engagement, benefit mechanisms, and data protection
                    practices that govern the{' '}
                    <b>No Excuse Challenge Program.</b>
                  </p>
                  <br></br>
                  <p className="text-lg text-blue-800">Membership Overview</p>
                  <p>
                    To join the <b>No Excuse Challenge</b>, you must first
                    become a registered member.
                  </p>
                  <p>
                    Your membership fee is determined based on your country of
                    residence — a small step that opens the door to an
                    extraordinary journey of growth, innovation, and
                    opportunity.
                  </p>
                  <br></br>
                  <p className="text-lg text-blue-800">Membership Benefits</p>
                  <p>
                    As a member of the <b>No Excuse Challenge</b> community, you
                    will receive the following benefits:
                  </p>
                  <ul className="list-disc list-inside">
                    <li>
                      <b>Access to the No Excuse Challenge Platform</b> — where
                      transformation begins.
                    </li>
                    <li>
                      <b>Access to our Premium Walking App</b> — walk for your
                      health, earn for your growth.
                    </li>
                    <li>
                      <b>Access to the AmChain Blockchain</b> — built for speed,
                      security, and real-world use.
                    </li>
                    <li>
                      <b>Access to our Quantum Wallet</b> — a post-quantum
                      secure wallet built for the future.
                    </li>
                    <li>
                      <b>Ownership of 100 USDT worth of HEWE Coin</b> — your
                      Health & Wealth digital asset.
                    </li>
                    <li>
                      <b>
                        Eligibility to Upgrade and Maintain Premium Membership
                      </b>{' '}
                      — granting continued participation in the Challenge
                      Program, including community contributions, appreciation
                      rewards, and exclusive company bonuses.
                    </li>
                  </ul>
                  <br></br>
                  <p className="text-lg text-blue-800">
                    Premium Membership: Upgrade & Maintenance
                  </p>
                  <p>
                    <b>No additional fee</b> is required to upgrade to Premium
                    Membership.
                  </p>
                  <p>
                    To qualify as a <b>Premium Member</b>, you must:
                  </p>
                  <ul className="list-disc list-inside">
                    <li>
                      Introduce <b>two (2) new members</b> to join the
                      Challenge.
                    </li>
                    <li>
                      Maintain <b>two (2) active Premium Members</b> at all
                      times to remain eligible for benefits.
                    </li>
                  </ul>
                  <br></br>
                  <p className="text-lg text-blue-800">
                    No Excuse Challenge – Terms & Conditions
                  </p>
                  <p className="font-semibold">1. Acceptance of Terms</p>
                  <p>
                    By accessing or using the <b>No Excuse Challenge website</b>
                    (noexcuse.live), our services, technology products, or
                    management programs, you ("User" or "you") agree to be bound
                    by these Terms & Conditions.
                  </p>
                  <p>
                    If you do not agree to all of these Terms, please do not use
                    the Services.
                  </p>
                  <p className="font-semibold">2. Eligibility</p>
                  <p>
                    You must be at least the age of majority in your
                    jurisdiction to use the Services.
                  </p>
                  <p>
                    By using the Site, you represent and warrant that you have
                    the legal capacity to enter into a binding agreement and
                    that all information you provide is accurate and truthful.
                  </p>
                  <p className="font-semibold">3. Changes to Terms</p>
                  <p>
                    The Organization reserves the right, at its discretion, to
                    modify, update, or replace these Terms at any time.Any
                    changes take effect immediately upon posting. It is your
                    responsibility to review these Terms periodically for
                    updates.
                  </p>
                  <p>
                    Your continued use of the Services after changes are posted
                    constitutes your acceptance of the updated Terms.
                  </p>
                  <p className="font-semibold">4. Intellectual Property</p>
                  <p>
                    All content, logos, designs, text, graphics, images, and
                    other materials on the Site are the property of No Excuse
                    Challenge or its licensors and are protected by intellectual
                    property laws.You agree not to reproduce, distribute,
                    modify, create derivative works, or otherwise exploit any
                    content without express written permission.
                  </p>
                  <p className="font-semibold">5. User Conduct</p>
                  <p>
                    You agree not to use the Site or Services for any unlawful
                    purpose or in a manner that violates these Terms.
                  </p>
                  <p>Prohibited activities include, but are not limited to:</p>
                  <ul className="list-disc list-inside">
                    <li>
                      Impersonating any person or entity, or misrepresenting
                      your affiliation with any person or entity.
                    </li>
                    <li>
                      Posting or transmitting content that is unlawful, harmful,
                      threatening, defamatory, obscene, or otherwise
                      objectionable.
                    </li>
                    <li>
                      Attempting to gain unauthorized access to our systems or
                      other users' accounts.
                    </li>
                  </ul>
                  <p className="font-semibold">6. Third-Party Links</p>
                  <p>
                    The Site may contain links to third-party websites or
                    resources. No Excuse Challenge does not endorse and is not
                    responsible for the accuracy or content of these external
                    sites.Use of third-party websites is at your own risk and
                    subject to their respective terms and conditions.
                  </p>
                  <p className="font-semibold">7. Disclaimers</p>
                  <p>
                    The Services are provided on an "as is" and "as available"
                    basis, without warranties of any kind, express or implied.
                  </p>
                  <p>
                    No Excuse Challenge does not guarantee that the Services
                    will be secure, error-free, uninterrupted, or meet your
                    specific requirements.
                  </p>
                  <p className="font-semibold">8. Limitation of Liability</p>
                  <p>
                    To the fullest extent permitted by law, No Excuse Challenge,
                    its officers, directors, employees, agents, and affiliates
                    shall not be liable for any indirect, incidental, special,
                    consequential, or punitive damages arising from your use of
                    the Services.
                  </p>
                  <p className="font-semibold">9. Indemnification</p>
                  <p>
                    You agree to indemnify and hold harmless No Excuse
                    Challenge, its affiliates, officers, directors, employees,
                    and agents from any claims, liabilities, damages, losses, or
                    expenses arising from your use of the Services or violation
                    of these Terms.
                  </p>
                  <p className="font-semibold">10. Governing Law</p>
                  <p>
                    This Agreement shall be governed by and construed in
                    accordance with the laws of the United States, without
                    regard to conflict-of-law principles.Any disputes shall be
                    resolved exclusively in the courts of the United States, in
                    accordance with international law where applicable.
                  </p>
                  <p className="font-semibold">11. Termination</p>
                  <p>
                    We may, at our sole discretion, suspend or terminate your
                    access to the Services at any time, with or without notice,
                    for any reason, including violations of these Terms.
                  </p>
                  <p className="font-semibold">12. Severability</p>
                  <p>
                    If any provision of this Agreement is found invalid or
                    unenforceable, that provision shall be enforced to the
                    maximum extent permissible, and the remaining provisions
                    shall remain in full force and effect.
                  </p>
                  <p className="font-semibold">
                    13. Personal Data Processing & Transfer
                  </p>
                  <p>
                    "Personal data" refers to electronic information in the form
                    of symbols, letters, numbers, images, sounds, or equivalents
                    associated with an individual or used to identify an
                    individual.This includes both general and sensitive personal
                    data, as defined by applicable laws.By using the No Excuse
                    Challenge platform, you acknowledge and consent that your
                    personal data may be collected, stored, processed, and
                    transferred to relevant third parties for the purpose of
                    providing, maintaining, and improving the Services.Such data
                    may be transferred outside Vietnam, where our servers or
                    service providers are located.We comply with all applicable
                    data protection laws and require receiving parties to
                    implement appropriate security measures to protect your
                    data.
                  </p>
                  <p className="font-semibold">14. Entire Agreement</p>
                  <p>
                    This Agreement constitutes the entire understanding between
                    you and No Excuse Challenge and supersedes all prior
                    agreements.
                  </p>
                  <br></br>
                  <p className="text-lg text-blue-800">
                    No Excuse Challenge Rules & Regulations
                  </p>
                  <p>
                    <b>1. Platform Policy</b>
                  </p>
                  <ul className="list-disc list-inside">
                    <li>
                      We provide a platform for peer-to-peer contributions and
                      community-driven support.
                    </li>
                    <li>
                      All decisions are made independently by participants.
                    </li>
                    <li>
                      Ameritec IPS, a U.S. corporation, proudly operates this
                      platform under U.S. regulations.
                    </li>
                  </ul>
                  <p>
                    <b>2. General Terms</b>
                  </p>
                  <ul className="list-disc list-inside">
                    <li>
                      One ID per person. Duplicate or fake accounts are
                      prohibited.
                    </li>
                    <li>
                      Negative talk or defamation about the company, program, or
                      members is not allowed.
                    </li>
                    <li>
                      Manipulation, cheating, or system exploitation results in
                      immediate termination.
                    </li>
                    <li>
                      Recruiting No Excuse Challenge members into other programs
                      or MLMs is prohibited.
                    </li>
                    <li>Members must stay active to maintain benefits.</li>
                    <li>
                      Respect and integrity must be observed at all times.
                    </li>
                    <li>
                      Unauthorized transfers or account sales are forbidden.
                    </li>
                  </ul>
                  <p>
                    <b>3. Participation Requirements</b>
                  </p>
                  <ul className="list-disc list-inside">
                    <li>
                      Members must refer two (2) direct members within 30 days
                      of registration to qualify as Premium.
                    </li>
                    <li>
                      Premium Members must maintain two (2) active members at
                      all times.
                    </li>
                    <li>
                      Failure to comply may result in disqualification and loss
                      of community rewards.
                    </li>
                  </ul>
                  <p>
                    <b>4. Premium Eligibility</b>
                  </p>
                  <ul className="list-disc list-inside">
                    <li>
                      Members must maintain 62 active IDs (direct and indirect)
                      in Tier 1 to unlock Tier 2 and beyond.
                    </li>
                    <li>
                      Main accounts are eligible for promotions and rewards.
                    </li>
                    <li>
                      Sub-accounts are for system support only and do not
                      qualify for bonuses.
                    </li>
                  </ul>
                  <p>
                    <b>5. Legal Notes</b>
                  </p>
                  <ul className="list-disc list-inside">
                    <li>
                      <b>
                        No Excuse Challenge, DreamChain, Ameritec IPS, and
                        America Technology
                      </b>{' '}
                      are not financial advisors.
                    </li>
                    <li>
                      The program operates as a{' '}
                      <b>peer-to-peer contribution model</b>, not an investment.
                    </li>
                    <li>
                      Participation is voluntary; members are responsible for
                      their own financial and emotional well-being.
                    </li>
                    <li>
                      Organizers are not liable for any personal loss, injury,
                      or damage.
                    </li>
                  </ul>
                  <p>
                    <b>6. Registration & Integrity</b>
                  </p>
                  <ul className="list-disc list-inside">
                    <li>
                      Registration must be completed through official platforms.
                    </li>
                    <li>
                      All tasks and challenges must be completed with honesty.
                    </li>
                    <li>Members must be 18 years or older.</li>
                    <li>
                      Membership is open globally unless prohibited by law.
                    </li>
                  </ul>
                  <p>
                    <b>7. Compliance & Enforcement</b>
                  </p>
                  <p>
                    Non-compliance with these terms may result in immediate
                    disqualification.The organization reserves the right to take
                    necessary action to protect the integrity of the community.
                  </p>
                  <p>
                    <b>Core Principles: R.O.S.C.A.</b>
                  </p>
                  <br></br>
                  <ul className="list-disc list-inside">
                    <li>
                      <b>Rotate</b>: Move assets to keep the system alive.
                    </li>
                    <li>
                      <b>Offer</b>: Help others through contribution.
                    </li>
                    <li>
                      <b>Support</b>: Circulate wealth within the community.
                    </li>
                    <li>
                      <b>Contribute</b>: Actively play your role.
                    </li>
                    <li>
                      <b>Advance</b>: The more you give, the more the community
                      grows.
                    </li>
                  </ul>
                  <br></br>
                  <p className="text-lg text-blue-800">Important Notice</p>
                  <p>
                    The <b>No Excuse Challenge</b> is a{' '}
                    <b>community-driven challenge program</b>, not an investment
                    or MLM.
                  </p>
                  <p>
                    It represents a global movement of dreamers, doers, and
                    believers striving to awaken potential, share values, and
                    change lives.
                  </p>
                  <p>
                    Recruitment is <b>optional</b>, not required.
                  </p>
                  <p>
                    However, to unlock full benefits and growth potential,
                    members are encouraged to upgrade to <b>Premium Member</b>{' '}
                    status.
                  </p>
                  <br></br>
                  <p className="text-lg text-blue-800">Acknowledgment</p>
                  <p>
                    By becoming a member of <b>No Excuse Challenge</b>, I hereby
                    acknowledge that I have read, understood, and agree to abide
                    by all{' '}
                    <b>
                      Terms & Conditions, Rules & Regulations, and Membership
                      Guidelines
                    </b>{' '}
                    established by the organization.I understand that
                    participation is voluntary.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Footer with checkbox and buttons */}
          <div className="flex-shrink-0 p-6 border-t border-gray-200 bg-gray-50">
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
              {/* <button
                onClick={() => {
                  setShowTermsModal(false);
                  setTermsAccepted(false);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
              >
                {t('paymentTerms.cancel')}
              </button> */}
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
          // For tier 1, signature is REQUIRED - prevent closing
          // User must upload signature to proceed
          toast.warning(
            t(
              'Signature is required for Tier 1 payment. Please provide your signature.',
            ),
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
    </DefaultLayout>
  );
};

export default PaymentPage;
