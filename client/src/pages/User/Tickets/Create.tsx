import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import DefaultLayout from '@/layout/DefaultLayout';
import Ticket from '@/api/Ticket';
import Loading from '@/components/Loading';
import { ToastContainer, toast } from 'react-toastify';

export default function CreateTicketPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 5) {
      toast.error(t('ticket.maxImages'));
      return;
    }

    // Validate files are actually File objects
    const validFiles = files.filter((file) => file instanceof File);
    if (validFiles.length !== files.length) {
      console.warn('Some files were not valid File objects');
    }

    const newImages = [...images, ...validFiles];
    setImages(newImages);

    // Create previews
    const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);

    // Reset file input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    const newPreviews = [...imagePreviews];
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim()) {
      toast.error(t('ticket.subjectRequired'));
      return;
    }

    if (!message.trim()) {
      toast.error(t('ticket.messageRequired'));
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('subject', subject);
      formData.append('message', message);

      // Log để debug
      console.log('Images array:', images);
      console.log('Images length:', images.length);

      images.forEach((image, index) => {
        console.log(`Appending image ${index}:`, image, image instanceof File);
        formData.append('images', image);
      });

      // Log FormData để debug
      console.log('FormData entries:');
      for (let pair of formData.entries()) {
        console.log(
          pair[0] +
            ': ' +
            (pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1]),
        );
      }

      await Ticket.create(formData);
      toast.success(t('ticket.createdSuccessfully'));
      navigate('/user/tickets');
    } catch (error: any) {
      const message =
        error.response?.data?.error ||
        error.message ||
        'Failed to create ticket';
      toast.error(t(message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <DefaultLayout>
      <ToastContainer />
      <div className="py-24 px-10">
        <div className="bg-[#FAFBFC] p-6 rounded-2xl max-w-3xl mx-auto">
          <h2 className="text-lg font-semibold mb-6">
            {t('ticket.createTicket')}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('ticket.subject')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                placeholder={t('ticket.subjectPlaceholder')}
                maxLength={200}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {t('ticket.message')} <span className="text-red-500">*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                placeholder={t('ticket.messagePlaceholder')}
                rows={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {t('ticket.images')} ({t('ticket.maxImages')}: 5)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  {t('ticket.selectImages')}
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  {t('ticket.imageHint')}
                </p>
              </div>

              {imagePreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/user/tickets')}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                {t('ticket.cancel')}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loading />
                    {t('ticket.submitting')}
                  </span>
                ) : (
                  t('ticket.submit')
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DefaultLayout>
  );
}
