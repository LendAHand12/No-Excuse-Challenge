import { useCallback, useEffect, useState } from "react";

import Admin from "@/api/Admin";
import Permissions from "@/api/Permissions";
import Loading from "@/components/Loading";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import DefaultLayout from "../../../../layout/DefaultLayout";
import "./index.css";

const AdminProfile = () => {
  const { id } = useParams();
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [data, setData] = useState({});
  const [isEditting, setEditting] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [permissionsList, setPermissionsList] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  useEffect(() => {
    (async () => {
      await Admin.getAdminById(id)
        .then((response) => {
          setLoading(false);
          setData(response.data.admin);
          const { userId, email, role } =
            response.data.admin;
          setValue("userId", userId);
          setValue("email", email);
          setValue("role", role);
        })
        .catch((error) => {
          let message =
            error.response && error.response.data.message
              ? error.response.data.message
              : error.message;
          toast.error(t(message));
        });
    })();
  }, [id, refresh]);

  useEffect(() => {
    (async () => {
      await Permissions.getAllPermissions()
        .then((response) => {
          setLoading(false);
          setPermissionsList(response.data.permissions);
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

  const onSubmit = useCallback(
    async (values) => {
      const body = {};
      if (values.userId !== data.userId) {
        body.userId = values.userId;
      }
      if (values.email !== data.email) {
        body.email = values.email;
      }
      if (values.role !== data.role) {
        body.role = values.role;
      }
      if (values.password) {
        body.password = values.password;
      }

      if (Object.keys(body).length === 0) {
        setEditting(false);
        return;
      }

      setLoadingUpdate(true);
      await Admin.updateAdmin(id, body)
        .then((response) => {
          setLoadingUpdate(false);
          toast.success(t(response.data.message));
          setRefresh(!refresh);
          setEditting(false);
        })
        .catch((error) => {
          let message =
            error.response && error.response.data.message
              ? error.response.data.message
              : error.message;
          toast.error(t(message));
          setLoadingUpdate(false);
          setEditting(false);
        });
    },
    [data]
  );

  const handleDeleteUser = async (onClose) => {
    setLoadingDelete(true);
    onClose();
    toast.warning(t("deleting"));
    await Admin.deleteAdminById(id)
      .then((response) => {
        const { message } = response.data;
        setLoadingDelete(false);
        toast.success(t(message));
        navigate("/admin/admin");
      })
      .catch((error) => {
        let message =
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message;
        toast.error(t(message));
        setLoadingDelete(false);
      });
  };

  const handleDelete = useCallback(async () => {
    confirmAlert({
      closeOnClickOutside: true,
      customUI: ({ onClose }) => {
        return (
          <div className="custom-ui">
            <div className="relative p-4 w-full max-w-md h-full md:h-auto mb-40">
              <div className="relative p-4 text-center bg-gray-100 rounded-lg shadow-lg sm:p-5">
                <button
                  onClick={onClose}
                  disabled={loadingDelete}
                  className="text-gray-400 absolute top-2.5 right-2.5 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
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
                <svg
                  className="text-gray-400 dark:text-gray-500 w-11 h-11 mb-3.5 mx-auto"
                  aria-hidden="true"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <p className="mb-4 text-gray-500">
                  {t("Are you sure to remove admin")}
                </p>
                <div className="flex justify-center items-center space-x-4">
                  <button
                    onClick={onClose}
                    disabled={loadingDelete}
                    className="py-2 px-3 text-sm font-medium text-gray-500 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-primary-300 hover:text-gray-900 focus:z-10 "
                  >
                    {t("cancel")}
                  </button>
                  <button
                    onClick={() => handleDeleteUser(onClose)}
                    className="flex items-center py-2 px-3 text-sm font-medium text-center text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 "
                  >
                    {loadingDelete && <Loading />}
                    {t("delete")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      },
    });
  }, [loadingDelete]);

  return (
    <DefaultLayout>
      <ToastContainer />
      {!loading && (
        <div className="container mx-auto py-24 px-10">
          <div className="flex justify-between items-center mb-10">
            <h1 className="text-2xl font-bold">{t("admin-admin-detail")}</h1>
          </div>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="md:flex no-wrap md:-mx-2 "
          >
            <div className="w-full">
              <div className="bg-white py-6 border-t-4 border-NoExcuseChallenge">
                <div className="text-gray-700">
                  <div className="grid grid-cols-1 text-sm">
                    <div className="grid lg:grid-cols-2 grid-cols-1">
                      <div className="px-4 py-2 font-semibold">
                        {t("user name")}
                      </div>
                      {isEditting ? (
                        <div className="px-4">
                          <input
                            className="w-full px-4 py-1.5 rounded-md border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                            {...register("userId", {
                              required: t("User ID is required"),
                            })}
                            autoComplete="off"
                          />
                          <p className="error-message-text">
                            {errors.userId?.message}
                          </p>
                        </div>
                      ) : (
                        <div className="px-4 py-2">{data.userId}</div>
                      )}
                    </div>
                    <div className="grid lg:grid-cols-2 grid-cols-1">
                      <div className="px-4 py-2 font-semibold">Email</div>
                      {isEditting ? (
                        <div className="px-4">
                          <input
                            className="w-full px-4 py-1.5 rounded-md border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                            {...register("email", {
                              required: t("Email is required"),
                            })}
                            autoComplete="off"
                          />
                          <p className="error-message-text">
                            {errors.email?.message}
                          </p>
                        </div>
                      ) : (
                        <div className="px-4 py-2">{data.email}</div>
                      )}
                    </div>
                    <div className="grid lg:grid-cols-2 grid-cols-1">
                      <div className="px-4 py-2 font-semibold">{t("role")}</div>
                      {isEditting ? (
                        <div className="px-4">
                          <select
                            className="w-full px-4 py-1.5 rounded-md border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                            {...register("role", {
                              required: t("role is required"),
                            })}
                          >
                            {permissionsList.length > 0 &&
                              permissionsList.map((p) => (
                                <option key={p.role} value={p.role}>
                                  {p.role}
                                </option>
                              ))}
                          </select>
                          <p className="error-message-text">
                            {errors.role?.message}
                          </p>
                        </div>
                      ) : (
                        <div className="px-4 py-2 break-words">{data.role}</div>
                      )}
                    </div>
                    {isEditting && (
                      <>
                        <div className="grid lg:grid-cols-2 grid-cols-1">
                          <div className="px-4 py-2 font-semibold">
                            {t("password")}
                          </div>
                          <div className="px-4">
                            <input
                              className="w-full px-4 py-1.5 rounded-md border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                              {...register("password", {
                                pattern: {
                                  value: /^(?=.*?[a-z])(?=.*?[0-9]).{8,}$/,
                                  message: t(
                                    "Password must contain at least 8 characters and a number"
                                  ),
                                },
                              })}
                              autoComplete="off"
                            />
                            <p className="error-message-text">
                              {errors.password?.message}
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                {isEditting && (
                  <>
                    <button
                      onClick={() => setEditting(true)}
                      disabled={loading}
                      className="w-full flex justify-center items-center hover:underline bg-black text-NoExcuseChallenge font-bold rounded-full my-6 py-4 px-8 shadow-lg focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out"
                    >
                      {loading && <Loading />}
                      {t("update")}
                    </button>
                    <button
                      onClick={() => setEditting(false)}
                      className="w-full flex justify-center items-center hover:underline border font-bold rounded-full my-6 py-4 px-8 shadow-lg focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out"
                    >
                      {t("cancel")}
                    </button>
                  </>
                )}
                {userInfo?.permissions
                  .find((p) => p.page.pageName === "admin-admin-detail")
                  ?.actions.includes("update") &&
                  !isEditting &&
                  data.status !== "UNVERIFY" &&
                  data.status !== "DELETED" && (
                    <button
                      onClick={() => setEditting(true)}
                      className="w-full flex justify-center items-center hover:underline bg-black text-NoExcuseChallenge font-bold rounded-full my-6 py-4 px-8 shadow-lg focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out"
                    >
                      {loadingUpdate && <Loading />}
                      {t("edit")}
                    </button>
                  )}
                {userInfo?.permissions
                  .find((p) => p.page.pageName === "admin-users-details")
                  ?.actions.includes("delete") &&
                  !isEditting &&
                  data.status !== "DELETED" && (
                    <div
                      onClick={handleDelete}
                      className="w-full flex justify-center items-center cursor-pointer hover:underline border font-bold rounded-full my-6 py-4 px-8 shadow-lg focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out bg-red-500 text-white"
                    >
                      {t("delete")}
                    </div>
                  )}
              </div>
            </div>
          </form>
        </div>
      )}
    </DefaultLayout>
  );
};

export default AdminProfile;
