import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import Posts from '@/api/Posts';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';
import DefaultLayout from '@/layout/DefaultLayout';
import LOGO_ICON from '@/images/logo/logo-icon.svg';
import {formatDateDDMMYYYY} from '@/utils'

const NewsDetailPage = () => {
  const { pathname } = useLocation();
  const id = pathname.split('/')[2];
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [news, setNews] = useState({});
  const [html, setHtml] = useState('<div>Loading</div>');

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Posts.getPostsById(id)
        .then((response) => {
          setNews(response.data);
          setHtml(
            i18n.language === 'vi'
              ? response.data.text_vn
              : response.data.text_en,
          );
          setLoading(false);
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

  return (
    <DefaultLayout>
      <section className="text-gray-600 body-font min-h-screen bg-white mt-16 md:px-10">
        <div className="container px-5 py-10 mx-auto">
          <div className="flex flex-wrap w-full mb-8">
            <div className="w-full flex justify-between items-center gap-10">
              <div className="w-full mb-6 lg:mb-0">
                <h1 className="sm:text-4xl text-3xl font-medium title-font mb-2 text-gray-900">
                  {news?.title_en}
                </h1>
                <div className="h-1 w-20 bg-NoExcuseChallenge rounded"></div>
              </div>
              {/* <button
                onClick={() => navigate('/news')}
                className="px-6 py-2 text-center flex text-xs justify-center items-center hover:underline text-NoExcuseChallenge bg-black font-bold rounded-full shadow-lg focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out"
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
              </button> */}
            </div>
            <div className="md:mt-10">
              <div className='flex items-start flex-col md:flex-row gap-4 md:gap-10'>
                <img src={LOGO_ICON} className="w-10" />
                <div>
                  <p className='text-sm text-gray-600'>Posted By</p>
                  <p className='text-black font-semibold mt-2'>NoExcuseChallenge</p>
                </div>
                <div>
                  <p className='text-sm text-gray-600'>Date created</p>
                  <p className='text-black font-semibold mt-2'>{news.createdAt ? formatDateDDMMYYYY(news.createdAt) : ""}</p>
                </div>
                <div>
                  <p className='text-sm text-gray-600'>Views</p>
                  <p className='text-black font-semibold mt-2'>70</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 mt-10 mb-64 max-w-screen overflow-hidden">
                {news.type === 'text' && (
                  <div dangerouslySetInnerHTML={{ __html: html }} />
                )}
                {news.type === 'file' && (
                  <div className="mt-3">
                    <label className="block text-sm text-gray-700 dark:text-gray-400">
                      <span>Download File : </span>
                      <div className="mt-2">
                        <a
                          className="font-normal underline text-blue-500"
                          download
                          rel="noopener noreferrer"
                          target="_blank"
                          href={`${
                            import.meta.env.VITE_API_URL
                          }/uploads/posts/${
                            i18n.language === 'vi'
                              ? news.filename_vn
                              : news.filename_en
                          }`}
                        >
                          {i18n.language === 'vi'
                            ? news.filename_vn
                            : news.filename_en}
                        </a>
                      </div>
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </DefaultLayout>
  );
};

export default NewsDetailPage;
