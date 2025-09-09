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
import IceBreakerPage from './pages/User/IceBreaker';
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
import AdminExportClaimsPage from './pages/Admin/Export/ExportClaims';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import PermissionsPage from './pages/Admin/Permissions';
import PermissionsDetailsPage from './pages/Admin/Permissions/Details';
import PermissionsCreatePage from './pages/Admin/Permissions/Create';
import AdminPage from './pages/Admin/Admin';
import AdminDetailPage from './pages/Admin/Admin/Detail';
import AdminCreatePage from './pages/Admin/Admin/Create';
import IncomePage from './pages/User/Income';
import ExportUsersPage from './pages/Admin/Export/ExportUsers';
import ExportPaymentsPage from './pages/Admin/Export/ExportPayments';
import CreateUserPage from './pages/Admin/CreateUser';
import ExportWithdrawPage from './pages/Admin/Export/ExportWithdraw';
import WithdrawsPage from './pages/User/Withdraws';
import ExportDreampoolPage from './pages/Admin/Export/ExportDreampool';
import AdminCronjobPage from './pages/Admin/Cronjob';
import RulesPage from './pages/Rules';
import { useSelector } from 'react-redux';
import ClaimsPage from './pages/User/Claims';
import RegisterKYCPage from './pages/User/RegisterKYC';
import ClaimKYCPage from './pages/User/ClaimKYC';
import MoveSystemPage from './pages/User/MoveSystemKYC';
import AdminDoubleKycPage from './pages/Admin/DoubleKyc';
import AdminConfigPage from './pages/Admin/Config';
import UserHistoryPage from './pages/Admin/UserHistory';
import UserUpdateInfoKYCPage from './pages/User/UpdateInfoKYC';
import UsersTier2 from './pages/User/UsersTier2';
import MoveSystem from './pages/Admin/MoveSystem';
import MoveSystemList from './pages/Admin/MoveSystemList';
import SwapPage from './pages/User/SwapPage';
import SubProfilePage from './pages/User/SubProfile';
import DormantUsersPage from './pages/Admin/DormantUsers';
import UsersEligiblePreTier2Page from './pages/Admin/UsersEligiblePreTier2';
import UsersPreTier2Page from './pages/Admin/UsersPreTier2';
import UsersPreTier2 from './pages/User/UsersPreTier2';
import PreTier2PaymentPage from './pages/User/PaymentPreTier2';
import PaymentTier2WithPrePool from './pages/User/PaymentTier2WithPrePool';
import AdminPreTier2PoolPage from './pages/Admin/PreTier2Pool';
import PreTier2Pool from './pages/User/PreTier2Pool';

function App() {
  const { pathname } = useLocation();
  const { userInfo } = useSelector((state) => state.auth);

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
              <PageTitle title="Homepage | NoExcuseChallenge" />
              <HomePage />
            </>
          }
        />
        <Route
          path="/services"
          element={
            <>
              <PageTitle title="Services | NoExcuseChallenge" />
              <ServicePage />
            </>
          }
        />
        <Route
          path="/mechanism"
          element={
            <>
              <PageTitle title="Mechanism | NoExcuseChallenge" />
              <Mechanism />
            </>
          }
        />
        <Route
          path="/policy"
          element={
            <>
              <PageTitle title="Policy | NoExcuseChallenge" />
              <PolicyPage />
            </>
          }
        />
        <Route
          path="/contact"
          element={
            <>
              <PageTitle title="Contact | NoExcuseChallenge" />
              <ContactPage />
            </>
          }
        />
        <Route
          path="/news"
          element={
            <>
              <PageTitle title="News | NoExcuseChallenge" />
              <NewsPage />
            </>
          }
        />
        <Route
          path="/rules"
          element={
            <>
              <PageTitle title="Rules | NoExcuseChallenge" />
              <RulesPage />
            </>
          }
        />
        <Route
          path="/news/:id"
          element={
            <>
              <PageTitle title="News | NoExcuseChallenge" />
              <NewsDetailPage />
            </>
          }
        />
        <Route
          path="/terms"
          element={
            <>
              <PageTitle title="Terms & Conditions | NoExcuseChallenge" />
              <TermsPage />
            </>
          }
        />
        <Route
          path="/guide"
          element={
            <>
              <PageTitle title="Member’s Guidelines | NoExcuseChallenge" />
              <GuidePage />
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
              <PageTitle title="Dashboard | NoExcuseChallenge" />
              <DashboardPage />
            </>
          }
        />
        {userInfo?.permissions
          ?.find((p) => p.page.path === '/admin/transactions')
          ?.actions.includes('read') && (
          <Route
            path="/admin/transactions"
            element={
              <>
                <PageTitle title="Transactions | NoExcuseChallenge" />
                <AdminTransactionsPage />
              </>
            }
          />
        )}

        {userInfo?.permissions
          ?.find((p) => p.page.path === '/admin/eligible-pre-tier-2')
          ?.actions.includes('read') && (
          <Route
            path="/admin/eligible-pre-tier-2"
            element={
              <>
                <PageTitle title="Users Eligible Pre-Tier 2 | NoExcuseChallenge" />
                <UsersEligiblePreTier2Page />
              </>
            }
          />
        )}

        {userInfo?.permissions
          ?.find((p) => p.page.path === '/admin/pre-tier-2-users')
          ?.actions.includes('read') && (
          <Route
            path="/admin/pre-tier-2-users"
            element={
              <>
                <PageTitle title="Users Pre-Tier 2 | NoExcuseChallenge" />
                <UsersPreTier2Page />
              </>
            }
          />
        )}

        {userInfo?.permissions
          ?.find((p) => p.page.path === '/admin/pre-tier-2-pool')
          ?.actions.includes('read') && (
          <Route
            path="/admin/pre-tier-2-pool"
            element={
              <>
                <PageTitle title="Pre-Tier 2 Pool | NoExcuseChallenge" />
                <AdminPreTier2PoolPage />
              </>
            }
          />
        )}

        {userInfo?.permissions
          ?.find((p) => p.page.path === '/admin/move-system-list')
          ?.actions.includes('read') && (
          <Route
            path="/admin/move-system-list"
            element={
              <>
                <PageTitle title="Move System List | NoExcuseChallenge" />
                <MoveSystemList />
              </>
            }
          />
        )}

        {userInfo?.permissions
          ?.find((p) => p.page.path === '/admin/users/:id')
          ?.actions.includes('read') && (
          <Route
            path="/admin/users/:id"
            element={
              <>
                <PageTitle title="User Profile | NoExcuseChallenge" />
                <AdminUserProfile />
              </>
            }
          />
        )}

        {userInfo?.permissions
          ?.find((p) => p.page.path === '/admin/move-system/:id')
          ?.actions.includes('read') && (
          <Route
            path="/admin/move-system/:id"
            element={
              <>
                <PageTitle title="Move System | NoExcuseChallenge" />
                <MoveSystem />
              </>
            }
          />
        )}

        {userInfo?.permissions
          ?.find((p) => p.page.path === '/admin/transactions')
          ?.actions.includes('export') && (
          <Route
            path="/admin/transaction/export"
            element={
              <>
                <PageTitle title="Admin Export Transaction | NoExcuseChallenge" />
                <ExportPaymentsPage />
              </>
            }
          />
        )}

        {userInfo?.permissions
          ?.find((p) => p.page.path === '/admin/transactions/:id')
          ?.actions.includes('read') && (
          <Route
            path="/admin/transactions/:id"
            element={
              <>
                <PageTitle title="Transaction Detail | NoExcuseChallenge" />
                <AdminTransactionDetail />
              </>
            }
          />
        )}
        {userInfo?.permissions
          ?.find((p) => p.page.path === '/admin/wallets')
          ?.actions.includes('read') && (
          <Route
            path="/admin/wallets"
            element={
              <>
                <PageTitle title="Setting Wallets | NoExcuseChallenge" />
                <SettingWallets />
              </>
            }
          />
        )}
        {userInfo?.permissions
          ?.find((p) => p.page.path === '/admin/users')
          ?.actions.includes('read') && (
          <Route
            path="/admin/users"
            element={
              <>
                <PageTitle title="Users | NoExcuseChallenge" />
                <AdminUserPages />
              </>
            }
          />
        )}

        {userInfo?.permissions
          ?.find((p) => p.page.path === '/admin/system/:id')
          ?.actions.includes('read') && (
          <Route
            path="/admin/system/:id"
            element={
              <>
                <PageTitle title="System | NoExcuseChallenge" />
                <AdminSystemPage />
              </>
            }
          />
        )}
        {userInfo?.permissions
          ?.find((p) => p.page.path === '/admin/linkVerify')
          ?.actions.includes('read') && (
          <Route
            path="/admin/linkVerify"
            element={
              <>
                <PageTitle title="Link verify | NoExcuseChallenge" />
                <GetVerifyLinkPage />
              </>
            }
          />
        )}
        {userInfo?.permissions
          ?.find((p) => p.page.path === '/admin/withdraw')
          ?.actions.includes('read') && (
          <Route
            path="/admin/withdraw"
            element={
              <>
                <PageTitle title="Withdraw request | NoExcuseChallenge" />
                <AdminWithdrawPages />
              </>
            }
          />
        )}
        {userInfo?.permissions
          ?.find((p) => p.page.path === '/admin/withdraw')
          ?.actions.includes('export') && (
          <Route
            path="/admin/withdraw/export"
            element={
              <>
                <PageTitle title="Admin Export Withdraw | NoExcuseChallenge" />
                <ExportWithdrawPage />
              </>
            }
          />
        )}
        {userInfo?.permissions
          ?.find((p) => p.page.path === '/admin/news')
          ?.actions.includes('read') && (
          <Route
            path="/admin/news"
            element={
              <>
                <PageTitle title="News | NoExcuseChallenge" />
                <AdminNewsPage />
              </>
            }
          />
        )}
        {userInfo?.permissions
          ?.find((p) => p.page.path === '/admin/claims')
          ?.actions.includes('read') && (
          <Route
            path="/admin/claims"
            element={
              <>
                <PageTitle title="Claims | NoExcuseChallenge" />
                <AdminClaimsPage />
              </>
            }
          />
        )}
        {userInfo?.permissions
          ?.find((p) => p.page.path === '/admin/claims')
          ?.actions.includes('export') && (
          <Route
            path="/admin/claims/export"
            element={
              <>
                <PageTitle title="Export Claims | NoExcuseChallenge" />
                <AdminExportClaimsPage />
              </>
            }
          />
        )}
        {userInfo?.permissions
          ?.find((p) => p.page.path === '/admin/news/create')
          ?.actions.includes('read') && (
          <Route
            path="/admin/news/create"
            element={
              <>
                <PageTitle title="Create News | NoExcuseChallenge" />
                <AdminCreateNewsPage />
              </>
            }
          />
        )}

        {userInfo?.permissions
          ?.find((p) => p.page.path === '/admin/news/edit')
          ?.actions.includes('read') && (
          <Route
            path="/admin/news/edit"
            element={
              <>
                <PageTitle title="Edit News | NoExcuseChallenge" />
                <AdminEditNewsPage />
              </>
            }
          />
        )}

        {userInfo?.permissions
          ?.find((p) => p.page.path === '/admin/dreampool')
          ?.actions.includes('read') && (
          <Route
            path="/admin/dreampool"
            element={
              <>
                <PageTitle title="DreamPool | NoExcuseChallenge" />
                <DreamPoolPage />
              </>
            }
          />
        )}
        {userInfo?.permissions
          ?.find((p) => p.page.path === '/admin/dreampool')
          ?.actions.includes('export') && (
          <Route
            path="/admin/dreampool/export"
            element={
              <>
                <PageTitle title="Export DreamPool | NoExcuseChallenge" />
                <ExportDreampoolPage />
              </>
            }
          />
        )}
        {userInfo?.permissions
          ?.find((p) => p.page.path === '/admin/permissions')
          ?.actions.includes('read') && (
          <Route
            path="/admin/permissions"
            element={
              <>
                <PageTitle title="Permissions | NoExcuseChallenge" />
                <PermissionsPage />
              </>
            }
          />
        )}
        {userInfo?.permissions
          ?.find((p) => p.page.path === '/admin/permissions/:id')
          ?.actions.includes('read') && (
          <Route
            path="/admin/permissions/:id"
            element={
              <>
                <PageTitle title="Permissions Details | NoExcuseChallenge" />
                <PermissionsDetailsPage />
              </>
            }
          />
        )}
        {userInfo?.permissions
          ?.find((p) => p.page.path === '/admin/permissions/create')
          ?.actions.includes('read') && (
          <Route
            path="/admin/permissions/create"
            element={
              <>
                <PageTitle title="Create New Permissions | NoExcuseChallenge" />
                <PermissionsCreatePage />
              </>
            }
          />
        )}
        {userInfo?.permissions
          ?.find((p) => p.page.path === '/admin/admin')
          ?.actions.includes('read') && (
          <Route
            path="/admin/admin"
            element={
              <>
                <PageTitle title="Admin | NoExcuseChallenge" />
                <AdminPage />
              </>
            }
          />
        )}
        {userInfo?.permissions
          ?.find((p) => p.page.path === '/admin/create-admin')
          ?.actions.includes('read') && (
          <Route
            path="/admin/create-admin"
            element={
              <>
                <PageTitle title="Create new Admin | NoExcuseChallenge" />
                <AdminCreatePage />
              </>
            }
          />
        )}
        {userInfo?.permissions
          ?.find((p) => p.page.path === '/admin/admin/:id')
          ?.actions.includes('read') && (
          <Route
            path="/admin/admin/:id"
            element={
              <>
                <PageTitle title="Admin Detail | NoExcuseChallenge" />
                <AdminDetailPage />
              </>
            }
          />
        )}
        {userInfo?.permissions
          ?.find((p) => p.page.path === '/admin/users')
          ?.actions.includes('export') && (
          <Route
            path="/admin/user/export"
            element={
              <>
                <PageTitle title="Admin Export User | NoExcuseChallenge" />
                <ExportUsersPage />
              </>
            }
          />
        )}
        {userInfo?.permissions
          ?.find((p) => p.page.path === '/admin/users')
          ?.actions.includes('create') && (
          <Route
            path="/admin/users/create"
            element={
              <>
                <PageTitle title="Admin Create User | NoExcuseChallenge" />
                <CreateUserPage />
              </>
            }
          />
        )}
        {userInfo?.permissions
          ?.find((p) => p.page.path === '/admin/cronjob')
          ?.actions.includes('read') && (
          <Route
            path="/admin/cronjob"
            element={
              <>
                <PageTitle title="Cronjob | NoExcuseChallenge" />
                <AdminCronjobPage />
              </>
            }
          />
        )}
        {userInfo?.permissions
          ?.find((p) => p.page.path === '/admin/double-kyc')
          ?.actions.includes('read') && (
          <Route
            path="/admin/double-kyc"
            element={
              <>
                <PageTitle title="Double KYC | NoExcuseChallenge" />
                <AdminDoubleKycPage />
              </>
            }
          />
        )}
        {userInfo?.permissions
          ?.find((p) => p.page.path === '/admin/config')
          ?.actions.includes('read') && (
          <Route
            path="/admin/config"
            element={
              <>
                <PageTitle title="Config | NoExcuseChallenge" />
                <AdminConfigPage />
              </>
            }
          />
        )}
        {userInfo?.permissions
          ?.find((p) => p.page.path === '/admin/user-history')
          ?.actions.includes('read') && (
          <Route
            path="/admin/user-history"
            element={
              <>
                <PageTitle title="User History | NoExcuseChallenge" />
                <UserHistoryPage />
              </>
            }
          />
        )}

        {userInfo?.permissions
          ?.find((p) => p.page.path === '/admin/user/tier2')
          ?.actions.includes('read') && (
          <Route
            path="/admin/user/tier2"
            element={
              <>
                <PageTitle title="Users Tier2 | NoExcuseChallenge" />
                <UsersTier2 />
              </>
            }
          />
        )}

        {userInfo?.permissions
          ?.find((p) => p.page.path === '/admin/user/dormant')
          ?.actions.includes('read') && (
          <Route
            path="/admin/user/dormant"
            element={
              <>
                <PageTitle title="Dormant Users | NoExcuseChallenge" />
                <DormantUsersPage />
              </>
            }
          />
        )}
      </Route>
      <Route element={<PrivateRoute />}>
        <Route
          path="/user/profile"
          element={
            <>
              <PageTitle title="Profile | NoExcuseChallenge" />
              <Profile />
            </>
          }
        />
        {userInfo?.errLahCode !== 'OVER45' && (
          <>
            <Route
              path="/user/payment"
              element={
                <>
                  <PageTitle title="Payment | NoExcuseChallenge" />
                  <Payment />
                </>
              }
            />
            {/* {(userInfo?.preTier2Status === 'APPROVED' ||
              userInfo?.preTier2Status === 'ACHIEVED') && (
              <Route
                path="/user/payment-pre-tier-2"
                element={
                  <>
                    <PageTitle title="Payment Pre-Tier 2 | NoExcuseChallenge" />
                    <PreTier2PaymentPage />
                  </>
                }
              />
            )}

            {userInfo?.preTier2Status === 'PASSED' && (
              <Route
                path="/user/payment-for-tier-with-pre-tier-2-pool"
                element={
                  <>
                    <PageTitle title="Payment Tier 2 With Pre-Tier2 Pool | NoExcuseChallenge" />
                    <PaymentTier2WithPrePool />
                  </>
                }
              />
            )}

            <Route
              path="/user/pre-tier-2-users"
              element={
                <>
                  <PageTitle title="Users Pre-Tier 2 | NoExcuseChallenge" />
                  <UsersPreTier2 />
                </>
              }
            />

            <Route
              path="/user/pre-tier-2-pool"
              element={
                <>
                  <PageTitle title="Pre-Tier 2 Pool | NoExcuseChallenge" />
                  <PreTier2Pool />
                </>
              }
            /> */}

            <Route
              path="/user/system"
              element={
                <>
                  <PageTitle title="System | NoExcuseChallenge" />
                  <SystemPage />
                </>
              }
            />
            <Route
              path="/user/referral"
              element={
                <>
                  <PageTitle title="Referral | NoExcuseChallenge" />
                  <ReferralPage />
                </>
              }
            />
            <Route
              path="/user/transactions"
              element={
                <>
                  <PageTitle title="Transactions | NoExcuseChallenge" />
                  <Transactions />
                </>
              }
            />
            <Route
              path="/user/ice-breakers"
              element={
                <>
                  <PageTitle title="Ice Breakers | NoExcuseChallenge" />
                  <IceBreakerPage />
                </>
              }
            />
            <Route
              path="/user/dreampool"
              element={
                <>
                  <PageTitle title="DreamPool | NoExcuseChallenge" />
                  <DreamPoolPage />
                </>
              }
            />
            <Route
              path="/user/income"
              element={
                <>
                  <PageTitle title="Income | NoExcuseChallenge" />
                  <IncomePage />
                </>
              }
            />
            <Route
              path="/user/withdraws"
              element={
                <>
                  <PageTitle title="Withdraws | NoExcuseChallenge" />
                  <WithdrawsPage />
                </>
              }
            />
            <Route
              path="/user/claims"
              element={
                <>
                  <PageTitle title="Claims | NoExcuseChallenge" />
                  <ClaimsPage />
                </>
              }
            />
            <Route
              path="/user/kyc"
              element={
                <>
                  <PageTitle title="Register KYC | NoExcuseChallenge" />
                  <RegisterKYCPage />
                </>
              }
            />
            <Route
              path="/user/update-info"
              element={
                <>
                  <PageTitle title="Update Info | NoExcuseChallenge" />
                  <UserUpdateInfoKYCPage />
                </>
              }
            />
            {userInfo?.tier > 1 && (
              <Route
                path="/user/tier2"
                element={
                  <>
                    <PageTitle title="Users Tier 2 | NoExcuseChallenge" />
                    <UsersTier2 />
                  </>
                }
              />
            )}
            <Route
              path="/user/move-system"
              element={
                <>
                  <PageTitle title="Move System KYC | NoExcuseChallenge" />
                  <MoveSystemPage />
                </>
              }
            />
            <Route
              path="/user/swap"
              element={
                <>
                  <PageTitle title="Swap Page | NoExcuseChallenge" />
                  <SwapPage />
                </>
              }
            />
            {userInfo?.tier > 1 && (
              <Route
                path="/user/sub/:id"
                element={
                  <>
                    <PageTitle title="Sub User Tier 1 | NoExcuseChallenge" />
                    <SubProfilePage />
                  </>
                }
              />
            )}
          </>
        )}
      </Route>
      <Route
        path="/user/claim"
        element={
          <>
            <PageTitle title="Claim KYC | NoExcuseChallenge" />
            <ClaimKYCPage />
          </>
        }
      />
      <Route path="*" element={<NotFoundPage />}></Route>
    </Routes>
  );
}

export default App;
