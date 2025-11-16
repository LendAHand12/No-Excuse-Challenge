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
    title: 'Assets',
    link: '/user/assets',
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M3 7H21M3 12H21M3 17H21"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect
          x="3"
          y="4"
          width="18"
          height="16"
          rx="2"
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
    title: 'Withdraws',
    link: '/user/withdraws',
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 15 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M11 10.5H12.5V9M11 4.5H12.5V6M4 4.5H2.5V6M2.5 9V10.5H4M7.5 9.5C6.39543 9.5 5.5 8.60457 5.5 7.5C5.5 6.39543 6.39543 5.5 7.5 5.5C8.60457 5.5 9.5 6.39543 9.5 7.5C9.5 8.60457 8.60457 9.5 7.5 9.5ZM1.5 2.5H13.5C14.0523 2.5 14.5 2.94772 14.5 3.5V11.5C14.5 12.0523 14.0523 12.5 13.5 12.5H1.5C0.947716 12.5 0.5 12.0523 0.5 11.5V3.5C0.5 2.94772 0.947715 2.5 1.5 2.5Z"
          stroke="currentColor"
        />
      </svg>
    ),
  },
  // {
  //   title: 'Pre-Tier 2 Users',
  //   link: '/user/pre-tier-2-users',
  //   icon: (
  //     <svg
  //       xmlns="http://www.w3.org/2000/svg"
  //       width="24"
  //       height="24"
  //       viewBox="0 0 24 24"
  //       fill="none"
  //       stroke="currentColor"
  //       strokeWidth="2"
  //       strokeLinecap="round"
  //       strokeLinejoin="round"
  //     >
  //       <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
  //       <circle cx="9" cy="7" r="4" />
  //       <path d="M23 21v-2a4 4 0 00-3-3.87" />
  //       <path d="M16 3.13a4 4 0 010 7.75" />
  //     </svg>
  //   ),
  // },
  {
    title: 'Pre-Tier 2 Pool',
    link: '/user/pre-tier-2-pool',
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
  //   title: 'Swap',
  //   link: '/user/swap',
  //   icon: (
  //     <svg
  //       xmlns="http://www.w3.org/2000/svg"
  //       fill="currentColor"
  //       width="24"
  //       height="24"
  //       viewBox="0 0 24 24"
  //     >
  //       <path d="M21.49 13.926l-3.273 2.48c.054-.663.116-1.435.143-2.275.04-.89.023-1.854-.043-2.835-.043-.487-.097-.98-.184-1.467-.077-.485-.196-.982-.31-1.39-.238-.862-.535-1.68-.9-2.35-.352-.673-.786-1.173-1.12-1.462-.172-.144-.31-.248-.414-.306l-.153-.093c-.083-.05-.187-.056-.275-.003-.13.08-.175.252-.1.388l.01.02s.11.198.258.54c.07.176.155.38.223.63.08.24.14.528.206.838.063.313.114.66.17 1.03l.15 1.188c.055.44.106.826.13 1.246.03.416.033.85.026 1.285.004.872-.063 1.76-.115 2.602-.062.853-.12 1.65-.172 2.335 0 .04-.004.073-.005.11l-.115-.118-2.996-3.028-1.6.454 5.566 6.66 6.394-5.803-1.503-.677z" />
  //       <path d="M2.503 9.48L5.775 7c-.054.664-.116 1.435-.143 2.276-.04.89-.023 1.855.043 2.835.043.49.097.98.184 1.47.076.484.195.98.31 1.388.237.862.534 1.68.9 2.35.35.674.785 1.174 1.12 1.463.17.145.31.25.413.307.1.06.152.093.152.093.083.05.187.055.275.003.13-.08.175-.252.1-.388l-.01-.02s-.11-.2-.258-.54c-.07-.177-.155-.38-.223-.63-.082-.242-.14-.528-.207-.84-.064-.312-.115-.658-.172-1.027-.046-.378-.096-.777-.15-1.19-.053-.44-.104-.825-.128-1.246-.03-.415-.033-.85-.026-1.285-.004-.872.063-1.76.115-2.603.064-.853.122-1.65.174-2.334 0-.04.004-.074.005-.11l.114.118 2.996 3.027 1.6-.454L7.394 3 1 8.804l1.503.678z" />
  //     </svg>
  //   ),
  // },
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
  // {
  //   title: 'Users Tier 2',
  //   link: '/user/tier2',
  //   icon: (
  //     <svg
  //       fill="currentColor"
  //       width="26"
  //       height="26"
  //       viewBox="0 0 256 256"
  //       id="Flat"
  //       xmlns="http://www.w3.org/2000/svg"
  //     >
  //       <path d="M223.999,128a8.00039,8.00039,0,0,1-8,8H104a8,8,0,0,1,0-16H215.999A8.00039,8.00039,0,0,1,223.999,128ZM104,72H215.999a8,8,0,0,0,0-16H104a8,8,0,0,0,0,16ZM215.999,184h-112a8,8,0,1,0,0,16h112a8,8,0,0,0,0-16ZM43.57764,67.15527,48,64.94434v43.0498a8,8,0,1,0,16,0V52a7.99928,7.99928,0,0,0-11.57764-7.15527l-16,8a7.99984,7.99984,0,1,0,7.15528,14.31054ZM72.23828,170.30566a22.00226,22.00226,0,1,0-38.50635-20.87109A8,8,0,1,0,48.46826,155.667a6.00233,6.00233,0,1,1,10.59717,5.55176l-25.46729,33.9834A8.00014,8.00014,0,0,0,40,208H68a8,8,0,0,0,0-16H55.99219l16.01855-21.375Q72.12867,170.46827,72.23828,170.30566Z" />
  //     </svg>
  //   ),
  // },
  {
    title: 'Support Tickets',
    link: '/user/tickets',
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M3 5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7 9L12 12L17 9"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
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
];

export default routes;
