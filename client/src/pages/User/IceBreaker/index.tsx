import { useEffect, useState } from 'react';

import IceBreaker from '@/api/IceBreaker';
import { useTranslation } from 'react-i18next';
import { ToastContainer, toast } from 'react-toastify';
import DefaultLayout from '../../../layout/DefaultLayout';
import { Sparkles, User } from 'lucide-react';
import confetti from "canvas-confetti";
import logo from '@/images/logo/logo-icon.svg'


const IceBreakerPage = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  useEffect(() => {
    confetti({
      startVelocity: 30, spread: 360, ticks: 60, zIndex: 0
    });

    const interval = setInterval(() => {
      confetti({
        startVelocity: 30, spread: 360, ticks: 60, zIndex: 0
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await IceBreaker.list()
        .then((response) => {
          const { allBreakers, pages } = response.data;
          setData(allBreakers);
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
  }, []);

  return (
    <DefaultLayout>
      <ToastContainer />
      <div className="relative py-24 px-6 min-h-screen flex flex-col items-center overflow-hidden">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2 relative z-10">
          <Sparkles className="text-yellow-300" /> Vinh Danh Người Dùng
        </h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {data.map((user, index) => (
          <div
            key={index}
            className="relative bg-gradient-to-br from-[#d99300] to-[#b57700] text-white shadow-2xl p-6 rounded-3xl border border-yellow-500 transform hover:scale-110 transition-transform overflow-hidden hover:shadow-yellow-500/50 flex items-center gap-4"
          >
            <div className="bg-white p-4 rounded-full">
              <img src={logo} className="text-[#d99300] w-12 h-12" />
            </div>
            <div className="relative z-10">
              <h2 className="text-2xl font-bold">{user.userId.userId}</h2>
              <p className="text-gray-200">{user.userId.email}</p>
            </div>
          </div>
        ))}
      </div>
      </div>
    </DefaultLayout>
  );
};

export default IceBreakerPage;
