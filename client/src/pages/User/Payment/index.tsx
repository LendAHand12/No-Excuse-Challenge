import { useDispatch, useSelector } from 'react-redux';
import ChoosePackagePage from './choosePackage';
import PaymentPage from './payment';
import User from '@/api/User';
import PaymentNextTierPage from './paymentNextTier';
import { useEffect } from 'react';
import { UPDATE_USER_INFO } from '@/slices/auth';
import { ToastContainer, toast } from 'react-toastify';

const Payment = () => {
  const { userInfo } = useSelector((state) => state.auth);
  let { countPay, buyPackage } = userInfo;
  const dispatch = useDispatch()

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
    }, []);

  if (countPay === 0 && buyPackage === '') {
    return <ChoosePackagePage />;
  } else if (countPay === 0) {
    return <PaymentPage />;
  } else {
    return  <PaymentNextTierPage />
  }
};

export default Payment;
