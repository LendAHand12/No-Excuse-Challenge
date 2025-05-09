import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { shortenWalletAddress } from '../../utils';
import { useState } from 'react';
import ClickOutside from '../ClickOutside';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const WalletUser = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { address, isConnected } = useAccount();
  const { connectors, connectAsync } = useConnect();
  const { disconnect } = useDisconnect();

  const handleConnect = async (connector: any) => {
    try {
      const result = await connectAsync({ connector });
      if (result?.accounts.length > 0) {
        toast.success('Connected to wallet successfully!');
        setDropdownOpen(!dropdownOpen);
      }
    } catch (error: any) {
      console.log({ error });
      toast.error('Failed to connect to wallet!');
    }
  };

  const handleDisconnect = () => {
    disconnect(); // Gọi hàm ngắt kết nối
    toast.info('Disconnected successfully!');
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <ClickOutside onClick={() => setDropdownOpen(false)} className="relative">
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
          className={`absolute right-0 mt-4 flex w-62 flex-col rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark`}
        >
          {!isConnected && (
            <ul className="flex flex-col gap-5 border-b border-stroke px-6 py-7.5">
              {connectors
                .filter((con) => con.name === 'WalletConnect')
                .map((connector) => {
                  return (
                    <button
                      key={connector.id}
                      onClick={() => handleConnect(connector)}
                      className="flex items-center gap-2 bg-white font-bold rounded-full p-2"
                    >
                      {connector.name}
                    </button>
                  );
                })}
            </ul>
          )}
          {isConnected && (
            <button
              className="flex items-center gap-2 bg-white rounded-full px-6 py-4 font-bold"
              onClick={handleDisconnect}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 16 16"
                xmlns="http://www.w3.org/2000/svg"
                fill="#000000"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M13.617 3.844a2.87 2.87 0 0 0-.451-.868l1.354-1.36L13.904 1l-1.36 1.354a2.877 2.877 0 0 0-.868-.452 3.073 3.073 0 0 0-2.14.075 3.03 3.03 0 0 0-.991.664L7 4.192l4.327 4.328 1.552-1.545c.287-.287.508-.618.663-.992a3.074 3.074 0 0 0 .075-2.14zm-.889 1.804a2.15 2.15 0 0 1-.471.705l-.93.93-3.09-3.09.93-.93a2.15 2.15 0 0 1 .704-.472 2.134 2.134 0 0 1 1.689.007c.264.114.494.271.69.472.2.195.358.426.472.69a2.134 2.134 0 0 1 .007 1.688zm-4.824 4.994l1.484-1.545-.616-.622-1.49 1.551-1.86-1.859 1.491-1.552L6.291 6 4.808 7.545l-.616-.615-1.551 1.545a3 3 0 0 0-.663.998 3.023 3.023 0 0 0-.233 1.169c0 .332.05.656.15.97.105.31.258.597.459.862L1 13.834l.615.615 1.36-1.353c.265.2.552.353.862.458.314.1.638.15.97.15.406 0 .796-.077 1.17-.232.378-.155.71-.376.998-.663l1.545-1.552-.616-.615zm-2.262 2.023a2.16 2.16 0 0 1-.834.164c-.301 0-.586-.057-.855-.17a2.278 2.278 0 0 1-.697-.466 2.28 2.28 0 0 1-.465-.697 2.167 2.167 0 0 1-.17-.854 2.16 2.16 0 0 1 .642-1.545l.93-.93 3.09 3.09-.93.93a2.22 2.22 0 0 1-.711.478z"
                />
              </svg>
              Disconnect
            </button>
          )}
        </div>
      )}
    </ClickOutside>
  );
};

export default WalletUser;
