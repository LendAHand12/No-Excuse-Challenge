import { useSelector } from 'react-redux';
import ChoosePackagePage from './choosePackage';
import PaymentPage from './payment';
import PaymentNextTierPage from './paymentNextTier';

const Payment = () => {
  const { userInfo } = useSelector((state) => state.auth);
  let { countPay, buyPackage } = userInfo;

  if (countPay === 0 && buyPackage === '') {
    return <ChoosePackagePage />;
  } else if (countPay === 0) {
    return <PaymentPage />;
  } else {
    return  <PaymentNextTierPage />
  }
};

export default Payment;
