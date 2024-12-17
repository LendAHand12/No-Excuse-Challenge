import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import Loading from '@/components/Loading';
import { ToastContainer, toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import Select from 'react-select';
import User from '@/api/User';
import DefaultLayout from '../../../layout/DefaultLayout';

const ReferralPage = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const { userInfo } = useSelector((state) => state.auth);
  const [childId, setChildId] = useState('');
  const [listChild, setListChild] = useState([]);
  const defaultRef = `${import.meta.env.VITE_URL}/register?ref=${userInfo.id}`;
  const [link, setLink] = useState(defaultRef);

  useEffect(() => {
    if (childId === '') {
      setLink(defaultRef);
    } else {
      setLink(`${defaultRef}&receiveId=${childId}`);
    }
  }, [childId, defaultRef]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await User.getListChild()
        .then((response) => {
          const newData = response.data.map((ele) => ({
            value: ele.id,
            label: ele.userId,
          }));
          setListChild([...newData]);
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

  const onCopy = () => {
    navigator.clipboard.writeText(link);
    toast.success(t('copied'));
  };

  return (
    <DefaultLayout>
      <ToastContainer />
      <div
        className="w-full py-24 lg:py-36 mx-auto rounded-lg bg-white p-5"
        style={{ maxWidth: '600px' }}
      >
        <div className="mb-10">
          <h1 className="text-center font-bold text-3xl">
            {t('Create referral link')}
          </h1>
        </div>
        {loading ? (
          <div className="w-full flex justify-center">
            <Loading />
          </div>
        ) : (
          <>
            <div className="mb-3">
              <div>
                <select
                  onChange={(e) => {
                    setChildId(e.target.value);
                  }}
                  value={childId}
                  className="form-select w-full px-3 py-2 mb-1 border border-black rounded-md focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                >
                  <option value="">{t('No choose')}</option>
                  {listChild.length > 0 &&
                    listChild.map((ele) => (
                      <option key={ele.id} value={ele.id}>
                        {ele.userId}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="mb-3 flex gap-1 border border-black rounded-md">
              <input
                className="flex-1 px-3 py-2 mb-1 focus:outline-none"
                type="text"
                value={link}
                readOnly
              />
              <button
                onClick={onCopy}
                className="text-xs hover:underline rounded-full p-2 "
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clip-path="url(#clip0_79_1767)">
                    <path
                      d="M15 20H5C3.67441 19.9984 2.40356 19.4711 1.46622 18.5338C0.528882 17.5964 0.00158786 16.3256 0 15L0 5C0.00158786 3.67441 0.528882 2.40356 1.46622 1.46622C2.40356 0.528882 3.67441 0.00158786 5 0L15 0C16.3256 0.00158786 17.5964 0.528882 18.5338 1.46622C19.4711 2.40356 19.9984 3.67441 20 5V15C19.9984 16.3256 19.4711 17.5964 18.5338 18.5338C17.5964 19.4711 16.3256 19.9984 15 20ZM5 2C4.20435 2 3.44129 2.31607 2.87868 2.87868C2.31607 3.44129 2 4.20435 2 5V15C2 15.7956 2.31607 16.5587 2.87868 17.1213C3.44129 17.6839 4.20435 18 5 18H15C15.7956 18 16.5587 17.6839 17.1213 17.1213C17.6839 16.5587 18 15.7956 18 15V5C18 4.20435 17.6839 3.44129 17.1213 2.87868C16.5587 2.31607 15.7956 2 15 2H5ZM24 19V6C24 5.73478 23.8946 5.48043 23.7071 5.29289C23.5196 5.10536 23.2652 5 23 5C22.7348 5 22.4804 5.10536 22.2929 5.29289C22.1054 5.48043 22 5.73478 22 6V19C22 19.7956 21.6839 20.5587 21.1213 21.1213C20.5587 21.6839 19.7956 22 19 22H6C5.73478 22 5.48043 22.1054 5.29289 22.2929C5.10536 22.4804 5 22.7348 5 23C5 23.2652 5.10536 23.5196 5.29289 23.7071C5.48043 23.8946 5.73478 24 6 24H19C20.3256 23.9984 21.5964 23.4711 22.5338 22.5338C23.4711 21.5964 23.9984 20.3256 24 19Z"
                      fill="#02071B"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_79_1767">
                      <rect width="24" height="24" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              </button>
            </div>
          </>
        )}
      </div>
    </DefaultLayout>
  );
};

export default ReferralPage;
