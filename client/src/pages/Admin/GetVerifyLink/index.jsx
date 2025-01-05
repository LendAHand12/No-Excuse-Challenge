import Auth from '@/api/Auth';
import Loading from '@/components/Loading';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast, ToastContainer } from 'react-toastify';
import DefaultLayout from '@/layout/DefaultLayout';

const GetVerifyLinkPage = () => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState('');

  const onSubmit = async (data) => {
    const { code } = data;
    await Auth.getLinkVerify({ email: code })
      .then((response) => {
        setUrl(response.data.url);
        setLoading(false);
      })
      .catch((error) => {
        console.log({ error });
        let message =
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message;
        toast.error(t(message));
        setLoading(false);
      });
  };

  return (
    <DefaultLayout>
      <ToastContainer />
      <div className="text-gray-900 flex justify-center bg-white">
        <div className="max-w-screen-xl m-0 sm:m-10 flex justify-center flex-1">
          <div className="w-full p-12">
            <div className="mt-12 flex flex-col items-center">
              <h1 className="text-2xl xl:text-3xl font-extrabold">
                {t('linkVerify')}
              </h1>
              <div className="w-full flex-1 mt-8">
                <form
                  className="mx-auto max-w-xl"
                  onSubmit={handleSubmit(onSubmit)}
                  autoComplete="off"
                >
                  <input
                    className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                    type="text"
                    placeholder="Email"
                    {...register('code', {
                      required: 'Email is required',
                    })}
                  />
                  <p className="error-message-text">{errors.code?.message}</p>
                  <button
                    type="submit"
                    className="w-full flex justify-center items-center hover:underline bg-black text-white font-bold rounded-full my-6 py-4 px-8 shadow-lg focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out"
                  >
                    {loading && <Loading />}
                    {t('confirm')}
                  </button>
                  <div className="mx-auto max-w-xs text-center break-words">
                    {url}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default GetVerifyLinkPage;
