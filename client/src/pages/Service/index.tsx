import React from 'react';
import DefaultLayout from '../../layout/DefaultLayout';
import features from '../../constants/features';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ServicePage: React.FC = () => {
  const { t } = useTranslation();

  const featureKeys = [
    'feature1',
    'feature2',
    'feature3',
    'feature4',
    'feature5',
    'feature6',
  ];

  return (
    <DefaultLayout>
      <div className="w-full p-24 space-y-20">
        <div className="flex flex-col items-center gap-6">
          <h1 className="text-5xl font-bold text-center">
            {t('service.title')}
          </h1>
          <p className="text-[20px] text-center max-w-4xl leading-8">
            {t('service.intro')}
          </p>
        </div>
        <div>
          <div className="grid md:grid-cols-2 gap-20">
            {features.map((feature, index) => (
              <Link
                key={index}
                to={feature.link}
                className="relative border border-black rounded-2xl p-4 flex flex-col items-center gap-8"
              >
                <h4 className="text-xl font-bold ml-20">
                  {t(`service.features.${featureKeys[index]}.title`)}
                </h4>
                <p>{t(`service.features.${featureKeys[index]}.desc`)}</p>
                <img className="absolute -top-8 left-2" src={feature.icon} />
              </Link>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center gap-6">
          <h1 className="text-3xl font-bold text-center">
            {t('service.conclusion.title')}
          </h1>
          <p className="text-[20px] text-center max-w-4xl leading-8 font-medium">
            {t('service.conclusion.text')}
          </p>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default ServicePage;
