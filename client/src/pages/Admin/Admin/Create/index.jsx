import { useCallback, useEffect, useState } from "react";

import Permissions from "@/api/Permissions";
import Loading from "@/components/Loading";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import Admin from "@/api/Admin";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import DefaultLayout from "../../../../layout/DefaultLayout";
import "./index.css";

const CreateAdmin = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [phone, setPhone] = useState("");
  const [errorPhone, setErrPhone] = useState(false);
  const [permissionsList, setPermissionsList] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

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
      setLoadingUpdate(true);
      await Admin.createAdmin(values)
        .then((response) => {
          setLoadingUpdate(false);
          toast.success(t(response.data.message));
          navigate("/admin/admin");
        })
        .catch((error) => {
          let message =
            error.response && error.response.data.message
              ? error.response.data.message
              : error.message;
          toast.error(t(message));
          setLoadingUpdate(false);
        });
    },
    [phone]
  );

  return (
    <DefaultLayout>
      <ToastContainer />
      {!loading && (
        <div className="container mx-auto py-24 px-10">
          <div className="flex justify-between items-center mb-10">
            <h1 className="text-2xl font-bold">{t("createAdmin")}</h1>
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
                      <div className="px-4 py-2 font-semibold">Email</div>
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
                    </div>
                    <div className="grid lg:grid-cols-2 grid-cols-1">
                      <div className="px-4 py-2 font-semibold">{t("role")}</div>
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
                    </div>
                    <div className="grid lg:grid-cols-2 grid-cols-1">
                      <div className="px-4 py-2 font-semibold">
                        {t("Root Admin")}
                      </div>
                      <div className="px-4 flex items-center">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-NoExcuseChallenge bg-gray-100 border-gray-300 rounded focus:ring-NoExcuseChallenge focus:ring-2"
                          {...register("isRootAdmin")}
                        />
                        <span className="ml-2 text-sm text-gray-600">
                          {t("Grant root admin privileges")}
                        </span>
                      </div>
                    </div>
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
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loadingUpdate}
                  className="w-full flex justify-center items-center hover:underline bg-black text-NoExcuseChallenge font-bold rounded-full my-6 py-4 px-8 shadow-lg focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out"
                >
                  {loadingUpdate && <Loading />}
                  {t("create")}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </DefaultLayout>
  );
};

export default CreateAdmin;
