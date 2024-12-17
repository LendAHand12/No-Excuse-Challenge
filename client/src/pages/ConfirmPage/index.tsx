import { useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import queryString from 'query-string';

import Auth from '@/api/Auth';

const ConfirmPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const parsed = queryString.parse(location.search);
  let { token } = parsed;
  console.log({ token });
  if (!token) {
    toast.error(t('invalidUrl'));
  }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      await Auth.confirm(token)
        .then(() => setLoading(false))
        .catch((error) => {
          let message =
            error.response && error.response.data.error
              ? error.response.data.error
              : error.message;
          toast.error(t(message));
        });
    })();
  }, [token]);

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen bg-white text-gray-900 flex justify-center items-center">
        {loading ? (
          <h1>verify...</h1>
        ) : (
          <div className="flex flex-col items-center gap-10">
            <svg
              viewBox="64 64 896 896"
              focusable="false"
              data-icon="check-circle"
              className="w-20 h-20 text-primary"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm193.5 301.7l-210.6 292a31.8 31.8 0 01-51.7 0L318.5 484.9c-3.8-5.3 0-12.7 6.5-12.7h46.9c10.2 0 19.9 4.9 25.9 13.3l71.2 98.8 157.2-218c6-8.3 15.6-13.3 25.9-13.3H699c6.5 0 10.3 7.4 6.5 12.7z"></path>
            </svg>
            <p className="">
              {t('Congratulations, you have successfully authenticated')}
            </p>
            <Link to="/signin" className="text-primary hover:underline">
              {t('login')}
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default ConfirmPage;
