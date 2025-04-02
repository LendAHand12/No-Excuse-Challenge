const routes = [
  // {
  //   title: 'Dashboard',
  //   link: '/admin/dashboard',
  //   icon: (
  //     <svg
  //       width="24"
  //       height="25"
  //       viewBox="0 0 24 25"
  //       fill="none"
  //       xmlns="http://www.w3.org/2000/svg"
  //     >
  //       <path
  //         d="M10.5525 3.17538C10.9579 2.83471 11.4705 2.64795 12 2.64795C12.5295 2.64795 13.0421 2.83471 13.4475 3.17538L20.1975 8.85138C20.4488 9.06251 20.6508 9.32606 20.7894 9.62353C20.928 9.921 20.9999 10.2452 21 10.5734V20.0009C21 20.3987 20.842 20.7802 20.5607 21.0615C20.2794 21.3428 19.8978 21.5009 19.5 21.5009H15.375C14.9772 21.5009 14.5956 21.3428 14.3143 21.0615C14.033 20.7802 13.875 20.3987 13.875 20.0009V14.7509H10.125V20.0009C10.125 20.3987 9.96696 20.7802 9.68566 21.0615C9.40436 21.3428 9.02282 21.5009 8.625 21.5009H4.5C4.10218 21.5009 3.72064 21.3428 3.43934 21.0615C3.15804 20.7802 3 20.3987 3 20.0009V10.5726C3.00008 10.2444 3.07196 9.92025 3.21059 9.62278C3.34922 9.32531 3.55124 9.06176 3.8025 8.85063L10.5525 3.17463V3.17538ZM12.483 4.32288C12.3478 4.20906 12.1767 4.14665 12 4.14665C11.8233 4.14665 11.6522 4.20906 11.517 4.32288L4.767 10.0004C4.68357 10.0706 4.61645 10.1582 4.57034 10.257C4.52422 10.3559 4.50022 10.4636 4.5 10.5726V20.0001H8.625V14.7501C8.625 14.3523 8.78304 13.9708 9.06434 13.6895C9.34564 13.4082 9.72718 13.2501 10.125 13.2501H13.875C14.2728 13.2501 14.6544 13.4082 14.9357 13.6895C15.217 13.9708 15.375 14.3523 15.375 14.7501V20.0001H19.5V10.5726C19.5 10.4633 19.4761 10.3553 19.43 10.2562C19.3839 10.1571 19.3166 10.0693 19.233 9.99888L12.483 4.32288Z"
  //         fill="currentColor"
  //       />
  //     </svg>
  //   ),
  // },
  {
    title: 'Users',
    link: '/admin/users',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    title: 'Transactions',
    link: '/admin/transactions',
    icon: (
      <svg
        width="24"
        height="25"
        viewBox="0 0 24 25"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M2 7H22V19H2V7Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M2 11C3.06087 11 4.07828 10.5786 4.82843 9.82843C5.57857 9.07828 6 8.06087 6 7H2V11ZM2 15C3.06087 15 4.07828 15.4214 4.82843 16.1716C5.57857 16.9217 6 17.9391 6 19H2V15ZM22 15V19H18C18 17.9391 18.4214 16.9217 19.1716 16.1716C19.9217 15.4214 20.9391 15 22 15ZM22 11C20.9391 11 19.9217 10.5786 19.1716 9.82843C18.4214 9.07828 18 8.06087 18 7H22V11Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 16C13.3805 16 14.5 14.657 14.5 13C14.5 11.343 13.3805 10 12 10C10.6195 10 9.5 11.343 9.5 13C9.5 14.657 10.6195 16 12 16Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: 'Wallets',
    link: '/admin/wallets',
    icon: (
      <svg
        width="18"
        height="20"
        viewBox="0 0 15 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0.5 3.5L0.5 12.5C0.5 13.0523 0.947716 13.5 1.5 13.5L13.5 13.5C14.0523 13.5 14.5 13.0523 14.5 12.5V4.5C14.5 3.94772 14.0523 3.5 13.5 3.5L3 3.5M0.5 3.5V2.5C0.5 1.94772 0.947716 1.5 1.5 1.5H9.5C10.0523 1.5 10.5 1.94772 10.5 2.5V3.5L3 3.5M0.5 3.5L3 3.5M9 9.5H12"
          stroke="currentColor"
        />
      </svg>
    ),
  },
  {
    title: 'Get link active',
    link: '/admin/linkVerify',
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 16 16"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M1 3.5l.5-.5h13l.5.5v9l-.5.5h-13l-.5-.5v-9zm1 1.035V12h12V4.536L8.31 8.9H7.7L2 4.535zM13.03 4H2.97L8 7.869 13.03 4z"
        />
      </svg>
    ),
  },
  {
    title: 'Withdraw request',
    link: '/admin/withdraw',
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 16 16"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path fill="currentColor" d="M8 0l2 3h-1v2h-2v-2h-1l2-3z"></path>
        <path
          fill="currentColor"
          d="M15 7v8h-14v-8h14zM16 6h-16v10h16v-10z"
        ></path>
        <path
          fill="currentColor"
          d="M8 8c1.657 0 3 1.343 3 3s-1.343 3-3 3h5v-1h1v-4h-1v-1h-5z"
        ></path>
        <path
          fill="currentColor"
          d="M5 11c0-1.657 1.343-3 3-3h-5v1h-1v4h1v1h5c-1.657 0-3-1.343-3-3z"
        ></path>
      </svg>
    ),
  },
  {
    title: 'Claims',
    link: '/admin/claims',
    icon: (
      <svg
        fill="currentColor"
        height="24"
        width="24"
        version="1.1"
        id="Layer_1"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
      >
        <g>
          <g>
            <path
              d="M453.278,420.87l-63.91-63.908c-34.557-34.554-90.783-34.556-125.34,0l-25.684,25.684l-72.692-0.547
			c-7.578-0.056-14.727,2.841-20.128,8.161c-1.174,1.157-2.227,2.402-3.169,3.713l-37.012-37.012
			c-10.959-10.959-28.331-11.549-39.549-1.34c-5.806,5.283-9.104,12.506-9.288,20.335c-0.181,7.72,2.844,15.278,8.304,20.738
			l14.601,14.601c3.24,3.238,8.491,3.238,11.73,0c3.239-3.24,3.239-8.491,0-11.73l-14.6-14.601c-2.302-2.301-3.526-5.362-3.45-8.618
			c0.075-3.251,1.451-6.255,3.869-8.456c4.576-4.166,12.047-3.804,16.655,0.803l43.491,43.491c0.005,0.006,0.011,0.01,0.017,0.016
			c0.889,14.754,13.109,26.793,28.105,26.908l75.935,0.823c0.022,0,0.043,0,0.064,0c4.552,0,8.258-3.925,8.293-8.483
			c0.034-4.581-3.651-8.447-8.231-8.483l-75.935-0.634c-6.501-0.05-11.75-5.41-11.701-11.91c0.023-3.151,1.272-6.117,3.515-8.327
			c2.244-2.209,5.229-3.417,8.363-3.399l73.851,0.552c2.758,0.724,5.815,0.011,7.977-2.15l28.403-28.403
			c28.087-28.088,73.791-28.091,101.88,0l63.906,63.906c1.62,1.619,3.743,2.428,5.865,2.428s4.245-0.809,5.865-2.428
			C456.517,429.359,456.517,424.109,453.278,420.87z"
            />
          </g>
        </g>
        <g>
          <g>
            <path
              d="M389.372,484.77l-35.507-35.5c-1.961-1.96-4.772-2.863-7.491-2.32l-70.202,13.988H152.618l-25.973-25.922
			c-3.24-3.238-8.491-3.211-11.73,0.025c-3.239,3.24-3.239,8.503,0,11.743l28.403,28.358c1.556,1.555,3.665,2.383,5.865,2.383
			h127.812c0.546,0,1.09-0.002,1.627-0.109l66.654-13.304l32.364,32.378c1.62,1.619,3.743,2.435,5.865,2.435
			s4.245-0.806,5.865-2.425C392.611,493.258,392.611,488.01,389.372,484.77z"
            />
          </g>
        </g>
        <g>
          <g>
            <path
              d="M504.259,13.076h-70.773c-4.581,0-8.294,3.712-8.294,8.294c0,4.581,3.712,8.294,8.294,8.294h61.927v266.505H16.587V29.664
			h381.512c4.581,0,8.294-3.712,8.294-8.294c0-4.581-3.712-8.294-8.294-8.294H8.847C4.265,13.076,0,16.236,0,20.817V303.91
			c0,4.581,4.265,8.847,8.847,8.847h495.412c4.581,0,7.741-4.265,7.741-8.847V20.817C512,16.237,508.841,13.076,504.259,13.076z"
            />
          </g>
        </g>
        <g>
          <g>
            <path
              d="M468.596,100.99c-24.695,0-44.648-19.814-44.648-44.51c0-4.581-3.574-8.017-8.156-8.017H97.313
			c-4.581,0-8.294,3.437-8.294,8.017c0,24.695-20.367,44.648-45.063,44.648c-4.581,0-8.57,3.574-8.57,8.156v106.16
			c0,4.581,3.989,8.294,8.57,8.294c24.695,0,44.924,20.367,44.924,45.063c0,4.581,3.85,8.57,8.432,8.57h318.479
			c4.581,0,8.294-3.989,8.294-8.57c0-24.695,19.814-44.924,44.51-44.924c4.581,0,8.017-3.851,8.017-8.432v-106.16
			C476.613,104.702,473.178,100.99,468.596,100.99z M460.026,207.708c-26.54,3.692-48.276,25.429-51.969,53.074H105.048
			c-3.692-27.646-25.429-49.382-53.074-53.074v-90.689c27.646-3.692,49.382-25.429,53.074-51.969h303.009
			c3.692,26.54,25.429,48.276,51.969,51.969V207.708z"
            />
          </g>
        </g>
        <g>
          <g>
            <path
              d="M274.246,154.623h-9.953v-45.339h27.646c4.581,0,8.294-3.712,8.294-8.294c0-4.581-3.712-8.294-8.294-8.294h-27.646v-9.953
			c0-4.581-3.712-8.294-8.294-8.294s-8.294,3.712-8.294,8.294v9.953h-8.847c-14.329,0-26.54,11.105-26.54,25.434v26.54
			c0,14.329,12.211,26.54,26.54,26.54h8.847v45.339h-26.54c-4.581,0-8.294,3.712-8.294,8.294s3.712,8.294,8.294,8.294h26.54v8.847
			c0,4.581,3.712,8.294,8.294,8.294s8.294-3.712,8.294-8.294v-8.847h9.953c14.329,0,25.434-12.211,25.434-26.54v-26.54
			C299.68,165.728,288.576,154.623,274.246,154.623z M247.706,154.623h-8.847c-5.183,0-9.953-4.769-9.953-9.952v-26.54
			c0-5.183,4.769-8.847,9.953-8.847h8.847V154.623z M283.093,206.597c0,5.183-3.664,9.952-8.847,9.952h-9.953V171.21h9.953
			c5.183,0,8.847,3.664,8.847,8.847V206.597z"
            />
          </g>
        </g>
        <g>
          <g>
            <path
              d="M380.406,127.53c-19.207,0-34.834,15.626-34.834,34.834s15.627,34.834,34.834,34.834
			c19.207,0,34.834-15.626,34.834-34.834S399.613,127.53,380.406,127.53z M380.406,180.61c-10.061,0-18.246-8.185-18.246-18.246
			s8.185-18.246,18.246-18.246c10.061,0,18.246,8.185,18.246,18.246S390.467,180.61,380.406,180.61z"
            />
          </g>
        </g>
        <g>
          <g>
            <path
              d="M132.7,127.53c-19.207,0-34.834,15.626-34.834,34.834s15.627,34.834,34.834,34.834c19.207,0,34.834-15.626,34.834-34.834
			S151.907,127.53,132.7,127.53z M132.7,180.61c-10.061,0-18.246-8.185-18.246-18.246s8.185-18.246,18.246-18.246
			s18.246,8.185,18.246,18.246S142.761,180.61,132.7,180.61z"
            />
          </g>
        </g>
        <g>
          <g>
            <path
              d="M398.099,92.696h-35.387c-4.581,0-8.294,3.712-8.294,8.294s3.712,8.294,8.294,8.294h35.387
			c4.581,0,8.294-3.712,8.294-8.294S402.681,92.696,398.099,92.696z"
            />
          </g>
        </g>
        <g>
          <g>
            <path
              d="M398.099,216.549h-35.387c-4.581,0-8.294,3.712-8.294,8.294s3.712,8.294,8.294,8.294h35.387
			c4.581,0,8.294-3.712,8.294-8.294S402.681,216.549,398.099,216.549z"
            />
          </g>
        </g>
        <g>
          <g>
            <path
              d="M150.393,92.696h-35.387c-4.581,0-8.294,3.712-8.294,8.294s3.712,8.294,8.294,8.294h35.387
			c4.581,0,8.294-3.712,8.294-8.294S154.975,92.696,150.393,92.696z"
            />
          </g>
        </g>
        <g>
          <g>
            <path
              d="M150.393,216.549h-35.387c-4.581,0-8.294,3.712-8.294,8.294s3.712,8.294,8.294,8.294h35.387
			c4.581,0,8.294-3.712,8.294-8.294S154.975,216.549,150.393,216.549z"
            />
          </g>
        </g>
      </svg>
    ),
  },
  {
    title: 'News',
    link: '/admin/news',
    icon: (
      <svg
        width="22"
        height="21"
        viewBox="0 0 22 21"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M17 13.5V7.5C17 4.672 17 3.257 16.121 2.379C15.243 1.5 13.828 1.5 11 1.5H7C4.172 1.5 2.757 1.5 1.879 2.379C1 3.257 1 4.672 1 7.5V13.5C1 16.328 1 17.743 1.879 18.621C2.757 19.5 4.172 19.5 7 19.5H19M5 6.5H13M5 10.5H13M5 14.5H9"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M17 6.5H18C19.414 6.5 20.121 6.5 20.56 6.94C21 7.379 21 8.086 21 9.5V17.5C21 18.0304 20.7893 18.5391 20.4142 18.9142C20.0391 19.2893 19.5304 19.5 19 19.5C18.4696 19.5 17.9609 19.2893 17.5858 18.9142C17.2107 18.5391 17 18.0304 17 17.5V6.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: 'DreamPool',
    link: '/admin/dreampool',
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
  //   link: '/admin/ice-breakers',
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
  //   path: "/users",
  //   title: "users",
  //   component: Users,
  // },
  // {
  //   path: "/tree/:id",
  //   component: Tree,
  // },
  // {
  //   path: "/users/:id",
  //   component: UserProfile,
  // },
  // {
  //   path: "/transactions",
  //   title: "transactions",
  //   component: Transactions,
  // },
  // {
  //   path: "/transactions/:id",
  //   component: TransactionDetail,
  // },
  // // {
  // //   path: "/system",
  // //   title: "tree",
  // //   component: System,
  // // },
  // {
  //   path: "/trash",
  //   title: "trash",
  //   component: Trash,
  // },
  // {
  //   path: "/linkVerify",
  //   component: GetVerifyLink,
  // },
  // {
  //   path: "/package",
  //   component: SettingPackage,
  // },
  // {
  //   path: "/wallet",
  //   component: SettingWallet,
  // },
  // {
  //   path: "/create-user",
  //   component: CreateUserPage,
  // },
  // {
  //   path: "/export/payment",
  //   component: ExportPayment,
  // },
  // {
  //   path: "/export/user",
  //   component: ExportUser,
  // },
  // {
  //   path: "/changeUser",
  //   title: "changeUser",
  //   component: ChangeUserPage,
  // },
  // {
  //   path: "/changeUser/:id",
  //   component: ChangeUserDetail,
  // },
  // {
  //   path: "/listTier",
  //   component: ListUserNextTier,
  // },
  // {
  //   path: "/lastUserTier",
  //   component: RemoveLastUserTier,
  // },
  // {
  //   path: "/cms",
  //   title: "CMS",
  //   component: CMSPage,
  // },
  // {
  //   path: "/cms/:page",
  //   component: EditCMSPage,
  // },
  // {
  //   path: "/cms/preview/cms-homepage",
  //   component: PreviewHomePage,
  // },
  // {
  //   path: "/cms/preview/cms-aboutUs",
  //   component: PreviewAboutUsPage,
  // },
  // {
  //   path: "/cms/preview/cms-ourTeam",
  //   component: PreviewOurTeamPage,
  // },
  // {
  //   path: "/posts",
  //   component: PostsPage,
  // },
  // {
  //   path: "/posts/create",
  //   component: CreatePostsPage,
  // },
  // {
  //   path: "/posts/edit",
  //   component: EditPostsPage,
  // },
  // {
  //   path: "/permissions",
  //   component: PermissionsPage,
  // },
  // {
  //   path: "/permissions/create",
  //   component: PermissionsCreatePage,
  // },
  // {
  //   path: "/permissions/:id",
  //   component: PermissionsDetailsPage,
  // },
  // {
  //   path: "/admin",
  //   component: AdminPage,
  // },
  // {
  //   path: "/create-admin",
  //   component: CreateAdminPage,
  // },
  // {
  //   path: "/admin/:id",
  //   component: AdminDetailPage,
  // },
];

export default routes;
