import React from 'react';
import DefaultLayout from '@/layout/DefaultLayout';
import COVER5 from '@/images/cover/cover-05.png';
import FRAME_PIG from '@/images/cover/frame-pig.png';

const DreamPoolPage: React.FC = () => {
  return (
    <DefaultLayout>
      <div className="relative w-full h-full bg-black">
        <img src={COVER5} className="relative w-full h-full object-contain" />
        <div className="absolute bottom-20 lg:bottom-10 left-1/2 transform -translate-x-1/2">
          <img src={FRAME_PIG} className="w-full h-full" />
          <p className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 text-xl md:text-3xl lg:text-2xl 2xl:text-4xl font-bold text-[#F4E096]">
            10 USD
          </p>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default DreamPoolPage;
