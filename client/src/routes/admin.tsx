import AdminUserPages from '@/pages/Admin/Users';

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
    component: AdminUserPages,
  },
  {
    title: 'Transactions',
    link: '/admin/transactions',
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
  // {
  //   title: 'Wallets',
  //   link: '/admin/wallets',
  //   icon: (
  //     <svg
  //       fill="currentColor
  //       "
  //       version="1.1"
  //       id="Layer_1"
  //       xmlns="http://www.w3.org/2000/svg"
  //       width="23"
  //       height="21"
  //       viewBox="0 0 20 20"
  //       enableBackground="new 0 0 20 20"
  //     >
  //       <path
  //         d="M19,4h-3V1c0-0.6-0.4-1-1-1H3C1.3,0,0,1.3,0,3v14c0,1.7,1.3,3,3,3h16c0.6,0,1-0.4,1-1V5C20,4.4,19.6,4,19,4z M2,3
  // c0-0.6,0.4-1,1-1h11v2H2V3z M18,18H3c-0.6,0-1-0.4-1-1V6h16V18z"
  //       />
  //       <circle cx="14" cy="12" r="2" />
  //     </svg>
  //   ),
  // },
  {
    title: 'Get link active',
    link: '/admin/linkVerify',
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 16 16"
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      >
        <rect height="9.5" width="12.5" y="3.75" x="1.75" />
        <path d="m2.25 4.25 5.75 5 5.75-5" />
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
  {
    title: 'Claims',
    link: '/admin/claims',
    icon: (
      <svg
        fill="currentColor"
        width="25"
        height="25"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          d="M22,17 L22,19 L8,19 L8,17 L22,17 Z M22,11 L22,13 L8,13 L8,11 L22,11 Z M22,5 L22,7 L8,7 L8,5 L22,5 Z M4,20 C2.8954305,20 2,19.1045695 2,18 C2,16.8954305 2.8954305,16 4,16 C5.1045695,16 6,16.8954305 6,18 C6,19.1045695 5.1045695,20 4,20 Z M4,14 C2.8954305,14 2,13.1045695 2,12 C2,10.8954305 2.8954305,10 4,10 C5.1045695,10 6,10.8954305 6,12 C6,13.1045695 5.1045695,14 4,14 Z M4,8 C2.8954305,8 2,7.1045695 2,6 C2,4.8954305 2.8954305,4 4,4 C5.1045695,4 6,4.8954305 6,6 C6,7.1045695 5.1045695,8 4,8 Z"
        />
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
    title: 'Permissions',
    link: '/admin/permissions',
    icon: (
      <svg
        fill="currentColor"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M17,9V7A5,5,0,0,0,7,7V9a3,3,0,0,0-3,3v7a3,3,0,0,0,3,3H17a3,3,0,0,0,3-3V12A3,3,0,0,0,17,9ZM9,7a3,3,0,0,1,6,0V9H9Zm9,12a1,1,0,0,1-1,1H7a1,1,0,0,1-1-1V12a1,1,0,0,1,1-1H17a1,1,0,0,1,1,1Z" />
      </svg>
    ),
  },
  {
    title: 'Cronjob',
    link: '/admin/cronjob',
    icon: (
      <svg
        fill="currentColor"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          d="M3,3 L21,3 C22.1045695,3 23,3.8954305 23,5 L23,19 C23,20.1045695 22.1045695,21 21,21 L3,21 C1.8954305,21 1,20.1045695 1,19 L1,5 C1,3.8954305 1.8954305,3 3,3 Z M3,5 L3,19 L21,19 L21,5 L3,5 Z M8.33333333,12 L5.4,9.8 L6.6,8.2 L11.6666667,12 L6.6,15.8 L5.4,14.2 L8.33333333,12 Z M12,16 L12,14 L17,14 L17,16 L12,16 Z"
        />
      </svg>
    ),
  },
  {
    title: 'Admins',
    link: '/admin/admin',
    icon: (
      <svg
        fill="currentColor"
        height="24"
        width="24"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        enableBackground="new 0 0 24 24"
      >
        <g id="user-admin">
          <path
            d="M22.3,16.7l1.4-1.4L20,11.6l-5.8,5.8c-0.5-0.3-1.1-0.4-1.7-0.4C10.6,17,9,18.6,9,20.5s1.6,3.5,3.5,3.5s3.5-1.6,3.5-3.5
		c0-0.6-0.2-1.2-0.4-1.7l1.9-1.9l2.3,2.3l1.4-1.4l-2.3-2.3l1.1-1.1L22.3,16.7z M12.5,22c-0.8,0-1.5-0.7-1.5-1.5s0.7-1.5,1.5-1.5
		s1.5,0.7,1.5,1.5S13.3,22,12.5,22z"
          />
          <path
            d="M2,19c0-3.9,3.1-7,7-7c2,0,3.9,0.9,5.3,2.4l1.5-1.3c-0.9-1-1.9-1.8-3.1-2.3C14.1,9.7,15,7.9,15,6c0-3.3-2.7-6-6-6
		S3,2.7,3,6c0,1.9,0.9,3.7,2.4,4.8C2.2,12.2,0,15.3,0,19v5h8v-2H2V19z M5,6c0-2.2,1.8-4,4-4s4,1.8,4,4s-1.8,4-4,4S5,8.2,5,6z"
          />
        </g>
      </svg>
    ),
  },
  {
    title: 'Double KYC',
    link: '/admin/double-kyc',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 16 16"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
      >
        <g fill="currentColor">
          <path d="M2.25 0A2.25 2.25 0 000 2.25v7.5A2.25 2.25 0 002.25 12h.25a.75.75 0 000-1.5h-.25a.75.75 0 01-.75-.75v-7.5a.75.75 0 01.75-.75h7.5a.75.75 0 01.75.75v.25a.75.75 0 001.5 0v-.25A2.25 2.25 0 009.75 0h-7.5z" />

          <path
            fillRule="evenodd"
            d="M6.25 4A2.25 2.25 0 004 6.25v7.5A2.25 2.25 0 006.25 16h7.5A2.25 2.25 0 0016 13.75v-7.5A2.25 2.25 0 0013.75 4h-7.5zM5.5 6.25a.75.75 0 01.75-.75h7.5a.75.75 0 01.75.75v7.5a.75.75 0 01-.75.75h-7.5a.75.75 0 01-.75-.75v-7.5z"
            clipRule="evenodd"
          />
        </g>
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
  {
    title: 'Config',
    link: '/admin/config',
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="48" height="48" fill="white" fillOpacity="0.01" />
        <path
          d="M41.5 10H35.5"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M27.5 6V14"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M27.5 10L5.5 10"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M13.5 24H5.5"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M21.5 20V28"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M43.5 24H21.5"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M41.5 38H35.5"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M27.5 34V42"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M27.5 38H5.5"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: 'User History',
    link: '/admin/user-history',
    icon: (
      <svg
        fill="currentColor"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12,2A10,10,0,0,0,5.12,4.77V3a1,1,0,0,0-2,0V7.5a1,1,0,0,0,1,1H8.62a1,1,0,0,0,0-2H6.22A8,8,0,1,1,4,12a1,1,0,0,0-2,0A10,10,0,1,0,12,2Zm0,6a1,1,0,0,0-1,1v3a1,1,0,0,0,1,1h2a1,1,0,0,0,0-2H13V9A1,1,0,0,0,12,8Z" />
      </svg>
    ),
  },
  {
    title: 'Users Tier 2',
    link: '/admin/user/tier2',
    icon: (
      <svg
        fill="currentColor"
        width="26"
        height="26"
        viewBox="0 0 256 256"
        id="Flat"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M223.999,128a8.00039,8.00039,0,0,1-8,8H104a8,8,0,0,1,0-16H215.999A8.00039,8.00039,0,0,1,223.999,128ZM104,72H215.999a8,8,0,0,0,0-16H104a8,8,0,0,0,0,16ZM215.999,184h-112a8,8,0,1,0,0,16h112a8,8,0,0,0,0-16ZM43.57764,67.15527,48,64.94434v43.0498a8,8,0,1,0,16,0V52a7.99928,7.99928,0,0,0-11.57764-7.15527l-16,8a7.99984,7.99984,0,1,0,7.15528,14.31054ZM72.23828,170.30566a22.00226,22.00226,0,1,0-38.50635-20.87109A8,8,0,1,0,48.46826,155.667a6.00233,6.00233,0,1,1,10.59717,5.55176l-25.46729,33.9834A8.00014,8.00014,0,0,0,40,208H68a8,8,0,0,0,0-16H55.99219l16.01855-21.375Q72.12867,170.46827,72.23828,170.30566Z" />
      </svg>
    ),
  },
  {
    title: 'Move System List',
    link: '/admin/move-system-list',
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4 7a1 1 0 0 1 1-1h1a1 1 0 0 1 0 2H5a1 1 0 0 1-1-1zm5 0a1 1 0 0 1 1-1h9a1 1 0 1 1 0 2h-9a1 1 0 0 1-1-1zm-5 5a1 1 0 0 1 1-1h1a1 1 0 1 1 0 2H5a1 1 0 0 1-1-1zm5 0a1 1 0 0 1 1-1h9a1 1 0 1 1 0 2h-9a1 1 0 0 1-1-1zm-5 5a1 1 0 0 1 1-1h1a1 1 0 1 1 0 2H5a1 1 0 0 1-1-1zm5 0a1 1 0 0 1 1-1h9a1 1 0 1 1 0 2h-9a1 1 0 0 1-1-1z"
          fill="currentColor"
        />
      </svg>
    ),
  },
];

export default routes;
