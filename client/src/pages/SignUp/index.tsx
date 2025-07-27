import { useCallback, useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import queryString from 'query-string';
import PhoneInput from 'react-phone-number-input';

import Loading from '@/components/Loading';
import Auth from '@/api/Auth';

import 'react-phone-number-input/style.css';
import './index.css';
import SignInLayout from '../../layout/SignInLayout';

const SignUpPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const parsed = queryString.parse(location.search);
  let { ref, receiveId } = parsed;
  if (!receiveId) {
    receiveId = ref;
  }
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      ref,
      receiveId,
    },
  });
  const [loading, setLoading] = useState(false);
  const [checkingRefUrl, setCheckingRefUrl] = useState(true);
  const [phone, setPhone] = useState('');
  const [errorPhone, setErrPhone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [refCity, setRefCity] = useState('');

  const onSubmit = useCallback(
    async (data) => {
      if (phone === '') {
        setErrPhone(true);
        return;
      }
      setLoading(true);
      const {
        userId,
        email,
        password,
        ref,
        receiveId,
        idCode,
        walletAddress,
        accountName,
        accountNumber,
      } = data;
      await Auth.register({
        userId: userId.trim(),
        email: email.trim(),
        walletAddress: walletAddress.trim(),
        password,
        ref,
        receiveId,
        phone: phone.trim(),
        idCode: idCode.trim(),
        accountName: accountName.trim(),
        accountNumber: accountNumber.trim(),
      })
        .then((response) => {
          setLoading(false);
          toast.success(t(response.data.message));
          setShowSuccess(true);
        })
        .catch((error) => {
          let message =
            error.response && error.response.data.message
              ? error.response.data.message
              : error.message;
          toast.error(t(message));
          setLoading(false);
        });
    },
    [phone],
  );

  useEffect(() => {
    (async () => {
      await Auth.checkLinkRef({ ref, receiveId })
        .then((res) => {
          const { city } = res.data;
          setCheckingRefUrl(false);
          setRefCity(city);
        })
        .catch((error) => {
          let message =
            error.response && error.response.data.error
              ? error.response.data.error
              : error.message;
          toast.error(t(message));
        });
    })();
  }, [ref, receiveId]);

  return (
    <>
      <ToastContainer />
      <SignInLayout>
        {!showSuccess ? (
          <div className="min-h-screen bg-white flex items-center justify-center">
            {!checkingRefUrl && (
              <div className="text-gray-900 flex justify-center bg-white">
                <div className="max-w-screen-xl m-0 sm:m-10 flex justify-center flex-1">
                  <div className="w-full p-12">
                    <div className="mt-12 flex flex-col items-center">
                      <h1 className="font-extrabold text-title-xl">
                        {t('Signup')}
                      </h1>
                      <div className="w-full flex-1 mt-8">
                        <form
                          className="mx-auto w-[350px] xl:w-[500px]"
                          onSubmit={handleSubmit(onSubmit)}
                          autoComplete="off"
                        >
                          {/* User ID */}
                          <input
                            className="text-white w-full px-4 py-3 rounded-lg bg-black border text-sm focus:outline-none"
                            type="text"
                            placeholder={t('User Name')}
                            {...register('userId', {
                              required: t('User ID is required'),
                            })}
                            disabled={loading}
                          />
                          <p className="text-red-500 mt-1 text-sm">
                            {errors.userId?.message}
                          </p>
                          {/* Email */}
                          <input
                            className="text-white w-full px-4 py-3 rounded-lg bg-black border text-sm focus:outline-none mt-5"
                            type="email"
                            placeholder="Email"
                            {...register('email', {
                              required: t('Email is required'),
                            })}
                            disabled={loading}
                          />
                          <p className="text-red-500 mt-1 text-sm">
                            {errors.email?.message}
                          </p>
                          <div>
                            <PhoneInput
                              defaultCountry="US"
                              placeholder={t('Phone')}
                              value={phone}
                              onChange={setPhone}
                            />
                            <p className="text-red-500 mt-1 text-sm">
                              {errorPhone && t('Phone is required')}
                            </p>
                          </div>
                          {/* Id code */}
                          <div>
                            <input
                              className="text-white w-full px-4 py-3 rounded-lg bg-black border text-sm focus:outline-none mt-5"
                              type="text"
                              placeholder={`${t('id code')}`}
                              {...register('idCode', {
                                required: t('ID code is required'),
                              })}
                              disabled={loading}
                            />
                            <p className="text-red-500 mt-1 text-sm">
                              {errors.idCode?.message}
                            </p>
                          </div>
                          {/* Wallet address */}
                          <input
                            className="text-white w-full px-4 py-3 rounded-lg bg-black border text-sm focus:outline-none mt-5"
                            type="text"
                            placeholder={`${t('Wallet address')} : Oxbx7...`}
                            {...register('walletAddress', {
                              required: t('Wallet address is required'),
                              pattern: {
                                value: /^0x[a-fA-F0-9]{40}$/g,
                                message: t(
                                  'Please enter the correct wallet format',
                                ),
                              },
                            })}
                            disabled={loading}
                          />
                          {refCity === 'US' && (
                            <>
                              <div>
                                <input
                                  className="text-white w-full px-4 py-3 rounded-lg bg-black border text-sm focus:outline-none mt-5"
                                  type="text"
                                  placeholder={`${t('Payout Display Name')}`}
                                  {...register('accountName', {
                                    required: t('Account name is required'),
                                  })}
                                  disabled={loading}
                                />
                                <p className="text-red-500 mt-1 text-sm">
                                  {errors.accountName?.message}
                                </p>
                              </div>
                              <div>
                                <input
                                  className="text-white w-full px-4 py-3 rounded-lg bg-black border text-sm focus:outline-none mt-5"
                                  type="text"
                                  placeholder={`${t(
                                    'Payout Email or Phone Number',
                                  )}`}
                                  {...register('accountNumber', {
                                    required: t('ID code is required'),
                                  })}
                                  disabled={loading}
                                />
                                <p className="text-red-500 mt-1 text-sm">
                                  {errors.accountNumber?.message}
                                </p>
                              </div>
                            </>
                          )}

                          {/* Password */}
                          <div className="relative mt-5">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              className="bg-black px-4 text-sm shadow-xl py-3 rounded-lg w-full text-white"
                              placeholder="Password"
                              {...register('password', {
                                required: t('Password is required'),
                                pattern: {
                                  value: /^(?=.*?[a-z])(?=.*?[0-9]).{8,}$/,
                                  message: t(
                                    'Password must contain at least 8 characters and a number',
                                  ),
                                },
                              })}
                            />
                            <p className="text-red-500 mt-1 text-sm">
                              {errors.password?.message}
                            </p>
                            <span
                              className="absolute right-3 top-3 cursor-pointer"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <svg
                                  fill="#D99300"
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  version="1.2"
                                  baseProfile="tiny"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path d="M21.821 12.43c-.083-.119-2.062-2.944-4.793-4.875-1.416-1.003-3.202-1.555-5.028-1.555-1.825 0-3.611.552-5.03 1.555-2.731 1.931-4.708 4.756-4.791 4.875-.238.343-.238.798 0 1.141.083.119 2.06 2.944 4.791 4.875 1.419 1.002 3.205 1.554 5.03 1.554 1.826 0 3.612-.552 5.028-1.555 2.731-1.931 4.71-4.756 4.793-4.875.239-.342.239-.798 0-1.14zm-9.821 4.07c-1.934 0-3.5-1.57-3.5-3.5 0-1.934 1.566-3.5 3.5-3.5 1.93 0 3.5 1.566 3.5 3.5 0 1.93-1.57 3.5-3.5 3.5zM14 13c0 1.102-.898 2-2 2-1.105 0-2-.898-2-2 0-1.105.895-2 2-2 1.102 0 2 .895 2 2z" />
                                </svg>
                              ) : (
                                <svg
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M3.05004 9.30995C3.00753 9.18301 2.99095 9.04882 3.00127 8.91534C3.01159 8.78187 3.0486 8.65183 3.11012 8.53292C3.17163 8.41402 3.2564 8.30868 3.35938 8.22315C3.46237 8.13762 3.58148 8.07363 3.70966 8.03499C3.83783 7.99635 3.97246 7.98384 4.10556 7.9982C4.23866 8.01256 4.36753 8.0535 4.48451 8.11859C4.60149 8.18369 4.70422 8.2716 4.78659 8.37714C4.86896 8.48267 4.9293 8.60366 4.96404 8.73295C7.05004 15.719 16.946 15.72 19.034 8.73695C19.0715 8.61102 19.1333 8.49368 19.2161 8.39165C19.2989 8.28962 19.4009 8.2049 19.5165 8.14231C19.632 8.07972 19.7587 8.0405 19.8894 8.02689C20.02 8.01327 20.1521 8.02553 20.278 8.06295C20.404 8.10038 20.5213 8.16225 20.6233 8.24502C20.7254 8.32779 20.8101 8.42985 20.8727 8.54536C20.9353 8.66088 20.9745 8.78759 20.9881 8.91826C21.0017 9.04894 20.9895 9.18102 20.952 9.30695C20.5882 10.5581 19.9711 11.7212 19.139 12.724L20.414 14C20.5962 14.1886 20.697 14.4412 20.6947 14.7034C20.6924 14.9656 20.5873 15.2164 20.4019 15.4018C20.2165 15.5872 19.9656 15.6923 19.7034 15.6946C19.4412 15.6969 19.1886 15.5961 19 15.414L17.689 14.103C16.9815 14.6365 16.1999 15.064 15.369 15.372L15.726 16.707C15.7641 16.835 15.7762 16.9694 15.7615 17.1022C15.7467 17.2349 15.7056 17.3634 15.6404 17.48C15.5752 17.5966 15.4873 17.699 15.3819 17.7811C15.2764 17.8631 15.1557 17.9233 15.0266 17.9579C14.8976 17.9925 14.7629 18.0009 14.6306 17.9826C14.4983 17.9643 14.3709 17.9197 14.2561 17.8514C14.1413 17.783 14.0414 17.6924 13.9622 17.5848C13.883 17.4772 13.8262 17.3549 13.795 17.225L13.431 15.868C12.484 16.008 11.516 16.008 10.569 15.868L10.205 17.225C10.1739 17.3549 10.1171 17.4772 10.0379 17.5848C9.9587 17.6924 9.85875 17.783 9.74395 17.8514C9.62914 17.9197 9.50181 17.9643 9.36948 17.9826C9.23714 18.0009 9.10248 17.9925 8.97345 17.9579C8.84442 17.9233 8.72363 17.8631 8.61822 17.7811C8.51281 17.699 8.42491 17.5966 8.35971 17.48C8.29451 17.3634 8.25334 17.2349 8.23863 17.1022C8.22392 16.9694 8.23596 16.835 8.27404 16.707L8.63104 15.372C7.80009 15.0636 7.01854 14.6358 6.31104 14.102L5.00104 15.414C4.81353 15.6017 4.55911 15.7073 4.29375 15.7075C4.02838 15.7077 3.77381 15.6025 3.58604 15.415C3.39827 15.2274 3.29267 14.973 3.29248 14.7077C3.2923 14.4423 3.39753 14.1877 3.58504 14L4.86004 12.725C4.07604 11.789 3.45004 10.651 3.04804 9.31095L3.05004 9.30995Z"
                                    fill="#D99300"
                                  />
                                </svg>
                              )}
                            </span>
                          </div>
                          {/* Confirm Password */}
                          <div className="relative mt-5">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              className="bg-black px-4 text-sm shadow-xl py-3 rounded-lg w-full text-white"
                              placeholder="Confirm Password"
                              {...register('confirmPassword', {
                                required: t('Confirm password is required'),
                                validate: (val) => {
                                  if (watch('password') != val) {
                                    return t('Your passwords do no match');
                                  }
                                },
                                pattern: {
                                  value: /^(?=.*?[a-z])(?=.*?[0-9]).{8,}$/,
                                  message: t(
                                    'Password must contain at least 8 characters and a number',
                                  ),
                                },
                              })}
                            />
                            <p className="text-red-500 mt-1 text-sm">
                              {errors.confirmPassword?.message}
                            </p>
                            <span
                              className="absolute right-3 top-3 cursor-pointer"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <svg
                                  fill="#D99300"
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  version="1.2"
                                  baseProfile="tiny"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path d="M21.821 12.43c-.083-.119-2.062-2.944-4.793-4.875-1.416-1.003-3.202-1.555-5.028-1.555-1.825 0-3.611.552-5.03 1.555-2.731 1.931-4.708 4.756-4.791 4.875-.238.343-.238.798 0 1.141.083.119 2.06 2.944 4.791 4.875 1.419 1.002 3.205 1.554 5.03 1.554 1.826 0 3.612-.552 5.028-1.555 2.731-1.931 4.71-4.756 4.793-4.875.239-.342.239-.798 0-1.14zm-9.821 4.07c-1.934 0-3.5-1.57-3.5-3.5 0-1.934 1.566-3.5 3.5-3.5 1.93 0 3.5 1.566 3.5 3.5 0 1.93-1.57 3.5-3.5 3.5zM14 13c0 1.102-.898 2-2 2-1.105 0-2-.898-2-2 0-1.105.895-2 2-2 1.102 0 2 .895 2 2z" />
                                </svg>
                              ) : (
                                <svg
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M3.05004 9.30995C3.00753 9.18301 2.99095 9.04882 3.00127 8.91534C3.01159 8.78187 3.0486 8.65183 3.11012 8.53292C3.17163 8.41402 3.2564 8.30868 3.35938 8.22315C3.46237 8.13762 3.58148 8.07363 3.70966 8.03499C3.83783 7.99635 3.97246 7.98384 4.10556 7.9982C4.23866 8.01256 4.36753 8.0535 4.48451 8.11859C4.60149 8.18369 4.70422 8.2716 4.78659 8.37714C4.86896 8.48267 4.9293 8.60366 4.96404 8.73295C7.05004 15.719 16.946 15.72 19.034 8.73695C19.0715 8.61102 19.1333 8.49368 19.2161 8.39165C19.2989 8.28962 19.4009 8.2049 19.5165 8.14231C19.632 8.07972 19.7587 8.0405 19.8894 8.02689C20.02 8.01327 20.1521 8.02553 20.278 8.06295C20.404 8.10038 20.5213 8.16225 20.6233 8.24502C20.7254 8.32779 20.8101 8.42985 20.8727 8.54536C20.9353 8.66088 20.9745 8.78759 20.9881 8.91826C21.0017 9.04894 20.9895 9.18102 20.952 9.30695C20.5882 10.5581 19.9711 11.7212 19.139 12.724L20.414 14C20.5962 14.1886 20.697 14.4412 20.6947 14.7034C20.6924 14.9656 20.5873 15.2164 20.4019 15.4018C20.2165 15.5872 19.9656 15.6923 19.7034 15.6946C19.4412 15.6969 19.1886 15.5961 19 15.414L17.689 14.103C16.9815 14.6365 16.1999 15.064 15.369 15.372L15.726 16.707C15.7641 16.835 15.7762 16.9694 15.7615 17.1022C15.7467 17.2349 15.7056 17.3634 15.6404 17.48C15.5752 17.5966 15.4873 17.699 15.3819 17.7811C15.2764 17.8631 15.1557 17.9233 15.0266 17.9579C14.8976 17.9925 14.7629 18.0009 14.6306 17.9826C14.4983 17.9643 14.3709 17.9197 14.2561 17.8514C14.1413 17.783 14.0414 17.6924 13.9622 17.5848C13.883 17.4772 13.8262 17.3549 13.795 17.225L13.431 15.868C12.484 16.008 11.516 16.008 10.569 15.868L10.205 17.225C10.1739 17.3549 10.1171 17.4772 10.0379 17.5848C9.9587 17.6924 9.85875 17.783 9.74395 17.8514C9.62914 17.9197 9.50181 17.9643 9.36948 17.9826C9.23714 18.0009 9.10248 17.9925 8.97345 17.9579C8.84442 17.9233 8.72363 17.8631 8.61822 17.7811C8.51281 17.699 8.42491 17.5966 8.35971 17.48C8.29451 17.3634 8.25334 17.2349 8.23863 17.1022C8.22392 16.9694 8.23596 16.835 8.27404 16.707L8.63104 15.372C7.80009 15.0636 7.01854 14.6358 6.31104 14.102L5.00104 15.414C4.81353 15.6017 4.55911 15.7073 4.29375 15.7075C4.02838 15.7077 3.77381 15.6025 3.58604 15.415C3.39827 15.2274 3.29267 14.973 3.29248 14.7077C3.2923 14.4423 3.39753 14.1877 3.58504 14L4.86004 12.725C4.07604 11.789 3.45004 10.651 3.04804 9.31095L3.05004 9.30995Z"
                                    fill="#D99300"
                                  />
                                </svg>
                              )}
                            </span>
                          </div>
                          <button
                            type="submit"
                            className="w-full flex justify-center font-semibold rounded-3xl border py-4 mt-10 border-black text-black duration-100 ease-linear"
                          >
                            {loading && <Loading />}
                            {t('confirm')}
                          </button>
                          <p className="mt-12 text-gray-600 font-medium">
                            Already have an account?{' '}
                            <Link
                              to="/signin"
                              className="text-dreamchain hover:underline"
                            >
                              Signin
                            </Link>
                          </p>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="min-h-screen bg-white text-gray-900 flex justify-center items-center">
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
                {t(
                  'Please confirm your email by opening it and clicking on `Activate Now.`',
                )}
              </p>
              <Link
                to="/"
                className="text-black font-medium hover:underline flex gap-2"
              >
                <svg
                  fill="#000000"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  id="left"
                  data-name="Flat Color"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    id="primary"
                    d="M21,11H5.41l5.3-5.29A1,1,0,1,0,9.29,4.29l-7,7a1,1,0,0,0,0,1.42l7,7a1,1,0,0,0,1.42,0,1,1,0,0,0,0-1.42L5.41,13H21a1,1,0,0,0,0-2Z"
                  ></path>
                </svg>
                Back to Homepage
              </Link>
            </div>
          </div>
        )}
      </SignInLayout>
    </>
  );
};

export default SignUpPage;
