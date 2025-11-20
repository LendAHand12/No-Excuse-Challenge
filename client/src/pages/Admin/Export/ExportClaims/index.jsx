import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ToastContainer, toast } from 'react-toastify';
import moment from 'moment';
import { exportToExcel } from '@/utils/export';
import Payment from '@/api/Payment';
import { Controller, useForm } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import { useSelector } from 'react-redux';
import DefaultLayout from '@/layout/DefaultLayout';
import Loading from '@/components/Loading';
import Claim from '../../../../api/Claim';

const ExportClaimsPage = () => {
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

  const exportClaims = async (values) => {
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
          [t('Time')]: null,
          [t('Claimer')]: null,
          [t('Email')]: null,
          [t('Withdraw Amount')]: null,
          [t('Tax')]: null,
          [t('Transaction Fee')]: null,
          [t('Received Amount')]: null,
          [t('Withdrawal Method')]: null,
          [t('Status')]: null,
          [t('Tx Hash')]: null,
        });
        exportToExcel(
          excelData,
          `Danh_sach_claims_${moment().format('DD/MM/YYYY_HH:mm:ss')}`,
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
      // Determine if hash is a crypto transaction (starts with 0x)
      const isCryptoHash = item.hash && item.hash.startsWith('0x');
      const withdrawalMethod =
        item.withdrawalType ||
        (isCryptoHash ? 'CRYPTO' : item.coin === 'USDT' ? 'BANK' : null);

      // For BANK withdrawal: calculate amounts in VND
      const isBank = withdrawalMethod === 'BANK' && item.coin === 'USDT';
      const exchangeRate = item.exchangeRate || 0;

      // Calculate amounts - All values stored in USDT, calculate VND when displaying
      const tax = item.tax || 0;
      const fee = item.fee || 0;
      const receivedAmount =
        item.receivedAmount !== undefined
          ? item.receivedAmount // Use value from backend (USDT)
          : item.amount - tax - fee; // For both CRYPTO and BANK (USDT)

      // Calculate VND values for BANK withdrawal display
      const totalVND =
        isBank && exchangeRate > 0 ? item.amount * exchangeRate : 0;
      const taxVND = isBank && exchangeRate > 0 ? tax * exchangeRate : 0;
      const feeVND = isBank && exchangeRate > 0 ? fee * exchangeRate : 0;
      const receivedAmountVND =
        isBank && exchangeRate > 0 ? receivedAmount * exchangeRate : 0;

      // Format withdrawal amount
      const withdrawAmountDisplay =
        isBank && exchangeRate > 0
          ? `${Number(item.amount).toLocaleString()} USDT (≈ ${Number(
              totalVND,
            ).toLocaleString()} VND)`
          : `${Number(item.amount).toLocaleString()} ${item.coin}`;

      // Format tax
      const taxDisplay =
        tax > 0
          ? isBank && exchangeRate > 0
            ? `-${Math.floor(taxVND).toLocaleString()} VND`
            : `-${Number(tax).toLocaleString()} ${item.coin}`
          : '-';

      // Format fee
      const feeDisplay =
        fee > 0
          ? isBank && exchangeRate > 0
            ? `-${Math.floor(feeVND).toLocaleString()} VND`
            : `-${Number(fee).toLocaleString()} ${item.coin}`
          : '-';

      // Format received amount
      const receivedAmountDisplay =
        isBank && exchangeRate > 0
          ? `${Math.floor(receivedAmountVND).toLocaleString()} VND`
          : `${Number(receivedAmount).toLocaleString()} ${item.coin}`;

      // Format withdrawal method
      const withdrawalMethodDisplay = withdrawalMethod
        ? withdrawalMethod === 'CRYPTO'
          ? t('Crypto Wallet')
          : t('Bank Transfer')
        : '-';

      // Format status (always SUCCESS for claims)
      const statusDisplay = 'SUCCESS';

      // Format time
      const timeDisplay = new Date(item.createdAt).toLocaleString();

      // Format claimer (userId)
      const claimerDisplay = item.user || '-';

      // Format email
      const emailDisplay = item.email || '-';

      // Format hash
      const hashDisplay = item.hash || '-';

      return {
        [t('Time')]: timeDisplay,
        [t('Claimer')]: claimerDisplay,
        [t('Email')]: emailDisplay,
        [t('Withdraw Amount')]: withdrawAmountDisplay,
        [t('Tax')]: taxDisplay,
        [t('Transaction Fee')]: feeDisplay,
        [t('Received Amount')]: receivedAmountDisplay,
        [t('Withdrawal Method')]: withdrawalMethodDisplay,
        [t('Status')]: statusDisplay,
        [t('Tx Hash')]: hashDisplay,
      };
    });
  };

  const getData = async (body) => {
    try {
      return await Claim.export(body).then((response) => {
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
              Export Claims List
            </h2>
            <p className="text-body-color dark:text-dark-6 text-sm font-medium">
              Download and manage the list of claims in Excel format for
              reporting and administrative purposes.
            </p>
          </div>
        </div>
        <form onSubmit={handleSubmit(exportClaims)} className="">
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

export default ExportClaimsPage;
