import React from 'react';
import COVER1 from '../../images/cover/cover-02.png';

const HomePage: React.FC = () => {
  return (
    <div className="w-full mt-10 lg:mt-0">
      <div className="flex">
        <div className="py-14 2xl:pl-16 px-10">
          <p className="text-[#676A76]">About us</p>
          <h1 className="text-black text-6xl font-medium mt-3 mb-6">
            Dreamchain
          </h1>
          <p className="text-[#02071B] text-lg">
            Welcome to DreamChain: Where Dreams Connect DreamChain is more than
            a platform; it's a mission. Every morning, as you wake up, let
            "DreamChain" remind you: you have a purpose—to give, to receive, and
            to achieve your dreams.
          </p>
          <p className="text-[#02071B] text-lg font-semibold mt-10">
            "A dream you dream alone is only a dream. A dream you dream together
            is reality." <br></br>– John Lennon –
          </p>
        </div>
        <img
          src={COVER1}
          className="hidden 2xl:block w-full lg:w-1/3 object-left"
        />
      </div>
      <div className="grid grid-cols-1 2xl:grid-cols-2">
        <div className="py-10 2xl:pl-16 px-10 3xl:-mt-64">
          <div className="border w-1/2 border-black"></div>
          <h1 className="text-black text-2xl font-semibold mt-3 mb-6 pt-3">
            Our Vision
          </h1>
          <p className="text-[#02071B] text-lg">
            At DreamChain, we believe everyone has a dream, a vision of a better
            future. We exist to connect those dreams, building a community of
            individuals who are willing, committed, and ready to take action
            toward success.
            <br></br>
            <br></br>
            Our ultimate goal is to become the place where most millionaires
            achieve their success—empowering dreamers, fostering growth, and
            providing the tools and support to turn aspirations into
            achievements.
          </p>
          <p className="text-[#02071B] text-lg font-semibold mt-10">
            "The future belongs to those who believe in the beauty of their
            dreams." – Eleanor Roosevelt
          </p>
        </div>
        <div className="py-10 2xl:pl-16 px-10">
          <div className="border w-1/2 border-black"></div>
          <h1 className="text-black text-2xl font-semibold mt-3 mb-6 pt-3">
            Giving and Receiving
          </h1>
          <p className="text-[#02071B] text-lg">
            Giving and Receiving In DreamChain, we embrace the philosophy that
            success is achieved through mutual support. By contributing members
            to members, you’re not only helping others but also taking a step
            closer to realizing your dreams. Together, we create an ecosystem of
            giving and receiving that empowers every member.
          </p>
          <p className="text-[#02071B] text-lg font-semibold mt-10">
            "No one has ever become poor by giving." – Anne Frank
          </p>
        </div>
        <div className="py-10 2xl:pl-16 px-10 3xl:-mt-32">
          <div className="border w-1/2 border-black"></div>
          <h1 className="text-black text-2xl font-semibold mt-3 mb-6 pt-3">
            Your Journey
          </h1>
          <p className="text-[#02071B] text-lg">
            Your Journey At DreamChain, we believe everyone has a dream, a
            vision of a better future. We exist to connect those dreams,
            building a community of individuals who are willing, committed, and
            ready to take action toward success.
            <br></br>
            <br></br>
            Our ultimate goal is to become the place where most millionaires
            achieve their success—empowering dreamers, fostering growth, and
            providing the tools and support to turn aspirations into
            achievements.
          </p>
          <p className="text-[#02071B] text-lg font-semibold mt-10">
            "The future belongs to those who believe in the beauty of their
            dreams." – Eleanor Roosevelt
          </p>
        </div>
        <div className="py-10 pb-20 2xl:pl-16 px-10">
          <div className="border w-1/2 border-black"></div>
          <h1 className="text-black text-2xl font-semibold mt-3 mb-6 pt-3">
            Join Us Today
          </h1>
          <p className="text-[#02071B] text-lg">
            Join Us Today Be part of a movement where dreams come alive.
            DreamChain is your community to grow, give, and achieve. Let’s build
            a future of shared success, one connection at a time.
          </p>
          <p className="text-[#02071B] text-lg font-semibold mt-10">
            "Alone, we can do so little; together, we can do so much." – Helen
            Keller
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
