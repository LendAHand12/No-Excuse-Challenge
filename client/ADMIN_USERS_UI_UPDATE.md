# Admin Users UI Components Update Guide

## Vấn đề đã được sửa

Trang Admin/Users trước đây có một số vấn đề về UI components:

1. **Filter components cũ**: Sử dụng HTML select và input thuần, không nhất quán với design system
2. **Action icons khó hiểu**: Các SVG icons phức tạp và không có tooltip rõ ràng
3. **Icon size không đồng nhất**: Một số icon quá to (w-6 h-6), một số quá nhỏ
4. **Buttons không nhất quán**: Sử dụng HTML button thuần thay vì design system

## Những thay đổi đã thực hiện

### 1. Shadcn/UI Components Integration

**Cài đặt dependencies:**
```bash
npm install lucide-react
npm install @radix-ui/react-select
```

**Tạo components:**
- `src/components/ui/select.tsx` - Select component với Radix UI
- `src/components/ui/badge.tsx` - Badge component cho status

### 2. Filter Components Update

**Trước (HTML thuần):**
```tsx
<select className="block p-2 pr-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50">
  <option value="all">All</option>
  {userStatus.map((status) => (
    <option value={status.status}>{t(status.status)}</option>
  ))}
</select>

<input 
  type="text"
  className="block p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50"
  placeholder={t('adminUsers.placeholders.searchUser')}
/>

<button className="h-8 flex text-xs justify-center items-center hover:underline bg-black text-NoExcuseChallenge font-bold rounded-full py-1 px-4">
  {t('adminUsers.buttons.search')}
</button>
```

**Sau (Shadcn/UI):**
```tsx
<Select
  value={objectFilter.status}
  onValueChange={(value) => setObjectFilter({
    ...objectFilter,
    status: value,
    pageNumber: 1,
  })}
  disabled={loading}
>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder={t('adminUsers.buttons.all')} />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">{t('adminUsers.buttons.all')}</SelectItem>
    {userStatus.map((status) => (
      <SelectItem value={status.status} key={status.status}>
        {t(status.status)}
      </SelectItem>
    ))}
  </SelectContent>
</Select>

<div className="relative">
  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
  <Input
    type="text"
    onChange={onSearch}
    className="pl-10 w-80"
    placeholder={t('adminUsers.placeholders.searchUser')}
    defaultValue={objectFilter.keyword}
  />
</div>

<Button
  onClick={handleSearch}
  disabled={loading}
  className="bg-black text-white hover:bg-gray-800"
>
  <Search className="w-4 h-4 mr-2" />
  {t('adminUsers.buttons.search')}
</Button>
```

### 3. Lucide React Icons

**Cài đặt:**
```bash
npm install lucide-react
```

**Import icons:**
```tsx
import { 
  CheckCircle, 
  Eye, 
  TreePine, 
  ArrowRightLeft, 
  Trash2,
  Search,
  Download,
  Plus
} from 'lucide-react';
```

**Action Icons Update:**

**Trước (SVG phức tạp):**
```tsx
<svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
</svg>
```

**Sau (Lucide React):**
```tsx
<CheckCircle className="w-5 h-5" />
<Eye className="w-5 h-5" />
<TreePine className="w-5 h-5" />
<ArrowRightLeft className="w-5 h-5" />
<Trash2 className="w-5 h-5" />
```

### 4. Improved Action Buttons

**Trước:**
```tsx
<button
  onClick={() => onApprove(row._id)}
  className="font-medium text-gray-500 hover:text-NoExcuseChallenge"
  title={t('adminUsers.actions.approve')}
>
  <svg>...</svg>
</button>
```

**Sau:**
```tsx
<button
  onClick={() => onApprove(row._id)}
  className="font-medium text-gray-500 hover:text-green-600 transition-colors"
  title={t('adminUsers.actions.approve')}
>
  <CheckCircle className="w-5 h-5" />
</button>
```

**Các action icons mới:**
- ✅ **Approve**: `CheckCircle` với hover màu xanh
- 👁️ **View Details**: `Eye` với hover màu xanh dương
- 🌳 **View Tree**: `TreePine` với hover màu xanh lá
- ↔️ **Move System**: `ArrowRightLeft` với hover màu cam
- 🗑️ **Delete**: `Trash2` với hover màu đỏ

### 5. Status Badge Component

**Trước:**
```tsx
<div className={`max-w-fit text-white rounded-sm py-1 px-2 text-sm ${statusConfig?.color}`}>
  {t(status)}
</div>
```

**Sau:**
```tsx
<Badge 
  variant="secondary"
  className={`${statusConfig?.color || 'bg-gray-500'} text-white border-0`}
>
  {t(status)}
</Badge>
```

### 6. Action Buttons Update

**Export và Create User buttons:**

**Trước:**
```tsx
<button className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white text-sm rounded-md hover:opacity-70">
  <svg>...</svg>
  Export Data
</button>
```

**Sau:**
```tsx
<Button className="bg-green-600 text-white hover:bg-green-700">
  <Download className="w-4 h-4 mr-2" />
  {t('adminUsers.buttons.exportData')}
</Button>

<Button className="bg-blue-500 text-white hover:bg-blue-600">
  <Plus className="w-4 h-4 mr-2" />
  {t('adminUsers.buttons.createUser')}
</Button>
```

## Kết quả

✅ **Trang Admin/Users giờ đây có:**
- **Shadcn/UI components** cho tất cả filter và buttons
- **Lucide React icons** nhất quán và dễ hiểu
- **Icon size đồng nhất** (w-5 h-5 cho actions, w-4 h-4 cho buttons)
- **Hover effects** với màu sắc phù hợp cho từng action
- **Transition animations** mượt mà
- **Accessibility** tốt hơn với proper ARIA labels
- **Design consistency** với toàn bộ hệ thống

## Lợi ích của Lucide React

1. **Consistency**: Tất cả icons có cùng style và size
2. **Performance**: Tree-shaking, chỉ load icons cần thiết
3. **Accessibility**: Built-in ARIA support
4. **Maintainability**: Dễ dàng thay đổi và update
5. **TypeScript**: Full type safety

## Lợi ích của Shadcn/UI

1. **Design System**: Nhất quán với toàn bộ app
2. **Accessibility**: Built-in ARIA và keyboard navigation
3. **Customization**: Dễ dàng customize với CSS variables
4. **Performance**: Optimized components
5. **Developer Experience**: IntelliSense và documentation tốt

## Cách sử dụng

1. Truy cập `/admin/users`
2. Filter components giờ có design đẹp và nhất quán
3. Action icons nhỏ gọn và dễ hiểu với tooltips
4. Hover effects mượt mà với màu sắc phù hợp
5. Tất cả components responsive và accessible

## Lưu ý

- Lucide React icons được cài đặt và sẵn sàng sử dụng
- Shadcn/UI components được tạo và cấu hình
- Icon size được chuẩn hóa: w-5 h-5 cho actions, w-4 h-4 cho buttons
- Hover colors được chọn phù hợp với từng chức năng
- Tất cả components hỗ trợ đa ngôn ngữ
