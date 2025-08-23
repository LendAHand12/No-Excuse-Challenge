import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import Loading from '@/components/Loading';
import { ToastContainer, toast } from 'react-toastify';
import { useCallback, useEffect, useState } from 'react';
import User from '@/api/User';
import DefaultLayout from '../../../layout/DefaultLayout';
import AsyncSelect from 'react-select/async';
import { debounce } from 'lodash';
import { useLocation } from 'react-router-dom';

const MoveSystem = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const id = pathname.split('/')[3];
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingInfoUser, setLoadingInfoUser] = useState(true);
  const [parentId, setParentId] = useState('');
  const [refId, setRefId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [withChild, setWithChild] = useState('');

  useEffect(() => {
    (async () => {
      await User.getUserById(id)
        .then((response) => {
          setData(response.data);
          setLoadingInfoUser(false);
        })
        .catch((error) => {
          let message =
            error.response && error.response.data.message
              ? error.response.data.message
              : error.message;
          toast.error(t(message));
        });
    })();
  }, [id]);

  const loadOptions = debounce((inputValue, callback) => {
    if (!inputValue.trim()) {
      callback([]);
      return;
    }

    (async () => {
      await User.getAllUsersWithKeyword({ keyword: inputValue })
        .then((response) => {
          const options = response.data.users.map((user) => ({
            value: user._id,
            label: user.userName,
          }));
          callback(options);
        })
        .catch(() => {
          callback([]);
        });
    })();
  }, 1000);

  const handleSubmit = useCallback(async () => {
    if (!parentId && !refId) {
      toast.error("Please select at least 1 parent or referral value");
      return;
    } else {
      await User.changeSystem({ moveId: id, parentId, refId, withChild })
        .then((response) => {
          const { success, message } = response.data;
          if (!success) {
            setErrorMessage(message);
          } else {
            setErrorMessage('');
            toast.success(message);
          }
          setLoading(false);
        })
        .catch((error) => {
          let message =
            error.response && error.response.data.message
              ? error.response.data.message
              : error.response.data.error
              ? error.response.data.error
              : error.message;
          toast.error(t(message));
          setLoading(false);
        });
    }
  }, [refId, parentId, id, withChild]);

  return (
    <DefaultLayout>
      <ToastContainer />
      <div
        className="w-full py-24 lg:py-36 mx-auto rounded-lg bg-white p-5"
        style={{ maxWidth: '600px' }}
      >
        <div className="mb-10">
          <h1 className="text-center font-bold text-3xl">{t('Move System')}</h1>
        </div>
        {loadingInfoUser ? (
          <div className="w-full flex justify-center">
            <Loading />
          </div>
        ) : (
          <>
            <div className="mb-3 space-y-4">
              <div className="space-y-2">
                <p className="text-sm">Move User Name : </p>
                <p className="text-lg font-semibold">{data?.userId}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm">Current Parent Name : </p>
                <p className="text-lg font-semibold">{data?.currentParent}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm">Current Referral  Name : </p>
                <p className="text-lg font-semibold">{data?.refUserName}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm">
                  Move To Parent Name :
                </p>
                <AsyncSelect
                  cacheOptions
                  defaultOptions
                  loadOptions={loadOptions}
                  onChange={(option) => setParentId(option.value)}
                  placeholder="Search user name…"
                  className="w-full mb-1 border text-black border-black rounded-md focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm">Referral Name : </p>
                <AsyncSelect
                  cacheOptions
                  defaultOptions
                  loadOptions={loadOptions}
                  onChange={(option) => setRefId(option.value)}
                  placeholder="Search user name..."
                  className="w-full mb-1 border text-black border-black rounded-md focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                />
                <p className="text-sm text-gray-700">
                  * If you do not select a referral name, the default will be
                  Admin2.
                </p>
              </div>
              <div className="space-y-2">
                <div className="text flex items-center gap-2">
                  <input
                    onChange={(e) => setWithChild(e.target.value)}
                    type="checkbox"
                    id="withChild"
                    checked={withChild}
                  />
                  <label className="" htmlFor="withChild">
                    Include children
                  </label>
                </div>
              </div>
              {errorMessage && (
                <div className="bg-red-100 border border-red-400 text-red-700 text-center w-full py-2 rounded-md">
                  {errorMessage}
                </div>
              )}
              <button
                onClick={handleSubmit}
                className="w-full flex justify-center items-center hover:underline text-NoExcuseChallenge bg-black font-bold rounded-full my-2 py-2 px-6 shadow-lg focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out"
              >
                {loading && <Loading />}
                {t('Confirm')}
              </button>
            </div>
          </>
        )}
      </div>
    </DefaultLayout>
  );
};

export default MoveSystem;
