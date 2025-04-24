import { useDispatch, useSelector } from 'react-redux';
import DefaultLayout from '@/layout/DefaultLayout';
import { useTranslation } from 'react-i18next';
import Cronjob from '@/api/Cronjob';
import { toast, ToastContainer } from 'react-toastify';
import { useState } from 'react';

const CronjobPage = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(null);
  const { userInfo } = useSelector((state) => state.auth);

  const handleSubmitCronjob = async (cronjob) => {
    setLoading(cronjob.id);
    await Cronjob.run({ cronjob, userId: userInfo.id })
      .then((response) => {
        toast.success(t(response.data.message));
        setLoading(false);
      })
      .catch((error) => {
        let message =
          error.response && error.response.data.error
            ? error.response.data.error
            : error.message;
        toast.error(t(message));
        setLoading(null);
      });
  };

  const cronjobs = [
    {
      id: 0,
      title: 'Distribution Hewe',
      descs: [
        'Hewe distribution by day',
        'Automatically run every day at 00:00',
      ],
    },
    {
      id: 1,
      title: 'Delete unpaid user',
      descs: [
        'Delete users who do not pay within 24 hours',
        'Automatically run every day at 01:00',
      ],
    },
    {
      id: 2,
      title: 'Count subordinates',
      descs: [
        'Count the number of subordinates and income',
        'Automatically run every day at 02:00',
      ],
    },
    {
      id: 3,
      title: 'Count level',
      descs: ['Count level of user', 'Automatically run every day at 03:00'],
    },
    {
      id: 4,
      title: 'Dreampool reward',
      descs: [
        '10 USDT reward for users with 2 subordinates under 15 days',
        'Automatically run every day at 04:00',
      ],
    },
  ];

  return (
    <DefaultLayout>
      <ToastContainer />
      <div className="px-10 lg:px-24 py-24">
        <div className="grid md:grid-cols-1 xl:grid-cols-3 gap-6">
          {cronjobs.map((ele) => (
            <div
              key={ele.id}
              className="border-2 w-full h-fit shadow-lg rounded-2xl max-w-[350px]"
            >
              <div className="bg-black rounded-2xl p-4 space-y-6">
                <div className="flex justify-between items-center gap-6">
                  <p className="text-NoExcuseChallenge text-sm font-bold uppercase">
                    {ele.title}
                  </p>
                  <button
                    onClick={() => handleSubmitCronjob(ele)}
                    className="bg-[#F4E096] flex items-center gap-2 text-sm text-black rounded-xl p-2"
                  >
                    {loading === ele.id ? (
                      <div role="status">
                        <svg
                          aria-hidden="true"
                          className="w-4 h-4 text-white animate-spin fill-gray-600"
                          viewBox="0 0 100 101"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                            fill="currentColor"
                          />
                          <path
                            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                            fill="currentFill"
                          />
                        </svg>
                        <span className="sr-only">Loading...</span>
                      </div>
                    ) : (
                      <svg
                        fill="currentColor"
                        width="16"
                        height="16"
                        viewBox="-4 -5 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                        preserveAspectRatio="xMinYMin"
                      >
                        <path d="M5.243 7.071l-4.95-4.95A1 1 0 1 1 1.707.707l5.657 5.657a1 1 0 0 1 0 1.414l-5.657 5.657a1 1 0 0 1-1.414-1.414l4.95-4.95zM6.929 12h8a1 1 0 0 1 0 2h-8a1 1 0 0 1 0-2z" />
                      </svg>
                    )}
                    <p className="text-xs font-semibold">
                      {loading === ele.id ? 'Running' : 'Run'}
                    </p>
                  </button>
                </div>
                <div className="flex gap-4 text-white text-sm">
                  <ul className="list-disc">
                    {ele.descs.map((desc) => (
                      <li className="ml-4" key={desc}>
                        {desc}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default CronjobPage;
