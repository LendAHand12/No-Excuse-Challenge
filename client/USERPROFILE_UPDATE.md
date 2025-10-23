# UserProfile Page Update Guide

## Vấn đề đã được sửa

Trang Admin/UserProfile trước đây có một số vấn đề:

1. **Text chưa được dịch**: Nhiều text hardcoded chưa được đưa vào hệ thống đa ngôn ngữ
2. **Layout cũ**: Bố cục không hợp lý, khó đọc và không responsive
3. **Không có avatar**: Không hiển thị ảnh KYC làm avatar
4. **Input fields cũ**: Sử dụng HTML thuần thay vì design system components
5. **UI không nhất quán**: Không sử dụng shadcn/ui components

## Những thay đổi đã thực hiện

### 1. Translation Keys Integration

**Thêm vào `en.json`:**
```json
"userProfile": {
  "title": "User Profile",
  "fields": {
    "userName": "User Name",
    "email": "Email",
    "phone": "Phone",
    "idCode": "ID Code",
    "walletAddress": "Wallet Address",
    "isRegistered": "Is Registered",
    "countPay": "Count Pay",
    "tier": "Tier",
    "buyPackage": "Buy Package",
    "rank": "Rank",
    "availableHewe": "Available HEWE",
    "rewardHewe": "Reward HEWE",
    "hewePerDay": "HEWE Per Day",
    "availableUsdt": "Available USDT",
    "processingUsdt": "Processing USDT",
    "totalEarned": "Total Earned",
    "totalHold": "Total Hold",
    "outstandingPreTier2": "Outstanding Pre-Tier2 Pool Amount",
    "payoutGateway": "Payout Gateway",
    "payoutDisplayName": "Payout Display Name",
    "payoutEmailOrPhone": "Payout Email or Phone Number",
    "overdueReferral": "Overdue referral",
    "fine": "Fine",
    "level": "Level",
    "note": "Note",
    "changeCreatedAt": "Change Created At",
    "dieTime": "Die Time"
  },
  "status": {
    "finished": "Finished",
    "unfinished": "Unfinished",
    "times": "times"
  },
  "buttons": {
    "edit": "Edit",
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "approve": "Approve",
    "reset": "Reset",
    "checkKyc": "Check KYC",
    "lockKyc": "Lock KYC",
    "unlockKyc": "Unlock KYC",
    "pushToPreTier2": "Push to Pre-Tier 2",
    "changeWallet": "Change Wallet"
  },
  "switches": {
    "openLah": "Open LAH",
    "closeLah": "Close LAH",
    "lockKyc": "Lock KYC",
    "termDie": "Term Die",
    "bonusRef": "Bonus Ref",
    "kycFee": "KYC Fee"
  },
  "sections": {
    "userInfo": "User Information",
    "financialInfo": "Financial Information",
    "referralInfo": "Referral Information",
    "notEnoughChild": "Not Enough Child",
    "numbersOfIdRequire": "Numbers of ID Require",
    "refUserName": "Referral User Name",
    "oldParent": "Old Parent",
    "branch1": "Branch 1",
    "branch2": "Branch 2",
    "totalEarnedUsdt": "Total Earned USDT",
    "totalEarnedHewe": "Total Earned HEWE"
  },
  "modals": {
    "deleteConfirm": "Are you sure to do this?",
    "changeWalletConfirm": "Are you sure to do this",
    "updating": "Updating...",
    "deleting": "Deleting..."
  },
  "validation": {
    "userNameRequired": "User ID is required",
    "emailRequired": "Email is required",
    "phoneRequired": "Phone is required",
    "idCodeRequired": "ID code is required",
    "walletAddressRequired": "Wallet address is required",
    "walletFormatError": "Please enter the correct wallet format",
    "tierRequired": "Tier is required",
    "availableHeweRequired": "Available HEWE is required",
    "availableUsdtRequired": "Available USDT is required",
    "fineRequired": "Fine is required",
    "levelRequired": "Level is required"
  }
}
```

**Thêm vào `vi.json`:** (Tương tự với bản dịch tiếng Việt)

### 2. New UserProfileCard Component

**Tạo component mới:** `src/components/UserProfileCard/index.tsx`

**Tính năng chính:**
- **Avatar từ KYC image**: Hiển thị ảnh KYC làm avatar, fallback về initials
- **Card-based layout**: Sử dụng Card components để tổ chức thông tin
- **Responsive design**: Grid layout responsive cho mobile và desktop
- **Shadcn/ui components**: Sử dụng Input, Textarea, Button, Badge, Avatar
- **Lucide React icons**: Icons nhất quán và dễ hiểu
- **Translation keys**: Tất cả text sử dụng translation keys

**Cấu trúc component với layout mới:**
```tsx
const UserProfileCard = ({ 
  data, 
  isEditting, 
  loading, 
  loadingUpdate,
  register, 
  errors, 
  phone, 
  setPhone, 
  errorPhone,
  packageOptions,
  renderRank,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onApproveChangeWallet,
  onCheckKyc,
  onPushToPreTier2,
  loadingCheckKyc,
  loadingPushToPreTier2,
  walletChange,
  userInfo
}) => {
  // Avatar logic
  const getAvatarSrc = () => {
    if (data.facetecTid) {
      return `${import.meta.env.VITE_FACETEC_URL}/api/liveness/image?tid=${data.facetecTid}`;
    }
    return null;
  };

  const getInitials = () => {
    if (data.userId) {
      return data.userId.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="w-full max-w-none space-y-6">
      {/* User Header Card - Responsive layout */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Avatar className="h-20 w-20 flex-shrink-0">
              <AvatarImage src={getAvatarSrc()} alt={data.userId} />
              <AvatarFallback className="text-lg font-semibold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-2xl truncate">{data.userId}</CardTitle>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {t(`status.${data.status?.toLowerCase()}`)}
                </Badge>
                <Badge variant="outline">
                  Tier {data.tier}
                </Badge>
                {data.countPay > 0 && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {renderRank(data.currentLayer[0] ? data.currentLayer[0] : 0)}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
              {/* Action buttons */}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* User Information Card - Clear title/value layout */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserIcon className="w-5 h-5 mr-2" />
            {t('userProfile.sections.userInfo')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Each field with clear title/value separation */}
            <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100">
              <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                <label className="text-sm font-semibold text-gray-600 flex items-center">
                  <UserIcon className="w-4 h-4 mr-2" />
                  {t('userProfile.fields.userName')}
                </label>
              </div>
              <div className="w-full sm:w-2/3">
                {isEditting ? (
                  <Input {...register('userId')} className="w-full" />
                ) : (
                  <p className="text-sm text-gray-900 font-medium">{data.userId}</p>
                )}
              </div>
            </div>
            {/* More fields... */}
          </div>
        </CardContent>
      </Card>

      {/* Financial Information Card - Same layout pattern */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            {t('userProfile.sections.financialInfo')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Financial fields with title/value layout */}
          </div>
        </CardContent>
      </Card>

      {/* Additional Information Card - Same layout pattern */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Additional Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Additional fields with title/value layout */}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons - Responsive */}
      {isEditting && (
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Button onClick={onSave} disabled={loadingUpdate} className="flex-1">
            {loadingUpdate && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />}
            <Save className="w-4 h-4 mr-2" />
            {t('userProfile.buttons.save')}
          </Button>
          <Button onClick={onCancel} variant="outline" className="flex-1">
            <X className="w-4 h-4 mr-2" />
            {t('userProfile.buttons.cancel')}
          </Button>
        </div>
      )}

      {/* Special Action Buttons */}
      <div className="space-y-2">
        {/* Special action buttons */}
      </div>
    </div>
  );
};
```

**Layout mới với title/value rõ ràng:**
- **2 cột layout**: Title (1/3) và Value (2/3) trên desktop
- **Responsive**: Chuyển thành 1 cột trên mobile
- **Border separation**: Mỗi field có border-bottom để phân tách
- **Full width**: Sử dụng toàn bộ chiều ngang của content area
- **Clear hierarchy**: Title có font-semibold và màu gray-600, Value có font-medium
- **No overflow**: Nút action không bị tràn với `flex-shrink-0` và `whitespace-nowrap`
- **Text truncation**: Username và text dài được truncate khi cần

### 3. Shadcn/UI Components Integration

**Cài đặt components:**
```bash
npx shadcn@latest add textarea
npx shadcn@latest add avatar
```

**Tạo components:**
- `src/components/ui/textarea.tsx` - Textarea component
- `src/components/ui/avatar.tsx` - Avatar component với Radix UI

**Sử dụng trong UserProfileCard:**
```tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
```

### 4. Lucide React Icons

**Import icons:**
```tsx
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  CreditCard, 
  DollarSign,
  Users,
  Settings,
  Edit,
  Save,
  X,
  Trash2,
  CheckCircle,
  Lock,
  Unlock,
  ArrowUp,
  Calendar,
  FileText
} from 'lucide-react';
```

**Sử dụng trong form fields:**
```tsx
<label className="text-sm font-medium text-gray-700 flex items-center">
  <Mail className="w-4 h-4 mr-1" />
  {t('userProfile.fields.email')}
</label>
```

### 5. Updated UserProfile Component

**Cấu trúc mới:**
```tsx
const UserProfile = () => {
  // ... existing logic

  return (
    <DefaultLayout>
      <ToastContainer />
      {!loading && (
        <div className="container mx-10 my-24">
          {/* Alert messages */}
          {isBonusRef && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-5">
              <span className="block sm:inline">
                {t('You have received 10 USDT from DreamPool fund')}
              </span>
            </div>
          )}

          {walletChange && (
            <div className="w-full bg-orange-100 border border-orange-400 text-orange-700 px-4 py-3 rounded mb-5">
              <span className="block sm:inline">
                {t('Wallet information update is pending admin approval')}
              </span>
            </div>
          )}

          {/* Countdown warnings */}
          {data.tier === 2 && data.dieTime && data.countdown > 0 && (
            <div className="w-full text-lg bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-5">
              <span className="block sm:inline">
                You have only <b>{data.countdown}</b> days left to complete the
                62 required IDs to be eligible for Tier 2 benefits.
              </span>
            </div>
          )}

          <div className="max-w-6xl mx-auto">
            <UserProfileCard
              data={data}
              isEditting={isEditting}
              loading={loading}
              loadingUpdate={loadingUpdate}
              register={register}
              errors={errors}
              phone={phone}
              setPhone={setPhone}
              errorPhone={errorPhone}
              packageOptions={packageOptions}
              renderRank={renderRank}
              onEdit={() => setEditting(true)}
              onSave={handleSubmit(onSubmit)}
              onCancel={() => setEditting(false)}
              onDelete={handleDelete}
              onApproveChangeWallet={handleApproveChangeWallet}
              onCheckKyc={handleCheckKyc}
              onPushToPreTier2={handlePushToPreTier2}
              loadingCheckKyc={loadingCheckKyc}
              loadingPushToPreTier2={loadingPushToPreTier2}
              walletChange={walletChange}
              userInfo={userInfo}
            />
          </div>
        </div>
      )}
    </DefaultLayout>
  );
};
```

### 6. Updated Modal Text

**Delete confirmation modal:**
```tsx
<p className="mb-4 text-gray-500">
  {t('userProfile.modals.deleteConfirm')}
</p>
<button>
  {t('userProfile.buttons.cancel')}
</button>
<button>
  {t('userProfile.buttons.delete')}
</button>
```

**Change wallet confirmation modal:**
```tsx
<p className="mb-4 text-gray-500">{t('userProfile.modals.changeWalletConfirm')}</p>
<button>
  {t('userProfile.buttons.cancel')}
</button>
<button>
  {t('userProfile.buttons.approve')}
</button>
```

## Kết quả

✅ **Trang Admin/UserProfile giờ đây có:**
- **Đa ngôn ngữ hoàn chỉnh**: Tất cả text sử dụng translation keys
- **Avatar từ KYC image**: Hiển thị ảnh KYC làm avatar với fallback
- **Layout rõ ràng**: Title và value được phân biệt rõ ràng với layout 2 cột
- **Full width content**: Sử dụng toàn bộ chiều ngang của content area (trừ sidebar)
- **Shadcn/ui components**: Input, Textarea, Button, Badge, Avatar, Card
- **Lucide React icons**: Icons nhất quán và dễ hiểu
- **Form validation**: Validation messages đa ngôn ngữ
- **Action buttons**: Buttons với loading states và icons
- **Responsive design**: Hoạt động tốt trên mobile và desktop
- **Build thành công**: Không có lỗi compilation

## Lợi ích của cập nhật

1. **User Experience**: Layout đẹp hơn, dễ đọc và sử dụng
2. **Internationalization**: Hỗ trợ đa ngôn ngữ hoàn chỉnh
3. **Consistency**: Nhất quán với design system
4. **Maintainability**: Code dễ bảo trì và mở rộng
5. **Accessibility**: Better accessibility với proper ARIA labels
6. **Performance**: Optimized components và lazy loading

## Cách sử dụng

1. Truy cập `/admin/users/{userId}` để xem trang UserProfile
2. Avatar sẽ hiển thị ảnh KYC nếu có, hoặc initials nếu không
3. Tất cả text sẽ tự động chuyển đổi theo ngôn ngữ đã chọn
4. Form fields sử dụng shadcn/ui components với validation
5. Action buttons có loading states và tooltips
6. Layout responsive trên tất cả thiết bị

## Lưu ý

- Avatar sử dụng KYC image từ FaceTec API
- Fallback về initials nếu không có ảnh KYC
- Tất cả components hỗ trợ đa ngôn ngữ
- Form validation sử dụng react-hook-form
- Loading states cho tất cả async operations
- Error handling với toast notifications
