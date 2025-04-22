import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ToastContainer, toast } from 'react-toastify';
import moment from 'moment';
import { exportToExcel } from '@/utils/export';
import Admin from '@/api/Admin';
import { Controller, useForm } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import { useSelector } from 'react-redux';
import DefaultLayout from '@/layout/DefaultLayout';
import Loading from '@/components/Loading';

const ExportWithdrawPage = () => {
  const { t } = useTranslation();
  const { userInfo } = useSelector((state) => state.auth);
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
  const fromDate = watch('fromDate');
  const toDate = watch('toDate');
  const [loading, setLoading] = useState(false);
  const [minToDate, setMinToDate] = useState(null);
  const [maxFromDate, setMaxFromDate] = useState(null);
  const [errorDate, setErrorDate] = useState(false);

  const exportWithdraws = async (values) => {
    const limit = 100;
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
        console.log({result});
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
          [t('order')]: null,
          [t('user')]: null,
          [t('email')]: null,
          [t('amount')]: null,
          [t('status')]: null,
          [t('hash')]: null,
        });
        exportToExcel(
          excelData,
          `Danh_sach_withdraws_${moment().format('DD/MM/YYYY_HH:mm:ss')}`,
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
      item.order = i + 1;
      return Object.assign(
        { ...nullObj },
        Object.fromEntries(
          Object.entries(item).map(([key, value]) => [t(`${key}`), value]),
        ),
      );
    });
  };

  const getData = async (body) => {
    try {
      return await Admin.exportWithdraw(body).then((response) => {
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
      <div className="px-10 py-24">
        <div className="mx-auto sm:container mb-10">
          <div>
            <h2 className="text-dark mb-2 text-2xl font-semibold dark:text-white">
              Export Withdraw List
            </h2>
            <p className="text-body-color dark:text-dark-6 text-sm font-medium">
              Download and manage the list of withdraw in Excel format for
              reporting and administrative purposes.
            </p>
          </div>
        </div>
        <form onSubmit={handleSubmit(exportWithdraws)} className="">
          <div className="flex items-center gap-10 lg:w-1/2">
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
            disabled={loading}
            className="flex justify-center items-center hover:underline bg-black text-NoExcuseChallenge font-bold rounded-md my-6 py-2 px-6 shadow-lg focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out"
          >
            {loading && <Loading />}
            Export
          </button>
        </form>
      </div>
    </DefaultLayout>
  );
};

export default ExportWithdrawPage;
