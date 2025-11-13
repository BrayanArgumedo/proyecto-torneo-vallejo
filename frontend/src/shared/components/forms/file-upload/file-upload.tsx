import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/shared/utils/cn';

export interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  label?: string;
  error?: string;
  preview?: string;
  className?: string;
}

export const FileUpload = ({
  onFileSelect,
  accept = { 'image/*': ['.jpeg', '.jpg', '.png'] },
  maxSize = 5 * 1024 * 1024, // 5MB
  label,
  error,
  preview,
  className,
}: FileUploadProps) => {
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        onFileSelect(file);

        // Generar preview si es imagen
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setLocalPreview(reader.result as string);
          };
          reader.readAsDataURL(file);
        }
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
  });

  const displayPreview = preview || localPreview;

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400',
          error && 'border-red-500'
        )}
      >
        <input {...getInputProps()} />

        {displayPreview ? (
          <div className="flex flex-col items-center">
            <img
              src={displayPreview}
              alt="Preview"
              className="max-h-48 rounded-lg mb-3 object-contain"
            />
            <p className="text-sm text-gray-600">Click o arrastra para cambiar</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <svg
              className="h-12 w-12 text-gray-400 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-sm text-gray-600 mb-1">
              {isDragActive
                ? 'Suelta el archivo aquí'
                : 'Click o arrastra un archivo'}
            </p>
            <p className="text-xs text-gray-500">
              Tamaño máximo: {(maxSize / 1024 / 1024).toFixed(0)}MB
            </p>
          </div>
        )}
      </div>

      {fileRejections.length > 0 && (
        <p className="mt-1 text-sm text-red-600">
          {fileRejections[0].errors[0].message}
        </p>
      )}

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};
