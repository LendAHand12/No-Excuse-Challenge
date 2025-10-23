# 🌐 Hướng Dẫn Sử Dụng Hệ Thống Đa Ngôn Ngữ

## ✅ **Đã Hoàn Thành:**

### 1. **Sửa lại cấu hình i18n:**
- ✅ Enable tiếng Việt trong `src/i18n.ts`
- ✅ Sửa lại `DropdownLanguage.tsx` để hiển thị cả 2 ngôn ngữ
- ✅ Cấu hình fallback language là tiếng Anh

### 2. **Cập nhật file translation:**
- ✅ **en.json**: Thêm các text mới từ Homepage và các component
- ✅ **vi.json**: Dịch tất cả text sang tiếng Việt
- ✅ Tổ chức text theo cấu trúc nested (homepage, payment, status, etc.)

### 3. **Cập nhật Homepage:**
- ✅ Thay thế tất cả text hardcode bằng `t()` function
- ✅ Sử dụng `whitespace-pre-line` cho text có xuống dòng
- ✅ Thêm `useTranslation` hook

## 🚀 **Cách Sử Dụng:**

### **1. Thêm text mới:**
```tsx
// Trong component
const { t } = useTranslation();

// Sử dụng
<h1>{t('homepage.title')}</h1>
<p>{t('homepage.subtitle')}</p>
```

### **2. Cập nhật file translation:**

**en.json:**
```json
{
  "newKey": "English text",
  "nested": {
    "key": "Nested English text"
  }
}
```

**vi.json:**
```json
{
  "newKey": "Văn bản tiếng Việt",
  "nested": {
    "key": "Văn bản tiếng Việt lồng nhau"
  }
}
```

### **3. Text với xuống dòng:**
```tsx
// Trong component
<p className="whitespace-pre-line">
  {t('homepage.description')}
</p>

// Trong translation file
{
  "homepage": {
    "description": "Dòng 1\nDòng 2\nDòng 3"
  }
}
```

### **4. Text với biến:**
```tsx
// Trong component
<p>{t('welcome', { name: 'John' })}</p>

// Trong translation file
{
  "welcome": "Chào mừng {{name}}!"
}
```

## 🔧 **Cấu Trúc File Translation:**

### **en.json:**
```json
{
  "homepage": {
    "aboutUs": "About us",
    "title": "No Excuse Challenge",
    "subtitle": "Get Up. Shut Up. Take Action...",
    "quote1": "Excuses don't pay. Effort does. Get to work.",
    "whatIsTitle": "What is the No Excuse Challenge?",
    "whatIsDesc": "This isn't some feel-good...",
    "quote2": "Nobody's coming to save you...",
    "whyJoinTitle": "Why Join the No Excuse Challenge?",
    "whyJoinDesc": "• No More Excuses...",
    "quote3": "Soft people make excuses...",
    "howItWorksTitle": "How It Works",
    "howItWorksDesc": "• Stop Complaining...",
    "quote4": "You either suffer the pain...",
    "takeActionTitle": "Enough Talk. Take Action.",
    "takeActionDesc": "This isn't for the weak...",
    "quote5": "Success isn't for crybabies..."
  },
  "payment": {
    "warning": "⚠️ Warning:",
    "checkIds": "Please check the number of IDs...",
    "days": "days",
    "branch1ToFulfill": "Branch 1 to fulfill :",
    "branch2ToFulfill": "Branch 2 to fulfill :",
    "ids": "IDs",
    "agreeToComplete": "By clicking \"Yes\"...",
    "activeIds": "active IDs",
    "inBoth": "in both",
    "branch1": "Branch 1",
    "branch2": "Branch 2"
  },
  "status": {
    "unverify": "Unverify",
    "approved": "Approved", 
    "locked": "Locked"
  }
}
```

### **vi.json:**
```json
{
  "homepage": {
    "aboutUs": "Về chúng tôi",
    "title": "Thử Thách Không Có Lý Do",
    "subtitle": "Đứng dậy. Im lặng. Hành động...",
    "quote1": "Lý do không trả tiền. Nỗ lực mới trả tiền...",
    "whatIsTitle": "Thử Thách Không Có Lý Do là gì?",
    "whatIsDesc": "Đây không phải là một bài diễn văn...",
    "quote2": "Không ai sẽ đến cứu bạn...",
    "whyJoinTitle": "Tại sao tham gia Thử Thách Không Có Lý Do?",
    "whyJoinDesc": "• Không Còn Lý Do...",
    "quote3": "Người yếu đuối tạo ra lý do...",
    "howItWorksTitle": "Cách Thức Hoạt Động",
    "howItWorksDesc": "• Ngừng Phàn Nàn...",
    "quote4": "Bạn hoặc chịu đựng nỗi đau...",
    "takeActionTitle": "Đủ Nói Rồi. Hãy Hành Động.",
    "takeActionDesc": "Điều này không dành cho người yếu đuối...",
    "quote5": "Thành công không dành cho những đứa trẻ..."
  },
  "payment": {
    "warning": "⚠️ Cảnh báo:",
    "checkIds": "Vui lòng kiểm tra số lượng ID...",
    "days": "ngày",
    "branch1ToFulfill": "Nhánh 1 cần hoàn thành :",
    "branch2ToFulfill": "Nhánh 2 cần hoàn thành :",
    "ids": "ID",
    "agreeToComplete": "Bằng cách nhấp \"Có\"...",
    "activeIds": "ID hoạt động",
    "inBoth": "trong cả hai",
    "branch1": "Nhánh 1",
    "branch2": "Nhánh 2"
  },
  "status": {
    "unverify": "Chưa xác thực",
    "approved": "Đã phê duyệt", 
    "locked": "Đã khóa"
  }
}
```

## 🎯 **Chức Năng Chuyển Ngôn Ngữ:**

### **Header Language Switcher:**
- ✅ Hiển thị ngôn ngữ hiện tại (Vie/Eng)
- ✅ Dropdown với 2 tùy chọn: Tiếng Việt và Tiếng Anh
- ✅ Lưu lựa chọn vào localStorage
- ✅ Tự động reload trang khi chuyển ngôn ngữ

### **Cách hoạt động:**
1. Click vào ngôn ngữ hiện tại trong header
2. Chọn ngôn ngữ mới từ dropdown
3. Trang sẽ tự động reload với ngôn ngữ mới
4. Lựa chọn được lưu và sẽ được nhớ cho lần sau

## 📝 **Lưu Ý Quan Trọng:**

### **1. Luôn sử dụng t() function:**
```tsx
// ✅ Đúng
const { t } = useTranslation();
<h1>{t('homepage.title')}</h1>

// ❌ Sai
<h1>No Excuse Challenge</h1>
```

### **2. Cập nhật cả 2 file translation:**
- Mỗi khi thêm key mới, phải thêm vào cả `en.json` và `vi.json`
- Đảm bảo key giống nhau ở cả 2 file

### **3. Sử dụng nested structure:**
```json
// ✅ Tốt - có tổ chức
{
  "homepage": {
    "title": "...",
    "subtitle": "..."
  },
  "payment": {
    "warning": "...",
    "success": "..."
  }
}

// ❌ Không tốt - phẳng
{
  "homepageTitle": "...",
  "homepageSubtitle": "...",
  "paymentWarning": "...",
  "paymentSuccess": "..."
}
```

### **4. Text với xuống dòng:**
```tsx
// Sử dụng whitespace-pre-line
<p className="whitespace-pre-line">
  {t('homepage.description')}
</p>
```

## 🚀 **Test Ngay:**

1. Chạy `npm run dev`
2. Truy cập trang chủ
3. Click vào ngôn ngữ trong header
4. Chuyển đổi giữa Tiếng Việt và Tiếng Anh
5. Kiểm tra tất cả text đã được dịch đúng

## 📚 **Tài Liệu Tham Khảo:**

- [React i18next Documentation](https://react.i18next.com/)
- [i18next Documentation](https://www.i18next.com/)
- [i18next Browser Language Detector](https://github.com/i18next/i18next-browser-languagedetector)

---

**🎉 Hệ thống đa ngôn ngữ đã hoạt động hoàn hảo!**
