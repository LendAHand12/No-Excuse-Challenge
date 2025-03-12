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
import TermsPage from './pages/Terms';
import GuidePage from './pages/Guide';
import DreamPoolPage from './pages/User/DreamPool';
import AdminUserPages from './pages/Admin/Users';
import AdminSystemPage from './pages/Admin/System';
import GetVerifyLinkPage from './pages/Admin/GetVerifyLink';
import AdminTransactionDetail from './pages/Admin/TransactionDetail';
import AdminWithdrawPages from './pages/Admin/Withdraw';
import AdminUserProfile from './pages/Admin/UserProfile';
import NewsPage from './pages/News';
import AdminNewsPage from './pages/Admin/News';
import AdminCreateNewsPage from './pages/Admin/News/Create';
import AdminEditNewsPage from './pages/Admin/News/Edit';
import NewsDetailPage from './pages/News/Detail';
import AdminClaimsPage from './pages/Admin/Claims';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

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
        <Route
          path="/terms"
          element={
            <>
              <PageTitle title="Terms & Conditions | DreamChain" />
              <TermsPage />
            </>
          }
        />
        <Route
          path="/guide"
          element={
            <>
              <PageTitle title="Member’s Guidelines | DreamChain" />
              <GuidePage />
            </>
          }
        />
        <Route
          path="/news"
          element={
            <>
              <PageTitle title="News | DreamChain" />
              <NewsPage />
            </>
          }
        />
        <Route
          path="/news/:id"
          element={
            <>
              <PageTitle title="News | DreamChain" />
              <NewsDetailPage />
            </>
          }
        />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/confirm" element={<ConfirmPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
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
          path="/admin/users/:id"
          element={
            <>
              <PageTitle title="User Profile | DreamChain" />
              <AdminUserProfile />
            </>
          }
        />
        <Route
          path="/admin/transactions/:id"
          element={
            <>
              <PageTitle title="Transaction Detail | DreamChain" />
              <AdminTransactionDetail />
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
        <Route
          path="/admin/users"
          element={
            <>
              <PageTitle title="Users | DreamChain" />
              <AdminUserPages />
            </>
          }
        />
        <Route
          path="/admin/system/:id"
          element={
            <>
              <PageTitle title="System | DreamChain" />
              <AdminSystemPage />
            </>
          }
        />
        <Route
          path="/admin/linkVerify"
          element={
            <>
              <PageTitle title="Link verify | DreamChain" />
              <GetVerifyLinkPage />
            </>
          }
        />
        <Route
          path="/admin/withdraw"
          element={
            <>
              <PageTitle title="Withdraw request | DreamChain" />
              <AdminWithdrawPages />
            </>
          }
        />
        <Route
          path="/admin/news"
          element={
            <>
              <PageTitle title="News | DreamChain" />
              <AdminNewsPage />
            </>
          }
        />
        <Route
          path="/admin/claims"
          element={
            <>
              <PageTitle title="Claims | DreamChain" />
              <AdminClaimsPage />
            </>
          }
        />
        <Route
          path="/admin/news/create"
          element={
            <>
              <PageTitle title="Create News | DreamChain" />
              <AdminCreateNewsPage />
            </>
          }
        />
        <Route
          path="/admin/news/edit"
          element={
            <>
              <PageTitle title="Edit News | DreamChain" />
              <AdminEditNewsPage />
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
        <Route
          path="/user/dreampool"
          element={
            <>
              <PageTitle title="DreamPool | DreamChain" />
              <DreamPoolPage />
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
