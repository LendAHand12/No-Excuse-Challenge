import React from 'react';
import DefaultLayout from '../../layout/DefaultLayout';
import { useTranslation } from 'react-i18next';

const TermsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <DefaultLayout>
      <div className="w-full md:p-24 py-24 px-10 space-y-10">
        <div>
          <h1 className="text-3xl font-bold mb-4">{t('terms.title')}</h1>
          <p className="">{t('terms.effectiveDate')}</p>
        </div>
        <div className="space-y-8">
          <div className="space-y-4">
            <b className="text-xl font-bold">{t('terms.section1.title')}</b>
            <ul className="grid list-disc gap-4 md:gap-8">
              <li className="ml-6">{t('terms.section1.content')}</li>
            </ul>
          </div>
        </div>
        <div className="space-y-8">
          <div className="space-y-4">
            <b className="text-xl font-bold">{t('terms.section2.title')}</b>
            <ul className="grid list-disc gap-4 md:gap-8">
              <li className="ml-6">{t('terms.section2.content')}</li>
            </ul>
          </div>
        </div>
        <div className="space-y-8">
          <div className="space-y-4">
            <b className="text-xl font-bold">{t('terms.section3.title')}</b>
            <ul className="grid list-disc gap-4 md:gap-8">
              <li className="ml-6">{t('terms.section3.content')}</li>
            </ul>
          </div>
        </div>
        <div className="space-y-8">
          <div className="space-y-4">
            <b className="text-xl font-bold">{t('terms.section4.title')}</b>
            <ul className="grid list-disc gap-4 md:gap-8">
              <li className="ml-6">{t('terms.section4.content')}</li>
            </ul>
          </div>
        </div>
        <div className="space-y-8">
          <div className="space-y-4">
            <b className="text-xl font-bold">{t('terms.section5.title')}</b>
            <p className="font-medium">{t('terms.section5.intro')}</p>
            <ul className="grid md:grid-cols-3 gap-4 md:gap-8">
              <li className="flex items-start gap-6">
                <span>• {t('terms.section5.item1')}</span>
              </li>
              <li className="flex items-start gap-6">
                <span>• {t('terms.section5.item2')}</span>
              </li>
              <li className="flex items-start gap-6">
                <span>• {t('terms.section5.item3')}</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="space-y-8">
          <div className="space-y-4">
            <b className="text-xl font-bold">{t('terms.section6.title')}</b>
            <ul className="grid list-disc gap-4 md:gap-8">
              <li className="ml-6">{t('terms.section6.content')}</li>
            </ul>
          </div>
        </div>
        <div className="space-y-8">
          <div className="space-y-4">
            <b className="text-xl font-bold">{t('terms.section7.title')}</b>
            <ul className="grid list-disc gap-4 md:gap-8">
              <li className="ml-6">{t('terms.section7.content')}</li>
            </ul>
          </div>
        </div>
        <div className="space-y-8">
          <div className="space-y-4">
            <b className="text-xl font-bold">{t('terms.section8.title')}</b>
            <ul className="grid list-disc gap-4 md:gap-8">
              <li className="ml-6">{t('terms.section8.content')}</li>
            </ul>
          </div>
        </div>
        <div className="space-y-8">
          <div className="space-y-4">
            <b className="text-xl font-bold">{t('terms.section9.title')}</b>
            <ul className="grid list-disc gap-4 md:gap-8">
              <li className="ml-6">{t('terms.section9.content')}</li>
            </ul>
          </div>
        </div>
        <div className="space-y-8">
          <div className="space-y-4">
            <b className="text-xl font-bold">{t('terms.section10.title')}</b>
            <ul className="grid list-disc gap-4 md:gap-8">
              <li className="ml-6">{t('terms.section10.content')}</li>
            </ul>
          </div>
        </div>
        <div className="space-y-8">
          <div className="space-y-4">
            <b className="text-xl font-bold">{t('terms.section11.title')}</b>
            <ul className="grid list-disc gap-4 md:gap-8">
              <li className="ml-6">{t('terms.section11.content')}</li>
            </ul>
          </div>
        </div>
        <div className="space-y-8">
          <div className="space-y-4">
            <b className="text-xl font-bold">{t('terms.section12.title')}</b>
            <ul className="grid list-disc gap-4 md:gap-8">
              <li className="ml-6">{t('terms.section12.content')}</li>
            </ul>
          </div>
        </div>
        <div className="space-y-8">
          <div className="space-y-4">
            <b className="text-xl font-bold">{t('terms.section13.title')}</b>
            <ul className="grid list-disc gap-4 md:gap-8">
              <li className="ml-6">{t('terms.section13.item1')}</li>
              <li className="ml-6">{t('terms.section13.item2')}</li>
              <li className="ml-6">{t('terms.section13.item3')}</li>
            </ul>
          </div>
        </div>
        <div className="space-y-8">
          <div className="space-y-4">
            <b className="text-xl font-bold">{t('terms.section14.title')}</b>
            <ul className="grid list-disc gap-4 md:gap-8">
              <li className="ml-6">{t('terms.section14.content')}</li>
            </ul>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default TermsPage;
