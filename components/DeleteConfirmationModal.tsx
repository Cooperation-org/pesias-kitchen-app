'use client';

import { Dialog } from '@/components/ui/dialog';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  eventTitle: string;
  onCancel: () => void;
  onConfirm: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  eventTitle,
  onCancel,
  onConfirm
}) => {
  // Prevent the modal from opening if isOpen is false
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
          <h3 className="text-lg font-medium mb-4">Confirm Deletion</h3>
          <p className="mb-6">
            Are you sure you want to delete the event &quot;{eventTitle}&quot;? This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <button 
              onClick={onCancel}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md text-sm transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm transition-colors"
            >
              Delete Event
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default DeleteConfirmationModal;