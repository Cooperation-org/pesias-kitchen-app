import React, { useState } from 'react';
import { 
  CalendarIcon, 
  ClockIcon, 
  MapPinIcon, 
  UsersIcon,
  QrCodeIcon,
  PencilSquareIcon,
  XMarkIcon,
  TrashIcon,
  ArrowLeftOnRectangleIcon,
  EllipsisVerticalIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import QRCodeModal from '@/components/QRCodeModal';

export interface QRCode {
  _id: string;
  ipfsCid: string;
  expiresAt: string;
  isActive: boolean;
  usedCount: number;
  qrImage?: string;
}

export interface Participant {
  _id: string;
  walletAddress: string;
  name: string;
}

export interface Event {
  _id: string;
  title: string;
  description?: string;
  date?: string;
  location?: string;
  capacity?: number;
  activityType?: string;
  qrCodes?: {
    volunteer?: QRCode;
    recipient?: QRCode;
  };
  participants: Participant[];
  createdBy?: {
    _id?: string;
    walletAddress?: string;
    name?: string;
  };
  createdAt?: string;
}

export const ACTIVITY_TYPE_COLORS: Record<string, string> = {
  'food_sorting': 'bg-blue-500 text-white',
  'food_distribution': 'bg-green-500 text-white',
  'food_pickup': 'bg-purple-500 text-white',
  'other': 'bg-gray-500 text-white'
};

export const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  'food_sorting': 'Food Sorting',
  'food_distribution': 'Food Distribution',
  'food_pickup': 'Food Pickup',
  'other': 'Other'
};

interface EventDetailsModalProps {
  isOpen: boolean;
  event: Event | null;
  onClose: () => void;
  onEdit: (eventId: string) => void;
  onDelete: (eventId: string) => void;
  onLeave: (eventId: string) => void;
  onGenerateQR: (eventId: string, eventTitle: string) => void;
  onJoin: (eventId: string) => void;
  isAdmin: boolean;
  isAuthenticated: boolean;
  userHasJoined: boolean;
  isCreator: boolean;
}

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  isOpen,
  event,
  onClose,
  onEdit,
  onDelete,
  onLeave,
  onGenerateQR,
  onJoin,
  isAdmin,
  isAuthenticated,
  userHasJoined,
  isCreator
}) => {
  // State for collapsible sections
  const [showDetails, setShowDetails] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  
  // State for QR code modal
  const [qrModalState, setQrModalState] = useState<{
    isOpen: boolean;
    type: 'volunteer' | 'recipient';
  }>({
    isOpen: false,
    type: 'volunteer'
  });
  
  if (!isOpen || !event) return null;

  // Format date strings
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric',
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Check if event is past
  const isEventPast = (): boolean => {
    if (!event.date) return false;
    const eventDate = new Date(event.date);
    const now = new Date();
    return eventDate < now;
  };

  const isPastEvent = isEventPast();

  // Handle action functions
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (event._id) {
      onEdit(event._id);
      setShowActionsMenu(false);
      onClose(); // Close the details modal when editing
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (event._id) {
      onDelete(event._id);
      setShowActionsMenu(false);
      onClose(); // Close the details modal when deleting
    }
  };
  
  const handleLeaveClick = () => {
    if (event._id) {
      onLeave(event._id);
    }
  };

  const handleOpenQRModal = ( type: 'volunteer' | 'recipient') => {
  
    setQrModalState({
      isOpen: true,
      type
    });
    setShowActionsMenu(false);
    // onClose(); // Close the details modal when opening QR modal
  };

  const handleQRCodeGenerated = () => {
    onGenerateQR(event._id, event.title);
  };

  const handleJoinEvent = () => {
    onJoin(event._id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      {/* Modal content */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden m-4">
        
        {/* Header */}
        <div className="relative border-b px-6 py-4">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
          
          {/* Actions menu for admin/creator - Fixed 3-dots */}
          {(isCreator || isAdmin) && (
            <div className="absolute top-4 right-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowActionsMenu(!showActionsMenu);
                }}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <EllipsisVerticalIcon className="w-5 h-5 text-gray-500" />
              </button>
              
              {/* Actions dropdown - Always render but conditionally show */}
              <div className={`absolute right-0 top-10 bg-white rounded-lg shadow-lg border py-1 min-w-40 z-20 transition-all duration-200 ${
                showActionsMenu ? 'opacity-100 visible' : 'opacity-0 invisible'
              }`}>
                {!isPastEvent && (
                  <>
                    <button
                      onClick={handleEditClick}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <PencilSquareIcon className="w-4 h-4" />
                      Edit
                    </button>
                    
                    <button
                      onClick={() => handleOpenQRModal('volunteer')}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <QrCodeIcon className="w-4 h-4" />
                      QR Codes
                    </button>
                    
                    {isAdmin && (
                      <button
                        onClick={handleDeleteClick}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <TrashIcon className="w-4 h-4" />
                        Delete
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
          
          {/* Title and basic info */}
          <div className="text-center px-12">
            <h2 className="text-xl font-semibold text-gray-900">{event.title}</h2>
            <div className="flex items-center justify-center gap-4 mt-2 text-sm text-gray-600">
              <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                {ACTIVITY_TYPE_LABELS[event.activityType || 'other']}
              </span>
              {isAuthenticated && userHasJoined && (
                <span className="text-green-600 text-xs">✓ Joined</span>
              )}
              {isAuthenticated && isCreator && (
                <span className="text-blue-600 text-xs">Creator</span>
              )}
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          
          {/* Description */}
          {event.description && (
            <div className="mb-6">
              <p className="text-gray-700">{event.description}</p>
            </div>
          )}
          
          {/* Basic info */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-sm">
              <CalendarIcon className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700">{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <ClockIcon className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700">{formatTime(event.date)}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPinIcon className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700">{event.location || 'Location TBD'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <UsersIcon className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700">{event.participants.length} attending</span>
            </div>
          </div>
          
          {/* More details toggle */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between p-3 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <span>More details</span>
            {showDetails ? (
              <ChevronUpIcon className="w-4 h-4" />
            ) : (
              <ChevronDownIcon className="w-4 h-4" />
            )}
          </button>
          
          {showDetails && (
            <div className="mt-3 p-4 bg-gray-50 rounded-lg space-y-3 text-sm">
              {event.capacity && (
                <div>
                  <span className="font-medium text-gray-900">Capacity: </span>
                  <span className="text-gray-700">{event.capacity} people</span>
                </div>
              )}
              {event.createdAt && (
                <div>
                  <span className="font-medium text-gray-900">Created: </span>
                  <span className="text-gray-700">{new Date(event.createdAt).toLocaleDateString()}</span>
                </div>
              )}
              {event.createdBy?.name && (
                <div>
                  <span className="font-medium text-gray-900">Organizer: </span>
                  <span className="text-gray-700">{event.createdBy.name}</span>
                </div>
              )}
            </div>
          )}
          
          {/* Past event notice */}
          {isPastEvent && (
            <div className="mt-6 p-3 bg-gray-100 border border-gray-200 text-gray-700 rounded-lg text-sm text-center">
              This event has already passed
            </div>
          )}
        </div>
        
        {/* Actions */}
        <div className="p-6 border-t bg-gray-50">
          {/* Join button */}
          {isAuthenticated && !userHasJoined && !isCreator && !isPastEvent && !isAdmin && (
            <button 
              onClick={handleJoinEvent} 
              className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors mb-3"
            >
              Join Event
            </button>
          )}
          
          {/* Leave button */}
          {isAuthenticated && userHasJoined && !isCreator && !isPastEvent && (
            <button 
              onClick={handleLeaveClick} 
              className="w-full py-2.5 flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors mb-3"
            >
              <ArrowLeftOnRectangleIcon className="w-4 h-4" />
              Leave Event
            </button>
          )}
          
          {/* Close button */}
          <button 
            onClick={onClose} 
            className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
      
      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={qrModalState.isOpen}
        onClose={() => setQrModalState(prev => ({ ...prev, isOpen: false }))}
        eventId={event._id}
        eventTitle={event.title}
        initialType={qrModalState.type}
        eventQRCodes={{
          volunteer: event.qrCodes?.volunteer,
          recipient: event.qrCodes?.recipient
        }}
        onQRCodeGenerated={handleQRCodeGenerated}
      />
      
      {/* Click outside to close actions menu */}
      {showActionsMenu && (
        <div 
          className="fixed inset-0 z-10"
          onClick={() => setShowActionsMenu(false)}
        />
      )}
    </div>
  );
};

export default EventDetailsModal;