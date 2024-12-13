import React from 'react';
import DefaultLayout from '../../layout/DefaultLayout';

const ContactPage: React.FC = () => {
  return (
    <DefaultLayout>
      <div className="w-full mt-16 lg:mt-10 p-10 lg:p-16 text-black text-lg space-y-24">
        <div className="space-y-10">
          <div className="space-y-2">
            <h3 className="lg:text-3xl text-2xl font-bold">Contact Us</h3>
            <p className="text-[16px]">
              Donec amet est quisque etiam sollicitudin pharetra tortor
              phasellus enim.
            </p>
          </div>
          <div className="space-y-10">
            <div className="flex flex-col lg:flex-row gap-10 lg:gap-12">
              <div className="flex items-center gap-2">
                <svg
                  width="50"
                  height="50"
                  viewBox="0 0 50 50"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M21.1125 21.9499L24.4687 18.8749C25.3864 18.0325 26.0315 16.935 26.321 15.7234C26.6105 14.5117 26.5314 13.2412 26.0937 12.0749L24.6625 8.25301C24.1278 6.8262 23.0692 5.65692 21.7024 4.9834C20.3356 4.30988 18.7635 4.18278 17.3062 4.62801C11.9437 6.26864 7.82186 11.253 9.09061 17.1718C9.92498 21.0655 11.5219 25.953 14.5469 31.153C17.5781 36.3655 21.0406 40.2155 24.0094 42.9218C28.4906 46.9999 34.8969 45.9811 39.0187 42.1374C40.1236 41.1072 40.7941 39.6944 40.8934 38.187C40.9926 36.6796 40.5133 35.1911 39.5531 34.0249L36.9281 30.8374C36.1364 29.8735 35.0744 29.1685 33.8787 28.8132C32.683 28.4579 31.4083 28.4685 30.2187 28.8436L25.8812 30.2093C24.7611 29.0533 23.7795 27.7706 22.9562 26.3874C22.1616 24.9885 21.5424 23.4971 21.1125 21.9468V21.9499Z"
                    fill="#02071B"
                  />
                </svg>
                <div className="space-y-2">
                  <p className="font-bold">Phone</p>
                  <p>+8481276381</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  width="50"
                  height="50"
                  viewBox="0 0 50 50"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M41.6666 16.6668L25 27.0835L8.33329 16.6668V12.5002L25 22.9168L41.6666 12.5002M41.6666 8.3335H8.33329C6.02079 8.3335 4.16663 10.1877 4.16663 12.5002V37.5002C4.16663 38.6052 4.60561 39.665 5.38701 40.4464C6.16842 41.2278 7.22822 41.6668 8.33329 41.6668H41.6666C42.7717 41.6668 43.8315 41.2278 44.6129 40.4464C45.3943 39.665 45.8333 38.6052 45.8333 37.5002V12.5002C45.8333 11.3951 45.3943 10.3353 44.6129 9.55388C43.8315 8.77248 42.7717 8.3335 41.6666 8.3335Z"
                    fill="#02071B"
                  />
                </svg>

                <div className="space-y-2">
                  <p className="font-bold">Email</p>
                  <p>Lorem ipsum@ gmail.com</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <svg
                width="50"
                height="50"
                viewBox="0 0 50 50"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M25 24.9998C26.1459 24.9998 27.1271 24.5915 27.9438 23.7748C28.7591 22.9596 29.1667 21.979 29.1667 20.8332C29.1667 19.6873 28.7591 18.7061 27.9438 17.8894C27.1271 17.0741 26.1459 16.6665 25 16.6665C23.8542 16.6665 22.8737 17.0741 22.0584 17.8894C21.2417 18.7061 20.8334 19.6873 20.8334 20.8332C20.8334 21.979 21.2417 22.9596 22.0584 23.7748C22.8737 24.5915 23.8542 24.9998 25 24.9998ZM25 45.8332C19.4098 41.0762 15.2348 36.6575 12.475 32.5769C9.71393 28.4978 8.33337 24.7221 8.33337 21.2498C8.33337 16.0415 10.0091 11.8922 13.3605 8.80192C16.7105 5.71164 20.5903 4.1665 25 4.1665C29.4098 4.1665 33.2896 5.71164 36.6396 8.80192C39.991 11.8922 41.6667 16.0415 41.6667 21.2498C41.6667 24.7221 40.2868 28.4978 37.5271 32.5769C34.766 36.6575 30.5903 41.0762 25 45.8332Z"
                  fill="#02071B"
                />
              </svg>
              <div className="space-y-2">
                <p className="font-bold">Adress</p>
                <p>Lorem ipsum dolor</p>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-10">
          <div>
            <h3 className="lg:text-3xl text-2xl font-bold">Contact Direct</h3>
            <p className="text-[16px]">
              Donec amet est quisque etiam sollicitudin pharetra tortor
              phasellus enim.
            </p>
          </div>
          <div className="max-w-180">
            <form action="#">
              <div className="mb-4.5">
                <input
                  type="text"
                  placeholder="Full name"
                  className="w-full rounded-xl border-black border-[1.5px] bg-transparent py-3 px-5 text-black outline-none transition focus:border-dreamchain active:border-dreamchain disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>
              <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                <div className="w-full xl:w-1/2">
                  <input
                    type="text"
                    placeholder="Phone number"
                    className="w-full rounded-xl border-black border-[1.5px] bg-transparent py-3 px-5 text-black outline-none transition focus:border-dreamchain active:border-dreamchain disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>

                <div className="w-full xl:w-1/2">
                  <input
                    type="text"
                    placeholder="Your email"
                    className="w-full rounded-xl border-black border-[1.5px] bg-transparent py-3 px-5 text-black outline-none transition focus:border-dreamchain active:border-dreamchain disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>
              </div>
              <div className="mb-6">
                <textarea
                  rows={6}
                  placeholder="Type your message"
                  className="w-full rounded-xl border-black border-[1.5px] bg-transparent py-3 px-5 text-black outline-none transition focus:border-dreamchain active:border-dreamchain disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                ></textarea>
              </div>

              <button className="flex w-36 text-[16px] justify-center rounded-xl border-black bg-black p-3 font-medium text-dreamchain hover:bg-opacity-90">
                Advise Me
              </button>
            </form>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default ContactPage;
