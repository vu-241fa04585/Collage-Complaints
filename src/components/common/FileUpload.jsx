import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { HiUpload, HiTrash, HiDocumentText } from 'react-icons/hi';
import { formatFileSize, isValidFileType, MAX_FILE_SIZE } from '../../utils/helpers';
import toast from 'react-hot-toast';

const FileUpload = ({
  files = [],
  setFiles,
  maxFiles = 5,
  description = 'PNG, JPG, PDF, or DOC up to 10MB',
}) => {
  const onDrop = useCallback(
    (acceptedFiles) => {
      if (files.length + acceptedFiles.length > maxFiles) {
        toast.error(`You can upload a maximum of ${maxFiles} files.`);
        return;
      }

      const validFiles = acceptedFiles.filter((file) => {
        if (!isValidFileType(file)) {
          toast.error(`${file.name}: Invalid file format.`);
          return false;
        }
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`${file.name} exceeds 10MB limit.`);
          return false;
        }
        return true;
      });

      setFiles((prev) => [...prev, ...validFiles]);
    },
    [files, maxFiles, setFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
  });

  const removeFile = (indexToRemove) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors duration-200 ${
          isDragActive
            ? 'border-blue-500 bg-blue-50/50'
            : 'border-gray-300 hover:border-blue-400 bg-gray-50/60'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
            <HiUpload className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-gray-700">
            {isDragActive
              ? 'Drop the files here...'
              : 'Drag & drop supporting files, or browse'}
          </p>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>

      {files.length > 0 && (
        <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
          {files.map((file, idx) => (
            <li
              key={idx}
              className="flex items-center justify-between p-3 text-sm hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3 overflow-hidden">
                <HiDocumentText className="text-blue-500 text-xl flex-shrink-0" />
                <div className="truncate">
                  <p className="font-medium text-gray-800 truncate">{file.name}</p>
                  <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeFile(idx)}
                className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors"
                title="Remove file"
              >
                <HiTrash className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FileUpload;

