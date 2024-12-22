import { useSelector } from 'react-redux';
import { useAccount, useConnect } from 'wagmi';
import { shortenWalletAddress } from '../../utils';
import { useState } from 'react';
import ClickOutside from '../ClickOutside';
import { Link } from 'react-router-dom';

const WalletUser = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const auth = useSelector((state) => state.auth);

  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();

  return (
    <>
      {auth.accessToken &&
        (auth.userInfo.status === 'APPROVED' ||
          auth.userInfo.status === 'LOCKED') && (
          <ClickOutside
            onClick={() => setDropdownOpen(false)}
            className="relative"
          >
            <Link
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center text-sm gap-2 rounded-3xl"
              to="#"
            >
              <button className="flex items-center gap-2 bg-[#F2F4F7] font-bold rounded-full p-2 pr-4">
                <span className="bg-black p-2 text-white rounded-full">
                  <svg
                    className="w-4 h-auto"
                    viewBox="0 0 16 16"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill="currentColor"
                      d="M14.5 4h-12.12c-0.057 0.012-0.123 0.018-0.19 0.018-0.552 0-1-0.448-1-1 0-0.006 0-0.013 0-0.019l12.81-0.499v-1.19c0.005-0.041 0.008-0.089 0.008-0.138 0-0.652-0.528-1.18-1.18-1.18-0.049 0-0.097 0.003-0.144 0.009l-11.374 1.849c-0.771 0.289-1.31 1.020-1.31 1.877 0 0.011 0 0.023 0 0.034l-0 10.728c-0 0.003-0 0.006-0 0.010 0 0.828 0.672 1.5 1.5 1.5 0 0 0 0 0 0h13c0 0 0 0 0 0 0.828 0 1.5-0.672 1.5-1.5 0-0.004-0-0.007-0-0.011v-8.999c0-0.012 0.001-0.027 0.001-0.041 0-0.801-0.649-1.45-1.45-1.45-0.018 0-0.036 0-0.053 0.001zM13 11c-0.828 0-1.5-0.672-1.5-1.5s0.672-1.5 1.5-1.5c0.828 0 1.5 0.672 1.5 1.5s-0.672 1.5-1.5 1.5z"
                    ></path>
                  </svg>
                </span>
                {isConnected ? shortenWalletAddress(address, 8) : 'Connect'}
              </button>
            </Link>
            {dropdownOpen && (
              <div
                className={`absolute right-0 mt-4 flex w-62.5 flex-col rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark`}
              >
                <ul className="flex flex-col gap-5 border-b border-stroke px-6 py-7.5 dark:border-strokedark">
                  {connectors.map((connector) => {
                    return (
                      <button
                        key={connector.uid}
                        onClick={() => connect({ connector })}
                        className="flex items-center gap-2 bg-white font-bold rounded-full p-2"
                      >
                        {/* {connector.icon ? (
                          <img
                            src={connector.icon}
                            className="w-6 h-auto object-cover"
                          />
                        ) : (
                          <svg
                            className="w-4 h-auto"
                            viewBox="0 0 16 16"
                            version="1.1"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fill="currentColor"
                              d="M14.5 4h-12.12c-0.057 0.012-0.123 0.018-0.19 0.018-0.552 0-1-0.448-1-1 0-0.006 0-0.013 0-0.019l12.81-0.499v-1.19c0.005-0.041 0.008-0.089 0.008-0.138 0-0.652-0.528-1.18-1.18-1.18-0.049 0-0.097 0.003-0.144 0.009l-11.374 1.849c-0.771 0.289-1.31 1.020-1.31 1.877 0 0.011 0 0.023 0 0.034l-0 10.728c-0 0.003-0 0.006-0 0.010 0 0.828 0.672 1.5 1.5 1.5 0 0 0 0 0 0h13c0 0 0 0 0 0 0.828 0 1.5-0.672 1.5-1.5 0-0.004-0-0.007-0-0.011v-8.999c0-0.012 0.001-0.027 0.001-0.041 0-0.801-0.649-1.45-1.45-1.45-0.018 0-0.036 0-0.053 0.001zM13 11c-0.828 0-1.5-0.672-1.5-1.5s0.672-1.5 1.5-1.5c0.828 0 1.5 0.672 1.5 1.5s-0.672 1.5-1.5 1.5z"
                            ></path>
                          </svg>
                        )} */}

                        {connector.name}
                      </button>
                    );
                  })}
                </ul>
              </div>
            )}
          </ClickOutside>
        )}
    </>
  );
};

export default WalletUser;
