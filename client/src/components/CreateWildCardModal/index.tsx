import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import WildCard from '@/api/WildCard';
import Loading from '@/components/Loading';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { useState, useCallback } from 'react';

interface CreateWildCardModalProps {
  userId: string;
  onSuccess?: () => void;
}

interface WildCardFormData {
  days: number;
  targetTier: number;
}

const CreateWildCardModal = ({ userId, onSuccess }: CreateWildCardModalProps) => {
  const { t } = useTranslation();

  const openModal = useCallback(() => {
    confirmAlert({
      closeOnClickOutside: true,
      customUI: ({ onClose }) => {
        return <FormContent userId={userId} onClose={onClose} onSuccess={onSuccess} t={t} />;
      },
    });
  }, [userId, onSuccess, t]);

  return { openModal };
};

// Component form riêng để có thể sử dụng hooks
const FormContent = ({ userId, onClose, onSuccess, t }: any) => {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<WildCardFormData>({
    defaultValues: {
      days: 15,
      targetTier: 1,
    },
  });

  const onSubmit = async (data: WildCardFormData) => {
    setLoading(true);
    try {
      const response = await WildCard.adminCreateWildCard(
        userId,
        data.days,
        data.targetTier,
      );

      toast.success(
        response.data.message || t('userProfile.wildCard.createSuccess'),
      );
      reset();
      onClose();
      onSuccess?.();
    } catch (error: any) {
      const message =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      toast.error(message || t('userProfile.wildCard.createError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="custom-ui">
      <div className="relative p-4 w-full max-w-md h-full md:h-auto mb-40">
        <div className="relative p-10 bg-gray-100 rounded-lg shadow-lg sm:p-5">
          <h3 className="text-lg font-semibold mb-4 text-left">
            {t('userProfile.modals.createWildCardTitle', {
              userId: userId,
            })}
          </h3>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4 text-left">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t('userProfile.wildCard.days')}{' '}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  {...register('days', {
                    required: t('userProfile.wildCard.errors.invalidDays'),
                    min: {
                      value: 1,
                      message: t('userProfile.wildCard.errors.invalidDays'),
                    },
                    valueAsNumber: true,
                  })}
                  className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:border-blue-500"
                  placeholder={t('userProfile.wildCard.daysPlaceholder')}
                />
                {errors.days && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.days.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t('userProfile.wildCard.targetTier')}{' '}
                  <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="targetTier"
                  control={control}
                  rules={{
                    required: t('userProfile.wildCard.errors.invalidTier'),
                    validate: (value) =>
                      value === 1 || value === 2 || t('userProfile.wildCard.errors.invalidTier'),
                  }}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:border-blue-500"
                    >
                      <option value={1}>Tier 1</option>
                      <option value={2}>Tier 2</option>
                    </select>
                  )}
                />
                {errors.targetTier && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.targetTier.message}
                  </p>
                )}
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white font-semibold rounded-md py-2 px-4 hover:bg-green-700 disabled:opacity-50"
                >
                  {loading && <Loading />}
                  {t('userProfile.buttons.createWildCard')}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 bg-gray-500 text-white font-semibold rounded-md py-2 px-4 hover:bg-gray-600 disabled:opacity-50"
                >
                  {t('userProfile.buttons.cancel')}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateWildCardModal;

