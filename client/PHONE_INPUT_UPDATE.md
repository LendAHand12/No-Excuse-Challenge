# PhoneInput Component Update

## Vấn đề đã được sửa

Component PhoneInput trước đây sử dụng `react-phone-number-input` có giao diện xấu và không nhất quán với design system của shadcn/ui.

## Giải pháp

Tạo một component PhoneInput mới với:
- **Giao diện đẹp**: Sử dụng shadcn/ui design system
- **Lá cờ nước**: Hiển thị emoji flags cho các quốc gia
- **Dropdown tìm kiếm**: Có thể tìm kiếm quốc gia theo tên, mã quốc gia, hoặc mã điện thoại
- **Responsive**: Hoạt động tốt trên mobile và desktop
- **Accessible**: Sử dụng Radix UI Popover cho accessibility

## Component mới

### `src/components/ui/phone-input.tsx`

**Tính năng chính:**
- **Country selector**: Dropdown với lá cờ và mã điện thoại
- **Search functionality**: Tìm kiếm quốc gia theo tên, mã, hoặc phone code
- **Phone number input**: Input field chỉ cho phép số
- **Shadcn/ui styling**: Nhất quán với design system
- **TypeScript support**: Fully typed với proper interfaces

**Props:**
```tsx
interface PhoneInputProps {
  value?: string;           // Phone number value (e.g., "+84123456789")
  onChange?: (value: string) => void;  // Callback when value changes
  placeholder?: string;     // Placeholder text
  className?: string;       // Additional CSS classes
  disabled?: boolean;       // Disable the input
  defaultCountry?: string;  // Default country code (e.g., "VN")
}
```

**Usage:**
```tsx
import PhoneInput from '@/components/ui/phone-input';

const [phone, setPhone] = useState('');

<PhoneInput
  defaultCountry="VN"
  placeholder="Enter phone number"
  value={phone}
  onChange={setPhone}
  className="w-full"
/>
```

## Cập nhật UserProfileCard

**Thay đổi import:**
```tsx
// Before
import PhoneInput from 'react-phone-number-input';

// After  
import PhoneInput from '@/components/ui/phone-input';
```

**Usage trong UserProfileCard:**
```tsx
<PhoneInput
  defaultCountry="VN"
  placeholder={t('userProfile.fields.phone')}
  value={phone}
  onChange={setPhone}
  className="w-full"
/>
```

## Dependencies đã thêm

1. **@radix-ui/react-popover**: Cho dropdown functionality
2. **react-flag-kit**: Cho flag icons (optional, có thể dùng emoji)

## Cấu trúc component

```tsx
const PhoneInput = ({ value, onChange, placeholder, className, disabled, defaultCountry }) => {
  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="relative">
      <div className="flex rounded-md border border-input bg-background">
        {/* Country Selector với Popover */}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <span className="text-lg">{selectedCountry.flag}</span>
              <span className="text-sm font-medium">{selectedCountry.phoneCode}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0">
            {/* Search input */}
            <div className="p-3 border-b">
              <input
                type="text"
                placeholder="Search countries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {/* Country list */}
            <div className="max-h-60 overflow-y-auto">
              {filteredCountries.map((country) => (
                <button
                  key={country.code}
                  onClick={() => handleCountrySelect(country)}
                  className="w-full flex items-center gap-3 px-3 py-2"
                >
                  <span className="text-lg">{country.flag}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{country.name}</div>
                    <div className="text-xs text-muted-foreground">{country.phoneCode}</div>
                  </div>
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Phone Number Input */}
        <Input
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneChange}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 border-0 rounded-l-none rounded-r-md"
        />
      </div>
    </div>
  );
};
```

## Lợi ích

1. **Giao diện đẹp**: Nhất quán với shadcn/ui design system
2. **User Experience tốt**: Dropdown tìm kiếm dễ sử dụng
3. **Visual appeal**: Lá cờ nước làm cho component trực quan hơn
4. **Accessibility**: Sử dụng Radix UI cho keyboard navigation và screen reader support
5. **TypeScript**: Fully typed với proper interfaces
6. **Responsive**: Hoạt động tốt trên mọi thiết bị
7. **Customizable**: Có thể dễ dàng customize styling và behavior

## Kết quả

✅ **Component PhoneInput mới có:**
- **Giao diện đẹp**: Shadcn/ui design system
- **Lá cờ nước**: Emoji flags cho các quốc gia
- **Dropdown tìm kiếm**: Tìm kiếm quốc gia dễ dàng
- **Responsive design**: Hoạt động tốt trên mobile và desktop
- **Accessibility**: Keyboard navigation và screen reader support
- **TypeScript support**: Fully typed
- **Build thành công**: Không có lỗi compilation

## Cách sử dụng

1. Import component: `import PhoneInput from '@/components/ui/phone-input';`
2. Sử dụng trong form với state management
3. Customize props theo nhu cầu (defaultCountry, placeholder, etc.)
4. Component sẽ tự động format phone number và handle country selection

Component PhoneInput mới giờ đây có giao diện đẹp, nhất quán với shadcn/ui và có lá cờ nước trực quan!
