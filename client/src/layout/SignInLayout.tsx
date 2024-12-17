import React, { useState, ReactNode, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import Logo from '../images/logo/logo.svg';
import { useTranslation } from 'react-i18next';
import COVER4 from '../images/cover/cover-4.png';

const SignInLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebar = useRef<any>(null);
  const { i18n } = useTranslation();

  const onChangeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    window.location.reload();
  };

  return (
    <div className="">
      {/* <!-- ===== Page Wrapper Start ===== --> */}
      <div className="flex h-screen overflow-hidden">
        {/* <!-- ===== Sidebar Start ===== --> */}
        <aside
          ref={sidebar}
          className={`flex h-screen flex-col overflow-y-auto bg-black duration-300`}
        >
          <img
            src={COVER4}
            className="hidden lg:block w-[577px] h-screen object-cover"
          />
        </aside>
        {/* <!-- ===== Sidebar End ===== --> */}

        {/* <!-- ===== Content Area Start ===== --> */}
        <div className="relative bg-white flex flex-1 flex-col overflow-y-auto overflow-x-hidden lg:rounded-s-[40px] lg:-ml-10">
          {/* <!-- ===== Header Start ===== --> */}
          <header className="absolute top-0 z-999 flex w-full bg-black lg:bg-transparent">
            <div className="flex flex-grow items-center justify-between lg:justify-end px-4 py-4 gap-10 md:px-6 2xl:px-11">
              <NavLink to="/" className="lg:hidden">
                <img src={Logo} alt="Logo" width={120} />
              </NavLink>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
                  <button
                    aria-controls="sidebar"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSidebarOpen(!sidebarOpen);
                    }}
                    className="z-99999 block p-1.5 shadow-sm dark:border-strokedark dark:bg-boxdark lg:hidden"
                  >
                    <span className="relative block h-5.5 w-5.5 cursor-pointer">
                      <span className="du-block absolute right-0 h-full w-full">
                        <span
                          className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-white delay-[0] duration-200 ease-in-out dark:bg-white ${
                            !sidebarOpen && '!w-full delay-300'
                          }`}
                        ></span>
                        <span
                          className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-white delay-150 duration-200 ease-in-out dark:bg-white ${
                            !sidebarOpen && 'delay-400 !w-full'
                          }`}
                        ></span>
                        <span
                          className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-white delay-200 duration-200 ease-in-out dark:bg-white ${
                            !sidebarOpen && '!w-full delay-500'
                          }`}
                        ></span>
                      </span>
                      <span className="absolute right-0 h-full w-full rotate-45">
                        <span
                          className={`absolute left-2.5 top-0 block h-full w-0.5 rounded-sm bg-white delay-300 duration-200 ease-in-out dark:bg-white ${
                            !sidebarOpen && '!h-0 !delay-[0]'
                          }`}
                        ></span>
                        <span
                          className={`delay-400 absolute left-0 top-2.5 block h-0.5 w-full rounded-sm bg-white duration-200 ease-in-out dark:bg-white ${
                            !sidebarOpen && '!h-0 !delay-200'
                          }`}
                        ></span>
                      </span>
                    </span>
                  </button>
                </div>

                <div className="hidden lg:flex items-center border gap-2 bg-white rounded-3xl px-4 py-2 font-medium">
                  <div className="text-black font-medium">
                    <button onClick={() => onChangeLanguage('vi')}>Vie</button>
                    <span>/</span>
                    <button onClick={() => onChangeLanguage('en')}>En</button>
                  </div>
                </div>
              </div>
            </div>
          </header>
          {/* <!-- ===== Header End ===== --> */}

          {/* <!-- ===== Main Content Start ===== --> */}
          <main className="">{children}</main>
          {/* <!-- ===== Main Content End ===== --> */}
        </div>
        {/* <!-- ===== Content Area End ===== --> */}
      </div>
      {/* <!-- ===== Page Wrapper End ===== --> */}
    </div>
  );
};

export default SignInLayout;
