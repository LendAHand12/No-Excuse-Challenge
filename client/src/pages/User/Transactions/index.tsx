import { useEffect, useState } from 'react';

import Payment from '@/api/Payment';
import Loading from '@/components/Loading';
import NoContent from '@/components/NoContent';
import transStatus from '@/constants/transStatus';
import { shortenWalletAddress } from '@/utils';
import { useTranslation } from 'react-i18next';
import { ToastContainer, toast } from 'react-toastify';
import DefaultLayout from '../../../layout/DefaultLayout';

const Transactions = () => {
  const { t } = useTranslation();
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPage, setTotalPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Payment.getPaymentsOfUser(pageNumber)
        .then((response) => {
          const { payments, pages } = response.data;
          setData(payments);
          setTotalPage(pages);
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
  }, [pageNumber]);

  const handleNextPage = () => {
    setPageNumber((pageNumber) => pageNumber + 1);
  };

  const handlePrevPage = () => {
    setPageNumber((pageNumber) => pageNumber - 1);
  };

  return (
    <DefaultLayout>
      <ToastContainer />
      <div className="relative overflow-x-auto py-24 px-10">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">
                From
              </th>
              <th scope="col" className="px-6 py-3">
                To
              </th>
              <th scope="col" className="px-6 py-3">
                Hash
              </th>
              <th scope="col" className="px-6 py-3">
                Amount
              </th>
              <th scope="col" className="px-6 py-3">
                Type
              </th>
              <th scope="col" className="px-6 py-3">
                Time
              </th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 &&
              !loading &&
              data.map((ele) => (
                <tr
                  className="bg-white border-b hover:bg-gray-50"
                  key={ele._id}
                >
                  <td className="px-6 py-4">
                    {shortenWalletAddress(ele.address_from)}
                  </td>
                  <td className="px-6 py-4">
                    {shortenWalletAddress(ele.address_to)}
                  </td>
                  <td className="px-6 py-4 text-blue-600">
                    <a
                      href={`https://bscscan.com/tx/${ele.hash}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {shortenWalletAddress(ele.hash)}
                    </a>
                  </td>
                  <td className="px-6 py-4">{ele.amount} USDT</td>
                  <td className="px-6 py-4">
                    <div
                      className={`w-full text-white rounded-sm py-1 px-2 text-sm ${transStatus.find(
                        (item) => item.status === ele.type,
                      )?.color} mr-2`}
                    >
                      {t(ele.type)}
                    </div>
                  </td>
                  <td className="px-6 py-4">{ele.createdAt}</td>
                </tr>
              ))}
          </tbody>
        </table>
        {loading && (
          <div className="w-full flex justify-center my-4">
            <Loading />
          </div>
        )}
        {!loading && data.length === 0 && <NoContent />}
        {data.length > 0 && (
          <nav
            className="flex items-center justify-between pt-4"
            aria-label="Table navigation"
          >
            <span className="text-sm font-normal text-gray-500">
              Showing{' '}
              <span className="font-semibold text-gray-900">{pageNumber}</span>{' '}
              of{' '}
              <span className="font-semibold text-gray-900">{totalPage}</span>{' '}
              page
            </span>
            <ul className="inline-flex items-center -space-x-px">
              <li>
                <button
                  disabled={pageNumber === 1}
                  onClick={handlePrevPage}
                  className={`block px-3 py-2 ml-0 leading-tight text-gray-500 ${
                    pageNumber === 1 ? 'bg-gray-100' : 'bg-white'
                  } border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700`}
                >
                  <span className="sr-only">Previous</span>
                  <svg
                    className="w-5 h-5"
                    aria-hidden="true"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </button>
              </li>
              <li>
                <button
                  disabled={pageNumber === totalPage}
                  onClick={handleNextPage}
                  className={`block px-3 py-2 leading-tight text-gray-500 ${
                    pageNumber === totalPage ? 'bg-gray-100' : 'bg-white'
                  } border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700`}
                >
                  <span className="sr-only">Next</span>
                  <svg
                    className="w-5 h-5"
                    aria-hidden="true"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </button>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </DefaultLayout>
  );
};

export default Transactions;
