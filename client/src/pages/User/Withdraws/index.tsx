import { useEffect, useState } from 'react';

import User from '@/api/User';
import Loading from '@/components/Loading';
import NoContent from '@/components/NoContent';
import transStatus from '@/constants/transStatus';
import { useTranslation } from 'react-i18next';
import { ToastContainer, toast } from 'react-toastify';
import DefaultLayout from '../../../layout/DefaultLayout';
import { shortenWalletAddress } from '../../../utils';

const Withdraws = () => {
  const { t } = useTranslation();
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPage, setTotalPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await User.withdraws()
        .then((response) => {
          const { withdraws } = response.data;
          setData(withdraws);
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

  return (
    <DefaultLayout>
      <ToastContainer />
      <div className="relative overflow-x-auto py-24 px-10">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">
                Username
              </th>
              <th scope="col" className="px-6 py-3">
                Amount
              </th>
              <th scope="col" className="px-6 py-3">
                Status
              </th>
              <th scope="col" className="px-6 py-3">
                Hash
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
                  <td className="px-6 py-4 font-semibold">
                    {ele.userInfo.userId}
                  </td>
                  <td className="px-6 py-4">{ele.amount} USDT</td>
                  <td className="px-6 py-4">
                    <div
                      className={`w-fit px-6 py-2 rounded-md text-white ${
                        ele.status === 'PENDING'
                          ? 'bg-yellow-600'
                          : 'bg-green-500'
                      } text-center`}
                    >
                      {ele.status}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-blue-600">
                    {ele.hash && (
                      <a
                        href={`https://bscscan.com/tx/${ele.hash}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {shortenWalletAddress(ele.hash)}
                      </a>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {new Date(ele.createdAt).toLocaleDateString('vi')}
                  </td>
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
      </div>
    </DefaultLayout>
  );
};

export default Withdraws;
