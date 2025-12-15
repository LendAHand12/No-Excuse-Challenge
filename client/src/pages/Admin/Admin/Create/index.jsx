import { useCallback, useEffect, useState } from "react";

import Loading from "@/components/Loading";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import Admin from "@/api/Admin";
import Permissions from "@/api/Permissions";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import DefaultLayout from "../../../../layout/DefaultLayout";
import "./index.css";

const CreateAdmin = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [permissionsList, setPermissionsList] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    (async () => {
      try {
        const response = await Permissions.getAllPermissions();
        setPermissionsList(response.data.permissions || []);
        setLoading(false);
      } catch (error) {
        let message =
          error.response?.data?.message || error.message || "Failed to load permissions";
        toast.error(t(message));
        setLoading(false);
      }
    })();
  }, [t]);

  const onSubmit = useCallback(
    async (values) => {
      setLoadingUpdate(true);
      await Admin.createAdmin({
        email: values.email,
        password: values.password,
        role: values.role,
      })
        .then((response) => {
          setLoadingUpdate(false);
          toast.success(t(response.data.message || "Admin created successfully"));
          navigate("/admin/admin");
        })
        .catch((error) => {
          let message =
            error.response?.data?.message || error.message || "Failed to create admin";
          toast.error(t(message));
          setLoadingUpdate(false);
        });
    },
    [navigate, t]
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
                          type="email"
                          className="w-full px-4 py-1.5 rounded-md border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                          {...register("email", {
                            required: t("Email is required"),
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: t("Invalid email address"),
                            },
                          })}
                          autoComplete="off"
                          placeholder={t("Enter email address")}
                        />
                        <p className="error-message-text">
                          {errors.email?.message}
                        </p>
                      </div>
                    </div>
                    <div className="grid lg:grid-cols-2 grid-cols-1">
                      <div className="px-4 py-2 font-semibold">
                        {t("password")}
                      </div>
                      <div className="px-4">
                        <input
                          type="password"
                          className="w-full px-4 py-1.5 rounded-md border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                          {...register("password", {
                            required: t("Password is required"),
                            minLength: {
                              value: 8,
                              message: t("Password must be at least 8 characters"),
                            },
                            pattern: {
                              value: /^(?=.*?[a-z])(?=.*?[0-9]).{8,}$/,
                              message: t(
                                "Password must contain at least 8 characters and a number"
                              ),
                            },
                          })}
                          autoComplete="new-password"
                          placeholder={t("Enter password")}
                        />
                        <p className="error-message-text">
                          {errors.password?.message}
                        </p>
                      </div>
                    </div>
                    <div className="grid lg:grid-cols-2 grid-cols-1">
                      <div className="px-4 py-2 font-semibold">{t("role")}</div>
                      <div className="px-4">
                        <select
                          className="w-full px-4 py-1.5 rounded-md border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                          {...register("role", {
                            required: t("Role is required"),
                          })}
                        >
                          <option value="">{t("Select a role")}</option>
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
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loadingUpdate}
                  className="w-full flex justify-center items-center hover:underline bg-black text-NoExcuseChallenge font-bold rounded-full my-6 py-4 px-8 shadow-lg focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out disabled:opacity-50"
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
