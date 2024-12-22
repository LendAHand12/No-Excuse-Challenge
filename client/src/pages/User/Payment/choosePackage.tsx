import { useDispatch, useSelector } from 'react-redux';
import DefaultLayout from '@/layout/DefaultLayout';
import { useTranslation } from 'react-i18next';
import User from '@/api/User';
import { toast, ToastContainer } from 'react-toastify';
import { useState } from 'react';
import { UPDATE_USER_INFO } from '@/slices/auth';

const ChoosePackagePage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const { userInfo } = useSelector((state) => state.auth);
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
  } = userInfo;

  const handleChoosePaymentMethod = async (buyPackage) => {
    await User.update(id, {
      buyPackage,
    })
      .then((response) => {
        toast.success(t(response.data.message));
        dispatch(UPDATE_USER_INFO(response.data.data));
      })
      .catch((error) => {
        let message =
          error.response && error.response.data.error
            ? error.response.data.error
            : error.message;
        toast.error(t(message));
        setLoading(false);
      });
  };

  return (
    <DefaultLayout>
      <ToastContainer />
      <div className="px-10 lg:px-24 py-24">
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-10">
          <div className="border-2 w-full shadow-lg rounded-2xl max-w-[350px]">
            <div className="bg-black rounded-2xl pt-1 pb-4 px-4 space-y-2">
              <div className="flex justify-end">
                <div className="bg-[#F4E096] text-sm text-black rounded-xl p-2">
                  Feature Package
                </div>
              </div>
              <div className="flex gap-4 text-dreamchain">
                <p>USDT</p>
                <p>1000</p>
              </div>
              <div className="flex gap-4 text-dreamchain">
                <p>Level</p>
                <p>9</p>
              </div>
            </div>
            <button
              onClick={() => handleChoosePaymentMethod('A')}
              className="w-full mt-2 text-3xl font-bold text-center py-2"
            >
              Package A
            </button>
          </div>
          {/* <div className="border-2 shadow-lg rounded-2xl w-full max-w-[350px]">
            <div className="bg-black rounded-2xl pt-1 pb-4 px-4 space-y-2">
              <div className="flex justify-end">
                <div className="bg-[#F4E096] text-sm text-black rounded-xl p-2">
                  Feature Package
                </div>
              </div>
              <div className="flex gap-4 text-dreamchain">
                <p>USDT</p>
                <p>1000</p>
              </div>
              <div className="flex gap-4 text-dreamchain">
                <p>Level</p>
                <p>9</p>
              </div>
            </div>
            <button
              onClick={() => handleChoosePaymentMethod('B')}
              className="w-full mt-2 text-3xl font-bold text-center py-2"
            >
              Package B
            </button>
          </div> */}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default ChoosePackagePage;
