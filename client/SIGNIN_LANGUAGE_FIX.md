# SignIn Language Fix Guide

## Vấn đề đã được sửa

Trang SignIn trước đây không thể chuyển ngôn ngữ từ tiếng Anh sang tiếng Việt vì:

1. **SignInLayout thiếu nút chuyển ngôn ngữ tiếng Việt**: Nút "Vie" bị comment trong code
2. **SignIn page chưa sử dụng translation keys**: Tất cả text đều hardcode bằng tiếng Anh

## Những thay đổi đã thực hiện

### 1. Sửa SignInLayout (`src/layout/SignInLayout.tsx`)

**Trước:**
```tsx
<div className="text-black font-medium">
  {/* <button onClick={() => onChangeLanguage('vi')}>Vie</button>
  <span>/</span> */}
  <button onClick={() => onChangeLanguage('en')}>En</button>
</div>
```

**Sau:**
```tsx
<div className="text-black font-medium flex items-center gap-2">
  <button 
    onClick={() => onChangeLanguage('vi')}
    className={`px-2 py-1 rounded ${
      i18n.language.includes('vi') ? 'bg-black text-white' : 'hover:bg-gray-100'
    }`}
  >
    Vie
  </button>
  <span>/</span>
  <button 
    onClick={() => onChangeLanguage('en')}
    className={`px-2 py-1 rounded ${
      i18n.language.includes('en') ? 'bg-black text-white' : 'hover:bg-gray-100'
    }`}
  >
    En
  </button>
</div>
```

### 2. Thêm translation keys cho SignIn

**File `src/locales/en/translation.json`:**
```json
"signin": {
  "title": "Login",
  "emailPlaceholder": "Email/User Name",
  "passwordPlaceholder": "Password",
  "rememberMe": "Remember me",
  "forgotPassword": "Forgot password?",
  "confirm": "Confirm",
  "backToHomepage": "Back to Homepage",
  "emailRequired": "Email/User Name is required",
  "passwordRequired": "Password is required",
  "passwordPattern": "Password must contain at least 8 characters and a number"
}
```

**File `src/locales/vi/translation.json`:**
```json
"signin": {
  "title": "Đăng nhập",
  "emailPlaceholder": "Email/Tên người dùng",
  "passwordPlaceholder": "Mật khẩu",
  "rememberMe": "Ghi nhớ đăng nhập",
  "forgotPassword": "Quên mật khẩu?",
  "confirm": "Xác nhận",
  "backToHomepage": "Quay về trang chủ",
  "emailRequired": "Email/Tên người dùng là bắt buộc",
  "passwordRequired": "Mật khẩu là bắt buộc",
  "passwordPattern": "Mật khẩu phải có ít nhất 8 ký tự và một số"
}
```

### 3. Cập nhật SignIn page (`src/pages/SignIn/index.tsx`)

Thay thế tất cả hardcoded text bằng translation keys:

**Trước:**
```tsx
<h1 className="text-4xl font-bold text-black text-center mb-10">
  Login
</h1>
```

**Sau:**
```tsx
<h1 className="text-4xl font-bold text-black text-center mb-10">
  {t('signin.title')}
</h1>
```

## Kết quả

✅ **SignIn page giờ đây có thể chuyển ngôn ngữ hoàn toàn**
- Nút chuyển ngôn ngữ hiển thị cả "Vie" và "En"
- Tất cả text trên trang đều được dịch
- Validation messages cũng được dịch
- UI hiển thị ngôn ngữ đang được chọn

## Cách sử dụng

1. Truy cập trang SignIn
2. Click vào nút "Vie" để chuyển sang tiếng Việt
3. Click vào nút "En" để chuyển về tiếng Anh
4. Tất cả text trên trang sẽ thay đổi ngay lập tức

## Lưu ý

- Trang sẽ reload sau khi chuyển ngôn ngữ để đảm bảo tất cả component được cập nhật
- Nút ngôn ngữ đang active sẽ có background đen và text trắng
- Nút ngôn ngữ không active sẽ có hover effect màu xám nhạt
