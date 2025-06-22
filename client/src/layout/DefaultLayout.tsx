import React, { useState, ReactNode } from 'react';
import Header from '../components/Header/index';
import Sidebar from '../components/Sidebar/index';
import { useDispatch, useSelector } from 'react-redux';
import AdminRoutes from '@/routes/admin';
import UserRoutes from '@/routes/user';
import PublicRoutes from '@/routes/public';
import { useDisconnect } from 'wagmi';
import { LOGOUT } from '../slices/auth';

const DefaultLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { userInfo } = useSelector((state) => state.auth);
  var routes = PublicRoutes;
  const { disconnect } = useDisconnect();
  const dispatch = useDispatch();

  const handleLogout = () => {
    disconnect();
    dispatch(LOGOUT());
  };

  if (userInfo) {
    try {
      const { permissions } = userInfo;
      if (userInfo.role !== 'user') {
        routes = AdminRoutes.filter((route) => {
          let currentRoute = `${route.link}`;
          let page = permissions.find((ele) => ele.page?.path === currentRoute);
          if (page && page.actions.includes('read')) {
            return route;
          }
        });
      } else {
        routes =
          userInfo.errLahCode === 'OVER45'
            ? UserRoutes.filter((route) => route.link === '/user/profile')
            : userInfo.tier === 1
            ? UserRoutes.filter((route) => route.link !== '/user/tier2')
            : UserRoutes;
      }
    } catch (err) {
      // handleLogout();
    }
  }

  return (
    <div className="">
      {/* <!-- ===== Page Wrapper Start ===== --> */}
      <div className="flex h-screen overflow-hidden">
        {/* <!-- ===== Sidebar Start ===== --> */}
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          routes={routes}
        />
        {/* <!-- ===== Sidebar End ===== --> */}

        {/* <!-- ===== Content Area Start ===== --> */}
        <div className="no-scrollbar relative bg-white flex flex-1 flex-col overflow-x-hidden lg:rounded-s-[40px] lg:-ml-10">
          {/* <!-- ===== Header Start ===== --> */}
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          {/* <!-- ===== Header End ===== --> */}

          {/* <!-- ===== Main Content Start ===== --> */}
          <main className="w-full h-full">{children}</main>
          {/* <!-- ===== Main Content End ===== --> */}
        </div>
        {/* <!-- ===== Content Area End ===== --> */}
      </div>
      <div className="lg:hidden bg-black text-NoExcuseChallenge text-center py-3">
        © 2024, made with by{' '}
        <span className="font-bold">NoExcuseChallenge.</span>
      </div>
      {/* <!-- ===== Page Wrapper End ===== --> */}
    </div>
  );
};

export default DefaultLayout;
