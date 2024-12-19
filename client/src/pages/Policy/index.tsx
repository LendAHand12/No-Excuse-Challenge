import React from 'react';
import DefaultLayout from '../../layout/DefaultLayout';

const PolicyPage: React.FC = () => {
  return (
    <DefaultLayout>
      <div className="w-full md:p-24 py-24 px-10 space-y-10">
        <div>
          <h1 className="text-3xl font-bold mb-4">DreamChain Policy</h1>
          <p className="">
            Welcome to DreamChain, where we build a supportive and thriving
            community dedicated to helping members achieve their dreams through
            mutual collaboration and innovation. By joining DreamChain, members
            agree to abide by the following policies and guidelines to ensure a
            harmonious and productive environment for everyone.
          </p>
        </div>
        <div className="space-y-8">
          <div className="space-y-4">
            <b className="text-xl font-bold">1. Voluntary Participation</b>
            <ul className="grid md:grid-cols-2 list-disc gap-4 md:gap-8">
              <li className="ml-6">
                Membership in DreamChain is entirely voluntary. Members are free
                to join, contribute, and engage at their own discretion.
              </li>
              <li className="ml-6">
                Contributions, whether financial, intellectual, or through time
                and effort, are also voluntary. Members are encouraged to
                participate in ways that align with their personal abilities and
                goals.
              </li>
            </ul>
          </div>
        </div>
        <div className="space-y-8">
          <div className="space-y-4">
            <b className="text-xl font-bold">2. Commitment to Guidelines</b>
            <ul className="grid md:grid-cols-2 list-disc gap-4 md:gap-8">
              <li className="ml-6">
                By becoming a member, you agree to follow DreamChain’s
                guidelines, which are designed to promote fairness,
                transparency, and respect within the community.
              </li>
              <li className="ml-6">
                Members are expected to adhere to the principles of DreamChain,
                including collaboration, accountability, and respect for others.
              </li>
            </ul>
          </div>
        </div>
        <div className="space-y-8">
          <div className="space-y-4">
            <b className="text-xl font-bold"> 3. Transparency and Honesty</b>
            <ul className="grid md:grid-cols-2 list-disc gap-4 md:gap-8">
              <li className="ml-6">
                Members must provide accurate and truthful information when
                registering and engaging with the platform, including during the
                KYC process.
              </li>
              <li className="ml-6">
                Any fraudulent behavior or misrepresentation will result in
                removal from the platform.
              </li>
            </ul>
          </div>
        </div>
        <div className="space-y-8">
          <div className="space-y-4">
            <b className="text-xl font-bold">4. Respect and Collaboration</b>
            <ul className="grid md:grid-cols-2 list-disc gap-4 md:gap-8">
              <li className="ml-6">
                Treat all members with respect and kindness. Discrimination,
                harassment, or abusive behavior of any kind will not be
                tolerated.
              </li>
              <li className="ml-6">
                Members should work collaboratively and support each other’s
                goals, fostering a positive and inclusive environment.
              </li>
            </ul>
          </div>
        </div>
        <div className="space-y-8">
          <div className="space-y-4">
            <b className="text-xl font-bold">5. Contributions and Benefits</b>
            <ul className="grid md:grid-cols-2 list-disc gap-4 md:gap-8">
              <li className="ml-6">
                Contributions made to DreamChain, whether financial or through
                participation, are voluntary and non-refundable.
              </li>
              <li className="ml-6">
                Benefits and rewards will be distributed fairly and
                transparently, based on DreamChain’s established contribution
                and engagement criteria.
              </li>
            </ul>
          </div>
        </div>
        <div className="space-y-8">
          <div className="space-y-4">
            <b className="text-xl font-bold">6. Privacy and Security</b>
            <ul className="grid md:grid-cols-2 list-disc gap-4 md:gap-8">
              <li className="ml-6">
                Members are responsible for maintaining the confidentiality of
                their account details and personal information.
              </li>
              <li className="ml-6">
                DreamChain is committed to protecting member data in compliance
                with applicable privacy laws. Members must not share or misuse
                sensitive information belonging to others.
              </li>
            </ul>
          </div>
        </div>
        <div className="space-y-8">
          <div className="space-y-4">
            <b className="text-xl font-bold">7. Prohibited Activities</b>
            <p className="font-medium">
              The following activities are strictly prohibited within the
              DreamChain community:
            </p>
            <ul className="grid md:grid-cols-3 gap-4 md:gap-8">
              <li className="flex items-start gap-6">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-16 h-auto"
                >
                  <path
                    d="M7.19995 2.40039C6.56343 2.40039 5.95298 2.65325 5.50289 3.10333C5.05281 3.55342 4.79995 4.16387 4.79995 4.80039V11.0488C5.19224 10.9379 5.59395 10.8636 5.99995 10.8268V4.80039C5.99995 4.48213 6.12638 4.17691 6.35142 3.95186C6.57647 3.72682 6.88169 3.60039 7.19995 3.60039H12V7.80039C12 8.27778 12.1896 8.73562 12.5272 9.07318C12.8647 9.41075 13.3226 9.60039 13.8 9.60039H18V19.2004C18 19.5187 17.8735 19.8239 17.6485 20.0489C17.4234 20.274 17.1182 20.4004 16.8 20.4004H12.48C12.2616 20.8279 11.9972 21.2303 11.6916 21.6004H16.8C17.4365 21.6004 18.0469 21.3475 18.497 20.8974C18.9471 20.4474 19.2 19.8369 19.2 19.2004V8.89719C19.1995 8.41996 19.0096 7.96243 18.672 7.62519L13.9752 2.92719C13.6377 2.58997 13.1802 2.40049 12.7032 2.40039H7.19995ZM17.7516 8.40039H13.8C13.6408 8.40039 13.4882 8.33718 13.3757 8.22465C13.2632 8.11213 13.2 7.95952 13.2 7.80039V3.84879L17.7516 8.40039ZM12 17.4004C12 18.8326 11.431 20.2061 10.4183 21.2188C9.40563 22.2315 8.03212 22.8004 6.59995 22.8004C5.16778 22.8004 3.79427 22.2315 2.78157 21.2188C1.76888 20.2061 1.19995 18.8326 1.19995 17.4004C1.19995 15.9682 1.76888 14.5947 2.78157 13.582C3.79427 12.5693 5.16778 12.0004 6.59995 12.0004C8.03212 12.0004 9.40563 12.5693 10.4183 13.582C11.431 14.5947 12 15.9682 12 17.4004ZM6.59995 14.4004C6.44082 14.4004 6.28821 14.4636 6.17569 14.5761C6.06317 14.6886 5.99995 14.8413 5.99995 15.0004V17.4004C5.99995 17.5595 6.06317 17.7121 6.17569 17.8247C6.28821 17.9372 6.44082 18.0004 6.59995 18.0004C6.75908 18.0004 6.91169 17.9372 7.02422 17.8247C7.13674 17.7121 7.19995 17.5595 7.19995 17.4004V15.0004C7.19995 14.8413 7.13674 14.6886 7.02422 14.5761C6.91169 14.4636 6.75908 14.4004 6.59995 14.4004ZM6.59995 20.5504C6.79886 20.5504 6.98963 20.4714 7.13028 20.3307C7.27093 20.1901 7.34995 19.9993 7.34995 19.8004C7.34995 19.6015 7.27093 19.4107 7.13028 19.2701C6.98963 19.1294 6.79886 19.0504 6.59995 19.0504C6.40104 19.0504 6.21027 19.1294 6.06962 19.2701C5.92897 19.4107 5.84995 19.6015 5.84995 19.8004C5.84995 19.9993 5.92897 20.1901 6.06962 20.3307C6.21027 20.4714 6.40104 20.5504 6.59995 20.5504Z"
                    fill="black"
                  />
                </svg>
                <span>
                  Fraudulent activities, including falsifying documents or
                  information.
                </span>
              </li>
              <li className="flex items-start gap-6">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-16 h-auto"
                >
                  <path
                    d="M11.992 16H12.001M11.992 13V8M12.31 3H11.69C9.254 3 8.036 3 7.04 3.553C6.043 4.105 5.452 5.108 4.269 7.115L3.679 8.115C2.56 10.014 2 10.963 2 12C2 13.037 2.56 13.986 3.68 15.885L4.269 16.885C5.452 18.892 6.043 19.895 7.039 20.448C8.036 21 9.254 21 11.689 21H12.311C14.746 21 15.964 21 16.961 20.448C17.957 19.895 18.548 18.892 19.731 16.885L20.321 15.885C21.44 13.986 22 13.037 22 12C22 10.963 21.44 10.014 20.32 8.115L19.731 7.115C18.548 5.108 17.957 4.105 16.961 3.553C15.964 3 14.746 3 12.31 3Z"
                    stroke="black"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                <span>
                  Spamming, phishing, or unauthorized promotion of unrelated
                  services.
                </span>
              </li>
              <li className="flex items-start gap-6">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-16 h-auto"
                >
                  <path
                    d="M16.616 20C17.008 20 17.3367 19.8673 17.602 19.602C17.8673 19.3367 18 19.008 18 18.616C18 18.224 17.8673 17.895 17.602 17.629C17.3367 17.363 17.008 17.2303 16.616 17.231C16.224 17.2317 15.895 17.3643 15.629 17.629C15.363 17.8937 15.2303 18.2223 15.231 18.615C15.2317 19.0077 15.3643 19.3367 15.629 19.602C15.8937 19.8673 16.2227 20 16.616 20ZM16.616 6.77C17.008 6.77 17.3367 6.637 17.602 6.371C17.8673 6.10567 18 5.77667 18 5.384C18 4.992 17.8673 4.66333 17.602 4.398C17.3367 4.13267 17.008 4 16.616 4C16.224 4 15.895 4.13267 15.629 4.398C15.363 4.66333 15.2303 4.99233 15.231 5.385C15.231 5.777 15.3637 6.10567 15.629 6.371C15.8943 6.63633 16.2233 6.77 16.616 6.77ZM3.00001 12.192V12C3.00001 11.3467 3.23001 10.7857 3.69001 10.317C4.15001 9.849 4.70868 9.615 5.36601 9.615C5.72401 9.615 6.05968 9.686 6.37301 9.828C6.68634 9.97 6.95068 10.166 7.16601 10.416L14.364 6.161C14.3173 6.03167 14.2837 5.90333 14.263 5.776C14.2417 5.648 14.231 5.51733 14.231 5.384C14.231 4.722 14.4633 4.159 14.928 3.695C15.3927 3.23167 15.9567 3 16.62 3C17.2833 3 17.846 3.23233 18.308 3.697C18.77 4.16167 19.0007 4.72567 19 5.389C18.9993 6.05233 18.7677 6.615 18.305 7.077C17.8423 7.539 17.279 7.76967 16.615 7.769C16.2537 7.769 15.9203 7.695 15.615 7.547C15.3097 7.399 15.0497 7.2 14.835 6.95L7.45001 11.333C7.27668 11.3017 7.10134 11.277 6.92401 11.259C6.74668 11.2403 6.56668 11.231 6.38401 11.231C5.76268 11.231 5.16601 11.3137 4.59401 11.479C4.02068 11.6443 3.48934 11.882 3.00001 12.192ZM16.61 21C15.9473 21 15.385 20.7683 14.923 20.305C14.4617 19.841 14.231 19.2777 14.231 18.615C14.231 18.515 14.275 18.2627 14.363 17.858L12.731 16.881C12.6977 16.6603 12.661 16.4487 12.621 16.246C12.5817 16.0433 12.5267 15.8427 12.456 15.644L14.835 17.05C15.0503 16.8 15.3103 16.601 15.615 16.453C15.9203 16.305 16.2537 16.231 16.615 16.231C17.2777 16.231 17.841 16.463 18.305 16.927C18.7683 17.3923 19 17.9567 19 18.62C19 19.2833 18.7677 19.846 18.303 20.308C17.8383 20.77 17.2733 21.0007 16.61 21ZM6.38401 21.616C5.27068 21.616 4.32568 21.2277 3.54901 20.451C2.77234 19.6743 2.38434 18.7293 2.38501 17.616C2.38501 16.5013 2.77301 15.556 3.54901 14.78C4.32568 14.004 5.27101 13.616 6.38501 13.616C7.49901 13.616 8.44401 14.004 9.22001 14.78C9.99601 15.556 10.3843 16.5013 10.385 17.616C10.385 18.7293 9.99668 19.6743 9.22001 20.451C8.44401 21.2277 7.49901 21.616 6.38501 21.616M6.38501 18.162L8.13501 19.917L8.68701 19.371L6.93101 17.616L8.68701 15.86L8.14101 15.314L6.38501 17.069L4.62901 15.314L4.08301 15.859L5.83901 17.615L4.08301 19.371L4.62901 19.917L6.38501 18.162Z"
                    fill="black"
                  />
                </svg>

                <span>
                  Sharing offensive, inappropriate, or illegal content.
                </span>
              </li>
              <li className="flex items-start gap-6">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-16 h-auto"
                >
                  <path
                    d="M8.5 4C8.10603 4 7.71593 4.0776 7.35195 4.22836C6.98797 4.37913 6.65726 4.6001 6.37868 4.87868C6.1001 5.15726 5.87913 5.48797 5.72836 5.85195C5.5776 6.21593 5.5 6.60603 5.5 7C5.5 7.39397 5.5776 7.78407 5.72836 8.14805C5.87913 8.51203 6.1001 8.84274 6.37868 9.12132C6.65726 9.3999 6.98797 9.62087 7.35195 9.77164C7.71593 9.9224 8.10603 10 8.5 10C9.29565 10 10.0587 9.68393 10.6213 9.12132C11.1839 8.55871 11.5 7.79565 11.5 7C11.5 6.20435 11.1839 5.44129 10.6213 4.87868C10.0587 4.31607 9.29565 4 8.5 4ZM3.5 7C3.5 5.67392 4.02678 4.40215 4.96447 3.46447C5.90215 2.52678 7.17392 2 8.5 2C9.82608 2 11.0979 2.52678 12.0355 3.46447C12.9732 4.40215 13.5 5.67392 13.5 7C13.5 8.32608 12.9732 9.59785 12.0355 10.5355C11.0979 11.4732 9.82608 12 8.5 12C7.17392 12 5.90215 11.4732 4.96447 10.5355C4.02678 9.59785 3.5 8.32608 3.5 7ZM20.573 5.648L21.07 6.515C21.6794 7.57633 22 8.7789 21.9996 10.0028C21.9993 11.2266 21.6781 12.429 21.068 13.49L20.569 14.357L18.836 13.36L19.334 12.493C19.7698 11.7352 19.9993 10.8764 19.9997 10.0023C20 9.12811 19.7712 8.26913 19.336 7.511L18.838 6.644L20.573 5.648ZM17.538 7.39L18.035 8.258C18.3398 8.78852 18.5002 9.38967 18.5002 10.0015C18.5002 10.6133 18.3398 11.2145 18.035 11.745L17.535 12.612L15.802 11.615L16.3 10.748C16.4307 10.5206 16.4995 10.2628 16.4995 10.0005C16.4995 9.73817 16.4307 9.48043 16.3 9.253L15.803 8.386L17.538 7.39ZM0 19C0 17.6739 0.526784 16.4021 1.46447 15.4645C2.40215 14.5268 3.67392 14 5 14H12C13.3261 14 14.5979 14.5268 15.5355 15.4645C16.4732 16.4021 17 17.6739 17 19V21H15V19C15 18.2044 14.6839 17.4413 14.1213 16.8787C13.5587 16.3161 12.7956 16 12 16H5C4.20435 16 3.44129 16.3161 2.87868 16.8787C2.31607 17.4413 2 18.2044 2 19V21H0V19Z"
                    fill="black"
                  />
                </svg>

                <span>
                  Speaking negatively about other members or the DreamChain
                  community.
                </span>
              </li>
              <li className="flex items-start gap-6">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-20 h-auto"
                >
                  <path
                    d="M12 3.75C11.4696 3.75 10.9609 3.96071 10.5858 4.33579C10.2107 4.71086 10 5.21957 10 5.75C10 6.28043 10.2107 6.78914 10.5858 7.16421C10.9609 7.53929 11.4696 7.75 12 7.75C12.5304 7.75 13.0391 7.53929 13.4142 7.16421C13.7893 6.78914 14 6.28043 14 5.75C14 5.21957 13.7893 4.71086 13.4142 4.33579C13.0391 3.96071 12.5304 3.75 12 3.75ZM8.75 5.75C8.75 4.88805 9.09241 4.0614 9.7019 3.4519C10.3114 2.84241 11.138 2.5 12 2.5C12.862 2.5 13.6886 2.84241 14.2981 3.4519C14.9076 4.0614 15.25 4.88805 15.25 5.75C15.25 6.61195 14.9076 7.4386 14.2981 8.0481C13.6886 8.65759 12.862 9 12 9C11.138 9 10.3114 8.65759 9.7019 8.0481C9.09241 7.4386 8.75 6.61195 8.75 5.75ZM4.75 5.75C4.35218 5.75 3.97064 5.90804 3.68934 6.18934C3.40804 6.47064 3.25 6.85218 3.25 7.25C3.25 7.64782 3.40804 8.02936 3.68934 8.31066C3.97064 8.59196 4.35218 8.75 4.75 8.75C5.14782 8.75 5.52936 8.59196 5.81066 8.31066C6.09196 8.02936 6.25 7.64782 6.25 7.25C6.25 6.85218 6.09196 6.47064 5.81066 6.18934C5.52936 5.90804 5.14782 5.75 4.75 5.75ZM2 7.25C2 6.52065 2.28973 5.82118 2.80546 5.30546C3.32118 4.78973 4.02065 4.5 4.75 4.5C5.47935 4.5 6.17882 4.78973 6.69454 5.30546C7.21027 5.82118 7.5 6.52065 7.5 7.25C7.5 7.97935 7.21027 8.67882 6.69454 9.19454C6.17882 9.71027 5.47935 10 4.75 10C4.02065 10 3.32118 9.71027 2.80546 9.19454C2.28973 8.67882 2 7.97935 2 7.25ZM17.75 7.25C17.75 6.85218 17.908 6.47064 18.1893 6.18934C18.4706 5.90804 18.8522 5.75 19.25 5.75C19.6478 5.75 20.0294 5.90804 20.3107 6.18934C20.592 6.47064 20.75 6.85218 20.75 7.25C20.75 7.64782 20.592 8.02936 20.3107 8.31066C20.0294 8.59196 19.6478 8.75 19.25 8.75C18.8522 8.75 18.4706 8.59196 18.1893 8.31066C17.908 8.02936 17.75 7.64782 17.75 7.25ZM19.25 4.5C18.5207 4.5 17.8212 4.78973 17.3055 5.30546C16.7897 5.82118 16.5 6.52065 16.5 7.25C16.5 7.97935 16.7897 8.67882 17.3055 9.19454C17.8212 9.71027 18.5207 10 19.25 10C19.9793 10 20.6788 9.71027 21.1945 9.19454C21.7103 8.67882 22 7.97935 22 7.25C22 6.52065 21.7103 5.82118 21.1945 5.30546C20.6788 4.78973 19.9793 4.5 19.25 4.5ZM7.5 12.125C7.5 11.694 7.67121 11.2807 7.97595 10.976C8.2807 10.6712 8.69402 10.5 9.125 10.5H14.875C15.306 10.5 15.7193 10.6712 16.024 10.976C16.3288 11.2807 16.5 11.694 16.5 12.125V16C16.5 17.1935 16.0259 18.3381 15.182 19.182C14.3381 20.0259 13.1935 20.5 12 20.5C10.8065 20.5 9.66193 20.0259 8.81802 19.182C7.97411 18.3381 7.5 17.1935 7.5 16V12.125ZM9.125 11.75C9.02554 11.75 8.93016 11.7895 8.85983 11.8598C8.78951 11.9302 8.75 12.0255 8.75 12.125V16C8.75 16.862 9.09241 17.6886 9.7019 18.2981C10.3114 18.9076 11.138 19.25 12 19.25C12.862 19.25 13.6886 18.9076 14.2981 18.2981C14.9076 17.6886 15.25 16.862 15.25 16V12.125C15.25 12.0255 15.2105 11.9302 15.1402 11.8598C15.0698 11.7895 14.9745 11.75 14.875 11.75H9.125ZM6.576 11.495C6.52567 11.697 6.50033 11.907 6.5 12.125V12.809L3.53 13.605C3.43403 13.6308 3.35221 13.6936 3.30252 13.7797C3.25283 13.8657 3.23934 13.968 3.265 14.064L4.009 16.841C4.21174 17.5981 4.68126 18.2564 5.33104 18.6947C5.98082 19.133 6.76709 19.3216 7.545 19.226C7.8299 19.6194 8.16565 19.9733 8.5435 20.2785C8.46783 20.3035 8.39117 20.3262 8.3135 20.3465C7.74268 20.4996 7.14729 20.5387 6.56135 20.4616C5.97541 20.3846 5.41039 20.1928 4.89854 19.8974C4.3867 19.602 3.93806 19.2086 3.57825 18.7398C3.21844 18.271 2.9545 17.7358 2.8015 17.165L2.057 14.388C2.00181 14.1819 1.98776 13.9669 2.01566 13.7553C2.04356 13.5437 2.11285 13.3397 2.2196 13.1549C2.32634 12.9701 2.46843 12.8082 2.63777 12.6783C2.8071 12.5484 3.00036 12.4532 3.2065 12.398L6.576 11.495ZM15.456 20.2785C15.532 20.3035 15.6088 20.3262 15.6865 20.3465C16.2573 20.4995 16.8527 20.5385 17.4386 20.4614C18.0245 20.3843 18.5895 20.1925 19.1013 19.897C19.6131 19.6015 20.0617 19.2081 20.4214 18.7393C20.7812 18.2704 21.0451 17.7353 21.198 17.1645L21.942 14.3875C22.0535 13.9712 21.9951 13.5278 21.7796 13.1546C21.5641 12.7814 21.2092 12.5091 20.793 12.3975L17.424 11.4945C17.4743 11.6968 17.4997 11.9068 17.5 12.1245V12.8095L20.4695 13.6045C20.5171 13.6173 20.5618 13.6393 20.6009 13.6693C20.64 13.6994 20.6728 13.7368 20.6974 13.7795C20.722 13.8223 20.738 13.8694 20.7443 13.9183C20.7507 13.9672 20.7474 14.0169 20.7345 14.0645L19.9905 16.841C19.7878 17.598 19.3183 18.2562 18.6687 18.6945C18.019 19.1328 17.2328 19.3215 16.455 19.226C16.1701 19.6194 15.8338 19.9733 15.456 20.2785Z"
                    fill="black"
                  />
                </svg>

                <span>
                  Engaging in any behavior that disrupts the harmony and
                  positive spirit of the community.
                </span>
              </li>
            </ul>
          </div>
        </div>
        <div className="space-y-8">
          <div className="space-y-4">
            <b className="text-xl font-bold">
              8. Commitment to the DreamChain Mission
            </b>
            <ul className="grid md:grid-cols-2 list-disc gap-4 md:gap-8">
              <li className="ml-6">
                Members are expected to actively contribute to the success and
                growth of the community by aligning with DreamChain’s mission of
                mutual giving and receiving.
              </li>
              <li className="ml-6">
                DreamChain reserves the right to remove members who fail to
                adhere to these policies or disrupt the community.
              </li>
            </ul>
          </div>
        </div>
        <div className="space-y-8">
          <div className="space-y-4">
            <b className="text-xl font-bold">9. Dispute Resolution</b>
            <ul className="grid md:grid-cols-2 list-disc gap-4 md:gap-8">
              <li className="ml-6">
                In the event of a dispute, members are encouraged to reach out
                to DreamChain’s support team for mediation.
              </li>
              <li className="ml-6">
                DreamChain aims to resolve conflicts fairly and amicably in
                accordance with its policies.
              </li>
            </ul>
          </div>
        </div>
        <div className="space-y-8">
          <div className="space-y-4">
            <b className="text-xl font-bold">10. Changes to the Policy</b>
            <ul className="grid md:grid-cols-2 list-disc gap-4 md:gap-8">
              <li className="ml-6">
                DreamChain reserves the right to update or modify these policies
                as needed to reflect changes in the platform, community, or
                applicable laws.
              </li>
              <li className="ml-6">
                Members will be notified of any significant updates, and
                continued participation indicates agreement with the revised
                policy.
              </li>
            </ul>
          </div>
        </div>
        <div className="bg-[#F2F4F7] p-4 rounded-2xl">
          By joining DreamChain, you contribute to a vision of collaboration,
          transparency, and shared success. Together, we can create a platform
          that empowers individuals and builds a community where dreams turn
          into reality.
        </div>
      </div>
    </DefaultLayout>
  );
};

export default PolicyPage;
