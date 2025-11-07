import React from 'react';
import DefaultLayout from '../../layout/DefaultLayout';
import { useTranslation } from 'react-i18next';

const Mechanism: React.FC = () => {
  const { t } = useTranslation();

  return (
    <DefaultLayout>
      <div className="w-full md:p-24 py-24 px-10 space-y-10">
        <div>
          <h1 className="text-3xl font-bold mb-4">{t('mechanism.title')}</h1>
          <p className="">{t('mechanism.intro')}</p>
        </div>
        <div className="space-y-8">
          <div className="space-y-4">
            <b className="text-xl font-bold">{t('mechanism.section1.title')}</b>
            <p>{t('mechanism.section1.intro')}</p>
            <ul className="grid md:grid-cols-2 list-disc gap-4 md:gap-8">
              <li className="ml-6">{t('mechanism.section1.itemA')}</li>
              <li className="ml-6">{t('mechanism.section1.itemB')}</li>
              <li className="ml-6">{t('mechanism.section1.itemC')}</li>
              <li className="ml-6">{t('mechanism.section1.itemD')}</li>
              <li className="ml-6">{t('mechanism.section1.itemE')}</li>
              <li className="ml-6">{t('mechanism.section1.itemF')}</li>
            </ul>
          </div>
        </div>
        <div className="space-y-8">
          <div className="space-y-4">
            <b className="text-xl font-bold">{t('mechanism.section2.title')}</b>
            <ul className="grid md:grid-cols-2 list-disc gap-4 md:gap-8">
              <li className="ml-6">{t('mechanism.section2.item1')}</li>
              <li className="ml-6">{t('mechanism.section2.item2')}</li>
            </ul>
          </div>
        </div>
        <div className="space-y-8">
          <div className="space-y-4">
            <b className="text-xl font-bold">{t('mechanism.section3.title')}</b>
            <ul className="grid md:grid-cols-2 list-disc gap-4 md:gap-8">
              <li className="ml-6">{t('mechanism.section3.item1')}</li>
              <li className="ml-6">{t('mechanism.section3.item2')}</li>
            </ul>
          </div>
        </div>
        <div className="space-y-8">
          <div className="space-y-4">
            <b className="text-xl font-bold">{t('mechanism.section4.title')}</b>
            <ul className="grid md:grid-cols-2 list-disc gap-4 md:gap-8">
              <li className="ml-6">{t('mechanism.section4.item1')}</li>
              <li className="ml-6">{t('mechanism.section4.item2')}</li>
            </ul>
          </div>
        </div>
        <div className="space-y-8">
          <div className="space-y-4">
            <b className="text-xl font-bold">{t('mechanism.section5.title')}</b>
            <ul className="grid md:grid-cols-2 list-disc gap-4 md:gap-8">
              <li className="ml-6">{t('mechanism.section5.item1')}</li>
            </ul>
          </div>
        </div>
        <div className="space-y-8">
          <div className="space-y-4">
            <b className="text-xl font-bold">{t('mechanism.section6.title')}</b>
            <ul className="grid md:grid-cols-2 list-disc gap-4 md:gap-8">
              <li className="ml-6">{t('mechanism.section6.item1')}</li>
              <li className="ml-6">{t('mechanism.section6.item2')}</li>
            </ul>
          </div>
        </div>
        <div className="space-y-8">
          <div className="space-y-4">
            <b className="text-xl font-bold">{t('mechanism.section7.title')}</b>
            <ul className="grid md:grid-cols-2 list-disc gap-4 md:gap-8">
              <li className="ml-6">{t('mechanism.section7.item1')}</li>
              <li className="ml-6">{t('mechanism.section7.item2')}</li>
            </ul>
          </div>
        </div>
        <div className="space-y-8">
          <div className="space-y-4">
            <b className="text-xl font-bold">{t('mechanism.section8.title')}</b>
            <ul className="grid md:grid-cols-2 list-disc gap-4 md:gap-8">
              <li className="ml-6">{t('mechanism.section8.item1')}</li>
              <li className="ml-6">{t('mechanism.section8.item2')}</li>
            </ul>
          </div>
        </div>
        <div className="space-y-8">
          <div className="space-y-4">
            <b className="text-xl font-bold">{t('mechanism.section9.title')}</b>
            <ul className="grid md:grid-cols-2 list-disc gap-4 md:gap-8">
              <li className="ml-6">{t('mechanism.section9.item1')}</li>
              <li className="ml-6">{t('mechanism.section9.item2')}</li>
            </ul>
          </div>
        </div>
        <div className="space-y-8">
          <div className="space-y-4">
            <b className="text-xl font-bold">
              {t('mechanism.section10.title')}
            </b>
            <ul className="grid md:grid-cols-2 list-disc gap-4 md:gap-8">
              <li className="ml-6">{t('mechanism.section10.item1')}</li>
              <li className="ml-6">{t('mechanism.section10.item2')}</li>
            </ul>
          </div>
        </div>
        <div className="bg-[#F2F4F7] p-4 rounded-2xl">
          {t('mechanism.conclusion')}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Mechanism;
