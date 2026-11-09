import React from 'react';
import Modal from './Modal';
import { HiExclamation, HiInformationCircle } from 'react-icons/hi';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
}) => {
  const isDanger = variant === 'danger';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex items-start space-x-3 mb-6">
        <div
          className={`p-2.5 rounded-full flex-shrink-0 ${
            isDanger ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
          }`}
        >
          {isDanger ? (
            <HiExclamation className="w-6 h-6" />
          ) : (
            <HiInformationCircle className="w-6 h-6" />
          )}
        </div>
        <p className="text-sm text-gray-600 pt-1 leading-relaxed">{message}</p>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="btn-secondary text-sm px-4 py-2"
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={`text-sm px-4 py-2 rounded-lg font-medium text-white transition ${
            isDanger
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-blue-600 hover:bg-blue-700'
          } disabled:opacity-50`}
        >
          {loading ? 'Processing...' : confirmText}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;

