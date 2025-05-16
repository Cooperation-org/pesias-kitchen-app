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
  ArrowLeftOnRectangleIcon
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
  participants: any[];
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

  // Handle edit button click
  const handleEditClick = () => {
    if (event._id) {
      onEdit(event._id);
    } else {
      console.error('Cannot edit: event._id is undefined');
    }
  };

  // Handle delete button click
  const handleDeleteClick = () => {
    if (event._id) {
      onDelete(event._id);
    } else {
      console.error('Cannot delete: event._id is undefined');
    }
  };
  
  // Handle leave button click
  const handleLeaveClick = () => {
    if (event._id) {
      onLeave(event._id);
    } else {
      console.error('Cannot leave: event._id is undefined');
    }
  };

  // Handle open QR Code modal
  const handleOpenQRModal = (type: 'volunteer' | 'recipient') => {
    setQrModalState({
      isOpen: true,
      type
    });
  };

  // Handle QR code generated
  const handleQRCodeGenerated = () => {
    // Call the parent's onGenerateQR to refresh data
    onGenerateQR(event._id, event.title);
  };

  // Handle join event
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
      <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
        {/* Color strip by activity type */}
        <div className={`h-2 w-full ${ACTIVITY_TYPE_COLORS[event.activityType || 'other'].split(' ')[0]}`}></div>
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
        
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">{event.title}</h2>
              <span className={`px-3 py-1 text-sm rounded-full ${ACTIVITY_TYPE_COLORS[event.activityType || 'other']}`}>
                {ACTIVITY_TYPE_LABELS[event.activityType || 'other']}
              </span>
            </div>
            
            {/* Participation status */}
            {isAuthenticated && (
              <div className="mt-2">
                {userHasJoined ? (
                  <div className="text-green-600 text-sm flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>You've joined this event</span>
                  </div>
                ) : isCreator ? (
                  <div className="text-blue-600 text-sm flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 016 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>You created this event</span>
                  </div>
                ) : null}
              </div>
            )}
          </div>
          
          {/* Event details */}
          <div className="space-y-4 mb-6">
            {/* Description */}
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Description</h3>
              <p className="text-gray-700">{event.description || 'No description provided.'}</p>
            </div>
            
            {/* Date and time */}
            <div className="flex items-start gap-3">
              <CalendarIcon className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-gray-900">Date</h4>
                <p className="text-gray-700">{formatDate(event.date)}</p>
              </div>
            </div>
            
            {/* Time */}
            <div className="flex items-start gap-3">
              <ClockIcon className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-gray-900">Time</h4>
                <p className="text-gray-700">{formatTime(event.date)}</p>
              </div>
            </div>
            
            {/* Location */}
            <div className="flex items-start gap-3">
              <MapPinIcon className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-gray-900">Location</h4>
                <p className="text-gray-700">{event.location || 'Location not specified'}</p>
              </div>
            </div>
            
            {/* Participants */}
            <div className="flex items-start gap-3">
              <UsersIcon className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-gray-900">Participants</h4>
                <p className="text-gray-700">{event.participants.length || 0} people attending</p>
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="space-y-3">
            {/* Past event indicator */}
            {isPastEvent && (
              <div className="mb-3 p-2 bg-amber-100 text-amber-800 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">This event has already passed</span>
              </div>
            )}
            
            {/* Join button (for authenticated non-admin users who haven't joined yet) */}
            {isAuthenticated && !userHasJoined && !isCreator && !isPastEvent && !isAdmin && (
              <button 
                onClick={handleJoinEvent} 
                className="w-full py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors"
              >
                Join Event
              </button>
            )}
            
            {/* Leave button (for users who have joined the event) */}
            {isAuthenticated && userHasJoined && !isCreator && !isPastEvent && (
              <button 
                onClick={handleLeaveClick} 
                className="w-full py-2.5 flex items-center justify-center gap-2 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg transition-colors"
              >
                <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                Leave Event
              </button>
            )}
            
            {/* Edit button (for creators or admins) */}
            {(isCreator || isAdmin) && !isPastEvent && (
              <button 
                onClick={handleEditClick} 
                className="w-full py-2.5 flex items-center justify-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
              >
                <PencilSquareIcon className="w-5 h-5" />
                Edit Event
              </button>
            )}
            
            {/* Delete button (for admins only, non-past events) */}
            {isAdmin && !isPastEvent && (
              <button 
                onClick={handleDeleteClick} 
                className="w-full py-2.5 flex items-center justify-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
              >
                <TrashIcon className="w-5 h-5" />
                Delete Event
              </button>
            )}
            
            {/* QR Code buttons (for creators or admins) */}
            {(isCreator || isAdmin) && (
              <div className="space-y-3">
                {/* Single QR Code button that opens the improved QRCodeModal */}
                <button 
                  onClick={() => handleOpenQRModal('volunteer')} 
                  className="w-full py-2.5 flex items-center justify-center gap-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors"
                >
                  <QrCodeIcon className="w-5 h-5" />
                  Manage QR Codes
                </button>
              </div>
            )}
            
            {/* Close button */}
            <button 
              onClick={onClose} 
              className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
      
      {/* QR Code Modal with all the smart logic built in */}
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
    </div>
  );
};

export default EventDetailsModal;