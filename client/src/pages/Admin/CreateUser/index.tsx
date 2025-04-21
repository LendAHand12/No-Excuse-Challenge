import { useCallback, useEffect, useState } from 'react';

import User from '@/api/User';
import Loading from '@/components/Loading';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import DefaultLayout from '../../../layout/DefaultLayout';
import './index.css';
import UploadFile from '../UserProfile/UploadInfo';
import Select from 'react-select';

const CreateUser = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [phone, setPhone] = useState('');
  const [errorPhone, setErrPhone] = useState(false);
  const [listChildTier1, setListChildTier1] = useState([]);
  const [listChildTier2, setListChildTier2] = useState([]);
  const [loading, setLoading] = useState(false);
  const [parentTier1, setParentTier1] = useState('');
  const [parentTier2, setParentTier2] = useState('');
  const [errorParentIdTier1, setErrorParentIdTier1] = useState(false);
  const [errorParentIdTier2, setErrorParentIdTier2] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      tier: 2,
    },
  });

  useEffect(() => {
    (async () => {
      setLoading(true);
      await User.getListChildForCreateAdmin()
        .then((response) => {
          setListChildTier1([...response.data.resultTier1]);
          setListChildTier2([...response.data.resultTier2]);
          setLoading(false);
        })
        .catch((error) => {
          let message =
            error.response && error.response.data.error
              ? error.response.data.error
              : error.message;
          toast.error(t(message));
          setLoading(false);
        });
    })();
  }, []);

  const onSubmit = useCallback(
    async (values) => {
      if (phone === '') {
        setErrPhone(true);
        return;
      }
      if (parentTier1 === '') {
        setErrorParentIdTier1(true);
        return;
      }
      if (parentTier2 === '') {
        setErrorParentIdTier2(true);
        return;
      }

      var formData = new FormData();

      const { imgFront } = values;
      const [fileObjectImgFront] = imgFront;

      const { imgBack } = values;
      const [fileObjectImgBack] = imgBack;

      formData.append('imgFront', fileObjectImgFront);
      formData.append('imgBack', fileObjectImgBack);
      formData.append('email', values.email);
      formData.append('idCode', values.idCode);
      formData.append('password', values.password);
      formData.append('userId', values.userId);
      formData.append('walletAddress', values.walletAddress);
      formData.append('parentTier1', parentTier1);
      formData.append('parentTier2', parentTier2);

      setLoadingUpdate(true);
      await User.createUser(formData)
        .then((response) => {
          setLoadingUpdate(false);
          toast.success(t(response.data.message));
          navigate('/admin/users');
        })
        .catch((error) => {
          let message =
            error.response && error.response.data.message
              ? error.response.data.message
              : error.message;
          toast.error(t(message));
          setLoadingUpdate(false);
        });
    },
    [phone, parentTier1, parentTier2],
  );

  return (
    <DefaultLayout>
      <ToastContainer />
      <div className="py-24 px-10">
        <div className="container mx-auto">
          <h1 className="text-center mb-10 text-2xl font-semibold uppercase">
            create new user tier 2
          </h1>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="md:flex no-wrap md:-mx-2"
          >
            <div className="w-full lg:w-3/5 lg:mx-auto">
              <div className="bg-white">
                <div className="text-gray-700">
                  <div className="grid grid-cols-1 gap-4 text-sm">
                    <div className="grid lg:grid-cols-2 grid-cols-1">
                      <div className="px-4 py-2 font-semibold text-lg">
                        {t('user name')}
                      </div>
                      <div className="px-4">
                        <input
                          className="w-full px-4 py-2 rounded-md border border-gray-300 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                          {...register('userId', {
                            required: t('User ID is required'),
                          })}
                          autoComplete="off"
                        />
                        <p className="text-red-500 text-sm mt-1">
                          {errors.userId?.message}
                        </p>
                      </div>
                    </div>
                    <div className="grid lg:grid-cols-2 grid-cols-1">
                      <div className="px-4 py-2 font-semibold text-lg">
                        Email
                      </div>
                      <div className="px-4">
                        <input
                          className="w-full px-4 py-2 rounded-md border border-gray-300 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                          {...register('email', {
                            required: t('Email is required'),
                          })}
                          autoComplete="off"
                        />
                        <p className="text-red-500 text-sm mt-1">
                          {errors.email?.message}
                        </p>
                      </div>
                    </div>
                    <div className="grid lg:grid-cols-2 grid-cols-1">
                      <div className="px-4 py-2 font-semibold text-lg">
                        {t('phone')}
                      </div>
                      <div className="px-4 py-2">
                        <PhoneInput
                          defaultCountry="VN"
                          placeholder={t('phone')}
                          value={phone}
                          onChange={setPhone}
                        />
                        <p className="text-red-500 text-sm mt-1">
                          {errorPhone && t('Phone is required')}
                        </p>
                      </div>
                    </div>
                    <div className="grid lg:grid-cols-2 grid-cols-1">
                      <div className="px-4 py-2 font-semibold text-lg">
                        {t('id code')}
                      </div>
                      <div className="px-4">
                        <input
                          className="w-full px-4 py-2 rounded-md border border-gray-300 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                          {...register('idCode', {
                            required: t('id code is required'),
                          })}
                          autoComplete="off"
                        />
                        <p className="text-red-500 text-sm mt-1">
                          {errors.idCode?.message}
                        </p>
                      </div>
                    </div>
                    <div className="grid lg:grid-cols-2 grid-cols-1">
                      <div className="px-4 py-2 font-semibold text-lg">
                        {t('walletAddress')}
                      </div>
                      <div className="px-4">
                        <input
                          className="w-full px-4 py-2 rounded-md border border-gray-300 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                          {...register('walletAddress', {
                            required: t('Wallet address is required'),
                            pattern: {
                              value: /^0x[a-fA-F0-9]{40}$/g,
                              message: t(
                                'Please enter the correct wallet format',
                              ),
                            },
                          })}
                          autoComplete="off"
                        />
                        <p className="text-red-500 text-sm mt-1">
                          {errors.walletAddress?.message}
                        </p>
                      </div>
                    </div>
                    <div className="grid lg:grid-cols-2 grid-cols-1">
                      <div className="px-4 py-2 font-semibold text-lg">
                        Tier
                      </div>
                      <div className="px-4">
                        <input
                          className="w-full px-4 py-2 rounded-md border border-gray-300 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                          {...register('tier', {
                            required: t('tier is required'),
                          })}
                          min={2}
                          max={5}
                          type="number"
                          autoComplete="off"
                        />
                        <p className="text-red-500 text-sm mt-1">
                          {errors.tier?.message}
                        </p>
                      </div>
                    </div>
                    <div className="grid lg:grid-cols-2 grid-cols-1">
                      <div className="px-4 py-2 font-semibold text-lg">
                        Parent tier 1
                      </div>
                      <div className="px-4">
                        <Select
                          options={listChildTier1.map((ele) => ({
                            value: ele.id,
                            label: ele.userName,
                          }))}
                          onChange={(e) => {
                            setParentTier1(e.value);
                          }}
                          className="w-full mb-1 text-black rounded-md focus:outline-none cursor-pointer"
                        />
                        <p className="text-red-500 text-sm mt-1">
                          {errorParentIdTier1 && 'Parent tier 1 ID is required'}
                        </p>
                      </div>
                    </div>
                    <div className="grid lg:grid-cols-2 grid-cols-1">
                      <div className="px-4 py-2 font-semibold text-lg">
                        Parent tier 2
                      </div>
                      <div className="px-4">
                        <Select
                          options={listChildTier2.map((ele) => ({
                            value: ele.id,
                            label: ele.userName,
                          }))}
                          onChange={(e) => {
                            setParentTier2(e.value);
                          }}
                          className="w-full mb-1 text-black rounded-md focus:outline-none cursor-pointer"
                        />
                        <p className="text-red-500 text-sm mt-1">
                          {errorParentIdTier2 && 'Parent tier 2 ID is required'}
                        </p>
                      </div>
                    </div>
                    <div className="grid lg:grid-cols-2 grid-cols-1">
                      <div className="px-4 py-2 font-semibold text-lg">
                        {t('password')}
                      </div>
                      <div className="px-4">
                        <input
                          className="w-full px-4 py-2 rounded-md border border-gray-300 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                          type="text"
                          {...register('password', {
                            required: t('Password is required'),
                            pattern: {
                              value: /^(?=.*?[a-z])(?=.*?[0-9]).{8,}$/,
                              message: t(
                                'Password must contain at least 8 characters and a number',
                              ),
                            },
                          })}
                          disabled={loadingUpdate}
                        />
                        <p className="text-red-500 text-sm mt-1">
                          {errors.password?.message}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-center my-4">
                      <div className="w-full">
                        <div className="m-4">
                          <div className="font-semibold mb-4 text-lg">
                            {t('idCardFront')}
                          </div>
                          <div className="flex flex-col items-center justify-center w-full">
                            <UploadFile
                              register={register}
                              watch={watch}
                              required={false}
                              imgSrc={''}
                              userStatus="PENDING"
                              name="imgFront"
                              isEdit={true}
                            />
                            <p className="text-red-500 text-sm mt-1">
                              {errors.imgFrontData?.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-center my-4">
                      <div className="w-full">
                        <div className="m-4">
                          <div className="font-semibold mb-4 text-lg">
                            {t('idCardBack')}
                          </div>
                          <div className="flex flex-col items-center justify-center w-full">
                            <UploadFile
                              register={register}
                              watch={watch}
                              required={false}
                              name="imgBack"
                              userStatus={'PENDING'}
                              isEdit={true}
                            />
                            <p className="text-red-500 text-sm mt-1">
                              {errors.imgBackData?.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loadingUpdate}
                  className="w-full flex justify-center items-center hover:underline bg-black text-NoExcuseChallenge font-bold rounded-full my-6 py-4 px-8 shadow-lg focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out"
                >
                  {loadingUpdate && <Loading />}
                  Create
                </button>
                <button
                  // onClick={() => setEditting(false)}
                  className="w-full flex justify-center items-center hover:underline border font-bold rounded-full my-6 py-4 px-8 shadow-lg focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out"
                >
                  {t('cancel')}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default CreateUser;
