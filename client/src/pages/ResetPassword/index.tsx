import { useState } from 'react';

import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import queryString from 'query-string';

import SignInLayout from '@/layout/SignInLayout';
import Loading from '@/components/Loading';
import Auth from '@/api/Auth';

const ResetPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const parsed = queryString.parse(location.search);
  let { token } = parsed;
  if (!token) {
    toast.error(t('invalidUrl'));
  }
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({});
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    const { password } = data;
    await Auth.resetPassword({
      token,
      password,
    })
      .then((response) => {
        setLoading(false);
        toast.success(response.data.message);
        setTimeout(() => {
          navigate('/signin');
        }, 2000);
      })
      .catch((error) => {
        let message =
          error.response && error.response.data.error
            ? error.response.data.error
            : error.message;
        toast.error(message);
        setLoading(false);
      });
  };

  return (
    <SignInLayout>
      <ToastContainer />
      <div className="min-h-screen bg-white">
        <div className="text-gray-900 flex justify-center bg-white">
          <div className="max-w-screen-xl m-0 sm:m-10 flex justify-center flex-1">
            <div className="w-full p-12">
              <div className="mt-12 flex flex-col items-center">
                <h1 className="text-2xl xl:text-3xl font-extrabold">
                  {t('resetPassword')}
                </h1>
                <div className="w-full flex-1 mt-8">
                  <form
                    className="mx-auto max-w-xl"
                    onSubmit={handleSubmit(onSubmit)}
                    autoComplete="off"
                  >
                    {/* Password */}
                    <input
                      className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5"
                      type="password"
                      placeholder="Password"
                      {...register('password', {
                        required: 'Password is required',
                      })}
                      disabled={loading}
                    />
                    <p className="error-message-text">
                      {errors.password?.message}
                    </p>
                    {/* Confirm Password */}
                    <input
                      className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5"
                      type="password"
                      placeholder="Confirm Password"
                      {...register('confirmPassword', {
                        required: 'Confirm password is required',
                        validate: (val) => {
                          if (watch('password') != val) {
                            return 'Your passwords do no match';
                          }
                        },
                      })}
                      disabled={loading}
                    />
                    <p className="error-message-text">
                      {errors.confirmPassword?.message}
                    </p>
                    <button
                      type="submit"
                      className="w-full flex justify-center items-center hover:underline bg-black text-dreamchain font-bold rounded-full my-6 py-4 px-8 shadow-lg focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out"
                    >
                      {loading && <Loading />}
                      {t('confirm')}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SignInLayout>
  );
};

export default ResetPassword;
