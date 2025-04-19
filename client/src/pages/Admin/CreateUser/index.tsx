import { useCallback, useState } from "react";

import User from "@/api/User";
import Loading from "@/components/Loading";
import axios from "axios";
import "react-confirm-alert/src/react-confirm-alert.css";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import DefaultLayout from "../../../layout/DefaultLayout";
import "./index.css";

const CreateUser = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  // const [packageOptions, setPackageOptions] = useState([]);
  const [phone, setPhone] = useState("");
  const [errorPhone, setErrPhone] = useState(false);
  const [loadingUploadFileFront, setLoadingUploadFileFront] = useState(false);
  const [loadingUploadFileBack, setLoadingUploadFileBack] = useState(false);
  const [imgFront, setImgFront] = useState("");
  const [imgBack, setImgBack] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      tier: 2,
    },
  });

  const onSubmit = useCallback(
    async (values) => {
      if (phone === "") {
        setErrPhone(true);
        return;
      }
      const body = {
        ...values,
        imgFront,
        imgBack,
        phone,
      };

      setLoadingUpdate(true);
      await User.createUser(body)
        .then((response) => {
          setLoadingUpdate(false);
          toast.success(t(response.data.message));
          navigate("/admin/users");
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
    [imgFront, imgBack, phone]
  );

  const uploadFile = (file, forData) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "sdblmpca");

    if (forData === "front") {
      setLoadingUploadFileFront(true);
    } else {
      setLoadingUploadFileBack(true);
    }
    axios
      .post(`${import.meta.env.VITE_CLOUDINARY_URL}/image/upload`, formData, {
        headers: {
          "content-type": "multipart/form-data",
        },
      })
      .then((response) => {
        if (forData === "front") {
          setLoadingUploadFileFront(false);
          setImgFront(response.data.secure_url);
        } else {
          setLoadingUploadFileBack(false);
          setImgBack(response.data.secure_url);
        }
      })
      .catch((error) => {
        console.log(error);
        let message =
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message;
        toast.error(message);
        if (forData === "front") {
          setLoadingUploadFileFront(false);
        } else {
          setLoadingUploadFileBack(false);
        }
      });
  };

  return (
    <DefaultLayout>
      <ToastContainer />
      <div className="py-24 px-10">
      <div className="container mx-auto">
        <h1 className="text-center mb-4 text-2xl font-semibold">
          {t("createUser")}
        </h1>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="md:flex no-wrap md:-mx-2"
        >
          <div className="w-full lg:w-3/5 lg:mx-auto">
            <div className="bg-white">
              <div className="text-gray-700">
                <div className="grid grid-cols-1 gap-4 text-sm">
                  <div className="grid lg:grid-cols-2 grid-cols-1">
                    <div className="px-4 py-2 font-semibold">
                      {t("user name")}
                    </div>
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
                  </div>
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
                    <div className="px-4 py-2 font-semibold">{t("phone")}</div>
                    <div className="px-4 py-2">
                      <PhoneInput
                        defaultCountry="VN"
                        placeholder={t("phone")}
                        value={phone}
                        onChange={setPhone}
                      />
                      <p className="error-message-text">
                        {errorPhone && t("Phone is required")}
                      </p>
                    </div>
                  </div>
                  <div className="grid lg:grid-cols-2 grid-cols-1">
                    <div className="px-4 py-2 font-semibold">
                      {t("id code")}
                    </div>
                    <div className="px-4">
                      <input
                        className="w-full px-4 py-1.5 rounded-md border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                        {...register("idCode", {
                          required: t("id code is required"),
                        })}
                        autoComplete="off"
                      />
                      <p className="error-message-text">
                        {errors.idCode?.message}
                      </p>
                    </div>
                  </div>
                  <div className="grid lg:grid-cols-2 grid-cols-1">
                    <div className="px-4 py-2 font-semibold">
                      {t("walletAddress")}
                    </div>
                    <div className="px-4">
                      <input
                        className="w-full px-4 py-1.5 rounded-md border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                        {...register("walletAddress", {
                          required: t("Wallet address is required"),
                          pattern: {
                            value: /^0x[a-fA-F0-9]{40}$/g,
                            message: t(
                              "Please enter the correct wallet format"
                            ),
                          },
                        })}
                        autoComplete="off"
                      />
                      <p className="error-message-text">
                        {errors.walletAddress?.message}
                      </p>
                    </div>
                  </div>
                  <div className="grid lg:grid-cols-2 grid-cols-1">
                    <div className="px-4 py-2 font-semibold">Tier</div>
                    <div className="px-4">
                      <input
                        className="w-full px-4 py-1.5 rounded-md border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                        {...register("tier", {
                          required: t("tier is required"),
                        })}
                        min={2}
                        max={5}
                        type="number"
                        autoComplete="off"
                      />
                      <p className="error-message-text">
                        {errors.tier?.message}
                      </p>
                    </div>
                  </div>
                  <div className="grid lg:grid-cols-2 grid-cols-1">
                    <div className="px-4 py-2 font-semibold">
                      {t("password")}
                    </div>
                    <div className="px-4">
                      <input
                        className="w-full px-4 py-1.5 rounded-md border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                        type="text"
                        {...register("password", {
                          required: t("Password is required"),
                          pattern: {
                            value: /^(?=.*?[a-z])(?=.*?[0-9]).{8,}$/,
                            message: t(
                              "Password must contain at least 8 characters and a number"
                            ),
                          },
                        })}
                        disabled={loadingUpdate}
                      />
                      <p className="error-message-text">
                        {errors.password?.message}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-center my-4">
                    <div className="max-w-2xl rounded-lg shadow-xl bg-gray-50">
                      <div className="m-4">
                        <label className="inline-block mb-2 text-gray-500">
                          {t("idCardFront")}
                        </label>
                        <div className="flex flex-col items-center justify-center w-full">
                          <label className="flex flex-col w-full h-40 border-4 border-blue-200 border-dashed hover:bg-gray-100 hover:border-gray-300">
                            {imgFront !== "" ? (
                              <img
                                src={imgFront}
                                className="w-full h-full"
                                alt="the front of identity card"
                              />
                            ) : (
                              <div className="flex flex-col items-center justify-center pt-7">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="w-8 h-8 text-gray-400 group-hover:text-gray-600"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                  />
                                </svg>
                                <p className="pt-1 text-sm tracking-wider text-gray-400 group-hover:text-gray-600">
                                  {loadingUploadFileFront
                                    ? "Uploading..."
                                    : "Attach a file"}
                                </p>
                              </div>
                            )}
                            <input
                              type="file"
                              onChange={(e) => {
                                e.preventDefault();
                                let file = e.target.files[0];
                                if (file && file.type.match("image.*")) {
                                  uploadFile(file, "front");
                                }
                              }}
                              accept="image/png, imgage/jpg, image/jpeg"
                              className="opacity-0"
                            />
                          </label>
                          <p className="error-message-text">
                            {errors.imgFrontData?.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center my-4">
                    <div className="max-w-2xl rounded-lg shadow-xl bg-gray-50">
                      <div className="m-4">
                        <label className="inline-block mb-2 text-gray-500">
                          {t("idCardBack")}
                        </label>
                        <div className="flex flex-col items-center justify-center w-full">
                          <label className="flex flex-col w-full h-40 border-4 border-blue-200 border-dashed hover:bg-gray-100 hover:border-gray-300">
                            {imgBack !== "" ? (
                              <img
                                src={imgBack}
                                className="w-full h-full"
                                alt="the back of identity card"
                              />
                            ) : (
                              <div className="flex flex-col items-center justify-center pt-7">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="w-8 h-8 text-gray-400 group-hover:text-gray-600"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                  />
                                </svg>
                                <p className="pt-1 text-sm tracking-wider text-gray-400 group-hover:text-gray-600">
                                  {loadingUploadFileBack
                                    ? "Uploading..."
                                    : "Attach a file"}
                                </p>
                              </div>
                            )}
                            <input
                              type="file"
                              onChange={(e) => {
                                e.preventDefault();
                                let file = e.target.files[0];
                                if (file && file.type.match("image.*")) {
                                  uploadFile(file, "back");
                                }
                              }}
                              accept="image/png, imgage/jpg, image/jpeg"
                              className="opacity-0"
                            />
                          </label>
                          <p className="error-message-text">
                            {errors.imgBackData?.message}
                          </p>
                        </div>
                      </div>
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
                Create
              </button>
              <button
                // onClick={() => setEditting(false)}
                className="w-full flex justify-center items-center hover:underline border font-bold rounded-full my-6 py-4 px-8 shadow-lg focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out"
              >
                {t("cancel")}
              </button>
            </div>
          </div>
        </form>
      </div>
      </div>
    </DefaultLayout>
  );
};

export default CreateUser;
