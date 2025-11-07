import React from 'react';
import DefaultLayout from '../../layout/DefaultLayout';
import { useTranslation } from 'react-i18next';

const RulesPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <DefaultLayout>
      <div className="w-full md:p-24 py-24 px-10 space-y-10">
        <div>
          <h1 className="text-3xl font-bold mb-4">{t('rules.title')}</h1>
          <p className="">{t('rules.subtitle')}</p>
        </div>
        <div className="space-y-8">
          <div className="space-y-4">
            <b className="text-xl font-bold">{t('rules.section1.title')}</b>
            <ul className="grid list-disc gap-2">
              <li className="ml-6">{t('rules.section1.item1')}</li>
              <li className="ml-6">{t('rules.section1.item2')}</li>
            </ul>
          </div>
        </div>
        <div className="space-y-8">
          <div className="space-y-4">
            <b className="text-xl font-bold">{t('rules.section2.title')}</b>
            <ul className="grid list-disc gap-2">
              <li className="ml-6">
                <b>{t('rules.section2.item1.label')}</b> :{' '}
                {t('rules.section2.item1.text')}
              </li>
              <li className="ml-6">
                <b>{t('rules.section2.item2.label')}</b>:{' '}
                {t('rules.section2.item2.text')}
              </li>
              <li className="ml-6">
                <b>{t('rules.section2.item3.label')}</b>:{' '}
                {t('rules.section2.item3.text')}
              </li>
              <li className="ml-6">
                <b>{t('rules.section2.item4.label')}</b> :{' '}
                {t('rules.section2.item4.text')}
              </li>
              <li className="ml-6">
                <b>{t('rules.section2.item5.label')}</b>:{' '}
                {t('rules.section2.item5.text')}
              </li>
              <li className="ml-6">
                <b>{t('rules.section2.item6.label')}</b>:{' '}
                {t('rules.section2.item6.text')}
              </li>
              <li className="ml-6">
                <b>{t('rules.section2.item7.label')}</b>:{' '}
                {t('rules.section2.item7.text')}
              </li>
              <li className="ml-6">
                <b>{t('rules.section2.item8.label')}</b>:{' '}
                {t('rules.section2.item8.text')}
              </li>
            </ul>
          </div>
        </div>
        <div className="space-y-8">
          <div className="space-y-4">
            <b className="text-xl font-bold">{t('rules.section3.title')}</b>
            <ul className="grid list-disc gap-2">
              <li className="ml-6">
                <b>{t('rules.section3.premium.label')}</b>
                <ul className="grid list-disc gap-2 mt-2">
                  <li className="ml-6">{t('rules.section3.premium.item1')}</li>
                  <li className="ml-6">{t('rules.section3.premium.item2')}</li>
                </ul>
              </li>
              <li className="ml-6">
                <b>{t('rules.section3.penalty.label')}</b>
                <ul className="grid list-disc gap-2 mt-2">
                  <li className="ml-6">{t('rules.section3.penalty.item1')}</li>
                  <li className="ml-6">{t('rules.section3.penalty.item2')}</li>
                </ul>
              </li>
              <li className="ml-6">
                <b>{t('rules.section3.binary.label')}</b>
                <ul className="grid list-disc gap-2 mt-2">
                  <li className="ml-6">{t('rules.section3.binary.item1')}</li>
                  <li className="ml-6">{t('rules.section3.binary.item2')}</li>
                  <li className="ml-6">{t('rules.section3.binary.item3')}</li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
        <div className="space-y-8">
          <div className="space-y-4">
            <b className="text-xl font-bold">{t('rules.section4.title')}</b>
            <ul className="grid list-disc gap-2">
              <li className="ml-6">{t('rules.section4.item1')}</li>
              <li className="ml-6">{t('rules.section4.item2')}</li>
              <li className="ml-6">{t('rules.section4.item3')}</li>
            </ul>
          </div>
        </div>
        <div className="space-y-8">
          <div className="space-y-4">
            <b className="text-xl font-bold">{t('rules.section5.title')}</b>
            <ul className="grid list-disc gap-2">
              <li className="ml-6">{t('rules.section5.item1')}</li>
              <li className="ml-6">{t('rules.section5.item2')}</li>
              <li className="ml-6">{t('rules.section5.item3')}</li>
              <li className="ml-6">{t('rules.section5.item4')}</li>
            </ul>
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <b className="text-xl font-bold">{t('rules.section6.title')}</b>
            <ul className="grid list-disc gap-2">
              <li className="ml-6">{t('rules.section6.item1')}</li>
              <li className="ml-6">{t('rules.section6.item2')}</li>
              <li className="ml-6">{t('rules.section6.item3')}</li>
              <li className="ml-6">{t('rules.section6.item4')}</li>
            </ul>
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <b className="text-xl font-bold">{t('rules.section7.title')}</b>
            <ul className="grid list-disc gap-2">
              <li className="ml-6">{t('rules.section7.item1')}</li>
              <li className="ml-6">{t('rules.section7.item2')}</li>
            </ul>
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <b className="text-xl font-bold">{t('rules.section8.title')}</b>
            <ul className="grid list-disc gap-2">
              <li className="ml-6">{t('rules.section8.item1')}</li>
              <li className="ml-6">{t('rules.section8.item2')}</li>
              <li className="ml-6">{t('rules.section8.item3')}</li>
              <li className="ml-6">{t('rules.section8.item4')}</li>
              <li className="ml-6">{t('rules.section8.item5')}</li>
            </ul>
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <b className="text-xl font-bold">{t('rules.section9.title')}</b>
            <ul className="grid list-disc gap-2">
              <li className="ml-6">{t('rules.section9.item1')}</li>
              <li className="ml-6">{t('rules.section9.item2')}</li>
              <li className="ml-6">{t('rules.section9.item3')}</li>
            </ul>
            <p>
              <b>{t('rules.section9.text1')}</b>
            </p>
            <p>{t('rules.section9.text2')}</p>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default RulesPage;
