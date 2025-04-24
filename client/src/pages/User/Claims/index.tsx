import { useCallback, useEffect, useState } from 'react';

import Claim from '@/api/Claim';
import Loading from '@/components/Loading';
import NoContent from '@/components/NoContent';
import transStatus from '@/constants/transStatus';
import { useTranslation } from 'react-i18next';
import { ToastContainer, toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
// import { shortenWalletAddress } from "@/utils";
import DefaultLayout from '../../../layout/DefaultLayout';
import { shortenWalletAddress } from '../../../utils';
import { useSelector } from 'react-redux';

const ClaimsPage = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const page = searchParams.get('page') || 1;
  const coin = searchParams.get('coin') || '';
  const [totalPage, setTotalPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [objectFilter, setObjectFilter] = useState({
    pageNumber: page,
    coin,
  });

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { pageNumber, coin } = objectFilter;
      await Claim.user(pageNumber, coin)
        .then((response) => {
          const { claims, pages } = response.data;
          setData(claims);
          setTotalPage(pages);
          setLoading(false);
          pushParamsToUrl(pageNumber, coin);
        })
        .catch((error) => {
          let message =
            error.response && error.response.data.message
              ? error.response.data.message
              : error.message;
          toast.error(t(message));
          setLoading(false);
        });
    })();
  }, [objectFilter]);

  const pushParamsToUrl = (pageNumber, coin) => {
    const searchParams = new URLSearchParams();
    if (pageNumber) {
      searchParams.set('page', pageNumber);
    }
    if (coin) {
      searchParams.set('coin', coin);
    }
    const queryString = searchParams.toString();
    const url = queryString ? `/user/claims?${queryString}` : '/user/claims';
    navigate(url);
  };

  const onChangeCoin = useCallback(
    (e) =>
      setObjectFilter({
        ...objectFilter,
        pageNumber: 1,
        coin: e.target.value,
      }),
    [objectFilter],
  );

  const handleChangePage = useCallback(
    (page) =>
      setObjectFilter({
        ...objectFilter,
        pageNumber: page,
      }),
    [objectFilter],
  );

  return (
    <DefaultLayout>
      <ToastContainer />
      <div className="py-24 px-10">
        <div className="relative overflow-x-auto p-10">
          <div className="flex items-center justify-between pb-4 bg-white">
            <div className="flex items-center gap-4">
              <div>
                <select
                  className="block p-2 pr-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none active:outline-none"
                  onChange={onChangeCoin}
                  defaultValue={objectFilter.coin}
                >
                  <option value="ALL" key="ALL">
                    All
                  </option>
                  <option value="HEWE" key="HEWE">
                    HEWE
                  </option>
                  <option value="USDT" key="USDT">
                    USDT
                  </option>
                </select>
              </div>
            </div>
          </div>
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Claimer
                </th>
                <th scope="col" className="px-6 py-3">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3">
                  Coin
                </th>
                <th scope="col" className="px-6 py-3">
                  HasH
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
                    <th
                      scope="row"
                      className="px-6 py-4 text-gray-900 whitespace-nowrap "
                    >
                      <div className="">
                        <div className="text-base font-semibold">
                          {ele.userInfo.userId}
                        </div>
                        <div className="font-normal text-gray-500">
                          {ele.userInfo.email}
                        </div>
                      </div>
                    </th>
                    <td className="px-6 py-4">
                      {ele.amount} {ele.coin}
                    </td>
                    <td className="px-6 py-4">{ele.coin}</td>
                    <td className="px-6 py-4 text-blue-600 hover:underline">
                      <a
                        target="_blank"
                        href={
                          ele.coin === 'HEWE'
                            ? `https://explorer.amchain.net/transactions_detail/${ele.hash}`
                            : `https://bscscan.com/tx/${ele.hash}`
                        }
                      >
                        {shortenWalletAddress(ele.hash, 20)}
                      </a>
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
          {!loading && data.length > 0 && (
            <nav
              className="flex items-center justify-between pt-4"
              aria-label="Table navigation"
            >
              <span className="text-sm font-normal text-gray-500">
                Showing{' '}
                <span className="font-semibold text-gray-900">
                  {objectFilter.pageNumber}
                </span>{' '}
                of{' '}
                <span className="font-semibold text-gray-900">{totalPage}</span>{' '}
                page
              </span>
              <ul className="inline-flex items-center -space-x-px">
                <li>
                  <button
                    disabled={parseInt(objectFilter.pageNumber) === 1}
                    onClick={() =>
                      handleChangePage(parseInt(objectFilter.pageNumber) - 1)
                    }
                    className={`block px-3 py-2 ml-0 leading-tight text-gray-500 ${
                      parseInt(objectFilter.pageNumber) === 1
                        ? 'bg-gray-100'
                        : 'bg-white'
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
                    disabled={parseInt(objectFilter.pageNumber) === totalPage}
                    onClick={() =>
                      handleChangePage(parseInt(objectFilter.pageNumber) + 1)
                    }
                    className={`block px-3 py-2 leading-tight text-gray-500 ${
                      parseInt(objectFilter.pageNumber) === totalPage
                        ? 'bg-gray-100'
                        : 'bg-white'
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
      </div>
    </DefaultLayout>
  );
};

export default ClaimsPage;
