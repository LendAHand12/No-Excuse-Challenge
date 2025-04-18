const routes = [
  {
    title: 'Profile',
    link: '/user/profile',
    icon: (
      <svg
        width="24"
        height="25"
        viewBox="0 0 24 25"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M20.5662 20.8897H20.5662V20.8999C20.5662 20.9749 20.5388 21.026 20.5105 21.0554C20.4846 21.0824 20.451 21.0999 20.3999 21.0999H3.56615C3.54138 21.0999 3.50135 21.0892 3.46121 21.0483C3.42208 21.0083 3.3999 20.9562 3.3999 20.8999C3.3999 18.1384 5.63865 15.8999 8.3999 15.8999H15.5662C18.3683 15.8999 20.5942 18.1406 20.5662 20.8897ZM16.3999 8.2999C16.3999 10.73 14.43 12.6999 11.9999 12.6999C9.5708 12.6999 7.5999 10.7299 7.5999 8.2999C7.5999 5.86986 9.57014 3.8999 11.9999 3.8999C14.43 3.8999 16.3999 5.86981 16.3999 8.2999Z"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    ),
  },
  {
    title: 'Payment',
    link: '/user/payment',
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M18 2H6C5.44772 2 5 2.44772 5 3V22L7.5 20L9.5 22L12 20L14.5 22L16.5 20L19 22V3C19 2.44772 18.5523 2 18 2Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9 6H15"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9 10H15"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9 14H10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: 'System',
    link: '/user/system',
    icon: (
      <svg
        width="24"
        height="25"
        viewBox="0 0 24 25"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M20.75 5.5H17.75M13.75 3.5V7.5M13.75 5.5H2.75M6.75 12.5H2.75M10.75 10.5V14.5M21.75 12.5H10.75M20.75 19.5H17.75M13.75 17.5V21.5M13.75 19.5H2.75"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: 'Transactions',
    link: '/user/transactions',
    icon: (
      <svg
        fill="currentColor"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        data-name="Layer 1"
      >
        <path d="M20,2H10A3,3,0,0,0,7,5v7a3,3,0,0,0,3,3H20a3,3,0,0,0,3-3V5A3,3,0,0,0,20,2Zm1,10a1,1,0,0,1-1,1H10a1,1,0,0,1-1-1V5a1,1,0,0,1,1-1H20a1,1,0,0,1,1,1ZM17.5,8a1.49,1.49,0,0,0-1,.39,1.5,1.5,0,1,0,0,2.22A1.5,1.5,0,1,0,17.5,8ZM16,17a1,1,0,0,0-1,1v1a1,1,0,0,1-1,1H4a1,1,0,0,1-1-1V15H4a1,1,0,0,0,0-2H3V12a1,1,0,0,1,1-1A1,1,0,0,0,4,9a3,3,0,0,0-3,3v7a3,3,0,0,0,3,3H14a3,3,0,0,0,3-3V18A1,1,0,0,0,16,17ZM6,18H7a1,1,0,0,0,0-2H6a1,1,0,0,0,0,2Z" />
      </svg>
    ),
  },
  {
    title: 'Income',
    link: '/user/income',
    icon: (
      <svg
        fill="currentColor"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M19,7H18V6a3,3,0,0,0-3-3H5A3,3,0,0,0,2,6H2V18a3,3,0,0,0,3,3H19a3,3,0,0,0,3-3V10A3,3,0,0,0,19,7ZM5,5H15a1,1,0,0,1,1,1V7H5A1,1,0,0,1,5,5ZM20,15H19a1,1,0,0,1,0-2h1Zm0-4H19a3,3,0,0,0,0,6h1v1a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V8.83A3,3,0,0,0,5,9H19a1,1,0,0,1,1,1Z" />
      </svg>
    ),
  },
  {
    title: 'Referral',
    link: '/user/referral',
    icon: (
      <svg
        width="24"
        height="25"
        viewBox="0 0 24 25"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M20.75 20.077V20.4152L21.0733 20.316C21.4185 20.2101 21.7027 20.0078 21.9205 19.7153C22.1401 19.4211 22.25 19.0838 22.25 18.712V5.615V5.61462C22.2492 5.10454 22.0642 4.66138 21.702 4.29841C21.3395 3.93515 20.896 3.75 20.385 3.75L3.615 3.75L3.61462 3.75C3.10454 3.75077 2.66138 3.93584 2.29841 4.29804C1.93507 4.66062 1.75 5.10449 1.75 5.616V13V13.25H2H3H3.25V13V5.616C3.25 5.49477 3.2864 5.41315 3.34978 5.34978C3.41334 5.28622 3.49472 5.25 3.615 5.25H20.385C20.5053 5.25 20.5867 5.28622 20.6502 5.34978C20.7136 5.41315 20.75 5.49477 20.75 5.616V20.077ZM9 14.135L9.00162 14.135C9.89182 14.1292 10.6606 13.8095 11.2949 13.1817C11.9305 12.5525 12.2507 11.7824 12.25 10.8858C12.2493 9.98956 11.9293 9.2191 11.2953 8.58872C10.6621 7.95914 9.89283 7.6396 9.00101 7.636C8.10765 7.6324 7.3373 7.95227 6.70382 8.58862C6.07105 9.22428 5.75072 9.99408 5.75 10.8848C5.74928 11.7759 6.06977 12.5453 6.70422 13.1798C7.33867 13.8142 8.10841 14.135 9 14.135ZM1.75 21.115V21.365L1.99998 21.365L16 21.366L16.25 21.366V21.116V19.47C16.25 19.0054 16.1136 18.5714 15.8469 18.1731C15.5812 17.7746 15.2232 17.4665 14.7787 17.2494L14.7771 17.2486C13.8197 16.7895 12.859 16.444 11.8953 16.2129C10.9314 15.9818 9.96617 15.866 9 15.866C8.03383 15.866 7.06892 15.9818 6.10567 16.2129C5.1419 16.4433 4.1806 16.7889 3.22191 17.2486L3.2219 17.2486L3.22012 17.2494C2.77629 17.4666 2.41845 17.7747 2.15217 18.1731L2.15211 18.1731C1.88602 18.5715 1.75 19.0055 1.75 19.47V21.115ZM14.5834 18.9918L14.5834 18.9919C14.6984 19.1486 14.75 19.3059 14.75 19.469V19.865H3.25V19.47C3.25 19.3061 3.30166 19.1485 3.41656 18.9919L3.41697 18.9913C3.5321 18.8335 3.69703 18.6928 3.92111 18.573C4.72821 18.1842 5.55888 17.8856 6.41332 17.6769C7.26736 17.4682 8.12939 17.3643 8.99981 17.365C9.87049 17.3657 10.7331 17.4696 11.5881 17.677C12.4429 17.8843 13.273 18.1828 14.0786 18.5728C14.3021 18.6926 14.4674 18.8335 14.5834 18.9918ZM10.2362 12.1202C9.89084 12.4656 9.48346 12.6349 9.00063 12.635C8.51979 12.6325 8.11171 12.463 7.76372 12.1192C7.41729 11.7768 7.24824 11.3705 7.25 10.8859C7.25176 10.3998 7.42148 9.99207 7.76478 9.64878C8.10806 9.30549 8.51539 9.13617 9.0006 9.135C9.48485 9.13383 9.89193 9.30272 10.2358 9.64832C10.5803 9.99466 10.7494 10.4026 10.75 10.8853C10.7506 11.3675 10.5817 11.7747 10.2362 12.1202Z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="0.5"
        />
      </svg>
    ),
  },
  {
    title: 'DreamPool',
    link: '/user/dreampool',
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="48" height="48" fill="currentColor" fillOpacity="0.01" />
        <ellipse
          cx="14"
          cy="10"
          rx="10"
          ry="5"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4 10C4 10 4 14.2386 4 17C4 19.7614 8.47715 22 14 22C19.5228 22 24 19.7614 24 17C24 15.3644 24 10 24 10"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4 17C4 17 4 21.2386 4 24C4 26.7614 8.47715 29 14 29C19.5228 29 24 26.7614 24 24C24 22.3644 24 17 24 17"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4 24C4 24 4 28.2386 4 31C4 33.7614 8.47715 36 14 36C19.5228 36 24 33.7614 24 31C24 29.3644 24 24 24 24"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4 31C4 31 4 35.2386 4 38C4 40.7614 8.47715 43 14 43C19.5228 43 24 40.7614 24 38C24 36.3644 24 31 24 31"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <ellipse
          cx="34"
          cy="24"
          rx="10"
          ry="5"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M24 24C24 24 24 28.2386 24 31C24 33.7614 28.4772 36 34 36C39.5228 36 44 33.7614 44 31C44 29.3644 44 24 44 24"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M24 31C24 31 24 35.2386 24 38C24 40.7614 28.4772 43 34 43C39.5228 43 44 40.7614 44 38C44 36.3644 44 31 44 31"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  // {
  //   title: 'Ice Breaker',
  //   link: '/user/ice-breakers',
  //   icon: (
  //     <svg
  //       width="24"
  //       height="24"
  //       viewBox="0 0 24 24"
  //       fill="none"
  //       xmlns="http://www.w3.org/2000/svg"
  //     >
  //       <path
  //         d="M4 13H20V20C20 21.1046 19.1046 22 18 22H6C4.89543 22 4 21.1046 4 20V13Z"
  //         stroke="currentColor"
  //         strokeWidth="2"
  //         strokeLinecap="round"
  //         strokeLinejoin="round"
  //       />
  //       <path
  //         d="M2 9H22V13H2V9Z"
  //         stroke="currentColor"
  //         strokeWidth="2"
  //         strokeLinecap="round"
  //         strokeLinejoin="round"
  //       />
  //       <path
  //         d="M12 5L12 22"
  //         stroke="currentColor"
  //         strokeWidth="2"
  //         strokeLinecap="round"
  //         strokeLinejoin="round"
  //       />
  //       <path
  //         d="M12 5.5C12 3.567 10.433 2 8.5 2C6.567 2 5 3.567 5 5.5C5 7.433 6.567 9 8.5 9"
  //         stroke="currentColor"
  //         strokeWidth="2"
  //         strokeLinecap="round"
  //         strokeLinejoin="round"
  //       />
  //       <path
  //         d="M15.5 9C17.433 9 19 7.433 19 5.5C19 3.567 17.433 2 15.5 2C13.567 2 12 3.567 12 5.5"
  //         stroke="currentColor"
  //         strokeWidth="2"
  //         strokeLinecap="round"
  //         strokeLinejoin="round"
  //       />
  //     </svg>
  //   ),
  // },

  // {
  //   title: 'Withdraw',
  //   link: '/user/withdraw',
  //   icon: (
  //     <svg
  //       width="24"
  //       height="25"
  //       viewBox="0 0 24 25"
  //       fill="none"
  //       xmlns="http://www.w3.org/2000/svg"
  //     >
  //       <path
  //         d="M12 12.5C11.4067 12.5 10.8266 12.6759 10.3333 13.0056C9.83994 13.3352 9.45542 13.8038 9.22836 14.3519C9.0013 14.9001 8.94189 15.5033 9.05764 16.0853C9.1734 16.6672 9.45912 17.2018 9.87868 17.6213C10.2982 18.0409 10.8328 18.3266 11.4147 18.4424C11.9967 18.5581 12.5999 18.4987 13.1481 18.2716C13.6962 18.0446 14.1648 17.6601 14.4944 17.1667C14.8241 16.6734 15 16.0933 15 15.5C15 14.7044 14.6839 13.9413 14.1213 13.3787C13.5587 12.8161 12.7956 12.5 12 12.5ZM12 16.5C11.8022 16.5 11.6089 16.4414 11.4444 16.3315C11.28 16.2216 11.1518 16.0654 11.0761 15.8827C11.0004 15.7 10.9806 15.4989 11.0192 15.3049C11.0578 15.1109 11.153 14.9327 11.2929 14.7929C11.4327 14.653 11.6109 14.5578 11.8049 14.5192C11.9989 14.4806 12.2 14.5004 12.3827 14.5761C12.5654 14.6518 12.7216 14.78 12.8315 14.9444C12.9414 15.1089 13 15.3022 13 15.5C13 15.7652 12.8946 16.0196 12.7071 16.2071C12.5196 16.3946 12.2652 16.5 12 16.5ZM11.29 10.21C11.3851 10.301 11.4972 10.3724 11.62 10.42C11.7397 10.4729 11.8691 10.5002 12 10.5002C12.1309 10.5002 12.2603 10.4729 12.38 10.42C12.5028 10.3724 12.6149 10.301 12.71 10.21L15 7.96C15.1936 7.76639 15.3024 7.5038 15.3024 7.23C15.3024 6.9562 15.1936 6.69361 15 6.5C14.8064 6.30639 14.5438 6.19762 14.27 6.19762C13.9962 6.19762 13.7336 6.30639 13.54 6.5L13 7.09V3.5C13 3.23478 12.8946 2.98043 12.7071 2.79289C12.5196 2.60536 12.2652 2.5 12 2.5C11.7348 2.5 11.4804 2.60536 11.2929 2.79289C11.1054 2.98043 11 3.23478 11 3.5V7.09L10.46 6.5C10.2664 6.30639 10.0038 6.19762 9.73 6.19762C9.4562 6.19762 9.19361 6.30639 9 6.5C8.80639 6.69361 8.69762 6.9562 8.69762 7.23C8.69762 7.5038 8.80639 7.76639 9 7.96L11.29 10.21ZM19 15.5C19 15.3022 18.9414 15.1089 18.8315 14.9444C18.7216 14.78 18.5654 14.6518 18.3827 14.5761C18.2 14.5004 17.9989 14.4806 17.8049 14.5192C17.6109 14.5578 17.4327 14.653 17.2929 14.7929C17.153 14.9327 17.0578 15.1109 17.0192 15.3049C16.9806 15.4989 17.0004 15.7 17.0761 15.8827C17.1518 16.0654 17.28 16.2216 17.4444 16.3315C17.6089 16.4414 17.8022 16.5 18 16.5C18.2652 16.5 18.5196 16.3946 18.7071 16.2071C18.8946 16.0196 19 15.7652 19 15.5ZM20 8.5H17C16.7348 8.5 16.4804 8.60536 16.2929 8.79289C16.1054 8.98043 16 9.23478 16 9.5C16 9.76522 16.1054 10.0196 16.2929 10.2071C16.4804 10.3946 16.7348 10.5 17 10.5H20C20.2652 10.5 20.5196 10.6054 20.7071 10.7929C20.8946 10.9804 21 11.2348 21 11.5V19.5C21 19.7652 20.8946 20.0196 20.7071 20.2071C20.5196 20.3946 20.2652 20.5 20 20.5H4C3.73478 20.5 3.48043 20.3946 3.29289 20.2071C3.10536 20.0196 3 19.7652 3 19.5V11.5C3 11.2348 3.10536 10.9804 3.29289 10.7929C3.48043 10.6054 3.73478 10.5 4 10.5H7C7.26522 10.5 7.51957 10.3946 7.70711 10.2071C7.89464 10.0196 8 9.76522 8 9.5C8 9.23478 7.89464 8.98043 7.70711 8.79289C7.51957 8.60536 7.26522 8.5 7 8.5H4C3.20435 8.5 2.44129 8.81607 1.87868 9.37868C1.31607 9.94129 1 10.7044 1 11.5V19.5C1 20.2956 1.31607 21.0587 1.87868 21.6213C2.44129 22.1839 3.20435 22.5 4 22.5H20C20.7956 22.5 21.5587 22.1839 22.1213 21.6213C22.6839 21.0587 23 20.2956 23 19.5V11.5C23 10.7044 22.6839 9.94129 22.1213 9.37868C21.5587 8.81607 20.7956 8.5 20 8.5ZM5 15.5C5 15.6978 5.05865 15.8911 5.16853 16.0556C5.27841 16.22 5.43459 16.3482 5.61732 16.4239C5.80004 16.4996 6.00111 16.5194 6.19509 16.4808C6.38907 16.4422 6.56725 16.347 6.70711 16.2071C6.84696 16.0673 6.9422 15.8891 6.98079 15.6951C7.01937 15.5011 6.99957 15.3 6.92388 15.1173C6.84819 14.9346 6.72002 14.7784 6.55557 14.6685C6.39112 14.5586 6.19778 14.5 6 14.5C5.73478 14.5 5.48043 14.6054 5.29289 14.7929C5.10536 14.9804 5 15.2348 5 15.5Z"
  //         fill="currentColor"
  //       />
  //     </svg>
  //   ),
  // },
  // {
  //   title: 'Update member’s info',
  //   link: '/user/update-member-info',
  //   icon: (
  //     <svg
  //       width="24"
  //       height="25"
  //       viewBox="0 0 24 25"
  //       fill="none"
  //       xmlns="http://www.w3.org/2000/svg"
  //     >
  //       <g clipPath="url(#clip0_79_1668)">
  //         <mask
  //           id="mask0_79_1668"
  //           maskUnits="userSpaceOnUse"
  //           x="0"
  //           y="0"
  //           width="24"
  //           height="25"
  //         >
  //           <path d="M0 0.5H24V24.5H0V0.5Z" fill="white" />
  //         </mask>
  //         <g mask="url(#mask0_79_1668)">
  //           <path
  //             d="M20 10.5C20 6.729 20 4.843 18.828 3.672C17.765 2.609 16.114 2.51 13 2.5M20 14.5C20 18.271 20 20.157 18.828 21.328C17.656 22.499 15.771 22.5 12 22.5C8.229 22.5 6.343 22.5 5.172 21.328C4.001 20.156 4 18.272 4 14.5V11.501"
  //             stroke="currentColor"
  //             strokeWidth="1.5"
  //             strokeLinecap="round"
  //           />
  //           <path
  //             d="M2.72981 5.3L2.17581 5.806C2.24609 5.88301 2.33166 5.94453 2.42705 5.98662C2.52244 6.02871 2.62555 6.05045 2.72981 6.05045C2.83408 6.05045 2.93719 6.02871 3.03258 5.98662C3.12797 5.94453 3.21353 5.88301 3.28381 5.806L2.72981 5.3ZM4.01381 5.006C4.14801 4.85907 4.21835 4.66485 4.20935 4.46606C4.20035 4.26727 4.11274 4.0802 3.96581 3.946C3.81888 3.8118 3.62466 3.74147 3.42587 3.75047C3.22708 3.75947 3.04001 3.84707 2.90581 3.994L4.01381 5.006ZM2.55381 3.994C2.41961 3.84707 2.23254 3.75947 2.03375 3.75047C1.83497 3.74147 1.64074 3.8118 1.49381 3.946C1.34688 4.0802 1.25928 4.26727 1.25028 4.46606C1.24128 4.66485 1.31161 4.85907 1.44581 5.006L2.55381 3.994ZM10.2698 3.7L10.8238 3.194C10.7535 3.11699 10.668 3.05547 10.5726 3.01338C10.4772 2.97129 10.3741 2.94955 10.2698 2.94955C10.1656 2.94955 10.0624 2.97129 9.96705 3.01338C9.87166 3.05547 9.78609 3.11699 9.71581 3.194L10.2698 3.7ZM8.98581 3.994C8.85161 4.14093 8.78128 4.33515 8.79028 4.53394C8.79928 4.73273 8.88688 4.9198 9.03381 5.054C9.18074 5.1882 9.37497 5.25853 9.57376 5.24953C9.77254 5.24053 9.95961 5.15293 10.0938 5.006L8.98581 3.994ZM10.4458 5.006C10.5123 5.07875 10.5924 5.1377 10.6816 5.17949C10.7709 5.22128 10.8674 5.24508 10.9659 5.24953C11.0643 5.25399 11.1626 5.23902 11.2553 5.20547C11.3479 5.17192 11.4331 5.12045 11.5058 5.054C11.5786 4.98755 11.6375 4.90742 11.6793 4.81819C11.7211 4.72896 11.7449 4.63237 11.7493 4.53394C11.7538 4.43551 11.7388 4.33717 11.7053 4.24452C11.6717 4.15188 11.6203 4.06675 11.5538 3.994L10.4458 5.006ZM4.57581 6.806C4.50989 6.73279 4.43019 6.67328 4.34127 6.63087C4.25235 6.58846 4.15594 6.56397 4.05756 6.55882C3.85886 6.54841 3.66417 6.61736 3.51631 6.7505C3.36846 6.88364 3.27954 7.07006 3.26913 7.26876C3.25873 7.46745 3.32768 7.66214 3.46081 7.81L4.57581 6.806ZM8.53981 2.33C8.66589 2.47986 8.84559 2.57447 9.0405 2.59359C9.2354 2.61271 9.43006 2.55484 9.58286 2.43234C9.73566 2.30984 9.83449 2.13243 9.85821 1.93802C9.88193 1.74362 9.82867 1.54765 9.70981 1.392L8.53981 2.33ZM6.37981 -0.25C3.88581 -0.25 1.97981 1.943 1.97981 4.5H3.47981C3.47981 2.64 4.83981 1.25 6.37981 1.25V-0.25ZM1.97981 4.5L1.98081 5.3H3.48081L3.47981 4.5H1.97981ZM3.28381 5.806L4.01381 5.006L2.90581 3.994L2.17581 4.794L3.28381 5.806ZM3.28381 4.794L2.55381 3.994L1.44581 5.006L2.17581 5.806L3.28381 4.794ZM6.61981 9.25C9.11381 9.25 11.0198 7.057 11.0198 4.5H9.51981C9.51981 6.36 8.15981 7.75 6.61981 7.75V9.25ZM11.0198 4.5V3.7H9.51981V4.5H11.0198ZM9.71681 3.194L8.98681 3.994L10.0948 5.006L10.8248 4.206L9.71681 3.194ZM9.71681 4.206L10.4458 5.006L11.5548 3.994L10.8238 3.194L9.71681 4.206ZM3.45981 7.809C4.24981 8.688 5.36781 9.25 6.61781 9.25V7.75C5.83281 7.75 5.10881 7.4 4.57481 6.806L3.45981 7.809ZM9.70981 1.392C8.91381 0.4 7.72481 -0.25 6.37981 -0.25V1.25C7.22281 1.25 7.99781 1.654 8.53981 2.33L9.70981 1.392Z"
  //             fill="currentColor"
  //           />
  //           <path
  //             d="M15 19.5H9"
  //             stroke="currentColor"
  //             strokeWidth="1.5"
  //             strokeLinecap="round"
  //           />
  //         </g>
  //       </g>
  //       <defs>
  //         <clipPath id="clip0_79_1668">
  //           <rect
  //             width="24"
  //             height="24"
  //             fill="white"
  //             transform="translate(0 0.5)"
  //           />
  //         </clipPath>
  //       </defs>
  //     </svg>
  //   ),
  // },
];

export default routes;
