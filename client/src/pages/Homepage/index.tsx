import React from 'react';
import COVER1 from '../../images/cover/cover-02.png';
import DefaultLayout from '../../layout/DefaultLayout';
import { useTranslation } from 'react-i18next';

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <DefaultLayout>
      <div className="w-full mt-10 lg:mt-0">
        <div className="flex">
          <div className="py-14 2xl:pl-16 px-10">
            <p className="text-[#] font-bold">{t('homepage.aboutUs')}</p>
            <h1 className="text-black text-4xl font-medium mt-3 mb-2">
              {t('homepage.title')}
            </h1>
            <p className="text-[#02071B] text-lg">
              {t('homepage.subtitle')}
            </p>
            <p className="text-[#02071B] text-lg font-semibold mt-10">
              "{t('homepage.quote1')}"
            </p>
          </div>
          <img
            src={COVER1}
            className="hidden xl:block w-full xl:w-1/2 object-center"
          />
        </div>
        <div className="grid grid-cols-1 2xl:grid-cols-2">
          <div className="py-10 2xl:pl-16 px-10 3xl:-mt-64">
            <div className="border w-1/2 border-black"></div>
            <h1 className="text-black text-2xl font-semibold mt-3 mb-6 pt-3">
              {t('homepage.whatIsTitle')}
            </h1>
            <p className="text-[#02071B] text-lg whitespace-pre-line">
              {t('homepage.whatIsDesc')}
            </p>
            <p className="text-[#02071B] text-lg font-semibold mt-10">
              "{t('homepage.quote2')}"
            </p>
          </div>
          <div className="py-10 2xl:pl-16 px-10">
            <div className="border w-1/2 border-black"></div>
            <h1 className="text-black text-2xl font-semibold mt-3 mb-6 pt-3">
              {t('homepage.whyJoinTitle')}
            </h1>
            <p className="text-[#02071B] text-lg whitespace-pre-line">
              {t('homepage.whyJoinDesc')}
            </p>
            <p className="text-[#02071B] text-lg font-semibold mt-10">
              "{t('homepage.quote3')}"
            </p>
          </div>
          <div className="py-10 2xl:pl-16 px-10 3xl:-mt-32">
            <div className="border w-1/2 border-black"></div>
            <h1 className="text-black text-2xl font-semibold mt-3 mb-6 pt-3">
              {t('homepage.howItWorksTitle')}
            </h1>
            <p className="text-[#02071B] text-lg whitespace-pre-line">
              {t('homepage.howItWorksDesc')}
            </p>
            <p className="text-[#02071B] text-lg font-semibold mt-10">
              "{t('homepage.quote4')}"
            </p>
          </div>
          <div className="py-10 pb-10 2xl:pl-16 px-10">
            <div className="border w-1/2 border-black"></div>
            <h1 className="text-black text-2xl font-semibold mt-3 mb-6 pt-3">
              {t('homepage.takeActionTitle')}
            </h1>
            <p className="text-[#02071B] text-lg">
              {t('homepage.takeActionDesc')}
            </p>
            <p className="text-[#02071B] text-lg font-semibold mt-10">
              "{t('homepage.quote5')}"
            </p>
          </div>
          <div className="pb-20 2xl:pl-16 px-10">
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default HomePage;
