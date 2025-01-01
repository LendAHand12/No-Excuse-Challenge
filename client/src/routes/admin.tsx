const routes = [
  {
    title: 'Dashboard',
    link: '/admin/dashboard',
    icon: (
      <svg
        width="24"
        height="25"
        viewBox="0 0 24 25"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10.5525 3.17538C10.9579 2.83471 11.4705 2.64795 12 2.64795C12.5295 2.64795 13.0421 2.83471 13.4475 3.17538L20.1975 8.85138C20.4488 9.06251 20.6508 9.32606 20.7894 9.62353C20.928 9.921 20.9999 10.2452 21 10.5734V20.0009C21 20.3987 20.842 20.7802 20.5607 21.0615C20.2794 21.3428 19.8978 21.5009 19.5 21.5009H15.375C14.9772 21.5009 14.5956 21.3428 14.3143 21.0615C14.033 20.7802 13.875 20.3987 13.875 20.0009V14.7509H10.125V20.0009C10.125 20.3987 9.96696 20.7802 9.68566 21.0615C9.40436 21.3428 9.02282 21.5009 8.625 21.5009H4.5C4.10218 21.5009 3.72064 21.3428 3.43934 21.0615C3.15804 20.7802 3 20.3987 3 20.0009V10.5726C3.00008 10.2444 3.07196 9.92025 3.21059 9.62278C3.34922 9.32531 3.55124 9.06176 3.8025 8.85063L10.5525 3.17463V3.17538ZM12.483 4.32288C12.3478 4.20906 12.1767 4.14665 12 4.14665C11.8233 4.14665 11.6522 4.20906 11.517 4.32288L4.767 10.0004C4.68357 10.0706 4.61645 10.1582 4.57034 10.257C4.52422 10.3559 4.50022 10.4636 4.5 10.5726V20.0001H8.625V14.7501C8.625 14.3523 8.78304 13.9708 9.06434 13.6895C9.34564 13.4082 9.72718 13.2501 10.125 13.2501H13.875C14.2728 13.2501 14.6544 13.4082 14.9357 13.6895C15.217 13.9708 15.375 14.3523 15.375 14.7501V20.0001H19.5V10.5726C19.5 10.4633 19.4761 10.3553 19.43 10.2562C19.3839 10.1571 19.3166 10.0693 19.233 9.99888L12.483 4.32288Z"
          fill="currentColor"
        />
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
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    title: 'Wallets',
    link: '/admin/wallets',
    icon: (
      <svg
        width="18"
        height="auto"
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
