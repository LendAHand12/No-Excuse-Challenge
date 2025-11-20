import User from '@/api/User';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ToastContainer, toast } from 'react-toastify';
import moment from 'moment';
import { exportToExcel } from '@/utils/export';
import { Controller, useForm } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import DefaultLayout from '@/layout/DefaultLayout';

const ExportUsersPage = () => {
  const { t } = useTranslation();
  const {
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      tier: 2,
    },
  });

  const [loading, setLoading] = useState(false);
  const fromDate = watch('fromDate');
  const toDate = watch('toDate');
  const [minToDate, setMinToDate] = useState(null);
  const [maxFromDate, setMaxFromDate] = useState(null);
  const [errorDate, setErrorDate] = useState(false);

  const exportUsers = async (values) => {
    const limit = 200;
    const body = { page: 1, limit };
    if (values.fromDate && values.toDate) {
      const fromDate = moment(values.fromDate);
      const toDate = moment(values.toDate);
      if (toDate < fromDate) {
        setErrorDate(true);
        return;
      } else {
        body.fromDate = fromDate;
        body.toDate = toDate;
      }
    } else if (values.fromDate) {
      const fromDate = moment(values.fromDate);
      body.fromDate = fromDate;
    } else if (values.toDate) {
      const toDate = moment(values.toDate);
      body.toDate = toDate;
    }
    let exportData = [];

    setLoading(true);

    const fetchData = async () => {
      try {
        const initialResponse = await getData(body);
        const { result } = initialResponse;
        exportData = result;
        const totalCount = initialResponse.totalCount;

        if (totalCount > result.length) {
          const totalPage = Math.ceil(totalCount / limit);
          const temporaryArray = [];

          for (let page = 2; page <= totalPage; page++) {
            const pageResponse = await getData({ ...body, page: page });
            const pageResult = pageResponse.result;
            temporaryArray.push(...pageResult);
          }

          exportData = [...exportData, ...temporaryArray];
        }

        const excelData = convertResponseDataToExportData(exportData, {
          [t('name')]: null,
          [t('email')]: null,
          [t('phone')]: null,
          [t('idCode')]: null,
          [t('walletAddress')]: null,
          [t('createdAt')]: null,
          [t('tier')]: null,
          [t('status')]: null,
          [t('bankName')]: null,
          [t('bankAccount')]: null,
          [t('refUserName')]: null,
          [t('note')]: null,
        });
        exportToExcel(
          excelData,
          `${t('usersListFileName')}_${moment().format('DD/MM/YYYY_HH:mm:ss')}`,
        );
        setLoading(false);
        toast.success(t('export successful'));
      } catch (error) {
        console.error('Error fetching data: ', error);
        setLoading(false);
      }
    };

    fetchData();
  };

  const convertResponseDataToExportData = (responseData, nullObj) => {
    return responseData.map((item, i) => {
      // Format createdAt
      const createdAtDisplay = item.createdAt
        ? new Date(item.createdAt).toLocaleString()
        : '';

      // Format status
      const statusDisplay = item.status ? t(item.status) : '';

      // Format tier
      const tierDisplay = item.tier ? String(item.tier) : '';

      return {
        [t('name')]: item.name || '',
        [t('email')]: item.email || '',
        [t('phone')]: item.phone || '',
        [t('idCode')]: item.idCode || '',
        [t('walletAddress')]: item.walletAddress || '',
        [t('createdAt')]: createdAtDisplay,
        [t('tier')]: tierDisplay,
        [t('status')]: statusDisplay,
        [t('bankName')]: item.bankName || '',
        [t('bankAccount')]: item.bankAccount || '',
        [t('refUserName')]: item.refUserName || '',
        [t('note')]: item.note || '',
      };
    });
  };

  const getData = async (body) => {
    try {
      return await User.getAllUsersForExport(body).then((response) => {
        return response.data;
      });
    } catch (error) {
      let message =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      toast.error(t(message));
    }
  };

  useEffect(() => {
    if (fromDate) {
      setMinToDate(fromDate);
    } else {
      setMinToDate(null);
    }

    if (toDate && !fromDate) {
      setMaxFromDate(toDate);
    } else {
      setMaxFromDate(null);
    }
  }, [fromDate, toDate]);

  return (
    <DefaultLayout>
      <ToastContainer />
      <div className="py-24 px-10">
        <div class="mx-auto sm:container mb-10">
          <div>
            <h2 class="text-dark mb-2 text-2xl font-semibold dark:text-white">
              Export User List
            </h2>
            <p class="text-body-color dark:text-dark-6 text-sm font-medium">
              Download and manage the list of registered users in Excel format
              for reporting and administrative purposes.
            </p>
          </div>
        </div>
        {loading && (
          <div
            className="flex items-center gradient text-white text-sm px-4 py-3 mb-4"
            role="alert"
          >
            <svg
              className="fill-current w-4 h-4 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M12.432 0c1.34 0 2.01.912 2.01 1.957 0 1.305-1.164 2.512-2.679 2.512-1.269 0-2.009-.75-1.974-1.99C9.789 1.436 10.67 0 12.432 0zM8.309 20c-1.058 0-1.833-.652-1.093-3.524l1.214-5.092c.211-.814.246-1.141 0-1.141-.317 0-1.689.562-2.502 1.117l-.528-.88c2.572-2.186 5.531-3.467 6.801-3.467 1.057 0 1.233 1.273.705 3.23l-1.391 5.352c-.246.945-.141 1.271.106 1.271.317 0 1.357-.392 2.379-1.207l.6.814C12.098 19.02 9.365 20 8.309 20z" />
            </svg>
            <p>{t('Getting data')}...</p>
          </div>
        )}
        <form onSubmit={handleSubmit(exportUsers)} className="">
          <div className="flex items-center gap-10">
            <Controller
              control={control}
              name="fromDate"
              render={({ field }) => (
                <DatePicker
                  placeholderText={t('fromDate')}
                  onChange={(date) => field.onChange(date)}
                  selected={field.value}
                  dateFormat="dd/MM/yyyy"
                  maxDate={maxFromDate ? new Date(maxFromDate) : null}
                  className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                />
              )}
            />
            <span>-</span>
            <Controller
              control={control}
              name="toDate"
              render={({ field }) => (
                <DatePicker
                  placeholderText={t('toDate')}
                  onChange={(date) => field.onChange(date)}
                  selected={field.value}
                  dateFormat="dd/MM/yyyy"
                  minDate={minToDate ? new Date(minToDate) : null}
                  className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                />
              )}
            />
          </div>
          {errorDate && (
            <p className="error-message-text">
              {t('From date must be less than to date')}
            </p>
          )}
          <button
            type="submit"
            className="flex justify-center items-center hover:underline bg-black text-NoExcuseChallenge font-bold rounded-md my-6 py-2 px-6 shadow-lg focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out"
          >
            Export
          </button>
        </form>
      </div>
    </DefaultLayout>
  );
};

export default ExportUsersPage;
