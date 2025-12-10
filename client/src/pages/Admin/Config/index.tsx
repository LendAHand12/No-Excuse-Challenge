import { useSelector } from 'react-redux';
import DefaultLayout from '@/layout/DefaultLayout';
import { useTranslation } from 'react-i18next';
import Config from '@/api/Config';
import { toast, ToastContainer } from 'react-toastify';
import { useCallback, useEffect, useState } from 'react';
import Switch from 'react-switch';

const ConfigPage = () => {
  const { t } = useTranslation();
  const { userInfo } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(null);
  const [list, setList] = useState([]);

  const onChangeValue = async (data, config, value) => {
    const newList = updateValueById(data, config._id, value);
    setList(newList);
  };

  const onUpdate = useCallback(
    async (idConfig) => {
      setLoading(idConfig);
      const config = list.find((ele) => ele._id === idConfig);
      await Config.update({ config })
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
    },
    [list],
  );

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Config.list()
        .then((response) => {
          const { allConfigs } = response.data;
          setList(allConfigs);
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
  }, []);

  const updateValueById = (arr, targetId, newValue) => {
    return arr.map((item) => {
      if (item._id === targetId) {
        return { ...item, value: newValue };
      }
      return item;
    });
  };

  return (
    <DefaultLayout>
      <ToastContainer />
      <div className="px-10 lg:px-24 py-24">
        <div className="grid md:grid-cols-1 xl:grid-cols-3 gap-6">
          {list.map((ele) => (
            <div
              key={ele._id}
              className="border-2 w-full h-fit shadow-lg rounded-2xl max-w-[350px]"
            >
              <div className="bg-black rounded-2xl p-4 space-y-6">
                <div className="flex justify-between items-center gap-6">
                  <p className="text-NoExcuseChallenge text-sm font-bold uppercase">
                    {ele.label}
                  </p>
                  {userInfo?.permissions
                    .find((p) => p.page.path === '/admin/config')
                    ?.actions.includes('update') && (
                    <button
                      onClick={() => onUpdate(ele._id)}
                      className="bg-[#F4E096] flex items-center gap-2 text-sm text-black rounded-xl p-2"
                    >
                      {loading === ele._id ? (
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
                          width="20"
                          height="20"
                          viewBox="0 0 16 16"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g>
                            <path d="M15,6V1.76l-1.7,1.7A7,7,0,1,0,14.92,9H13.51a5.63,5.63,0,1,1-1.2-4.55L10.76,6Z" />
                          </g>
                        </svg>
                      )}
                      <p className="text-xs font-semibold">
                        {loading === ele._id ? 'Processing' : 'Update'}
                      </p>
                    </button>
                  )}
                </div>
                <div className="flex gap-4 text-white text-sm">
                  {(ele.type === 'string' || ele.type === 'number') && (
                    <input
                      type={ele.type === 'number' ? 'number' : 'text'}
                      defaultValue={ele.value}
                      className="bg-white text-black px-2 py-1 w-full rounded-lg text-lg"
                      onChange={(e) => onChangeValue(list, ele, e.target.value)}
                      disabled={
                        userInfo?.permissions
                          .find((p) => p.page.path === '/admin/config')
                          ?.actions.includes('update')
                          ? false
                          : true
                      }
                    />
                  )}
                  {ele.type === 'boolean' && (
                    <Switch
                      checked={ele.value}
                      onChange={(e) => onChangeValue(list, ele, e)}
                      disabled={
                        userInfo?.permissions
                          .find((p) => p.page.path === '/admin/config')
                          ?.actions.includes('update')
                          ? false
                          : true
                      }
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default ConfigPage;
