import React, { useEffect, useState } from 'react';
import DefaultLayout from '@/layout/DefaultLayout';
import COVER5 from '@/images/cover/cover-05.png';
import FRAME_PIG from '@/images/cover/frame-pig.png';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import User from '@/api/User';
import Loading from '../../../components/Loading';

const DreamPoolPage: React.FC = () => {
  const { t } = useTranslation();
  const [dreamPool, setDreamPool] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      await User.getDreamPool()
        .then((response) => {
          setDreamPool(response.data.dreampool);
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
      <div className="relative w-full h-full bg-black">
        <img src={COVER5} className="relative w-full h-full object-contain" />
        <div className="absolute bottom-20 lg:bottom-10 left-1/2 transform -translate-x-1/2">
          <img src={FRAME_PIG} className="w-full h-full" />
          <p className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 text-xl md:text-3xl lg:text-2xl 2xl:text-4xl font-bold text-[#F4E096]">
            {loading ? <Loading /> : `${dreamPool} USD`}
          </p>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default DreamPoolPage;
