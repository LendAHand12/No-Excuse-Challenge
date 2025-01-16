import useFilePreview from '@/hooks/useFilePreview';

const UploadFile = ({ watch, register, required, name }) => {
  const file = watch(name, false);
  const [filePreview] = useFilePreview(file);

  return (
    <div className="flex flex-col items-center justify-center w-full bg-white">
      <label className="flex flex-col w-full h-40 border-4 border-blue-200 border-dashed hover:bg-gray-100 hover:border-gray-300">
        {filePreview ? (
          <img
            src={filePreview}
            className="w-full h-full rounded-md object-cover"
            alt="the front of identity card"
          />
        ) : (
          <div className="flex flex-col items-center justify-center pt-7">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-8 h-8 text-gray-400 group-hover:text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="pt-1 text-sm tracking-wider text-gray-400 group-hover:text-gray-600">
              Attach a file
            </p>
          </div>
        )}

        <input
          type="file"
          name={name}
          id={name}
          {...register(
            name,
            required
              ? {
                  required: 'Vui lòng thêm ảnh',
                }
              : {},
          )}
          accept="image/png, imgage/jpg, image/jpeg"
          className="opacity-0"
        />
      </label>
    </div>
  );
};

export default UploadFile;
