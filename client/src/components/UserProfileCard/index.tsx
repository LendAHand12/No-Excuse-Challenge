import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import 'react-day-picker/style.css';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
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
  Calendar as CalendarIcon,
  FileText,
} from 'lucide-react';
import PhoneInput from '@/components/ui/phone-input';
import moment from 'moment';
import DatePickerCustom from '../DatePickerCustom';

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
  userInfo,
}) => {
  const { t } = useTranslation();
  const { setValue, control } = useForm();
  const [activeTab, setActiveTab] = useState('tier1');

  // Determine available tabs based on user tier
  const getAvailableTabs = () => {
    const tabs = [];
    if (data.tier >= 1) {
      tabs.push({ id: 'tier1', label: 'Tier 1', tier: 1 });
    }
    if (data.tier >= 2) {
      tabs.push({ id: 'tier1-1', label: 'Tier 1-1', tier: 1 });
      tabs.push({ id: 'tier2', label: 'Tier 2', tier: 2 });
    }
    // Always show at least one tab for testing
    if (tabs.length === 0) {
      tabs.push({ id: 'tier1', label: 'Tier 1', tier: 1 });
    }
    return tabs;
  };

  const availableTabs = getAvailableTabs();

  // Get color from API data
  const getTabColor = () => {
    if (data.isBlue) return '#3B82F6'; // Blue
    if (data.isPink) return '#EC4899'; // Pink
    return '#3B82F6'; // Default blue
  };

  // Get tier-specific data
  const getTierData = (tier) => {
    if (tier === 1) {
      return {
        availableUsdt: data.availableUsdt,
        availableHewe: data.availableHewe,
        rewardHewe: Math.max(
          0,
          (data.totalHewe || 0) - (data.claimedHewe || 0),
        ),
        hewePerDay: data.hewePerDay,
        level: data.currentLayer[0] || 0,
        rank: renderRank(data.currentLayer[0] || 0),
      };
    } else if (tier === 2) {
      return {
        availableUsdt: data.availableUsdt,
        availableHewe: data.availableHewe,
        rewardHewe: Math.max(
          0,
          (data.totalHewe || 0) - (data.claimedHewe || 0),
        ),
        hewePerDay: data.hewePerDay,
        level: data.currentLayer[1] || 0,
        rank: renderRank(data.currentLayer[1] || 0),
      };
    }
    return {};
  };

  const currentTierData = getTierData(
    availableTabs.find((tab) => tab.id === activeTab)?.tier || 1,
  );

  // Get avatar from KYC image or use default
  const getAvatarSrc = () => {
    if (data.facetecTid) {
      return `${import.meta.env.VITE_FACETEC_URL}/api/liveness/image?tid=${
        data.facetecTid
      }`;
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
      {/* Tier Tabs */}
      {availableTabs.length > 0 && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            {availableTabs.map((tab) => {
              const tabColor = getTabColor();
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className={`text-base font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  style={{
                    backgroundColor:
                      activeTab === tab.id ? tabColor : 'transparent',
                    color: activeTab === tab.id ? 'white' : '#64748b',
                  }}
                >
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Important Alerts */}
          <div className="space-y-2 mt-4">
            {data.bonusRef && (
              <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded-r-md">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">
                      {t('You have received 10 USDT from DreamPool fund')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {walletChange && (
              <div className="bg-orange-50 border-l-4 border-orange-400 p-3 rounded-r-md">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Settings className="h-5 w-5 text-orange-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-orange-700">
                      {t('Wallet information update is pending admin approval')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {data.tier === 2 && data.dieTime && data.countdown > 0 && (
              <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-r-md">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CalendarIcon className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">
                      You have only{' '}
                      <span className="font-semibold">{data.countdown}</span>{' '}
                      days left to complete the 62 required IDs to be eligible
                      for Tier 2 benefits.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {data.tier === 1 && data.dieTime && data.countdown > 0 && (
              <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded-r-md">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CalendarIcon className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">
                      You have only{' '}
                      <span className="font-semibold">{data.countdown}</span>{' '}
                      days left to complete referring at least 2 people in 2
                      different branches.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {availableTabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="mt-6 space-y-6">
              {/* User Header Card */}
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <Avatar className="h-20 w-20 flex-shrink-0">
                      <AvatarImage
                        src={getAvatarSrc()}
                        alt={data.userId}
                        className="object-cover"
                      />
                      <AvatarFallback className="text-lg font-semibold">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <CardTitle className="text-2xl truncate">
                        {data.userId}
                      </CardTitle>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <Badge
                          className={`${
                            data.status === 'UNVERIFY'
                              ? 'bg-red-600'
                              : data.status === 'PENDING'
                              ? 'bg-yellow-600'
                              : data.status === 'APPROVED'
                              ? 'bg-green-600'
                              : data.status === 'REJECTED'
                              ? 'bg-red-600'
                              : data.status === 'LOCKED'
                              ? 'bg-red-600'
                              : data.status === 'DELETED'
                              ? 'bg-red-600'
                              : 'bg-gray-600'
                          } text-white`}
                        >
                          {t(data.status)}
                        </Badge>
                        <Badge variant="outline">Tier {data.tier}</Badge>
                        {data.countPay > 0 && (
                          <Badge
                            variant="secondary"
                            className="bg-blue-100 text-blue-800"
                          >
                            {currentTierData.rank ||
                              renderRank(
                                data.currentLayer[0] ? data.currentLayer[0] : 0,
                              )}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 flex-shrink-0">
                      {userInfo?.permissions
                        ?.find((p) => p.page.pageName === 'admin-users-details')
                        ?.actions.includes('update') &&
                        !isEditting &&
                        data.status !== 'DELETED' && (
                          <Button
                            onClick={onEdit}
                            variant="outline"
                            size="sm"
                            className="whitespace-nowrap"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            {t('userProfile.buttons.edit')}
                          </Button>
                        )}
                      {userInfo?.permissions
                        ?.find((p) => p.page.pageName === 'admin-users-details')
                        ?.actions.includes('delete') &&
                        !isEditting &&
                        data.status !== 'DELETED' && (
                          <Button
                            onClick={onDelete}
                            variant="destructive"
                            size="sm"
                            className="whitespace-nowrap"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {t('userProfile.buttons.delete')}
                          </Button>
                        )}
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* User Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <UserIcon className="w-5 h-5 mr-2" />
                    {t('userProfile.sections.userInfo')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* User Name */}
                    <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100">
                      <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                        <label className="text-sm font-semibold text-gray-600 flex items-center">
                          <UserIcon className="w-4 h-4 mr-2" />
                          {t('userProfile.fields.userName')}
                        </label>
                      </div>
                      <div className="w-full sm:w-2/3">
                        {isEditting ? (
                          <div>
                            <Input
                              {...register('userId', {
                                required: t(
                                  'userProfile.validation.userNameRequired',
                                ),
                              })}
                              autoComplete="off"
                              className="w-full"
                            />
                            {errors.userId && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors.userId.message}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-900 font-medium">
                            {data.userId}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100">
                      <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                        <label className="text-sm font-semibold text-gray-600 flex items-center">
                          <Mail className="w-4 h-4 mr-2" />
                          {t('userProfile.fields.email')}
                        </label>
                      </div>
                      <div className="w-full sm:w-2/3">
                        {isEditting ? (
                          <div>
                            <Input
                              {...register('email', {
                                required: t(
                                  'userProfile.validation.emailRequired',
                                ),
                              })}
                              autoComplete="off"
                              className="w-full"
                            />
                            {errors.email && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors.email.message}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-900 font-medium">
                            {data.email}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100">
                      <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                        <label className="text-sm font-semibold text-gray-600 flex items-center">
                          <Phone className="w-4 h-4 mr-2" />
                          {t('userProfile.fields.phone')}
                        </label>
                      </div>
                      <div className="w-full sm:w-2/3">
                        {isEditting ? (
                          <div>
                            <PhoneInput
                              defaultCountry="VN"
                              placeholder={t('userProfile.fields.phone')}
                              value={phone}
                              onChange={setPhone}
                              className="w-full"
                            />
                            {errorPhone && (
                              <p className="text-red-500 text-sm mt-1">
                                {t('userProfile.validation.phoneRequired')}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-900 font-medium">
                            {data.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* ID Code */}
                    <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100">
                      <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                        <label className="text-sm font-semibold text-gray-600 flex items-center">
                          <UserIcon className="w-4 h-4 mr-2" />
                          {t('userProfile.fields.idCode')}
                        </label>
                      </div>
                      <div className="w-full sm:w-2/3">
                        {isEditting ? (
                          <div>
                            <Input
                              {...register('idCode', {
                                required: t(
                                  'userProfile.validation.idCodeRequired',
                                ),
                              })}
                              autoComplete="off"
                              className="w-full"
                            />
                            {errors.idCode && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors.idCode.message}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-900 font-medium">
                            {data.idCode}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Wallet Address */}
                    <div className="flex flex-col sm:flex-row sm:items-start py-3 border-b border-gray-100">
                      <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                        <label className="text-sm font-semibold text-gray-600 flex items-center">
                          <CreditCard className="w-4 h-4 mr-2" />
                          {t('userProfile.fields.walletAddress')}
                        </label>
                      </div>
                      <div className="w-full sm:w-2/3">
                        {isEditting ? (
                          <div>
                            <Input
                              {...register('walletAddress', {
                                required: t(
                                  'userProfile.validation.walletAddressRequired',
                                ),
                                pattern: {
                                  value: /^0x[a-fA-F0-9]{40}$/g,
                                  message: t(
                                    'userProfile.validation.walletFormatError',
                                  ),
                                },
                              })}
                              autoComplete="off"
                              className="w-full"
                            />
                            {errors.walletAddress && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors.walletAddress.message}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-900 font-medium break-all">
                            {data.walletAddress}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* HEWE Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="w-5 h-5 mr-2" />
                    HEWE Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Total HEWE */}
                    <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100">
                      <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                        <label className="text-sm font-semibold text-gray-600">
                          {t('userProfile.fields.totalHewe')}
                        </label>
                      </div>
                      <div className="w-full sm:w-2/3">
                        {isEditting ? (
                          <div>
                            <Input
                              {...register('totalHewe', {
                                required: t(
                                  'userProfile.validation.totalHeweRequired',
                                ),
                              })}
                              defaultValue={data.totalHewe || 0}
                              className="w-full"
                            />
                            {errors.totalHewe && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors.totalHewe.message}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-900 font-medium">
                            {data.totalHewe || 0}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Available HEWE */}
                    <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100">
                      <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                        <label className="text-sm font-semibold text-gray-600">
                          {t('userProfile.fields.availableHewe')}
                        </label>
                      </div>
                      <div className="w-full sm:w-2/3">
                        {isEditting ? (
                          <div>
                            <Input
                              {...register('availableHewe', {
                                required: t(
                                  'userProfile.validation.availableHeweRequired',
                                ),
                              })}
                              defaultValue={
                                currentTierData.availableHewe ||
                                data.availableHewe
                              }
                              className="w-full"
                            />
                            {errors.availableHewe && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors.availableHewe.message}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-900 font-medium">
                            {currentTierData.availableHewe ||
                              data.availableHewe}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Daily HEWE */}
                    <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100">
                      <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                        <label className="text-sm font-semibold text-gray-600">
                          {t('userProfile.fields.hewePerDay')}
                        </label>
                      </div>
                      <div className="w-full sm:w-2/3">
                        {isEditting ? (
                          <div>
                            <Input
                              {...register('hewePerDay', {
                                required: t(
                                  'userProfile.validation.hewePerDayRequired',
                                ),
                              })}
                              defaultValue={
                                currentTierData.hewePerDay || data.hewePerDay
                              }
                              className="w-full"
                            />
                            {errors.hewePerDay && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors.hewePerDay.message}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-900 font-medium">
                            {currentTierData.hewePerDay || data.hewePerDay}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Reward HEWE */}
                    <div className="flex flex-col sm:flex-row sm:items-center py-3">
                      <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                        <label className="text-sm font-semibold text-gray-600">
                          {t('userProfile.fields.rewardHewe')}
                        </label>
                      </div>
                      <div className="w-full sm:w-2/3">
                        <p className="text-sm text-gray-900 font-medium">
                          {Math.max(
                            0,
                            (data.totalHewe || 0) - (data.claimedHewe || 0),
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* USDT Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="w-5 h-5 mr-2" />
                    USDT Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Available USDT */}
                    <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100">
                      <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                        <label className="text-sm font-semibold text-gray-600 flex items-center">
                          <DollarSign className="w-4 h-4 mr-2" />
                          {t('userProfile.fields.availableUsdt')}
                        </label>
                      </div>
                      <div className="w-full sm:w-2/3">
                        {isEditting ? (
                          <div>
                            <Input
                              {...register('availableUsdt', {
                                required: t(
                                  'userProfile.validation.availableUsdtRequired',
                                ),
                              })}
                              defaultValue={
                                currentTierData.availableUsdt ||
                                data.availableUsdt
                              }
                              className="w-full"
                            />
                            {errors.availableUsdt && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors.availableUsdt.message}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-900 font-medium">
                            {currentTierData.availableUsdt ||
                              data.availableUsdt}{' '}
                            USDT
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Processing USDT */}
                    <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100">
                      <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                        <label className="text-sm font-semibold text-gray-600">
                          {t('userProfile.fields.processingUsdt')}
                        </label>
                      </div>
                      <div className="w-full sm:w-2/3">
                        <p className="text-sm text-gray-900 font-medium">
                          {data.withdrawPending} USDT
                        </p>
                      </div>
                    </div>

                    {/* Total Earned */}
                    <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100">
                      <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                        <label className="text-sm font-semibold text-gray-600">
                          {t('userProfile.fields.totalEarned')}
                        </label>
                      </div>
                      <div className="w-full sm:w-2/3">
                        <p className="text-sm text-gray-900 font-medium">
                          {data.totalEarning} USDT
                        </p>
                      </div>
                    </div>

                    {/* Total Hold */}
                    <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100">
                      <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                        <label className="text-sm font-semibold text-gray-600">
                          {t('userProfile.fields.totalHold')}
                        </label>
                      </div>
                      <div className="w-full sm:w-2/3">
                        <p className="text-sm text-gray-900 font-medium">
                          {data.totalHold} USDT
                        </p>
                      </div>
                    </div>

                    {/* Outstanding Pre-Tier2 */}
                    <div className="flex flex-col sm:flex-row sm:items-center py-3">
                      <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                        <label className="text-sm font-semibold text-gray-600">
                          {t('userProfile.fields.outstandingPreTier2')}
                        </label>
                      </div>
                      <div className="w-full sm:w-2/3">
                        <p className="text-sm text-gray-900 font-medium">
                          {data.shortfallAmount} USDT
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Settings Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Open LAH */}
                    <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100">
                      <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                        <label className="text-sm font-semibold text-gray-600">
                          {t('userProfile.switches.openLah')}
                        </label>
                      </div>
                      <div className="w-full sm:w-2/3">
                        {isEditting ? (
                          <Controller
                            name="openLah"
                            control={control}
                            render={({ field }) => (
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </div>
                            )}
                          />
                        ) : (
                          <p className="text-sm text-gray-900 font-medium">
                            {data.openLah ? t('yes') : t('no')}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Close LAH */}
                    <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100">
                      <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                        <label className="text-sm font-semibold text-gray-600">
                          {t('userProfile.switches.closeLah')}
                        </label>
                      </div>
                      <div className="w-full sm:w-2/3">
                        {isEditting ? (
                          <Controller
                            name="closeLah"
                            control={control}
                            render={({ field }) => (
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </div>
                            )}
                          />
                        ) : (
                          <p className="text-sm text-gray-900 font-medium">
                            {data.closeLah ? t('yes') : t('no')}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Lock KYC */}
                    <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100">
                      <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                        <label className="text-sm font-semibold text-gray-600">
                          {t('userProfile.switches.lockKyc')}
                        </label>
                      </div>
                      <div className="w-full sm:w-2/3">
                        {isEditting ? (
                          <Controller
                            name="lockKyc"
                            control={control}
                            render={({ field }) => (
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </div>
                            )}
                          />
                        ) : (
                          <p className="text-sm text-gray-900 font-medium">
                            {data.lockKyc ? t('yes') : t('no')}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Term Die */}
                    <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100">
                      <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                        <label className="text-sm font-semibold text-gray-600">
                          {t('userProfile.switches.termDie')}
                        </label>
                      </div>
                      <div className="w-full sm:w-2/3">
                        {isEditting ? (
                          <Controller
                            name="termDie"
                            control={control}
                            render={({ field }) => (
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </div>
                            )}
                          />
                        ) : (
                          <p className="text-sm text-gray-900 font-medium">
                            {data.errLahCode === 'OVER45' ? t('yes') : t('no')}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Bonus Ref */}
                    <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100">
                      <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                        <label className="text-sm font-semibold text-gray-600">
                          {t('userProfile.switches.bonusRef')}
                        </label>
                      </div>
                      <div className="w-full sm:w-2/3">
                        {isEditting ? (
                          <Controller
                            name="bonusRef"
                            control={control}
                            render={({ field }) => (
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </div>
                            )}
                          />
                        ) : (
                          <p className="text-sm text-gray-900 font-medium">
                            {data.bonusRef ? t('yes') : t('no')}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* KYC Fee */}
                    <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100">
                      <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                        <label className="text-sm font-semibold text-gray-600">
                          {t('userProfile.switches.kycFee')}
                        </label>
                      </div>
                      <div className="w-full sm:w-2/3">
                        {isEditting ? (
                          <Controller
                            name="kycFee"
                            control={control}
                            render={({ field }) => (
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </div>
                            )}
                          />
                        ) : (
                          <p className="text-sm text-gray-900 font-medium">
                            {data.kycFee ? t('yes') : t('no')}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Hold Tier */}
                    <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100">
                      <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                        <label className="text-sm font-semibold text-gray-600">
                          {t('userProfile.fields.holdTier')}
                        </label>
                      </div>
                      <div className="w-full sm:w-2/3">
                        {isEditting ? (
                          <div>
                            <Select
                              {...register('hold')}
                              defaultValue={data.hold}
                              disabled={loadingUpdate}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select hold tier" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="no">{t('no')}</SelectItem>
                                <SelectItem value="1">Tier 1</SelectItem>
                                <SelectItem value="2">Tier 2</SelectItem>
                                <SelectItem value="3">Tier 3</SelectItem>
                                <SelectItem value="4">Tier 4</SelectItem>
                                <SelectItem value="5">Tier 5</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-900 font-medium">
                            {data.hold === 'no' ? t('no') : data.hold}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Hold Level */}
                    <div className="flex flex-col sm:flex-row sm:items-center py-3">
                      <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                        <label className="text-sm font-semibold text-gray-600">
                          {t('userProfile.fields.holdLevel')}
                        </label>
                      </div>
                      <div className="w-full sm:w-2/3">
                        {isEditting ? (
                          <div>
                            <Select
                              {...register('holdLevel')}
                              defaultValue={data.holdLevel}
                              disabled={loadingUpdate}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select hold level" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="no">{t('no')}</SelectItem>
                                <SelectItem value="0">
                                  {t('userProfile.fields.level')} 0
                                </SelectItem>
                                <SelectItem value="1">
                                  {t('userProfile.fields.level')} 1
                                </SelectItem>
                                <SelectItem value="2">
                                  {t('userProfile.fields.level')} 2
                                </SelectItem>
                                <SelectItem value="3">
                                  {t('userProfile.fields.level')} 3
                                </SelectItem>
                                <SelectItem value="4">
                                  {t('userProfile.fields.level')} 4
                                </SelectItem>
                                <SelectItem value="5">
                                  {t('userProfile.fields.level')} 5
                                </SelectItem>
                                <SelectItem value="6">
                                  {t('userProfile.fields.level')} 6
                                </SelectItem>
                                <SelectItem value="7">
                                  {t('userProfile.fields.level')} 7
                                </SelectItem>
                                <SelectItem value="8">
                                  {t('userProfile.fields.level')} 8
                                </SelectItem>
                                <SelectItem value="9">
                                  {t('userProfile.fields.level')} 9
                                </SelectItem>
                                <SelectItem value="10">
                                  {t('userProfile.fields.level')} 10
                                </SelectItem>
                                <SelectItem value="11">
                                  {t('userProfile.fields.level')} 11
                                </SelectItem>
                                <SelectItem value="12">
                                  {t('userProfile.fields.level')} 12
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-900 font-medium">
                            {data.holdLevel === 'no' ? t('no') : data.holdLevel}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Referral Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    {t('userProfile.sections.referralInfo')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Referer */}
                    <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100">
                      <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                        <label className="text-sm font-semibold text-gray-600">
                          {t('userProfile.sections.referer')}
                        </label>
                      </div>
                      <div className="w-full sm:w-2/3">
                        <p className="text-sm text-gray-900 font-medium">
                          {data.refUserName || 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Total Child */}
                    <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100">
                      <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                        <label className="text-sm font-semibold text-gray-600">
                          {t('userProfile.sections.totalChild')}
                        </label>
                      </div>
                      <div className="w-full sm:w-2/3">
                        <p className="text-sm text-gray-900 font-medium">
                          {data.totalChild || 0}
                        </p>
                      </div>
                    </div>

                    {/* Direct Referral Members */}
                    <div className="flex flex-col sm:flex-row sm:items-start py-3 border-b border-gray-100">
                      <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                        <label className="text-sm font-semibold text-gray-600">
                          {t('userProfile.sections.directReferralMembers')}
                        </label>
                      </div>
                      <div className="w-full sm:w-2/3">
                        <p className="text-sm text-gray-900 font-medium mb-2">
                          {data.listDirectUser?.length || 0} members
                        </p>
                        {data.listDirectUser &&
                          data.listDirectUser.length > 0 && (
                            <div className="mt-2">
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                                {data.listDirectUser.map((ele) => (
                                  <div
                                    className="bg-white border hover:bg-gray-50 rounded"
                                    key={ele.userId}
                                  >
                                    <span
                                      className={`${
                                        ele.isRed
                                          ? 'bg-[#b91c1c]'
                                          : ele.isBlue
                                          ? 'bg-[#0000ff]'
                                          : ele.isYellow
                                          ? 'bg-[#F4B400]'
                                          : ele.isPink
                                          ? 'bg-[#e600769c]'
                                          : 'bg-[#16a34a]'
                                      } py-1 px-2 rounded text-white text-sm block text-center`}
                                    >
                                      {ele.userId}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                    </div>

                    {/* Missing Users */}
                    <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100">
                      <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                        <label className="text-sm font-semibold text-gray-600">
                          {t('userProfile.sections.missingUsers')}
                        </label>
                      </div>
                      <div className="w-full sm:w-2/3">
                        <p className="text-sm text-gray-900 font-medium">
                          {data.notEnoughChild || 0}
                        </p>
                      </div>
                    </div>

                    {/* Active ID */}
                    {data.tier === 2 && (
                      <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100">
                        <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                          <label className="text-sm font-semibold text-gray-600">
                            {t('userProfile.fields.activeId')}
                          </label>
                        </div>
                        <div className="w-full sm:w-2/3">
                          <ul className="text-sm text-gray-900">
                            <li className="mb-1">
                              {t('userProfile.fields.branch1')}:{' '}
                              {data.notEnoughtChild?.countChild1 || 0} IDs
                            </li>
                            <li>
                              {t('userProfile.fields.branch2')}:{' '}
                              {data.notEnoughtChild?.countChild2 || 0} IDs
                            </li>
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Numbers of ID Require */}
                    {data.tier === 2 && (
                      <div className="flex flex-col sm:flex-row sm:items-center py-3">
                        <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                          <label className="text-sm font-semibold text-gray-600">
                            {t('userProfile.fields.numbersOfIdRequire')}
                          </label>
                        </div>
                        <div className="w-full sm:w-2/3">
                          <ul className="text-sm text-gray-900">
                            {(() => {
                              const c1 =
                                data?.notEnoughtChild?.countChild1 ?? 0;
                              const c2 =
                                data?.notEnoughtChild?.countChild2 ?? 0;

                              let b1 = 0;
                              let b2 = 0;

                              if (c1 >= 44 && c2 >= 44 && c1 + c2 >= 126) {
                                // ✅ Đủ điều kiện, không cần bù
                                b1 = 0;
                                b2 = 0;
                              } else {
                                // ✅ Xác định nhánh mạnh và nhánh yếu
                                if (c1 >= c2) {
                                  // Nhánh 1 mạnh (quota 42), nhánh 2 yếu (quota 20)
                                  b1 = Math.max(82 - c1, 0);
                                  b2 = Math.max(44 - c2, 0);
                                } else {
                                  // Nhánh 2 mạnh (quota 42), nhánh 1 yếu (quota 20)
                                  b1 = Math.max(44 - c1, 0);
                                  b2 = Math.max(82 - c2, 0);
                                }
                              }

                              return (
                                <>
                                  <li className="mb-1">
                                    {t('userProfile.fields.branch1')}: {b1} IDs
                                  </li>
                                  <li>
                                    {t('userProfile.fields.branch2')}: {b2} IDs
                                  </li>
                                </>
                              );
                            })()}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Sub Information Card (for Tier 2 users) */}
              {data.tier >= 2 && data.subInfo && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      {t('userProfile.sections.subInfo')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Sub Name */}
                      <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100">
                        <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                          <label className="text-sm font-semibold text-gray-600">
                            Sub Name
                          </label>
                        </div>
                        <div className="w-full sm:w-2/3">
                          <p className="text-sm text-gray-900 font-medium">
                            {data.subInfo.subName || 'N/A'}
                          </p>
                        </div>
                      </div>

                      {/* Direct Referral Sub Members */}
                      <div className="flex flex-col sm:flex-row sm:items-start py-3 border-b border-gray-100">
                        <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                          <label className="text-sm font-semibold text-gray-600">
                            {t('userProfile.sections.directReferralSubMembers')}
                          </label>
                        </div>
                        <div className="w-full sm:w-2/3">
                          <p className="text-sm text-gray-900 font-medium mb-2">
                            {data.subInfo.listDirectUser?.length || 0} members
                          </p>
                          {data.subInfo.listDirectUser &&
                            data.subInfo.listDirectUser.length > 0 && (
                              <div className="mt-2">
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                                  {data.subInfo.listDirectUser.map((ele) => (
                                    <div
                                      className="bg-white border hover:bg-gray-50 rounded p-2"
                                      key={ele.userId}
                                    >
                                      <span
                                        className={`${
                                          ele.isRed
                                            ? 'bg-[#b91c1c]'
                                            : ele.isBlue
                                            ? 'bg-[#0000ff]'
                                            : ele.isYellow
                                            ? 'bg-[#F4B400]'
                                            : ele.isPink
                                            ? 'bg-[#e600769c]'
                                            : 'bg-[#16a34a]'
                                        } py-1 px-2 rounded text-white text-xs block text-center`}
                                      >
                                        {ele.userId}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                        </div>
                      </div>

                      {/* Total Amount USDT */}
                      <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100">
                        <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                          <label className="text-sm font-semibold text-gray-600">
                            Total Amount USDT
                          </label>
                        </div>
                        <div className="w-full sm:w-2/3">
                          <p className="text-sm text-gray-900 font-medium">
                            {data.subInfo.totalAmountUsdt || 0} USDT
                          </p>
                        </div>
                      </div>

                      {/* Total Amount HEWE */}
                      <div className="flex flex-col sm:flex-row sm:items-center py-3">
                        <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                          <label className="text-sm font-semibold text-gray-600">
                            Total Amount HEWE
                          </label>
                        </div>
                        <div className="w-full sm:w-2/3">
                          <p className="text-sm text-gray-900 font-medium">
                            {data.subInfo.totalAmountHewe || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Additional Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    Additional Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Tier */}
                    <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100">
                      <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                        <label className="text-sm font-semibold text-gray-600">
                          {t('userProfile.fields.tier')}
                        </label>
                      </div>
                      <div className="w-full sm:w-2/3">
                        {isEditting ? (
                          <div>
                            <Input
                              {...register('tier', {
                                required: t(
                                  'userProfile.validation.tierRequired',
                                ),
                              })}
                              autoComplete="off"
                              className="w-full"
                            />
                            {errors.tier && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors.tier.message}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-900 font-medium">
                            {data.tier}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Fine */}
                    <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100">
                      <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                        <label className="text-sm font-semibold text-gray-600">
                          {t('userProfile.fields.fine')}
                        </label>
                      </div>
                      <div className="w-full sm:w-2/3">
                        {isEditting ? (
                          <div>
                            <Input
                              {...register('newFine', {
                                required: t(
                                  'userProfile.validation.fineRequired',
                                ),
                              })}
                              defaultValue={data.fine}
                              className="w-full"
                            />
                            {errors.newFine && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors.newFine.message}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-900 font-medium">
                            {data.fine}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Level */}
                    <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100">
                      <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                        <label className="text-sm font-semibold text-gray-600">
                          {t('userProfile.fields.level')}
                        </label>
                      </div>
                      <div className="w-full sm:w-2/3">
                        {isEditting ? (
                          <div>
                            <Input
                              {...register('level', {
                                required: t(
                                  'userProfile.validation.levelRequired',
                                ),
                              })}
                              defaultValue={
                                currentTierData.level ||
                                data.currentLayer[parseInt(data.tier) - 1]
                              }
                              className="w-full"
                            />
                            {errors.level && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors.level.message}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-900 font-medium">
                            {currentTierData.level ||
                              data.currentLayer[parseInt(data.tier) - 1]}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Change Created At */}
                    <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100">
                      <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                        <label className="text-sm font-semibold text-gray-600 flex items-center">
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          {t('userProfile.fields.changeCreatedAt')}
                        </label>
                      </div>
                      <div className="w-full sm:w-2/3">
                        {isEditting ? (
                          <div>
                            <Controller
                              name="changeCreatedAt"
                              control={control}
                              render={({ field }) => (
                                <DatePickerCustom
                                  value={field.value}
                                  onChange={field.onChange}
                                  placeholder="Select date"
                                  disabled={loadingUpdate}
                                />
                              )}
                            />

                            {errors.changeCreatedAt && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors.changeCreatedAt.message}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-900 font-medium">
                            {data.changeCreatedAt
                              ? new Date(
                                  data.changeCreatedAt,
                                ).toLocaleDateString()
                              : 'N/A'}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Die Time */}
                    <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100">
                      <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                        <label className="text-sm font-semibold text-gray-600 flex items-center">
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          {t('userProfile.fields.dieTime')}
                        </label>
                      </div>
                      <div className="w-full sm:w-2/3">
                        {isEditting ? (
                          <div>
                            <Controller
                              name="dieTime"
                              control={control}
                              render={({ field }) => (
                                <DatePickerCustom
                                  value={field.value}
                                  onChange={field.onChange}
                                  placeholder="Select date"
                                  disabled={loadingUpdate}
                                />
                              )}
                            />
                            {errors.dieTime && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors.dieTime.message}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-900 font-medium">
                            {data.dieTime
                              ? new Date(data.dieTime).toLocaleDateString()
                              : 'N/A'}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Note */}
                    <div className="flex flex-col sm:flex-row sm:items-start py-3 border-b border-gray-100">
                      <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                        <label className="text-sm font-semibold text-gray-600 flex items-center">
                          <FileText className="w-4 h-4 mr-2" />
                          {t('userProfile.fields.note')}
                        </label>
                      </div>
                      <div className="w-full sm:w-2/3">
                        {isEditting ? (
                          <div>
                            <Textarea
                              {...register('note')}
                              autoComplete="off"
                              rows={3}
                              className="resize-none w-full"
                            />
                            {errors.note && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors.note.message}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-900 font-medium">
                            {data.note || 'No notes'}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Member Since */}
                    <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100">
                      <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                        <label className="text-sm font-semibold text-gray-600 flex items-center">
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          {t('userProfile.fields.memberSince')}
                        </label>
                      </div>
                      <div className="w-full sm:w-2/3">
                        {isEditting ? (
                          <div>
                            <Controller
                              name="memberSince"
                              control={control}
                              render={({ field }) => (
                                <DatePickerCustom
                                  value={field.value}
                                  onChange={field.onChange}
                                  placeholder="Select date"
                                  disabled={loadingUpdate}
                                />
                              )}
                            />
                            {errors.changeCreatedAt && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors.changeCreatedAt.message}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-900 font-medium">
                            {data.changeCreatedAt
                              ? new Date(
                                  data.changeCreatedAt,
                                ).toLocaleDateString()
                              : 'N/A'}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Locked Time */}
                    {data.status === 'LOCKED' && (
                      <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100">
                        <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                          <label className="text-sm font-semibold text-gray-600 flex items-center">
                            <CalendarIcon className="w-4 h-4 mr-2" />
                            {t('userProfile.fields.lockedTime')}
                          </label>
                        </div>
                        <div className="w-full sm:w-2/3">
                          <p className="text-sm text-gray-900 font-medium">
                            {data.lockedTime
                              ? new Date(data.lockedTime).toLocaleDateString()
                              : 'N/A'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Deleted Time */}
                    {data.status === 'DELETED' && (
                      <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100">
                        <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                          <label className="text-sm font-semibold text-gray-600 flex items-center">
                            <CalendarIcon className="w-4 h-4 mr-2" />
                            {t('userProfile.fields.deletedTime')}
                          </label>
                        </div>
                        <div className="w-full sm:w-2/3">
                          <p className="text-sm text-gray-900 font-medium">
                            {data.deletedTime
                              ? new Date(data.deletedTime).toLocaleDateString()
                              : 'N/A'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Tier Times */}
                    <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100">
                      <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                        <label className="text-sm font-semibold text-gray-600 flex items-center">
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          {t('userProfile.fields.tier1Time')}
                        </label>
                      </div>
                      <div className="w-full sm:w-2/3">
                        <p className="text-sm text-gray-900 font-medium">
                          {data.tier1Time
                            ? new Date(data.tier1Time).toLocaleDateString()
                            : 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100">
                      <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                        <label className="text-sm font-semibold text-gray-600 flex items-center">
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          {t('userProfile.fields.tier2Time')}
                        </label>
                      </div>
                      <div className="w-full sm:w-2/3">
                        <p className="text-sm text-gray-900 font-medium">
                          {data.tier2Time
                            ? new Date(data.tier2Time).toLocaleDateString()
                            : 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100">
                      <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                        <label className="text-sm font-semibold text-gray-600 flex items-center">
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          {t('userProfile.fields.tier3Time')}
                        </label>
                      </div>
                      <div className="w-full sm:w-2/3">
                        <p className="text-sm text-gray-900 font-medium">
                          {data.tier3Time
                            ? new Date(data.tier3Time).toLocaleDateString()
                            : 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100">
                      <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                        <label className="text-sm font-semibold text-gray-600 flex items-center">
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          {t('userProfile.fields.tier4Time')}
                        </label>
                      </div>
                      <div className="w-full sm:w-2/3">
                        <p className="text-sm text-gray-900 font-medium">
                          {data.tier4Time
                            ? new Date(data.tier4Time).toLocaleDateString()
                            : 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center py-3">
                      <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                        <label className="text-sm font-semibold text-gray-600 flex items-center">
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          {t('userProfile.fields.tier5Time')}
                        </label>
                      </div>
                      <div className="w-full sm:w-2/3">
                        <p className="text-sm text-gray-900 font-medium">
                          {data.tier5Time
                            ? new Date(data.tier5Time).toLocaleDateString()
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Change User Information Card */}
              {data.changeUser && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <UserIcon className="w-5 h-5 mr-2" />
                      Change User Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Old User Name */}
                      <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100">
                        <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                          <label className="text-sm font-semibold text-gray-600">
                            {t('userProfile.fields.oldUserName')}
                          </label>
                        </div>
                        <div className="w-full sm:w-2/3">
                          <p className="text-sm text-gray-900 font-medium">
                            {data.changeUser.oldUserName}
                          </p>
                        </div>
                      </div>

                      {/* Old Email */}
                      <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100">
                        <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                          <label className="text-sm font-semibold text-gray-600">
                            {t('userProfile.fields.oldEmail')}
                          </label>
                        </div>
                        <div className="w-full sm:w-2/3">
                          <p className="text-sm text-gray-900 font-medium">
                            {data.changeUser.oldEmail}
                          </p>
                        </div>
                      </div>

                      {/* Change Date */}
                      <div className="flex flex-col sm:flex-row sm:items-center py-3">
                        <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                          <label className="text-sm font-semibold text-gray-600 flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            {t('userProfile.fields.changeDate')}
                          </label>
                        </div>
                        <div className="w-full sm:w-2/3">
                          <p className="text-sm text-gray-900 font-medium">
                            {data.changeUser.updatedAt
                              ? new Date(
                                  data.changeUser.updatedAt,
                                ).toLocaleDateString()
                              : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              {isEditting && (
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <Button
                    onClick={onSave}
                    disabled={loadingUpdate}
                    className="flex-1"
                  >
                    {loadingUpdate && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    )}
                    <Save className="w-4 h-4 mr-2" />
                    {t('userProfile.buttons.save')}
                  </Button>
                  <Button
                    onClick={onCancel}
                    variant="outline"
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-2" />
                    {t('userProfile.buttons.cancel')}
                  </Button>
                </div>
              )}

              {/* Special Action Buttons */}
              <div className="space-y-2">
                {userInfo?.permissions
                  ?.find((p) => p.page.pageName === 'admin-users-details')
                  ?.actions.includes('update') &&
                  walletChange && (
                    <Button
                      onClick={onApproveChangeWallet}
                      className="w-full bg-orange-500 hover:bg-orange-600"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {t('userProfile.buttons.changeWallet')}
                    </Button>
                  )}

                {userInfo?.permissions
                  ?.find((p) => p.page.pageName === 'admin-users-details')
                  ?.actions.includes('update') &&
                  data.facetecTid === '' &&
                  data.status === 'UNVERIFY' && (
                    <Button
                      onClick={onCheckKyc}
                      className="w-full bg-orange-500 hover:bg-orange-600"
                    >
                      {loadingCheckKyc && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      )}
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {t('userProfile.buttons.checkKyc')}
                    </Button>
                  )}

                {userInfo?.permissions
                  ?.find((p) => p.page.pageName === 'admin-users-details')
                  ?.actions.includes('update') &&
                  data.preTier2Status === '' &&
                  data.status === 'APPROVED' && (
                    <Button
                      onClick={onPushToPreTier2}
                      className="w-full bg-purple-500 hover:bg-purple-600"
                    >
                      {loadingPushToPreTier2 && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      )}
                      <ArrowUp className="w-4 h-4 mr-2" />
                      {t('userProfile.buttons.pushToPreTier2')}
                    </Button>
                  )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
};

export default UserProfileCard;
