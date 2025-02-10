import React from 'react';
import DefaultLayout from '@/layout/DefaultLayout';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Posts from '@/api/Posts';
import { formatDateDDMM, getFirstImageSrc } from '@/utils';
import LOGO_ICON from '@/images/logo/logo-icon.svg';
import NoContent from '@/components/NoContent';

const NewsPage: React.FC = () => {
  const news = [
    {
      title: 'What is Lorem Ipsum?',
      desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
      img: 'https://picsum.photos/300/400',
      author: 'Victor',
      views: 10,
      time: '21 Feb',
    },
    {
      title: 'What is Lorem Ipsum?',
      desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
      img: 'https://picsum.photos/300/400',
      author: 'Victor',
      views: 20,
      time: '21 Feb',
    },
    {
      title: 'What is Lorem Ipsum?',
      desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
      img: 'https://picsum.photos/300/400',
      author: 'Victor',
      views: 50,
      time: '21 Feb',
    },
    {
      title: 'What is Lorem Ipsum?',
      desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
      img: 'https://picsum.photos/300/400',
      author: 'Victor',
      views: 40,
      time: '21 Feb',
    },
    {
      title: 'What is Lorem Ipsum?',
      desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
      img: 'https://picsum.photos/300/400',
      author: 'Victor',
      views: 100,
      time: '21 Feb',
    },
    {
      title: 'What is Lorem Ipsum?',
      desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
      img: 'https://picsum.photos/300/400',
      author: 'Victor',
      views: 90,
      time: '21 Feb',
    },
  ];

  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPage, setTotalPage] = useState(0);
  const [data, setData] = useState([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Posts.getAllPosts(pageNumber, '', '')
        .then((response) => {
          const { list, pages } = response.data;
          setData(list);
          setTotalPage(pages);

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
  }, [pageNumber]);

  const handleNextPage = () => {
    setPageNumber((pageNumber) => pageNumber + 1);
  };

  const handlePrevPage = () => {
    setPageNumber((pageNumber) => pageNumber - 1);
  };

  return (
    <DefaultLayout>
      <div className="w-full md:p-24 py-24 px-10">
        <div className="grid grid-cols-2 2xl:grid-cols-3 gap-10">
          {data.map((ele) => (
            <div
              className=" bg-black text-white p-6 rounded-lg space-y-4"
              key={ele.title_en}
            >
              <div>
                <img
                  src={getFirstImageSrc(ele.text_en)}
                  className="rounded-lg w-full object-cover max-h-48 object-center"
                />
              </div>
              <h3 className="text-xl font-semibold">{ele.title_en}</h3>
              <p className="text-md text-gray-500">{ele.desc_en}</p>
              <div className="flex justify-between font-thin">
                <div className="flex gap-2">
                  <img src={LOGO_ICON} className='w-6' />
                  <p>DREAMCHAIN</p>
                  <p className="text-dreamchain">.</p>
                  <p className="text-dreamchain">{formatDateDDMM(ele.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    fill="#D99300"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    version="1.2"
                    baseProfile="tiny"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M21.821 12.43c-.083-.119-2.062-2.944-4.793-4.875-1.416-1.003-3.202-1.555-5.028-1.555-1.825 0-3.611.552-5.03 1.555-2.731 1.931-4.708 4.756-4.791 4.875-.238.343-.238.798 0 1.141.083.119 2.06 2.944 4.791 4.875 1.419 1.002 3.205 1.554 5.03 1.554 1.826 0 3.612-.552 5.028-1.555 2.731-1.931 4.71-4.756 4.793-4.875.239-.342.239-.798 0-1.14zm-9.821 4.07c-1.934 0-3.5-1.57-3.5-3.5 0-1.934 1.566-3.5 3.5-3.5 1.93 0 3.5 1.566 3.5 3.5 0 1.93-1.57 3.5-3.5 3.5zM14 13c0 1.102-.898 2-2 2-1.105 0-2-.898-2-2 0-1.105.895-2 2-2 1.102 0 2 .895 2 2z" />
                  </svg>
                  <p className="text-dreamchain">{ele.views}</p>
                </div>
              </div>
              <div className="w-full flex justify-center py-1.5 border rounded-md border-dreamchain">
                <Link to={`/news/${ele._id}`} className="w-full text-center">
                  See more
                </Link>
              </div>
            </div>
          ))}
        </div>
        {!loading && data.length === 0 && <NoContent />}
          {data.length > 0 && (
            <nav
              className="flex items-center justify-between pt-4"
              aria-label="Table navigation"
            >
              <span className="text-sm font-normal text-gray-500">
                Showing{" "}
                <span className="font-semibold text-gray-900">
                  {pageNumber}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-900">{totalPage}</span>{" "}
                page
              </span>
              <ul className="inline-flex items-center -space-x-px">
                <li>
                  <button
                    disabled={pageNumber === 1}
                    onClick={handlePrevPage}
                    className={`block px-3 py-2 ml-0 leading-tight text-gray-500 ${
                      pageNumber === 1 ? "bg-gray-100" : "bg-white"
                    } border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700`}
                  >
                    <span className="sr-only">Previous</span>
                    <svg
                      className="w-5 h-5"
                      aria-hidden="true"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </button>
                </li>
                <li>
                  <button
                    disabled={pageNumber === totalPage}
                    onClick={handleNextPage}
                    className={`block px-3 py-2 leading-tight text-gray-500 ${
                      pageNumber === totalPage ? "bg-gray-100" : "bg-white"
                    } border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700`}
                  >
                    <span className="sr-only">Next</span>
                    <svg
                      className="w-5 h-5"
                      aria-hidden="true"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </button>
                </li>
              </ul>
            </nav>
          )}
      </div>
    </DefaultLayout>
  );
};

export default NewsPage;
