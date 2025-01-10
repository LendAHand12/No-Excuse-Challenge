import { useSelector } from 'react-redux';
import ChoosePackagePage from './choosePackage';
import PaymentPage from './payment';

const Payment = () => {
  const { userInfo } = useSelector((state) => state.auth);
  let { countPay, buyPackage } = userInfo;

  if (countPay === 0 && buyPackage === '') {
    return <ChoosePackagePage />;
  } else {
    return <PaymentPage />;
  }
};

export default Payment;
