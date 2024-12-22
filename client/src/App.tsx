import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import PageTitle from './components/PageTitle';
// import Calendar from './pages/Calendar';
// import Chart from './pages/Chart';
// import FormElements from './pages/Form/FormElements';
// import FormLayout from './pages/Form/FormLayout';
// import Profile from './pages/Profile';
// import Settings from './pages/Settings';
// import Tables from './pages/Tables';
// import Alerts from './pages/UiElements/Alerts';
// import Buttons from './pages/UiElements/Buttons';
import HomePage from './pages/Homepage';
import Mechanism from './pages/Mechanism';
import PolicyPage from './pages/Policy';
import ContactPage from './pages/Contact';
import { PrivateRoute, PublicRoute } from './helpers/router';
import SignInPage from './pages/SignIn';
import Profile from './pages/User/Profile';
import DashboardPage from './pages/Admin/Dashboard';
import SignUpPage from './pages/SignUp';
import ConfirmPage from './pages/ConfirmPage';
import Payment from './pages/User/Payment';
import ReferralPage from './pages/User/Referral';
import Transactions from './pages/User/Transactions';
import NotFoundPage from './pages/NotFound';
import ServicePage from './pages/Service';
import SettingWallets from './pages/Admin/SettingWallets';
import AdminTransactionsPage from './pages/Admin/Transactions';
import SystemPage from './pages/User/System';

function App() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route
          path="/home"
          element={
            <>
              <PageTitle title="Homepage | DreamChain" />
              <HomePage />
            </>
          }
        />
        <Route
          path="/services"
          element={
            <>
              <PageTitle title="Services | DreamChain" />
              <ServicePage />
            </>
          }
        />
        <Route
          path="/mechanism"
          element={
            <>
              <PageTitle title="Mechanism | DreamChain" />
              <Mechanism />
            </>
          }
        />
        <Route
          path="/policy"
          element={
            <>
              <PageTitle title="Policy | DreamChain" />
              <PolicyPage />
            </>
          }
        />
        <Route
          path="/contact"
          element={
            <>
              <PageTitle title="Contact | DreamChain" />
              <ContactPage />
            </>
          }
        />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/confirm" element={<ConfirmPage />} />
      </Route>
      <Route element={<PrivateRoute />}>
        <Route
          path="/admin/dashboard"
          element={
            <>
              <PageTitle title="Dashboard | DreamChain" />
              <DashboardPage />
            </>
          }
        />
        <Route
          path="/admin/transactions"
          element={
            <>
              <PageTitle title="Transactions | DreamChain" />
              <AdminTransactionsPage />
            </>
          }
        />
        <Route
          path="/admin/wallets"
          element={
            <>
              <PageTitle title="Setting Wallets | DreamChain" />
              <SettingWallets />
            </>
          }
        />
      </Route>
      <Route element={<PrivateRoute />}>
        <Route
          path="/user/profile"
          element={
            <>
              <PageTitle title="Profile | DreamChain" />
              <Profile />
            </>
          }
        />
        <Route
          path="/user/payment"
          element={
            <>
              <PageTitle title="Payment | DreamChain" />
              <Payment />
            </>
          }
        />
        <Route
          path="/user/system"
          element={
            <>
              <PageTitle title="System | DreamChain" />
              <SystemPage />
            </>
          }
        />
        <Route
          path="/user/referral"
          element={
            <>
              <PageTitle title="Referral | DreamChain" />
              <ReferralPage />
            </>
          }
        />
        <Route
          path="/user/transactions"
          element={
            <>
              <PageTitle title="Transactions | DreamChain" />
              <Transactions />
            </>
          }
        />
      </Route>
      <Route path="*" element={<NotFoundPage />}></Route>
      {/* <Route
          path="/calendar"
          element={
            <>
              <PageTitle title="Calendar | DreamChain" />
              <Calendar />
            </>
          }
        />
        
        <Route
          path="/forms/form-elements"
          element={
            <>
              <PageTitle title="Form Elements | DreamChain" />
              <FormElements />
            </>
          }
        />
        <Route
          path="/forms/form-layout"
          element={
            <>
              <PageTitle title="Form Layout | DreamChain" />
              <FormLayout />
            </>
          }
        />
        <Route
          path="/tables"
          element={
            <>
              <PageTitle title="Tables | DreamChain" />
              <Tables />
            </>
          }
        />
        <Route
          path="/settings"
          element={
            <>
              <PageTitle title="Settings | DreamChain" />
              <Settings />
            </>
          }
        />
        <Route
          path="/chart"
          element={
            <>
              <PageTitle title="Basic Chart | DreamChain" />
              <Chart />
            </>
          }
        />
        <Route
          path="/ui/alerts"
          element={
            <>
              <PageTitle title="Alerts | DreamChain" />
              <Alerts />
            </>
          }
        />
        <Route
          path="/ui/buttons"
          element={
            <>
              <PageTitle title="Buttons | DreamChain" />
              <Buttons />
            </>
          }
        />
        <Route
          path="/auth/signin"
          element={
            <>
              <PageTitle title="Signin | DreamChain" />
              <SignIn />
            </>
          }
        /> */}
    </Routes>
  );
}

export default App;
