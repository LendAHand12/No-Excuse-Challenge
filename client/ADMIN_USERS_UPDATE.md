# Admin Users Table Update Guide

## Vấn đề đã được sửa

Trang Admin/Users trước đây có một số vấn đề:

1. **Table headers chưa được dịch**: Tất cả headers đều hardcode bằng tiếng Anh
2. **Table structure cũ**: Sử dụng HTML table thuần, khó maintain và extend
3. **Action icons khó hiểu**: Các icon không có tooltip và khó phân biệt chức năng
4. **Buttons và placeholders chưa được dịch**: Một số text vẫn hardcode

## Những thay đổi đã thực hiện

### 1. Translation Keys

**File `src/locales/en/translation.json`:**
```json
"adminUsers": {
  "table": {
    "username": "Username",
    "age": "Age",
    "usdt": "USDT",
    "hewe": "HEWE",
    "walletAddress": "Wallet Address",
    "paymentPending": "Payment Pending",
    "status": "Status",
    "action": "Action"
  },
  "buttons": {
    "exportData": "Export Data",
    "createUser": "Create user",
    "search": "Search",
    "approve": "Approve",
    "all": "All"
  },
  "placeholders": {
    "searchUser": "Search with user name or email or wallet"
  },
  "modals": {
    "approvePayment": "Are you sure you want to approve transactions for this user?",
    "approveButton": "Approve"
  },
  "actions": {
    "approve": "Approve",
    "view": "View Details",
    "tree": "View Tree",
    "move": "Move System",
    "delete": "Delete"
  }
}
```

**File `src/locales/vi/translation.json`:**
```json
"adminUsers": {
  "table": {
    "username": "Tên người dùng",
    "age": "Tuổi",
    "usdt": "USDT",
    "hewe": "HEWE",
    "walletAddress": "Địa chỉ ví",
    "paymentPending": "Thanh toán chờ duyệt",
    "status": "Trạng thái",
    "action": "Hành động"
  },
  "buttons": {
    "exportData": "Xuất dữ liệu",
    "createUser": "Tạo người dùng",
    "search": "Tìm kiếm",
    "approve": "Phê duyệt",
    "all": "Tất cả"
  },
  "placeholders": {
    "searchUser": "Tìm kiếm theo tên người dùng, email hoặc ví"
  },
  "modals": {
    "approvePayment": "Bạn có chắc chắn muốn phê duyệt giao dịch cho người dùng này?",
    "approveButton": "Phê duyệt"
  },
  "actions": {
    "approve": "Phê duyệt",
    "view": "Xem chi tiết",
    "tree": "Xem cây",
    "move": "Di chuyển hệ thống",
    "delete": "Xóa"
  }
}
```

### 2. TanStack Table Integration

**Cài đặt:**
```bash
npm install @tanstack/react-table
```

**Tạo component mới `src/components/AdminUsersTable/index.tsx`:**
- Sử dụng `createColumnHelper` để định nghĩa columns
- Sử dụng `useReactTable` để quản lý table state
- Sử dụng `flexRender` để render cells và headers
- Hỗ trợ dynamic column headers dựa trên filter

### 3. Improved Action Icons

**Trước (khó hiểu):**
```tsx
<svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-auto">
  <polyline points="5 12 10 17 19 8" />
</svg>
```

**Sau (dễ hiểu với tooltip):**
```tsx
<button
  onClick={() => onApprove(row._id)}
  className="font-medium text-gray-500 hover:text-NoExcuseChallenge"
  title={t('adminUsers.actions.approve')}
>
  <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
  </svg>
</button>
```

**Các action icons mới:**
- ✅ **Approve**: Checkmark icon với màu xanh
- 👁️ **View Details**: Eye icon với tooltip "Xem chi tiết"
- 🌳 **View Tree**: Tree structure icon với tooltip "Xem cây"
- ↔️ **Move System**: Arrow icon với tooltip "Di chuyển hệ thống"
- 🗑️ **Delete**: Trash icon với màu đỏ và tooltip "Xóa"

### 4. Updated Admin/Users Page

**Thay đổi chính:**
```tsx
// Trước
<table className="w-full text-sm text-left text-gray-500">
  <thead>
    <tr>
      <th>Username</th>
      <th>Age</th>
      // ... hardcoded headers
    </tr>
  </thead>
  <tbody>
    {data.map((ele) => (
      <tr key={ele._id}>
        // ... hardcoded cells
      </tr>
    ))}
  </tbody>
</table>

// Sau
<AdminUsersTable
  data={data}
  loading={loading}
  onApprove={handleApprove}
  onDetail={handleDetail}
  onTree={handleTree}
  onMoveSystem={handleMoveSystem}
  onDelete={handleDelete}
  onApprovePayment={(id) => {
    setShowApprovePayment(true);
    setCurrentApprovePaymentId(id);
  }}
  objectFilter={objectFilter}
/>
```

**Cập nhật buttons và placeholders:**
```tsx
// Trước
<option value="all">All</option>
placeholder="Search with user name or email or wallet"
{t('search')}

// Sau
<option value="all">{t('adminUsers.buttons.all')}</option>
placeholder={t('adminUsers.placeholders.searchUser')}
{t('adminUsers.buttons.search')}
```

## Kết quả

✅ **Trang Admin/Users giờ đây có:**
- **Table headers được dịch** sang tiếng Việt
- **TanStack Table** với structure rõ ràng và dễ maintain
- **Action icons dễ hiểu** với tooltips và màu sắc phù hợp
- **Tất cả text được dịch** (buttons, placeholders, modals)
- **Performance tốt hơn** với TanStack Table
- **Code dễ maintain** với component separation

## Lợi ích của TanStack Table

1. **Type Safety**: TypeScript support tốt
2. **Performance**: Virtualization và optimization
3. **Flexibility**: Dễ dàng thêm/sửa columns
4. **Features**: Sorting, filtering, pagination built-in
5. **Maintainability**: Code structure rõ ràng

## Cách sử dụng

1. Truy cập `/admin/users`
2. Tất cả headers sẽ hiển thị bằng ngôn ngữ đã chọn
3. Hover vào action icons để xem tooltip
4. Các buttons và placeholders đều được dịch
5. Table structure được tối ưu với TanStack Table

## Lưu ý

- TanStack Table được cài đặt và cấu hình sẵn
- Component `AdminUsersTable` có thể tái sử dụng cho các table khác
- Action icons có tooltip để dễ hiểu chức năng
- Tất cả text đều hỗ trợ đa ngôn ngữ
