import { useCallback, useEffect, useState } from 'react';

import User from '@/api/User';
import FsLightbox from 'fslightbox-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ToastContainer, toast } from 'react-toastify';
import Loading from '@/components/Loading';
import PhoneInput from 'react-phone-number-input';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { useNavigate } from 'react-router-dom';
import Switch from 'react-switch';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import DefaultLayout from '../../../layout/DefaultLayout';
import USER_RANKINGS from '@/constants/userRankings';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { adjustSales } from '../../../utils';
import UploadFile from './UploadInfo';

const UserProfile = () => {
  const { pathname } = useLocation();
  const id = pathname.split('/')[3];
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [data, setData] = useState({});
  const [toggler, setToggler] = useState(false);
  const [isEditting, setEditting] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [packageOptions, setPackageOptions] = useState([]);
  const [currentOpenLah, setCurrentOpenLah] = useState(null);
  const [currentCloseLah, setCurrentCloseLah] = useState(null);
  const [phone, setPhone] = useState('');
  const [errorPhone, setErrPhone] = useState(false);
  const [loadingUploadFileFront, setLoadingUploadFileFront] = useState(false);
  const [loadingUploadFileBack, setLoadingUploadFileBack] = useState(false);
  const [imgFront, setImgFront] = useState('');
  const [imgBack, setImgBack] = useState('');
  const [totalChild, setTotalChild] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [targetSales, setTargetSales] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm();

  useEffect(() => {
    (async () => {
      await User.getUserById(id)
        .then((response) => {
          setLoading(false);
          setData(response.data);
          const {
            userId,
            email,
            phone,
            idCode,
            walletAddress,
            tier,
            openLah,
            closeLah,
            chartData,
            targetSales,
          } = response.data;
          setValue('userId', userId);
          setValue('email', email);
          setPhone(phone);
          setValue('idCode', idCode);
          setValue('tier', tier);
          setValue('walletAddress', walletAddress);
          setCurrentOpenLah(openLah);
          setCurrentCloseLah(closeLah);
          setTotalChild(
            adjustSales(chartData, targetSales).reduce(
              (acc, num) => acc + num,
              0,
            ),
          );
          setChartData(chartData);
          setTargetSales(targetSales);
        })
        .catch((error) => {
          let message =
            error.response && error.response.data.message
              ? error.response.data.message
              : error.message;
          toast.error(t(message));
        });
    })();
  }, [id, refresh]);

  const onSubmit = useCallback(
    async (values) => {
      if (phone === '') {
        setErrPhone(true);
        return;
      }
      var formData = new FormData();

      const { imgFront } = values;
      const [fileObjectImgFront] = imgFront;

      const { imgBack } = values;
      const [fileObjectImgBack] = imgBack;

      if (values.userId !== data.userId) {
        formData.append('userId', values.userId);
      }
      if (values.note !== data.note) {
        formData.append('note', values.note);
      }
      if (values.email !== data.email) {
        formData.append('email', values.email);
      }
      if (data.phone !== phone) {
        formData.append('phone', phone);
      }
      if (values.idCode !== data.idCode) {
        formData.append('idCode', values.idCode);
      }
      if (values.tier !== data.tier) {
        formData.append('tier', values.tier);
      }
      if (values.walletAddress !== data.walletAddress) {
        formData.append('walletAddress', values.walletAddress);
      }
      if (currentOpenLah !== data.openLah) {
        formData.append('openLah', currentOpenLah);
      }
      if (currentCloseLah !== data.closeLah) {
        formData.append('closeLah', currentCloseLah);
      }
      if (imgFront) {
        formData.append('imgFront', fileObjectImgFront);
      }
      if (imgBack) {
        formData.append('imgBack', fileObjectImgBack);
      }
      if (values.newStatus !== data.status) {
        formData.append('newStatus', values.newStatus);
      }
      if (values.newFine !== data.fine) {
        formData.append('newFine', values.newFine);
      }

      if (values.hold !== data.hold) {
        formData.append('hold', values.hold);
      }

      if (values.availableHewe !== data.availableHewe) {
        formData.append('availableHewe', values.availableHewe);
      }

      if (values.availableUsdt !== data.availableUsdt) {
        formData.append('availableUsdt', values.availableUsdt);
      }

      if (values.holdLevel !== data.holdLevel) {
        formData.append('holdLevel', values.holdLevel);
      }

      setLoadingUpdate(true);
      await User.adminUpdateUser(id, formData)
        .then((response) => {
          setLoadingUpdate(false);
          toast.success(t(response.data.message));
          setRefresh(!refresh);
          setEditting(false);
        })
        .catch((error) => {
          let message =
            error.response && error.response.data.message
              ? error.response.data.message
              : error.message;
          toast.error(t(message));
          setLoadingUpdate(false);
          setEditting(false);
        });
    },
    [data, currentCloseLah, currentOpenLah, phone],
  );

  const handleDeleteUser = async (onClose) => {
    setLoadingDelete(true);
    onClose();
    toast.warning(t('deleting'));
    await User.deleteUserById(id)
      .then((response) => {
        const { message } = response.data;
        setLoadingDelete(false);
        toast.success(t(message));
        navigate('/admin/users');
      })
      .catch((error) => {
        let message =
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message;
        toast.error(t(message));
        setLoadingDelete(false);
      });
  };

  const handleDelete = useCallback(async () => {
    confirmAlert({
      closeOnClickOutside: true,
      customUI: ({ onClose }) => {
        return (
          <div className="custom-ui">
            <div className="relative p-4 w-full max-w-md h-full md:h-auto mb-40">
              <div className="relative p-4 text-center bg-gray-100 rounded-lg shadow-lg sm:p-5">
                <button
                  onClick={onClose}
                  disabled={loadingDelete}
                  className="text-gray-400 absolute top-2.5 right-2.5 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
                >
                  <svg
                    aria-hidden="true"
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
                <svg
                  className="text-gray-400 dark:text-gray-500 w-11 h-11 mb-3.5 mx-auto"
                  aria-hidden="true"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <p className="mb-4 text-gray-500">
                  {t('Are you sure to do this.')}
                </p>
                <div className="flex justify-center items-center space-x-4">
                  <button
                    onClick={onClose}
                    disabled={loadingDelete}
                    className="py-2 px-3 text-sm font-medium text-gray-500 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-primary-300 hover:text-gray-900 focus:z-10 "
                  >
                    {t('cancel')}
                  </button>
                  <button
                    onClick={() => handleDeleteUser(onClose)}
                    className="flex items-center py-2 px-3 text-sm font-medium text-center text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 "
                  >
                    {loadingDelete && <Loading />}
                    {t('delete')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      },
    });
  }, [loadingDelete]);

  useEffect(() => {
    if (data.countPay === 0) {
      setPackageOptions(['A', 'B', 'C']);
    } else {
      // if (data.buyPackage === "A") {
      //   setPackageOptions([]);
      // } else if (data.buyPackage === "B") {
      //   if (data.countPay === 7) {
      //     setPackageOptions(["B", "C"]);
      //   }
      // } else if (data.buyPackage === "C") {
      //   if (data.countPay === 7) {
      //     setPackageOptions(["B", "C"]);
      //   }
      // }
      setPackageOptions([data.buyPackage]);
    }
  }, [data]);

  const handleChangeOpenLah = useCallback(
    () => setCurrentOpenLah(!currentOpenLah),
    [currentOpenLah],
  );

  const handleChangeCloseLah = useCallback(
    () => setCurrentCloseLah(!currentCloseLah),
    [currentCloseLah],
  );

  return (
    <DefaultLayout>
      <ToastContainer />
      {!loading && (
        <div className="container mx-10 my-24">
          <form onSubmit={handleSubmit(onSubmit)} className="md:flex no-wrap">
            <div className="w-full lg:w-3/12 lg:mx-2 mb-4 lg:mb-0">
              <div className="bg-white shadow-md p-3 border-t-4 border-NoExcuseChallenge">
                <ul className=" text-gray-600 py-2 px-3 mt-3 divide-y rounded">
                  <li className="flex items-center py-3">
                    <span>{t('status')}</span>
                    <span className="ml-auto">
                      {isEditting ? (
                        <select
                          className="block p-2 pr-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none active:outline-none"
                          {...register('newStatus')}
                          defaultValue={data.status}
                          disabled={loadingUpdate}
                        >
                          <option value="UNVERIFY">Unverify</option>
                          <option value="APPROVED">Approved</option>
                          <option value="LOCKED">Locked</option>
                        </select>
                      ) : (
                        <span
                          className={`${
                            data.status === 'UNVERIFY'
                              ? 'bg-red-600'
                              : data.status === 'PENDING'
                              ? 'bg-yellow-600'
                              : data.status === 'APPROVED'
                              ? 'bg-green-600'
                              : data.status === 'REJECTED'
                              ? 'bg-red-600'
                              : data.status === 'LOCKED'
                              ? 'bg-red-600'
                              : data.status === 'DELETED'
                              ? 'bg-red-600'
                              : ''
                          }  py-1 px-2 rounded text-white text-sm`}
                        >
                          {t(data.status)}
                        </span>
                      )}
                    </span>
                  </li>
                  <li className="flex items-center py-3">
                    <span>Hold Tier</span>
                    <span className="ml-auto">
                      {isEditting ? (
                        <select
                          className="block p-2 pr-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none active:outline-none"
                          {...register('hold')}
                          defaultValue={data.hold}
                          disabled={loadingUpdate}
                        >
                          <option value="no">{t('no')}</option>
                          <option value={1}>Tier 1</option>
                          <option value={2}>Tier 2</option>
                          <option value={3}>Tier 3</option>
                          <option value={4}>Tier 4</option>
                          <option value={5}>Tier 5</option>
                        </select>
                      ) : (
                        <span className={`py-1 px-2 text-sm`}>
                          {data.hold === 'no' ? t('no') : data.hold}
                        </span>
                      )}
                    </span>
                  </li>
                  <li className="flex items-center py-3">
                    <span>{t('holdLevel')}</span>
                    <span className="ml-auto">
                      {isEditting ? (
                        <select
                          className="block p-2 pr-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none active:outline-none"
                          {...register('holdLevel')}
                          defaultValue={data.holdLevel}
                          disabled={loadingUpdate}
                        >
                          <option value="no">{t('no')}</option>
                          <option value={0}>{t('level')} 0</option>
                          <option value={1}>{t('level')} 1</option>
                          <option value={2}>{t('level')} 2</option>
                          <option value={3}>{t('level')} 3</option>
                          <option value={4}>{t('level')} 4</option>
                          <option value={5}>{t('level')} 5</option>
                          <option value={6}>{t('level')} 6</option>
                          <option value={7}>{t('level')} 7</option>
                          <option value={8}>{t('level')} 8</option>
                          <option value={9}>{t('level')} 9</option>
                          <option value={10}>{t('level')} 10</option>
                          <option value={11}>{t('level')} 11</option>
                          <option value={12}>{t('level')} 12</option>
                        </select>
                      ) : (
                        <span className={`py-1 px-2 text-sm`}>
                          {data.holdLevel === 'no' ? t('no') : data.holdLevel}
                        </span>
                      )}
                    </span>
                  </li>
                  {isEditting && (
                    <>
                      <li className="flex items-center py-3">
                        <span>{t('openLah')}</span>
                        <span className="ml-auto">
                          <Switch
                            checked={currentOpenLah}
                            onChange={handleChangeOpenLah}
                          />
                        </span>
                      </li>
                      <li className="flex items-center py-3">
                        <span>{t('closeLah')}</span>
                        <span className="ml-auto">
                          <Switch
                            checked={currentCloseLah}
                            onChange={handleChangeCloseLah}
                          />
                        </span>
                      </li>
                    </>
                  )}
                  {data.status === 'LOCKED' && (
                    <li className="flex items-center py-3">
                      <span>{t('lockedTime')}</span>
                      <span className="ml-auto">
                        {new Date(data.lockedTime).toLocaleDateString('vi')}
                      </span>
                    </li>
                  )}
                  {data.status === 'DELETED' && (
                    <li className="flex items-center py-3">
                      <span>{t('deletedTime')}</span>
                      <span className="ml-auto">
                        {new Date(data.deletedTime).toLocaleDateString('vi')}
                      </span>
                    </li>
                  )}
                  <li className="flex items-center py-3">
                    <span>{t('memberSince')}</span>
                    <span className="ml-auto">
                      {new Date(data.createdAt).toLocaleDateString('vi')}
                    </span>
                  </li>
                  <li className="flex items-center py-3">
                    <span>{t('tier1Time')}</span>
                    <span className="ml-auto">
                      {data.tier1Time
                        ? new Date(data.tier1Time).toLocaleDateString('vi')
                        : ''}
                    </span>
                  </li>
                  <li className="flex items-center py-3">
                    <span>{t('tier2Time')}</span>
                    <span className="ml-auto">
                      {data.tier2Time
                        ? new Date(data.tier2Time).toLocaleDateString('vi')
                        : ''}
                    </span>
                  </li>
                  <li className="flex items-center py-3">
                    <span>{t('tier3Time')}</span>
                    <span className="ml-auto">
                      {data.tier3Time
                        ? new Date(data.tier3Time).toLocaleDateString('vi')
                        : ''}
                    </span>
                  </li>
                  <li className="flex items-center py-3">
                    <span>{t('tier4Time')}</span>
                    <span className="ml-auto">
                      {data.tier4Time
                        ? new Date(data.tier4Time).toLocaleDateString('vi')
                        : ''}
                    </span>
                  </li>
                  <li className="flex items-center py-3">
                    <span>{t('tier5Time')}</span>
                    <span className="ml-auto">
                      {data.tier5Time
                        ? new Date(data.tier5Time).toLocaleDateString('vi')
                        : ''}
                    </span>
                  </li>
                  {data.changeUser && (
                    <>
                      <li className="flex items-center py-3">
                        <span>{t('old user name')}</span>
                        <span className="ml-auto">
                          {data.changeUser.oldUserName}
                        </span>
                      </li>
                      <li className="flex items-center py-3">
                        <span>{t('old email')}</span>
                        <span className="ml-auto">
                          {data.changeUser.oldEmail}
                        </span>
                      </li>
                      <li className="flex items-center py-3">
                        <span>{t('changeDate')}</span>
                        <span className="ml-auto">
                          {new Date(
                            data.changeUser.updatedAt,
                          ).toLocaleDateString('vi')}
                        </span>
                      </li>
                    </>
                  )}
                </ul>
              </div>
              <div className="mt-10 bg-white shadow-md p-3 border-t-4 border-NoExcuseChallenge">
                <p className="uppercase mt-2 font-bold">{t('children')}</p>
                <div className="py-2">
                  <ul>
                    {data.listDirectUser.map((ele) => (
                      <li
                        className="bg-white border-b hover:bg-gray-50"
                        key={ele._id}
                      >
                        <div className="py-2">
                          <div className="text-base">
                            <span
                              className={`${
                                ele.isGray
                                  ? 'bg-[#8c8c8c]'
                                  : ele.isRed
                                  ? 'bg-[#b91c1c]'
                                  : ele.isYellow
                                  ? 'bg-[#F4B400]'
                                  : 'bg-[#16a34a]'
                              } py-1 px-2 rounded text-white text-sm`}
                            >
                              {ele.userId}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mt-10 bg-white shadow-md p-3 border-t-4 border-NoExcuseChallenge">
                <p className="uppercase mt-2 font-bold">{t('refUserName')}</p>
                <div className="py-2">
                  <ul>
                    <li className="bg-white hover:bg-gray-50">
                      <div className="py-2">
                        <div className="text-base">
                          <span className="">
                            {data.refUserName}
                            <br></br>
                            <i className="text-xs">{data.refUserEmail}</i>
                          </span>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-10 bg-white shadow-md p-3 border-t-4 border-NoExcuseChallenge">
                <p className="uppercase mt-2 font-bold">{t('oldParent')}</p>
                {data.listOldParent.length > 0 && (
                  <div className="py-2">
                    <ul>
                      {data.listOldParent.map((ele) => (
                        <li className="bg-white hover:bg-gray-50" key={ele._id}>
                          <div className="py-2">
                            <div className="text-base">
                              <span className="">{ele.userId}</span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {/* <div className="py-10">
                <div className="max-w-sm">
                  <Doughnut
                    data={{
                      labels: [
                        'Group 1',
                        'Group 2',
                        'Group 3',
                        'Remaining target',
                      ],
                      datasets: [
                        {
                          label: 'Members',
                          data: [
                            ...adjustSales(chartData, targetSales),
                            targetSales - totalChild,
                          ],
                          backgroundColor: [
                            '#FFCF65',
                            '#02071B',
                            '#C1C9D3',
                            'red',
                          ],
                        },
                      ],
                    }}
                    plugins={[ChartDataLabels]}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'bottom' as const,
                        },
                        tooltip: {
                          enabled: false,
                        },
                        datalabels: {
                          color: '#ffffff',
                          anchor: 'center',
                          font: { size: 16, weight: 'bold' },
                          formatter: (value) => {
                            return value <= 0
                              ? ''
                              : Math.round((value / targetSales) * 100) + '%';
                          },
                        },
                      },
                    }}
                  />
                </div>
                <div className="w-full mt-6">
                  <ul className="flex flex-col items-center gap-3">
                    <li>
                      <span className="bg-[#FFCF65] px-2 py-1 text-sm">
                        Group 1 :
                      </span>{' '}
                      {chartData[0]} members
                    </li>
                    <li>
                      <span className="bg-[#02071B] text-white px-2 py-1 text-sm">
                        Group 2 :
                      </span>{' '}
                      {chartData[1]} members
                    </li>
                    <li>
                      <span className="bg-[#C1C9D3] px-2 py-1 text-sm">
                        Group 3 :
                      </span>{' '}
                      {chartData[2]} members
                    </li>
                  </ul>
                </div>
              </div> */}
            </div>
            <div className="w-full lg:w-2/3 lg:mx-2">
              <div className="bg-white p-6 shadow-md rounded-sm border-t-4 border-NoExcuseChallenge">
                <div className="text-gray-700">
                  <div className="grid grid-cols-1 text-sm">
                    <div className="grid lg:grid-cols-2 grid-cols-1">
                      <div className="px-4 py-2 font-semibold">
                        {t('user name')}
                      </div>
                      {isEditting ? (
                        <div className="px-4">
                          <input
                            className="w-full px-4 py-1.5 rounded-md border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                            {...register('userId', {
                              required: t('User ID is required'),
                            })}
                            autoComplete="off"
                          />
                          <p className="text-red-500 text-sm">
                            {errors.userId?.message}
                          </p>
                        </div>
                      ) : (
                        <div className="px-4 py-2">{data.userId}</div>
                      )}
                    </div>
                    <div className="grid lg:grid-cols-2 grid-cols-1">
                      <div className="px-4 py-2 font-semibold">Email</div>
                      {isEditting ? (
                        <div className="px-4">
                          <input
                            className="w-full px-4 py-1.5 rounded-md border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                            {...register('email', {
                              required: t('Email is required'),
                            })}
                            autoComplete="off"
                          />
                          <p className="text-red-500 text-sm">
                            {errors.email?.message}
                          </p>
                        </div>
                      ) : (
                        <div className="px-4 py-2">{data.email}</div>
                      )}
                    </div>
                    <div className="grid lg:grid-cols-2 grid-cols-1">
                      <div className="px-4 py-2 font-semibold">
                        {t('phone')}
                      </div>
                      <div className="py-2">
                        {isEditting ? (
                          <>
                            <PhoneInput
                              defaultCountry="VN"
                              placeholder={t('phone')}
                              value={phone}
                              onChange={setPhone}
                              className="-my-1 ml-4 w-full"
                            />
                            <p className="text-red-500 text-sm">
                              {errorPhone && t('Phone is required')}
                            </p>
                          </>
                        ) : (
                          <div className="px-4 py-2">{data.phone}</div>
                        )}
                      </div>
                    </div>
                    <div className="grid lg:grid-cols-2 grid-cols-1">
                      <div className="px-4 py-2 font-semibold">
                        {t('id code')}
                      </div>
                      {isEditting ? (
                        <div className="px-4">
                          <input
                            className="w-full px-4 py-1.5 rounded-md border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                            {...register('idCode', {
                              required: t('id code is required'),
                            })}
                            autoComplete="off"
                          />
                          <p className="text-red-500 text-sm">
                            {errors.idCode?.message}
                          </p>
                        </div>
                      ) : (
                        <div className="px-4 py-2">{data.idCode}</div>
                      )}
                    </div>
                    <div className="grid lg:grid-cols-2 grid-cols-1">
                      <div className="px-4 py-2 font-semibold">
                        {t('walletAddress')}
                      </div>
                      {isEditting ? (
                        <div className="px-4">
                          <input
                            className="w-full px-4 py-1.5 rounded-md border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
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
                          <p className="text-red-500 text-sm">
                            {errors.walletAddress?.message}
                          </p>
                        </div>
                      ) : (
                        <div className="px-4 py-2 break-words">
                          {data.walletAddress}
                        </div>
                      )}
                    </div>
                    <div className="grid lg:grid-cols-2 grid-cols-1">
                      <div className="px-4 py-2 font-semibold">
                        {t('isRegistered')}
                      </div>
                      <div className="px-4 py-2">
                        {isEditting && data.countPay === 0 && (
                          <div className="flex gap-4">
                            <input
                              type="radio"
                              {...register('isRegistered')}
                            ></input>
                            <p>Đã hoàn thành</p>
                          </div>
                        )}
                        {!isEditting || data.countPay >= 1
                          ? data.countPay >= 1
                            ? t('finished')
                            : t('unfinished')
                          : ''}
                      </div>
                    </div>
                    <div className="grid lg:grid-cols-2 grid-cols-1">
                      <div className="px-4 py-2 font-semibold">
                        {t('count pay')}
                      </div>
                      <div className="px-4 py-2">
                        {data.countPay === 0 ? 0 : data.countPay - 3}{' '}
                        {t('times')}
                      </div>
                    </div>
                    <div className="grid lg:grid-cols-2 grid-cols-1">
                      <div className="px-4 py-2 font-semibold">Tier</div>
                      {isEditting ? (
                        <div className="px-4">
                          <input
                            className="w-full px-4 py-1.5 rounded-md border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                            {...register('tier', {
                              required: t('tier is required'),
                            })}
                            autoComplete="off"
                          />
                          <p className="text-red-500 text-sm">
                            {errors.tier?.message}
                          </p>
                        </div>
                      ) : (
                        <div className="px-4 py-2">{data.tier}</div>
                      )}
                    </div>
                    <div className="grid lg:grid-cols-2 grid-cols-1">
                      <div className="px-4 py-2 font-semibold">
                        {t('buyPackage')}
                      </div>
                      <div className="px-4 py-2">
                        {!isEditting ? (
                          data.buyPackage
                        ) : (
                          <select
                            {...register('buyPackage')}
                            defaultValue={data.buyPackage}
                            disabled={loadingUpdate}
                            className="block p-2 pr-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none active:outline-none"
                          >
                            {packageOptions.map((item) => (
                              <option key={item} value={item}>
                                {item}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                    <div className="grid lg:grid-cols-2 grid-cols-1">
                      <div className="px-4 py-2 font-semibold">Rank</div>
                      <div className="px-4 py-2">
                        {data.countPay !== 0 && (
                          <div
                            className={`p-2 max-w-fit text-sm bg-green-600 text-white rounded-[50px]`}
                          >
                            {
                              USER_RANKINGS.find(
                                (ele) => ele.value === data.ranking,
                              ).label
                            }
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="grid lg:grid-cols-2 grid-cols-1">
                      <div className="px-4 py-2 font-semibold">
                        Available HEWE
                      </div>
                      {isEditting ? (
                        <div className="px-4">
                          <input
                            className="w-full px-4 py-1.5 rounded-md border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                            {...register('availableHewe', {
                              required: 'Available Hewe is required',
                            })}
                            defaultValue={data.availableHewe}
                          />
                        </div>
                      ) : (
                        <div className="px-4 py-2">{data.availableHewe}</div>
                      )}
                    </div>
                    <div className="grid lg:grid-cols-2 grid-cols-1">
                      <div className="px-4 py-2 font-semibold">Reward HEWE</div>
                      <div className="px-4 py-2">
                        {data.totalHewe - data.claimedHewe - data.availableHewe}
                      </div>
                    </div>
                    <div className="grid lg:grid-cols-2 grid-cols-1">
                      <div className="px-4 py-2 font-semibold">
                        Available USDT
                      </div>
                      {isEditting ? (
                        <div className="px-4">
                          <input
                            className="w-full px-4 py-1.5 rounded-md border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                            {...register('availableUsdt', {
                              required: 'Available Usdt is required',
                            })}
                            defaultValue={data.availableUsdt}
                          />
                        </div>
                      ) : (
                        <div className="px-4 py-2">{data.availableUsdt}</div>
                      )}
                    </div>
                    <div className="grid lg:grid-cols-2 grid-cols-1">
                      <div className="px-4 py-2 font-semibold">
                        Processing USDT
                      </div>
                      <div className="px-4 py-2">{data.withdrawPending}</div>
                    </div>
                    <div className="grid lg:grid-cols-2 grid-cols-1">
                      <div className="px-4 py-2 font-semibold">
                        Total Earned
                      </div>
                      <div className="px-4 py-2">{data.totalEarning}</div>
                    </div>
                    <div className="grid lg:grid-cols-2 grid-cols-1">
                      <div className="px-4 py-2 font-semibold">{t('fine')}</div>
                      {isEditting ? (
                        <div className="px-4">
                          <input
                            className="w-full px-4 py-1.5 rounded-md border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                            {...register('newFine', {
                              required: 'Fine is required',
                            })}
                            defaultValue={data.fine}
                          />
                        </div>
                      ) : (
                        <div className="px-4 py-2">{data.fine}</div>
                      )}
                    </div>
                    <div className="grid lg:grid-cols-2 grid-cols-1">
                      <div className="px-4 py-2 font-semibold">{t('note')}</div>
                      {isEditting ? (
                        <div className="px-4">
                          <textarea
                            className="w-full px-4 py-1.5 rounded-md border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                            {...register('note')}
                            autoComplete="off"
                            rows="3"
                          />
                          <p className="text-red-500 text-sm">
                            {errors.note?.message}
                          </p>
                        </div>
                      ) : (
                        <div className="px-4 py-2">{data.note}</div>
                      )}
                    </div>

                    <>
                      <div className="w-full flex justify-center">
                        <div className="w-full grid lg:grid-cols-2 gap-2 lg:gap-0 items-center py-2 px-4">
                          <p> {t('idCardFront')} :</p>
                          <div className="flex flex-col items-center justify-center w-full">
                            <UploadFile
                              register={register}
                              watch={watch}
                              required={false}
                              imgSrc={data.imgFront}
                              userStatus={data.status}
                              name="imgFront"
                              isEdit={isEditting}
                            />
                            <p className="text-red-500 text-sm">
                              {errors.imgFront?.message}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-center bg-[#E5E9EE] rounded-lg">
                        <div className="w-full grid lg:grid-cols-2 gap-2 lg:gap-0 items-center py-2 px-4">
                          <p> {t('idCardBack')} :</p>
                          <div className="flex items-center justify-center w-full">
                            <UploadFile
                              register={register}
                              watch={watch}
                              required={false}
                              name="imgBack"
                              imgSrc={data.imgBack}
                              userStatus={data.status}
                              isEdit={isEditting}
                            />
                            <p className="text-red-500 text-sm">
                              {errors.imgBack?.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  </div>
                </div>
                {/* {data.status === 'PENDING' && (
                  <>
                    <div
                      onClick={() => handleApprove(id)}
                      className="w-full cursor-pointer flex justify-center items-center hover:underline bg-green-600 text-white font-bold rounded-full my-2 py-2 px-6 shadow-lg focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out"
                    >
                      {t('accept')}
                    </div>
                  </>
                )} */}
                {isEditting && (
                  <>
                    <button
                      onClick={() => setEditting(true)}
                      disabled={loading}
                      className="w-full flex justify-center items-center hover:underline bg-black text-NoExcuseChallenge font-semibold rounded-full my-2 py-2 px-6 shadow-lg focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out"
                    >
                      {loading && <Loading />}
                      {t('update')}
                    </button>
                    <button
                      onClick={() => setEditting(false)}
                      className="w-full flex justify-center items-center hover:underline border font-bold rounded-full my-2 py-2 px-6 shadow-lg focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out"
                    >
                      {t('cancel')}
                    </button>
                  </>
                )}
                {!isEditting && data.status !== 'DELETED' && (
                  <button
                    onClick={() => setEditting(true)}
                    className="w-full flex justify-center items-center hover:underline text-NoExcuseChallenge bg-black font-bold rounded-full my-2 py-2 px-6 shadow-lg focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out"
                  >
                    {t('edit')}
                  </button>
                )}
                {!isEditting && data.status !== 'DELETED' && (
                  <div
                    onClick={handleDelete}
                    className="w-full flex justify-center items-center cursor-pointer hover:underline border font-bold rounded-full my-2 py-2 px-6 shadow-lg focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out bg-red-500 text-white"
                  >
                    {t('delete')}
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>
      )}
    </DefaultLayout>
  );
};

export default UserProfile;
