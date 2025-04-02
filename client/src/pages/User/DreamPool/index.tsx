import React, { useEffect, useState } from 'react';
import DefaultLayout from '@/layout/DefaultLayout';
import COVER5 from '@/images/cover/cover-05.png';
import FRAME_PIG from '@/images/cover/frame-pig.png';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import User from '@/api/User';
import Loading from '../../../components/Loading';
import { Sparkles } from 'lucide-react';
import { shortenWalletAddress } from '../../../utils';

const DreamPoolPage: React.FC = () => {
  const { t } = useTranslation();
  const [dreamPool, setDreamPool] = useState(0);
  const [iceBreakers, setIceBreakers] = useState([]);
  const [loading, setLoading] = useState(true);

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
  }, []);

  return (
    <DefaultLayout>
      <div className="relative w-full h-full px-10 py-24 bg-black">
        <h1 className="text-4xl font-bold mb-12 flex items-center justify-center gap-2 text-white relative z-10">
          <Sparkles className="text-yellow-300" /> DreamPool
        </h1>
        <div className="grid xl:grid-cols-3 gap-4">
          <div className="flex flex-col gap-4">
            <p className="text-xl text-white">
              DreamPool Fund <span className="text-sm italic">(5 USDT)</span> :
            </p>
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
            <p className="text-xl text-NoExcuseChallenge">
              DreamPool Total :
            </p>
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
                  <tr className="border-b" key={ele.userId}>
                    <td className="px-6 py-4">{ele.userId.userId}</td>
                    <td className="px-6 py-4">{shortenWalletAddress(ele.userId.email, 16)}</td>
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
