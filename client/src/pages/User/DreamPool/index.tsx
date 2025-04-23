import React, { useCallback, useEffect, useState } from 'react';
import DefaultLayout from '@/layout/DefaultLayout';
import COVER5 from '@/images/cover/cover-05.png';
import FRAME_PIG from '@/images/cover/frame-pig.png';
import { toast, ToastContainer } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import User from '@/api/User';
import Loading from '../../../components/Loading';
import { Sparkles } from 'lucide-react';
import { shortenWalletAddress } from '../../../utils';
import Modal from 'react-modal';
import { useSelector } from 'react-redux';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';

const DreamPoolPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [dreamPool, setDreamPool] = useState(0);
  const [iceBreakers, setIceBreakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditDreampool, setShowEditDreampool] = useState(false);
  const { userInfo } = useSelector((state) => state.auth);
  const [notHonors, setNotHonors] = useState([]);
  const [newHonors, setNewHonors] = useState([]);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    (async () => {
      await User.getDreamPool()
        .then((response) => {
          setDreamPool(response.data.dreampool);
          setIceBreakers(response.data.allBreakers);
          setLoading(false);
        })
        .catch((error) => {
          let message =
            error.response && error.response.data.message
              ? error.response.data.message
              : error.message;
          toast.error(t(message));
        });
    })();

    (async () => {
      userInfo.isAdmin &&
        (await User.getNotHonorUsers()
          .then((response) => {
            setNotHonors(response.data.usersNotYetHonored);
            setLoading(false);
          })
          .catch((error) => {
            let message =
              error.response && error.response.data.message
                ? error.response.data.message
                : error.message;
            toast.error(t(message));
          }));
    })();
  }, [refresh]);

  const handleUpdateDreampool = useCallback(async () => {
    await User.updateDreamPool({ totalDreampool: dreamPool, newHonors })
      .then((response) => {
        const { message } = response.data;
        toast.success(t(message));
        setShowEditDreampool(false);
        setRefresh(!refresh);
      })
      .catch((error) => {
        let message =
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message;
        toast.error(t(message));
      });
  }, [dreamPool, newHonors]);

  const handleExportDreampool = async () => {
    navigate('/admin/dreampool/export');
  };

  return (
    <DefaultLayout>
      <ToastContainer />
      {userInfo?.permissions
        ?.find((p) => p.page.path === '/admin/dreampool')
        ?.actions.includes('update') && (
        <Modal
          isOpen={showEditDreampool}
          onRequestClose={() => setShowEditDreampool(false)}
          style={{
            content: {
              top: '50%',
              left: '50%',
              right: 'auto',
              bottom: 'auto',
              marginRight: '-50%',
              transform: 'translate(-50%, -50%)',
            },
          }}
        >
          <div className="overflow-y-auto overflow-x-hidden justify-center items-center w-full md:inset-0 h-modal md:h-full">
            <div className="relative w-full max-w-md h-full md:h-auto">
              <div className="relative text-center bg-white rounded-lg sm:p-5">
                <button
                  onClick={() => setShowEditDreampool(false)}
                  className="text-gray-400 absolute top-2.5 right-2.5 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
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
                <div className="pt-10 mb-4">
                  <p className="mb-4 text-gray-500 text-lg font-semibold">
                    Please select a reward recipient
                  </p>
                  <Select
                    options={notHonors.map((ele) => ({
                      value: ele._id,
                      label: ele.userId,
                    }))}
                    onChange={(e) => setNewHonors(e)}
                    isMulti
                    className="w-full mb-1 text-black rounded-xl focus:outline-none cursor-pointer"
                  />
                </div>
                <div className="space-y-4">
                  <p className="mb-4 text-gray-500 text-lg font-semibold">
                    Please input new dreampool fund number
                  </p>
                  <div>
                    <input
                      onChange={(e) => setDreamPool(e.target.value)}
                      value={dreamPool}
                      className="block p-2.5 w-full min-w-62.5 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="Write the reason for reject..."
                    ></input>
                  </div>
                  <div className="flex justify-center items-center space-x-4">
                    <button
                      onClick={handleUpdateDreampool}
                      className="py-2 px-3 text-sm font-medium text-center text-white bg-green-600 rounded-lg hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-red-300 "
                    >
                      Update
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
      <div className="relative w-full min-h-screen px-10 py-24 bg-black">
        <h1 className="text-4xl font-bold mb-12 flex items-center justify-center gap-2 text-white relative z-10">
          <Sparkles className="text-yellow-300" /> DreamPool
        </h1>
        <div className="grid xl:grid-cols-3 gap-4">
          <div className="flex flex-col gap-4">
            <div className="relative flex items-center gap-2 text-xl text-white">
              <p>
                DreamPool Fund <span className="text-sm italic">(5 USDT)</span>{' '}
                :
              </p>
              {userInfo?.permissions
                ?.find((p) => p.page.path === '/admin/dreampool')
                ?.actions.includes('update') && (
                <button
                  className="text-NoExcuseChallenge hover:opacity-70"
                  onClick={() => setShowEditDreampool(true)}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M16.293 2.293a1 1 0 0 1 1.414 0l4 4a1 1 0 0 1 0 1.414l-13 13A1 1 0 0 1 8 21H4a1 1 0 0 1-1-1v-4a1 1 0 0 1 .293-.707l10-10 3-3zM14 7.414l-9 9V19h2.586l9-9L14 7.414zm4 1.172L19.586 7 17 4.414 15.414 6 18 8.586z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
              )}
            </div>
            <div className="relative w-full sm:w-64">
              <img src={FRAME_PIG} className="sm:w-64 h-full" />
              <p className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xl font-bold text-[#F4E096]">
                {loading ? <Loading /> : `${dreamPool} USD`}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <p className="text-xl text-white">
              Ice Breakers <span className="text-sm italic">(10 USDT)</span> :
            </p>
            <div className="relative w-full sm:w-64">
              <img src={FRAME_PIG} className="sm:w-64 h-full" />
              <p className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xl font-bold text-[#F4E096]">
                {loading ? <Loading /> : `${iceBreakers.length * 10} USD`}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <p className="text-xl text-NoExcuseChallenge">DreamPool Total :</p>
            <div className="relative w-full sm:w-64">
              <img src={FRAME_PIG} className="sm:w-64 h-full" />
              <p className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xl font-bold text-[#F4E096]">
                {loading ? (
                  <Loading />
                ) : (
                  `${dreamPool - iceBreakers.length * 10} USD`
                )}
              </p>
            </div>
          </div>
        </div>
        <div className='flex justify-end mt-10'>
          {userInfo?.permissions
            ?.find((p) => p.page.path === '/admin/users')
            ?.actions.includes('export') && (
            <div>
              <button
                onClick={handleExportDreampool}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white text-sm rounded-md hover:opacity-70"
              >
                <svg
                  fill="currentColor"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M8.71,7.71,11,5.41V15a1,1,0,0,0,2,0V5.41l2.29,2.3a1,1,0,0,0,1.42,0,1,1,0,0,0,0-1.42l-4-4a1,1,0,0,0-.33-.21,1,1,0,0,0-.76,0,1,1,0,0,0-.33.21l-4,4A1,1,0,1,0,8.71,7.71ZM21,14a1,1,0,0,0-1,1v4a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V15a1,1,0,0,0-2,0v4a3,3,0,0,0,3,3H19a3,3,0,0,0,3-3V15A1,1,0,0,0,21,14Z" />
                </svg>
                Export Data
              </button>
            </div>
          )}
        </div>
        <div className="bg-black py-10">
          <table className="w-full bg-black text-left text-gray-300">
            <thead className="text-lg text-gray-200 uppercase ">
              <tr>
                <th scope="col" className="px-6 py-3">
                  UserName
                </th>
                <th scope="col" className="px-6 py-3">
                  Email
                </th>
                <th scope="col" className="px-6 py-3">
                  Time
                </th>
              </tr>
            </thead>
            <tbody>
              {iceBreakers.length > 0 &&
                !loading &&
                iceBreakers.map((ele) => (
                  <tr className="border-b" key={ele._id}>
                    <td className="px-6 py-4">{ele.userId.userId}</td>
                    <td className="px-6 py-4">
                      {shortenWalletAddress(ele.userId.email, 16)}
                    </td>
                    <td className="px-6 py-4">
                      {new Date(ele.createdAt).toLocaleDateString('vi')}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default DreamPoolPage;
