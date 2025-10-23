# Sidebar Language Update Guide

## Vấn đề đã được sửa

Sidebar trước đây có một số vấn đề về đa ngôn ngữ:

1. **Menu items sử dụng hardcoded text**: Tất cả menu items đều hiển thị bằng tiếng Anh
2. **Nút chuyển ngôn ngữ thiếu tiếng Việt**: Nút "Vie" bị comment trong code
3. **Sign in button và copyright text chưa được dịch**: Các text này vẫn hardcode

## Những thay đổi đã thực hiện

### 1. Thêm Translation Keys

**File `src/locales/en/translation.json`:**
```json
"sidebar": {
  "signIn": "Sign in",
  "copyright": "©2024 NoExcuseChallenge. All Rights Reserved.",
  "menu": {
    "Users": "Users",
    "Transactions": "Transactions",
    "Get link active": "Get link active",
    "Withdraw request": "Withdraw request",
    "Claims": "Claims",
    "News": "News",
    "Permissions": "Permissions",
    "Cronjob": "Cronjob",
    "Admins": "Admins",
    "Double KYC": "Double KYC",
    "DreamPool": "DreamPool",
    "Config": "Config",
    "User History": "User History",
    "Basic Members": "Basic Members",
    "Pre-Tier 2 Pending": "Pre-Tier 2 Pending",
    "Pre-Tier 2 Users": "Pre-Tier 2 Users",
    "Pre-Tier 2 Pool": "Pre-Tier 2 Pool",
    "Wallet Connect History": "Wallet Connect History",
    "Profile": "Profile",
    "Payment": "Payment",
    "System": "System",
    "Income": "Income",
    "Withdraws": "Withdraws",
    "Referral": "Referral"
  }
}
```

**File `src/locales/vi/translation.json`:**
```json
"sidebar": {
  "signIn": "Đăng nhập",
  "copyright": "©2024 NoExcuseChallenge. Tất cả quyền được bảo lưu.",
  "menu": {
    "Users": "Người dùng",
    "Transactions": "Giao dịch",
    "Get link active": "Lấy liên kết kích hoạt",
    "Withdraw request": "Yêu cầu rút tiền",
    "Claims": "Yêu cầu",
    "News": "Tin tức",
    "Permissions": "Quyền hạn",
    "Cronjob": "Tác vụ tự động",
    "Admins": "Quản trị viên",
    "Double KYC": "KYC kép",
    "DreamPool": "DreamPool",
    "Config": "Cấu hình",
    "User History": "Lịch sử người dùng",
    "Basic Members": "Thành viên cơ bản",
    "Pre-Tier 2 Pending": "Pre-Tier 2 chờ duyệt",
    "Pre-Tier 2 Users": "Người dùng Pre-Tier 2",
    "Pre-Tier 2 Pool": "Pool Pre-Tier 2",
    "Wallet Connect History": "Lịch sử kết nối ví",
    "Profile": "Hồ sơ",
    "Payment": "Thanh toán",
    "System": "Hệ thống",
    "Income": "Thu nhập",
    "Withdraws": "Rút tiền",
    "Referral": "Giới thiệu"
  }
}
```

### 2. Cập nhật Sidebar Component (`src/components/Sidebar/index.tsx`)

**Menu Items:**
```tsx
// Trước
{t(route.title)}

// Sau
{t(`sidebar.menu.${route.title}`)}
```

**Sign In Button:**
```tsx
// Trước
Sign in

// Sau
{t('sidebar.signIn')}
```

**Copyright Text:**
```tsx
// Trước
©2024 NoExcuseChallenge. All Rights Reserved.

// Sau
{t('sidebar.copyright')}
```

**Language Switcher:**
```tsx
// Trước (nút Vie bị comment)
{/* <span onClick={() => onChangeLanguage('vi')}>Vie</span> */}

// Sau (uncomment và cải thiện)
<span
  onClick={() => onChangeLanguage('vi')}
  className={`${
    i18n.language.includes('vi') ? 'text-NoExcuseChallenge' : ''
  } cursor-pointer`}
>
  Vie
</span>
<span>/</span>
<span
  onClick={() => onChangeLanguage('en')}
  className={`${
    i18n.language.includes('en') ? 'text-NoExcuseChallenge' : ''
  } cursor-pointer`}
>
  Eng
</span>
```

## Kết quả

✅ **Sidebar giờ đây hỗ trợ đa ngôn ngữ hoàn toàn:**
- Tất cả menu items được dịch sang tiếng Việt
- Nút chuyển ngôn ngữ hiển thị cả "Vie" và "Eng"
- Sign in button và copyright text được dịch
- UI hiển thị ngôn ngữ đang được chọn

## Cách sử dụng

1. Truy cập bất kỳ trang nào có sidebar
2. Click vào nút "Vie" để chuyển sang tiếng Việt
3. Click vào nút "Eng" để chuyển về tiếng Anh
4. Tất cả text trong sidebar sẽ thay đổi ngay lập tức

## Lưu ý

- Sidebar sẽ reload sau khi chuyển ngôn ngữ để đảm bảo tất cả component được cập nhật
- Nút ngôn ngữ đang active sẽ có màu vàng (`text-NoExcuseChallenge`)
- Nút ngôn ngữ không active sẽ có màu xám (`text-gray-500`)
- Cả admin và user routes đều được hỗ trợ đa ngôn ngữ
