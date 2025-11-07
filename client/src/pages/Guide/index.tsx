import React from 'react';
import DefaultLayout from '../../layout/DefaultLayout';
import { useTranslation } from 'react-i18next';

const GuidePage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <DefaultLayout>
      <div className="w-full md:p-24 py-24 px-10 space-y-10">
        <div>
          <h1 className="text-3xl font-bold mb-4">{t('guide.title')}</h1>
          <p className="mb-4 font-semibold">{t('guide.subtitle')}</p>
          <p className="">{t('guide.intro')}</p>
        </div>
        <div className="space-y-8">
          <div className="space-y-4">
            <b className="text-xl font-bold">{t('guide.step1.title')}</b>
            <p className="">{t('guide.step1.description')}</p>
            <ul className="grid gap-4">
              <li className="flex items-start gap-6">
                <span>
                  <span className="font-semibold">
                    {t('guide.step1.item1.label')}
                  </span>{' '}
                  {t('guide.step1.item1.text')}
                </span>
              </li>
              <li className="flex items-start gap-6">
                <span>
                  <span className="font-semibold">
                    {t('guide.step1.item2.label')}{' '}
                  </span>{' '}
                  {t('guide.step1.item2.text')}
                </span>
              </li>
              <li className="flex items-start gap-6">
                <span>
                  <span className="font-semibold">
                    {t('guide.step1.item3.label')}
                  </span>{' '}
                  {t('guide.step1.item3.text')}
                </span>
              </li>
              <li className="flex items-start gap-6">
                <span>
                  <span className="font-semibold">
                    {t('guide.step1.item4.label')}
                  </span>{' '}
                  {t('guide.step1.item4.text')}{' '}
                  <span className="font-semibold">
                    {t('guide.step1.item4.benefit')}
                  </span>{' '}
                  <span className="font-semibold">
                    {t('guide.step1.item4.period')}
                  </span>
                </span>
              </li>
              <li className="flex items-start gap-6">
                <span>
                  <span className="font-semibold">
                    {t('guide.step1.item5.label')}
                  </span>{' '}
                  {t('guide.step1.item5.text')}{' '}
                  <span className="font-semibold">
                    {t('guide.step1.item5.amount')}
                  </span>{' '}
                  {t('guide.step1.item5.distributed')}{' '}
                  {t('guide.step1.item5.each')}
                </span>
              </li>
              <li className="flex items-start gap-6">
                <span>
                  <span className="font-semibold">
                    {t('guide.step1.item6.label')}
                  </span>
                </span>
              </li>
            </ul>
            <div className="text-xl font-bold">
              {t('guide.step1.usCanada.title')}
            </div>
            <p className="">{t('guide.step1.usCanada.description')}</p>
            <ul className="grid gap-4">
              <li className="flex items-start gap-6">
                <span>
                  <span className="font-semibold">
                    {t('guide.step1.usCanada.item1.label')}
                  </span>{' '}
                  {t('guide.step1.usCanada.item1.text')}
                  <b> {t('guide.step1.usCanada.item1.amount')}</b>{' '}
                  {t('guide.step1.usCanada.item1.suffix')}
                </span>
              </li>
              <li className="flex items-start gap-6">
                <span>
                  <span className="font-semibold">
                    {t('guide.step1.usCanada.item2.label')}{' '}
                  </span>{' '}
                  {t('guide.step1.usCanada.item2.text')}
                </span>
              </li>
              <li className="flex items-start gap-6">
                <span>
                  <span className="font-semibold">
                    {t('guide.step1.usCanada.item3.label')}
                  </span>{' '}
                  {t('guide.step1.usCanada.item3.text')}
                </span>
              </li>
              <li className="flex items-start gap-6">
                <span>
                  <span className="font-semibold">
                    {t('guide.step1.usCanada.item4.label')}
                  </span>{' '}
                  {t('guide.step1.usCanada.item4.text')}{' '}
                  <span className="font-semibold">
                    {t('guide.step1.usCanada.item4.benefit')}
                  </span>{' '}
                  <span className="font-semibold">
                    {t('guide.step1.usCanada.item4.period')}
                  </span>
                </span>
              </li>
              <li className="flex items-start gap-6">
                <span>
                  <span className="font-semibold">
                    {t('guide.step1.usCanada.item5.label')}
                  </span>{' '}
                  {t('guide.step1.usCanada.item5.text')}{' '}
                  <span className="font-semibold">
                    {t('guide.step1.usCanada.item5.amount')}
                  </span>{' '}
                  {t('guide.step1.usCanada.item5.distributed')}{' '}
                  {t('guide.step1.usCanada.item5.each')}
                </span>
              </li>
              <li className="flex items-start gap-6">
                <span>
                  <span className="font-semibold">
                    {t('guide.step1.usCanada.item6.label')}
                  </span>
                </span>
              </li>
            </ul>
          </div>
        </div>
        <div className="space-y-8">
          <div className="space-y-4">
            <b className="text-xl font-bold">{t('guide.step2.title')}</b>
            <p className="">{t('guide.step2.description')}</p>
            <ul className="grid gap-4 list-disc">
              <li className="flex items-start gap-6">
                <span>
                  •{' '}
                  <span className="font-semibold">
                    {t('guide.step2.item1.label')}
                  </span>{' '}
                  {t('guide.step2.item1.text')}{' '}
                  <span className="font-semibold">
                    {t('guide.step2.item1.requirement')}
                  </span>{' '}
                  {t('guide.step2.item1.bonus')}
                </span>
              </li>
              <li className="flex items-start gap-6">
                <span>
                  <span className="font-semibold">
                    • {t('guide.step2.item2.label')}
                  </span>{' '}
                  {t('guide.step2.item2.text')}{' '}
                  <span className="font-semibold">
                    {t('guide.step2.item2.amount')}
                  </span>{' '}
                  {t('guide.step2.item2.suffix')}
                </span>
              </li>
              <li className="flex items-start gap-6">
                <span>
                  <span className="font-semibold">
                    • {t('guide.step2.item3.label')}
                  </span>{' '}
                  {t('guide.step2.item3.text')}{' '}
                  <span className="font-semibold">
                    {t('guide.step2.item3.rewards')}
                  </span>
                </span>
              </li>
            </ul>
          </div>
        </div>
        <div className="space-y-8">
          <div className="space-y-4">
            <b className="text-xl font-bold">{t('guide.step3.title')}</b>
            <p className="">{t('guide.step3.description')}</p>
            <div className="space-y-4">
              <b>{t('guide.step3.howItWorks.title')}</b>
              <p>{t('guide.step3.howItWorks.text')}</p>
              <p>
                {t('guide.step3.tier1.text')}{' '}
                <b>{t('guide.step3.tier1.requirement')}</b>{' '}
                <b>{t('guide.step3.tier1.reward')}</b>
              </p>
            </div>
            <div className="space-y-4">
              <p>
                <b>{t('guide.step3.yearEnd.title')}</b>
              </p>
              <ul className="grid gap-4 list-disc">
                <li className="flex items-start gap-6">
                  <span>• {t('guide.step3.yearEnd.item1')}</span>
                </li>
                <li className="flex items-start gap-6">
                  • {t('guide.step3.yearEnd.item2')}
                </li>
                <li className="flex items-start gap-6">
                  • {t('guide.step3.yearEnd.item3')}
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <b>{t('guide.step3.tier2.title')}</b>
              <p>{t('guide.step3.tier2.description')}</p>
              <ul className="grid gap-4 list-disc">
                <li className="flex items-start gap-6">
                  <span>
                    • <b>50%</b> {t('guide.step3.tier2.item1.text')}
                  </span>
                </li>
                <li className="flex items-start gap-6">
                  <span>
                    • <b>25%</b> {t('guide.step3.tier2.item2.text')}
                  </span>
                </li>
                <li className="flex items-start gap-6">
                  <span>
                    • <b>25%</b> {t('guide.step3.tier2.item3.text')}
                  </span>
                </li>
              </ul>
              <p>
                <b>{t('guide.step3.tier2.note')}</b>
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-8">
          <div className="space-y-4">
            <b className="text-xl font-bold">{t('guide.step4.title')}</b>
            <p className="">{t('guide.step4.description')}</p>
            <ul className="grid gap-4 list-disc">
              <li className="flex items-start gap-6">
                <span>
                  <span className="font-semibold">
                    • {t('guide.step4.item1.label')}
                  </span>{' '}
                  {t('guide.step4.item1.text')}
                </span>
              </li>
            </ul>
          </div>
        </div>
        <div className="space-y-8">
          <div className="space-y-4">
            <b className="text-xl font-bold">{t('guide.step5.title')}</b>
            <p className="">{t('guide.step5.description')}</p>
            <ul className="grid gap-4 list-disc">
              <li className="flex items-start gap-6">
                <span>• {t('guide.step5.item1')}</span>
              </li>
              <li className="flex items-start gap-6">
                <span>• {t('guide.step5.item2')}</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="space-y-8">
          <div className="space-y-4">
            <b className="text-xl font-bold">{t('guide.final.title')}</b>
            <p className="">{t('guide.final.text1')}</p>
            <p>
              {t('guide.final.text2')}{' '}
              <span className="font-semibold">
                {t('guide.final.highlight')}
              </span>
            </p>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default GuidePage;
