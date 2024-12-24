import { Link, NavLink } from 'react-router-dom';
// import DropdownMessage from './DropdownMessage';
// import DropdownNotification from './DropdownNotification';
import DropdownUser from './DropdownUser';
// import DarkModeSwitcher from './DarkModeSwitcher';
import Logo from '../../images/logo/logo.svg';
import { useSelector } from 'react-redux';
import WalletUser from './WalletUser';
import DropdownLanguage from './DropdownLanguage';

const Header = (props: {
  sidebarOpen: string | boolean | undefined;
  setSidebarOpen: (arg0: boolean) => void;
}) => {
  const { userInfo } = useSelector((state) => state.auth);

  return (
    <header className="absolute top-0 z-999 flex w-full bg-black lg:bg-transparent">
      <div className="flex flex-grow items-center justify-between lg:justify-end px-4 py-4 gap-4 md:px-6 2xl:px-11">
        <NavLink to="/" className="lg:hidden">
          <img src={Logo} alt="Logo" width={120} />
        </NavLink>
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center border gap-2 bg-white rounded-3xl px-4 py-2 font-medium">
            <DropdownLanguage />
            <span>|</span>
            <span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M17.2583 16.075L14.425 13.25C15.3392 12.0854 15.8352 10.6472 15.8333 9.16667C15.8333 7.84813 15.4423 6.5592 14.7098 5.46287C13.9773 4.36654 12.9361 3.51206 11.7179 3.00747C10.4997 2.50289 9.15927 2.37087 7.86607 2.6281C6.57286 2.88534 5.38497 3.52027 4.45262 4.45262C3.52027 5.38497 2.88534 6.57286 2.6281 7.86607C2.37087 9.15927 2.50289 10.4997 3.00747 11.7179C3.51206 12.9361 4.36654 13.9773 5.46287 14.7098C6.5592 15.4423 7.84813 15.8333 9.16667 15.8333C10.6472 15.8352 12.0854 15.3392 13.25 14.425L16.075 17.2583C16.1525 17.3364 16.2446 17.3984 16.3462 17.4407C16.4477 17.4831 16.5567 17.5048 16.6667 17.5048C16.7767 17.5048 16.8856 17.4831 16.9872 17.4407C17.0887 17.3984 17.1809 17.3364 17.2583 17.2583C17.3364 17.1809 17.3984 17.0887 17.4407 16.9872C17.4831 16.8856 17.5048 16.7767 17.5048 16.6667C17.5048 16.5567 17.4831 16.4477 17.4407 16.3462C17.3984 16.2446 17.3364 16.1525 17.2583 16.075ZM4.16667 9.16667C4.16667 8.17776 4.45991 7.21106 5.00932 6.38882C5.55873 5.56657 6.33962 4.92571 7.25325 4.54727C8.16688 4.16883 9.17222 4.06982 10.1421 4.26274C11.112 4.45567 12.0029 4.93187 12.7022 5.63114C13.4015 6.3304 13.8777 7.22131 14.0706 8.19122C14.2635 9.16112 14.1645 10.1665 13.7861 11.0801C13.4076 11.9937 12.7668 12.7746 11.9445 13.324C11.1223 13.8734 10.1556 14.1667 9.16667 14.1667C7.84059 14.1667 6.56882 13.6399 5.63114 12.7022C4.69345 11.7645 4.16667 10.4928 4.16667 9.16667Z"
                  fill="#02071B"
                />
              </svg>
            </span>
          </div>

          {!userInfo && (
            <div className="font-medium hidden lg:flex text-black">
              {/* <Link
                to="/signup"
                className="border rounded-3xl px-4 py-2 pr-10 bg-white"
              >
                Sign Up
              </Link> */}
              <Link
                to="/signin"
                className="border rounded-3xl border-black px-4 py-2 text-white bg-black"
              >
                Login
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 2xsm:gap-6">
          {/* <ul className="flex items-center gap-2 2xsm:gap-4">
            <DropdownNotification />
            <DropdownMessage />
          </ul> */}
          {userInfo && (
            <>
              <WalletUser />
              <DropdownUser />
            </>
          )}
          <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
            <button
              aria-controls="sidebar"
              onClick={(e) => {
                e.stopPropagation();
                props.setSidebarOpen(!props.sidebarOpen);
              }}
              className="z-99999 block p-1.5 shadow-sm dark:border-strokedark dark:bg-boxdark lg:hidden"
            >
              <span className="relative block h-5.5 w-5.5 cursor-pointer">
                <span className="du-block absolute right-0 h-full w-full">
                  <span
                    className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-white delay-[0] duration-200 ease-in-out dark:bg-white ${
                      !props.sidebarOpen && '!w-full delay-300'
                    }`}
                  ></span>
                  <span
                    className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-white delay-150 duration-200 ease-in-out dark:bg-white ${
                      !props.sidebarOpen && 'delay-400 !w-full'
                    }`}
                  ></span>
                  <span
                    className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-white delay-200 duration-200 ease-in-out dark:bg-white ${
                      !props.sidebarOpen && '!w-full delay-500'
                    }`}
                  ></span>
                </span>
                <span className="absolute right-0 h-full w-full rotate-45">
                  <span
                    className={`absolute left-2.5 top-0 block h-full w-0.5 rounded-sm bg-white delay-300 duration-200 ease-in-out dark:bg-white ${
                      !props.sidebarOpen && '!h-0 !delay-[0]'
                    }`}
                  ></span>
                  <span
                    className={`delay-400 absolute left-0 top-2.5 block h-0.5 w-full rounded-sm bg-white duration-200 ease-in-out dark:bg-white ${
                      !props.sidebarOpen && '!h-0 !delay-200'
                    }`}
                  ></span>
                </span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
