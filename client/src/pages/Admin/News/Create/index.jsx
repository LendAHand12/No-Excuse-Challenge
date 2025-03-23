import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import TextEditor from '@/components/TextEditor';
import { useForm } from 'react-hook-form';
import Loading from '@/components/Loading';
import UploadFile from '@/components/UploadFile';
import Posts from '@/api/Posts';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import DefaultLayout from '@/layout/DefaultLayout';

const CreatePostPage = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: { type: 'text' },
  });

  const watchShowType = watch('type');

  const onSubmit = async (values) => {
    var formData = new FormData();

    formData.append('type', values.type);
    formData.append('title_vn', values.title_vn);
    formData.append('title_en', values.title_en);
    formData.append('text_vn', values.text_vn ? values.text_vn : '');
    formData.append('text_en', values.text_en ? values.text_en : '');
    formData.append('desc_vn', values.desc_vn ? values.desc_vn : '');
    formData.append('desc_en', values.desc_en ? values.desc_en : '');
    formData.append('file_vn', values.file_vn);
    formData.append('file_en', values.file_en);
    setLoading(true);
    await Posts.createPost(formData)
      .then((response) => {
        const { message } = response.data;
        toast.success(t(message));
        setLoading(false);
        navigate('/admin/news');
      })
      .catch((error) => {
        let message =
          error.response && error.response.data.error
            ? error.response.data.error
            : error.message;
        toast.error(t(message));
        setLoading(false);
      });
  };

  return (
    <DefaultLayout>
      <div className="py-24 px-10">
        <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Create a new news</h1>
            <div className="flex items-center gap-6">
              {/* <button
              onClick={handleSubmit((values) => onSubmit(values, "preview"))}
              className="w-64 flex justify-center items-center hover:underline font-bold rounded-full my-6 py-4 px-8 border shadow-lg focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out"
            >
              {t("saveDrap")}
            </button> */}
              <button
                className="w-64 flex justify-center gap-2 items-center hover:underline text-NoExcuseChallenge bg-black rounded-full py-2 shadow-lg focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out"
                onClick={(e) => {
                  e.preventDefault();
                  history.push('/admin/news');
                }}
              >
                <svg
                  fill="currentColor"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  id="left"
                  data-name="Flat Color"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    id="primary"
                    d="M21,11H5.41l5.3-5.29A1,1,0,1,0,9.29,4.29l-7,7a1,1,0,0,0,0,1.42l7,7a1,1,0,0,0,1.42,0,1,1,0,0,0,0-1.42L5.41,13H21a1,1,0,0,0,0-2Z"
                  ></path>
                </svg>
                Back to list page
              </button>
            </div>
          </div>
          <div className="mt-10">
            <div className="mb-10">
              <span className="mb-2 block font-semibold text-gray-900">
                Vietnamese title :
              </span>
              <div>
                <input
                  id="title_vn"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                  {...register('title_vn', {
                    required: t('required'),
                  })}
                ></input>
                <p className="text-sm text-red-500">
                  {errors.title_vn?.message}
                </p>
              </div>
            </div>
            <div className="mb-10">
              <span className="mb-2 block font-semibold text-gray-900">
                English title :
              </span>
              <div>
                <input
                  id="title_en"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                  {...register('title_en', {
                    required: t('required'),
                  })}
                ></input>
                <p className="text-sm text-red-500">
                  {errors.title_en?.message}
                </p>
              </div>
            </div>
            <div className="mb-10">
              <span className="mb-2 block font-semibold text-gray-900">
                Type :
              </span>
              <div>
                <select
                  id="type"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                  {...register('type', {
                    required: t('required'),
                  })}
                >
                  <option value="text">Text</option>
                  <option value="file">File</option>
                </select>
                <p className="text-sm text-red-500">{errors.type?.message}</p>
              </div>
            </div>
            {watchShowType === 'file' ? (
              <>
                <div className="mb-10">
                  <span className="mb-2 block font-semibold text-gray-900">
                    Vietnamese file :
                  </span>
                  <UploadFile
                    onFileChange={(files) => setValue('file_vn', files[0])}
                  />
                </div>
                <div className="mb-10">
                  <span className="mb-2 block font-semibold text-gray-900">
                    English files :
                  </span>
                  <UploadFile
                    onFileChange={(files) => setValue('file_en', files[0])}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="mb-10">
                  <span className="mb-2 block font-semibold text-gray-900">
                  Vietnamese description :
                  </span>
                  <div>
                    <input
                      id="desc_vn"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                      {...register('desc_vn', {
                        required: t('required'),
                      })}
                    ></input>
                    <p className="text-sm text-red-500">
                      {errors.desc_vn?.message}
                    </p>
                  </div>
                </div>
                <div className="mb-10">
                  <span className="mb-2 block font-semibold text-gray-900">
                    English description :
                  </span>
                  <div>
                    <input
                      id="desc_en"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                      {...register('desc_en', {
                        required: t('required'),
                      })}
                    ></input>
                    <p className="text-sm text-red-500">
                      {errors.desc_en?.message}
                    </p>
                  </div>
                </div>
                <div className="mb-10">
                  <span className="mb-2 block font-semibold text-gray-900">
                    Vietnamese content :
                  </span>
                  <TextEditor
                    onChange={(content) => {
                      setValue('text_vn', content);
                    }}
                  />
                  <p className="text-sm text-red-500">
                    {errors.text_vn?.message}
                  </p>
                </div>
                <div className="mb-10">
                  <span className="mb-2 block font-semibold text-gray-900">
                    English content :
                  </span>
                  <TextEditor
                    onChange={(content) => {
                      setValue('text_en', content);
                    }}
                  />
                  <p className="text-sm text-red-500">
                    {errors.text_en?.message}
                  </p>
                </div>
              </>
            )}

            <button
              type="submit"
              className="w-full flex justify-center items-center hover:underline text-NoExcuseChallenge bg-black font-bold rounded-full my-6 py-4 px-8 shadow-lg focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out"
            >
              {loading ? <Loading /> : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </DefaultLayout>
  );
};

export default CreatePostPage;
