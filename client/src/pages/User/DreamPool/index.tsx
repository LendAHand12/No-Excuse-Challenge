import React from 'react';
import DefaultLayout from '@/layout/DefaultLayout';
import COVER5 from '@/images/cover/cover-05.png';

const DreamPoolPage: React.FC = () => {
  return (
    <DefaultLayout>
      <div className="w-full h-full">
        <img src={COVER5} className="w-full h-full object-cover" />
      </div>
    </DefaultLayout>
  );
};

export default DreamPoolPage;
