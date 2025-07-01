import { useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import queryString from 'query-string';

import Claim from '@/api/Claim';

const ClaimKYCPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const parsed = queryString.parse(location.search);
  const [loadingClaim, setLoadingClaim] = useState(true);
  let { token, user_id, coin, status } = parsed;
  if (status !== 'success' || !token || !user_id || !coin) {
    toast.error(t('invalidUrl'));
  }

  useEffect(() => {
    (async () => {
      if (status === 'success' && token && user_id && coin) {
        if (coin === 'hewe') {
          await Claim.hewe({ user_id, token })
            .then((response) => {
              toast.success(t(response.data.message));
              setLoadingClaim(false);
              navigate('/user/profile');
            })
            .catch((error) => {
              let message =
                error.response && error.response.data.message
                  ? error.response.data.message
                  : error.response.data.error
                  ? error.response.data.error
                  : error.message;
              toast.error(t(message));
            });
        } else if (coin === 'usdt') {
          await Claim.usdt({ user_id, token })
            .then((response) => {
              toast.success(t(response.data.message));
              setLoadingClaim(false);
              navigate('/user/profile');
            })
            .catch((error) => {
              let message =
                error.response && error.response.data.message
                  ? error.response.data.message
                  : error.response.data.error
                  ? error.response.data.error
                  : error.message;
              toast.error(t(message));
            });
        }
      }
    })();
  }, [token]);

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen bg-white text-gray-900 flex flex-col justify-center items-center">
        {loadingClaim ? (
          <h1>Processing...</h1>
        ) : (
          <div className="flex flex-col items-center gap-10">
            <svg
              width="78"
              height="78"
              viewBox="0 0 78 78"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M39 71.5C43.2688 71.5053 47.4965 70.667 51.4402 69.0334C55.384 67.3998 58.9661 65.003 61.9808 61.9808C65.003 58.9661 67.3998 55.384 69.0334 51.4402C70.667 47.4965 71.5053 43.2688 71.5 39C71.5053 34.7313 70.667 30.5036 69.0334 26.5598C67.3998 22.616 65.003 19.0339 61.9808 16.0193C58.9661 12.997 55.384 10.6003 51.4402 8.96664C47.4965 7.33302 43.2688 6.49476 39 6.50002C34.7313 6.49476 30.5036 7.33302 26.5598 8.96664C22.616 10.6003 19.0339 12.997 16.0193 16.0193C12.997 19.0339 10.6003 22.616 8.96664 26.5598C7.33302 30.5036 6.49476 34.7313 6.50002 39C6.49476 43.2688 7.33302 47.4965 8.96664 51.4402C10.6003 55.384 12.997 58.9661 16.0193 61.9808C19.0339 65.003 22.616 67.3998 26.5598 69.0334C30.5036 70.667 34.7313 71.5053 39 71.5Z"
                fill="#02071B"
              />
              <path
                d="M26 39L35.75 48.75L55.25 29.25"
                stroke="#36BA02"
                strokeWidth="6.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <p className="text-2xl font-bold">
              {`Claim ${coin.toUpperCase()} successful`}
            </p>
          </div>
        )}
        <Link
          to="/user/profile"
          className="border border-black max-w-xl w-full text-center rounded-3xl py-2 mt-4"
        >
          {t('Back to Profile')}
        </Link>
      </div>
    </>
  );
};

export default ClaimKYCPage;
