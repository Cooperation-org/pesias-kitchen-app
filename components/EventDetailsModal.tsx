// components/EventDetailsModal.tsx

import React from 'react';

// Interface definitions
interface User {
  _id: string;
  walletAddress: string;
  role: string;
  name?: string;
}

interface Participant {
  _id?: string;
  id?: string;
  walletAddress?: string;
}

export interface Event {
  _id: string;
  title: string;
  description?: string;
  date?: string;
  location?: string;
  capacity?: number;
  participants: Participant[] | string[];
  activityType?: string;
  hasQrCode?: boolean;
  createdBy?: {
    _id?: string;
    walletAddress?: string;
    name?: string;
  };
  createdAt?: string;
}

// Activity type definitions
export const ACTIVITY_TYPE_COLORS: Record<string, string> = {
  food_distribution: "bg-blue-100 text-blue-800 border border-blue-300",
  food_rescue: "bg-green-100 text-green-800 border border-green-300",
  food_sorting: "bg-purple-100 text-purple-800 border border-purple-300",
  other: "bg-gray-100 text-gray-800 border border-gray-300"
};

export const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  food_distribution: "Distribution",
  food_rescue: "Rescue",
  food_sorting: "Sorting",
  other: "Other"
};

// Helper functions
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
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

const isEventPast = (event: Event): boolean => {
  if (!event?.date) return false;
  const eventDate = new Date(event.date);
  const now = new Date();
  return eventDate < now;
};

interface EventDetailsModalProps {
  isOpen: boolean; 
  event: Event | null; 
  onClose: () => void; 
  onEdit: (eventId: string) => void; 
  onGenerateQR: (eventId: string, eventTitle: string) => void; 
  onViewQR: (eventId: string, eventTitle: string, qrCodeType: 'volunteer' | 'recipient') => void;
  onJoin?: (eventId: string) => void;
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
  onGenerateQR, 
  onViewQR,
  onJoin,
  isAdmin,
  isAuthenticated,
  userHasJoined,
  isCreator
}) => {
  if (!isOpen || !event) return null;
  
  const eventIsPast = isEventPast(event);
  
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      {/* Blurry Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
        onClick={onClose}
        aria-hidden="true"
      ></div>
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold">{event.title}</h2>
          
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            ACTIVITY_TYPE_COLORS[event.activityType || 'other']
          }`}>
            {ACTIVITY_TYPE_LABELS[event.activityType || 'other']}
          </span>
        </div>
        
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-gray-700">{formatDate(event.date)}</span>
            <span className="text-gray-700 ml-2">{formatTime(event.date)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-gray-700">{event.location || "Location not specified"}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span className="text-gray-700">Capacity: {event.capacity || 0} people</span>
          </div>
          
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-gray-700">Participants: {(event.participants?.length || 0)}</span>
          </div>
          
          {event.createdBy && (
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-gray-700">
                Created by: {event.createdBy.name || event.createdBy.walletAddress?.substring(0, 8) + '...'}
              </span>
            </div>
          )}
          
          {event.createdAt && (
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-gray-700">
                Created: {new Date(event.createdAt).toLocaleDateString()}
              </span>
            </div>
          )}
          
          {/* Event status indicator */}
          {isAuthenticated && (
            <div className="mt-2 py-2 px-3 bg-gray-50 rounded-md">
              {userHasJoined ? (
                <div className="flex items-center gap-2 text-green-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">You've joined this event</span>
                </div>
              ) : isCreator ? (
                <div className="flex items-center gap-2 text-blue-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="font-medium">You created this event</span>
                </div>
              ) : eventIsPast ? (
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">This event has ended</span>
                </div>
              ) : null}
            </div>
          )}
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Description</h3>
          <p className="text-gray-700 whitespace-pre-wrap">
            {event.description || "No description provided"}
          </p>
        </div>
        
        {/* Action Buttons Section */}
        <div className="border-t pt-4 mt-4">
          {/* Admin Actions */}
          {isAdmin && (
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-3">Admin Actions</h3>
              <div className="flex flex-wrap gap-2">
                {/* Edit button */}
                <button 
                  onClick={() => {
                    onEdit(event._id);
                    onClose();
                  }}
                  className="flex items-center gap-1 px-4 py-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <span>Edit Event</span>
                </button>
                
                {/* QR Code buttons */}
                {event.hasQrCode ? (
                  <div className="flex flex-wrap gap-2">
                    {/* View Volunteer QR */}
                    <button 
                      onClick={() => {
                        onViewQR(event._id, event.title, 'volunteer');
                        onClose();
                      }}
                      className="flex items-center gap-1 px-4 py-2 bg-green-100 text-green-600 rounded-md hover:bg-green-200 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>Volunteer QR</span>
                    </button>
                    
                    {/* View Recipient QR */}
                    <button 
                      onClick={() => {
                        onViewQR(event._id, event.title, 'recipient');
                        onClose();
                      }}
                      className="flex items-center gap-1 px-4 py-2 bg-purple-100 text-purple-600 rounded-md hover:bg-purple-200 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>Recipient QR</span>
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      onGenerateQR(event._id, event.title);
                      onClose();
                    }}
                    className="flex items-center gap-1 px-4 py-2 bg-yellow-100 text-yellow-600 rounded-md hover:bg-yellow-200 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                    <span>Generate QR</span>
                  </button>
                )}
              </div>
            </div>
          )}
          
          {/* User Actions */}
          {isAuthenticated && !isAdmin && !eventIsPast && !userHasJoined && !isCreator && onJoin && (
            <div className="flex justify-center mb-4">
              <button 
                onClick={() => {
                  onJoin(event._id);
                  onClose();
                }}
                className="w-full py-3 px-4 bg-primary text-white font-medium rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Join Event
              </button>
            </div>
          )}
          
          {/* Close button */}
          <div className="flex justify-end">
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsModal;