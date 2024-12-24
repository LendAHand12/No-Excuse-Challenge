import React from 'react';
import DefaultLayout from '../../layout/DefaultLayout';
import features from '../../constants/features';
import { Link } from 'react-router-dom';

const ServicePage: React.FC = () => {
  return (
    <DefaultLayout>
      <div className="w-full p-24 space-y-20">
        <div className="flex flex-col items-center gap-6">
          <h1 className="text-5xl font-bold text-center">
            DreamChain Services{' '}
          </h1>
          <p className="text-[20px] text-center max-w-4xl leading-8">
            At DreamChain, we are committed to empowering individuals and
            fostering a thriving community through innovative software
            solutions. Our services include:
          </p>
        </div>
        <div>
          <div className="grid md:grid-cols-2 gap-20">
            {features.map((feature) => (
              <Link
                to={feature.link}
                className="relative border border-black rounded-2xl p-4 flex flex-col items-center gap-8"
              >
                <h4 className="text-xl font-bold ml-20">{feature.title}</h4>
                <p>{feature.desc}</p>
                <img className="absolute -top-8 left-2" src={feature.icon} />
              </Link>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center gap-6">
          <h1 className="text-3xl font-bold text-center">
            DreamChain is more than a platform
          </h1>
          <p className="text-[20px] text-center max-w-4xl leading-8 font-medium">
            it's a community-driven ecosystem where technology meets purpose,
            helping you turn dreams into reality. Join us and take the first
            step toward achieving your aspirations.
          </p>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default ServicePage;
