import React from 'react';
import COVER1 from '../../images/cover/cover-02.png';
import DefaultLayout from '../../layout/DefaultLayout';

const HomePage: React.FC = () => {
  return (
    <DefaultLayout>
      <div className="w-full mt-10 lg:mt-0">
        <div className="flex">
          <div className="py-14 2xl:pl-16 px-10">
            <p className="text-[#] font-bold">About us</p>
            <h1 className="text-black text-4xl font-medium mt-3 mb-2">
              No Excuse Challenge
            </h1>
            <p className="text-[#02071B] text-lg">
              Get Up. Shut Up. Take Action. No More Excuses. Welcome to the No
              Excuse Challenge – where weakness gets crushed, and winners are
              made. You’ve been soft for too long. Excuses won’t pay your bills,
              won’t build your dreams, and won’t make you stronger. Stop
              talking. Stop waiting. Stop blaming. It’s time to wake up, put in
              the work, and take full control of your life – NOW!
            </p>
            <p className="text-[#02071B] text-lg font-semibold mt-10">
              "Excuses don’t pay. Effort does. Get to work."
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
              What is the No Excuse Challenge?
            </h1>
            <p className="text-[#02071B] text-lg">
              This isn’t some feel-good, pat-on-the-back motivation speech. This
              is a reality check. The No Excuse Challenge is here to shake you,
              break your old habits, and force you to take responsibility.
              Success isn’t given—it’s taken. And if you’re not willing to take
              it, step aside for those who will. Ready to own your life? Prove
              it.
            </p>
            <p className="text-[#02071B] text-lg font-semibold mt-10">
              "Nobody’s coming to save you. Get up and do it yourself."
            </p>
          </div>
          <div className="py-10 2xl:pl-16 px-10">
            <div className="border w-1/2 border-black"></div>
            <h1 className="text-black text-2xl font-semibold mt-3 mb-6 pt-3">
              Why Join the No Excuse Challenge?
            </h1>
            <p className="text-[#02071B] text-lg">
              • No More Excuses – You’re either all in or out. There’s no
              in-between.
              <br></br>• Get Uncomfortable – Growth happens when you push past
              your limits. No pain, no gain.
              <br></br>• Prove Yourself – Talk is cheap. Show up, work hard, and
              earn your success.
              <br></br>• Join a Relentless Community – Winners only. If you’re
              looking for sympathy, look else where.
            </p>
            <p className="text-[#02071B] text-lg font-semibold mt-10">
              "Soft people make excuses. Strong people make moves."
            </p>
          </div>
          <div className="py-10 2xl:pl-16 px-10 3xl:-mt-32">
            <div className="border w-1/2 border-black"></div>
            <h1 className="text-black text-2xl font-semibold mt-3 mb-6 pt-3">
              How It Works
            </h1>
            <p className="text-[#02071B] text-lg">
              • Stop Complaining – Nobody cares about your excuses. Nobody. Get
              up and get to work.
              <br></br>• Set a Goal – Make it real. Make it tough. No easy wins.
              <br></br>• Do the Work – No skipping. No shortcuts. No giving up.
              <br></br>• Own Your Results – Win or lose, it’s on YOU. No
              blaming. No whining.
            </p>
            <p className="text-[#02071B] text-lg font-semibold mt-10">
              "You either suffer the pain of discipline or the pain of regret.
              Choose."
            </p>
          </div>
          <div className="py-10 pb-10 2xl:pl-16 px-10">
            <div className="border w-1/2 border-black"></div>
            <h1 className="text-black text-2xl font-semibold mt-3 mb-6 pt-3">
              Enough Talk. Take Action.
            </h1>
            <p className="text-[#02071B] text-lg">
              This isn’t for the weak. It’s for those who refuse to stay stuck
              in the same cycle of failure. It’s time to push harder, level up,
              and MAKE THINGS HAPPEN. If you can’t handle it, move aside. Join
              the No Excuse Challenge today. No more whining. No more waiting.
              Just results.
            </p>
            <p className="text-[#02071B] text-lg font-semibold mt-10">
              "Success isn’t for crybabies. Step up or step aside."
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
