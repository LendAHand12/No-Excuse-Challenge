import React, { useState } from 'react';
import SignInLayout from '@/layout/SignInLayout';
import { Link, useNavigate } from 'react-router-dom';
import COVER4 from '@/images/cover/cover-4.png';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import Auth from '@/api/Auth';
import { ToastContainer, toast } from 'react-toastify';
import { LOGIN } from '@/slices/auth';

const SignInPage: React.FC = () => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    const { code, password } = data;
    setLoading(true);
    await Auth.login({ code, password })
      .then((response) => {
        setLoading(false);
        dispatch(LOGIN(response.data));
        navigate('/');
      })
      .catch((error) => {
        let message =
          error.response && error.response.data.error
            ? error.response.data.error
            : error.message;
        toast.error(t(message));
        setLoading(false);
      });
  };

  return (
    <>
      <ToastContainer />
      <SignInLayout>
        <div className="w-full h-screen overflow-auto flex flex-col lg:justify-center items-end lg:items-center">
          <img src={COVER4} className="lg:hidden w-full" />
          <form
            onSubmit={handleSubmit(onSubmit)}
            autoComplete="off"
            className="-mt-28 py-10 rounded-t-3xl bg-white flex w-full lg:max-w-150 flex-col justify-center gap-6 px-4"
          >
            <h1 className="text-4xl font-bold text-black text-center mb-10">
              {t('signin.title')}
            </h1>
            <div className="">
              <input
                type="text"
                className="bg-black px-4 py-3 shadow-xl rounded-lg w-full text-white"
                placeholder={t('signin.emailPlaceholder')}
                {...register('code', {
                  required: t('signin.emailRequired'),
                })}
              />
              <p className="text-red-500 mt-1 text-sm">
                {errors.code?.message}
              </p>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="bg-black px-4 shadow-xl py-3 rounded-lg w-full text-white"
                placeholder={t('signin.passwordPlaceholder')}
                {...register('password', {
                  required: t('signin.passwordRequired'),
                  pattern: {
                    value: /^(?=.*?[a-z])(?=.*?[0-9]).{8,}$/,
                    message: t('signin.passwordPattern'),
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
            <div className="flex justify-between">
              <div className="flex gap-2">
                <input type="checkbox" id="remember" />
                <label htmlFor="remember" className="text-black font-medium">
                  {t('signin.rememberMe')}
                </label>
              </div>
              <Link
                to="/forgot-password"
                className="text-NoExcuseChallenge font-medium hover:underline"
              >
                {t('signin.forgotPassword')}
              </Link>
            </div>
            <button
              type="submit"
              className="font-semibold rounded-3xl border py-4 border-black text-black hover:bg-black hover:text-white duration-100 ease-linear"
            >
              {t('signin.confirm')}
            </button>
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
              {t('signin.backToHomepage')}
            </Link>
          </form>
          <div className="lg:hidden w-full bg-black text-NoExcuseChallenge text-center py-2">
            © 2024, made with by <span className="font-bold">NoExcuseChallenge.</span>
          </div>
        </div>
      </SignInLayout>
    </>
  );
};

export default SignInPage;
