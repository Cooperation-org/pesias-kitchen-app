'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useAuthContext } from '@/providers/Web3Provider';
import EditEventModal from '@/components/EditEventModal';
import EventDetailsModal, { 
  Event, 
  Participant,
  ACTIVITY_TYPE_COLORS, 
  ACTIVITY_TYPE_LABELS 
} from '@/components/EventDetailsModal';
import { useEvents, TimeFilter } from '@/hooks/useEvents';
import { useRouter } from 'next/navigation';
import { buildApiUrl } from '@/utils/swr-config';
import QRCodeModal from '@/components/QRCodeModal';

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

// Updated QR code modal state interface to include QR code data
interface QRCodeModalState {
  isOpen: boolean;
  eventId: string;
  eventTitle: string;
  eventQRCodes?: {
    volunteer?: {
      qrImage?: string;
      _id?: string;
      ipfsCid?: string;
    };
    recipient?: {
      qrImage?: string;
      _id?: string;
      ipfsCid?: string;
    };
  };
}

interface EventDetailsModalState {
  isOpen: boolean;
  event: Event | null;
}

interface EventsPageProps {
  title?: string;
  description?: string;
}

export default function EventsPage({ 
  title = "Community Events", 
  description = "Join our community events, make meaningful connections, and create positive change together"
}: EventsPageProps) {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('upcoming');
  const [searchQuery] = useState('');
  
  // Updated QR modal state to include the QR code data
  const [qrModalState, setQrModalState] = useState<QRCodeModalState>({
    isOpen: false,
    eventId: '',
    eventTitle: '',
    eventQRCodes: undefined
  });
  
  const [editEventModal, setEditEventModal] = useState<{
    isOpen: boolean;
    eventId: string | undefined;
  }>({
    isOpen: false,
    eventId: undefined
  });
  
  const [eventDetailsModal, setEventDetailsModal] = useState<EventDetailsModalState>({
    isOpen: false,
    event: null
  });
  
  const { user, isAuthenticated } = useAuthContext();
  const router = useRouter();

  // Use the useEvents hook for data fetching
  const { events, isLoading, error: fetchError, mutate } = useEvents(timeFilter);

  // Function to check if user is admin
  const isAdmin = user?.role === 'admin';

  // Filter events based on search query and time filter
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!event.date) return false;
    const eventDate = new Date(event.date);
    const now = new Date();
    
    switch (timeFilter) {
      case 'upcoming':
        return matchesSearch && eventDate >= now;
      case 'past':
        return matchesSearch && eventDate < now;
      default:
        return matchesSearch;
    }
  }).sort((a, b) => {
    if (!a.date || !b.date) return 0;
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return timeFilter === 'past' 
      ? dateB.getTime() - dateA.getTime() 
      : dateA.getTime() - dateB.getTime();
  });

  // Function to handle joining an event
  const handleJoinEvent = async (eventId: string) => {
    if (!user?.id) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(buildApiUrl(`event/${eventId}/join`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to join event');
      }

      // Optimistically update the UI
      await mutate();
      toast.success('Successfully joined the event');
      
      // Refresh the details modal if it's open
      if (eventDetailsModal.isOpen && eventDetailsModal.event?._id === eventId) {
        const updatedEvent = {...eventDetailsModal.event};
        if (user) {
          const participant: Participant = {
            _id: typeof user.id === 'string' ? user.id : String(user.id),
            walletAddress: typeof user.walletAddress === 'string' ? user.walletAddress : '',
            name: typeof user.name === 'string' ? user.name : 'Anonymous User'
          };
          updatedEvent.participants.push(participant);
        }
        setEventDetailsModal({
          isOpen: true,
          event: updatedEvent
        });
      }
    } catch {
      toast.error('Failed to join event');
    }
  };
  
  // Function to handle leaving an event
  const handleLeaveEvent = async (eventId: string) => {
    if (!user?.id) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(buildApiUrl(`event/${eventId}/leave`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to leave event');
      }

      // Optimistically update the UI
      await mutate();
      toast.success('Successfully left the event');
      
      // Refresh the details modal if it's open
      if (eventDetailsModal.isOpen && eventDetailsModal.event?._id === eventId) {
        const updatedEvent = {...eventDetailsModal.event};
        updatedEvent.participants = updatedEvent.participants.filter(
          participant => typeof participant === 'object' && participant._id !== user.id
        );
        setEventDetailsModal({
          isOpen: true,
          event: updatedEvent
        });
      }
    } catch {
      toast.error('Failed to leave event');
    }
  };
  
  // Function to handle deleting an event
  const handleDeleteEvent = async (eventId: string) => {
    try {
      const response = await fetch(buildApiUrl(`event/${eventId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      // Close the details modal
      setEventDetailsModal({ isOpen: false, event: null });
      
      // Optimistically update the events list
      await mutate(
        (currentEvents: Event[] = []) => {
          return currentEvents.filter(event => event._id !== eventId);
        },
        false
      );
      
      // Then force revalidation
      setTimeout(() => mutate(), 300);
      
      toast.success('Event deleted successfully');
    } catch {
      toast.error('Failed to delete event');
    }
  };

  // UPDATED: Improved QR code generated handler
  const handleQRCodeGenerated = (type?: string) => {
    console.log(`QR code generated for ${type} type`);
    
    // Just update the events list in the background without triggering a re-render
    mutate(undefined, { 
      revalidate: false,
      optimisticData: (currentData: Event[] = []) => currentData
    });
  };

  // UPDATED: Improved QR code generation function
  const handleGenerateQRCode = (eventId: string, eventTitle: string, eventQRCodes?: {
    volunteer?: {
      qrImage?: string;
      _id?: string;
      ipfsCid?: string;
    };
    recipient?: {
      qrImage?: string;
      _id?: string;
      ipfsCid?: string;
    };
  }) => {
    // Only open the modal if it's not already open
    if (!qrModalState.isOpen) {
      setQrModalState({
        isOpen: true,
        eventId,
        eventTitle,
        eventQRCodes
      });
    }
  };

  // UPDATED: Improved modal close handler
  const handleCloseQRModal = () => {
    // Clear the modal state completely
    setQrModalState({
      isOpen: false,
      eventId: '',
      eventTitle: '',
      eventQRCodes: undefined
    });
  };

  // Function to handle editing an event
  const handleEditEvent = (eventId: string) => {
    if (eventId) {
      setEditEventModal({
        isOpen: true,
        eventId
      });
    } else {
      console.error('Cannot edit: No event ID available');
      toast.error('Error: Cannot edit this event');
    }
  };

  // Function to open event details modal
  const openEventDetails = (event: Event) => {
    setEventDetailsModal({
      isOpen: true,
      event
    });
  };

  // Function to check if the current user is the creator of an event
  const isEventCreator = (event: Event) => {
    if (!user || !isAuthenticated) return false;
    
    // Check by ID
    if (event.createdBy && event.createdBy._id === user.id) {
      return true;
    }
    
    // Check by wallet address (case-insensitive comparison)
    if (event.createdBy && 
        event.createdBy.walletAddress && 
        user.walletAddress) {
      return event.createdBy.walletAddress.toLowerCase() === user.walletAddress.toLowerCase();
    }
    
    return false;
  };

  // Function to check if the current user has joined an event
  const hasUserJoined = (event: Event) => {
    if (!user || !isAuthenticated) return false;
    
    // Check if user is in participants array
    return event.participants.some(participant => {
      // If participant is an object with _id
      if (typeof participant === 'object' && participant._id && user.id) {
        return participant._id === user.id;
      }
      
      // If participant is an object with walletAddress
      if (typeof participant === 'object' && participant.walletAddress && user.walletAddress) {
        return participant.walletAddress.toLowerCase() === user.walletAddress.toLowerCase();
      }
      
      // If participant is just a string (ID), compare with user ID
      if (typeof participant === 'string' && user.id) {
        return participant === user.id;
      }
      
      return false;
    });
  };

  // Time filter buttons component
  const TimeFilterButtons = () => (
    <div className="flex justify-center gap-2 mt-6">
      <button
        onClick={() => setTimeFilter('upcoming')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          timeFilter === 'upcoming'
            ? 'bg-primary text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        Upcoming
      </button>
      <button
        onClick={() => setTimeFilter('past')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          timeFilter === 'past'
            ? 'bg-primary text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        Past
      </button>
      <button
        onClick={() => setTimeFilter('all')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          timeFilter === 'all'
            ? 'bg-primary text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        All
      </button>
    </div>
  );

  // No events message component
  const NoEventsMessage = () => (
    <div className="text-center py-10">
      <h3 className="text-xl font-medium text-gray-700 mb-2">No events found</h3>
      <p className="text-gray-500">
        {timeFilter === 'upcoming'
          ? "There are no upcoming events scheduled at the moment."
          : timeFilter === 'past'
          ? "There are no past events to display."
          : "There are no events to display."}
      </p>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="text-center text-red-500 p-4">
        Error loading events: {fetchError.message}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">{title}</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {description}
          </p>
          <TimeFilterButtons />
        </div>

        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvents.map((event) => {
              const userHasJoined = hasUserJoined(event);
              const isCreator = isEventCreator(event);
              const eventIsPast = isEventPast(event);
              
              return (
                <div 
                  key={event._id} 
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden cursor-pointer"
                  onClick={() => openEventDetails(event)}
                >
                  <div className={`h-2 w-full ${ACTIVITY_TYPE_COLORS[event.activityType || 'other'].split(' ')[0]}`}></div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-medium line-clamp-1">{event.title}</h3>
                      
                      <span className={`px-2 py-0.5 text-xs rounded-full ${ACTIVITY_TYPE_COLORS[event.activityType || 'other']}`}>
                        {ACTIVITY_TYPE_LABELS[event.activityType || 'other']}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{formatDate(event.date)}</span>
                        <span className="ml-1">at {formatTime(event.date)}</span>
                        
                        {/* Past event indicator */}
                        {eventIsPast && (
                          <span className="ml-1 px-1.5 py-0.5 bg-amber-100 text-amber-800 text-xs rounded">
                            Past
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="line-clamp-1">{event.location || "Location not specified"}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>Participants: {event.participants.length || 0}</span>
                      </div>
                    </div>
                    
                    {/* Status indicator */}
                    {isAuthenticated && (
                      <div className="mb-3">
                        {userHasJoined ? (
                          <div className="text-green-600 text-sm flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>You&apos;ve joined this event</span>
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
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent opening details modal
                        openEventDetails(event);
                      }}
                      className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md text-sm transition-colors duration-200"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <NoEventsMessage />
        )}
      </div>

      {/* Event Details Modal */}
      <EventDetailsModal
        isOpen={eventDetailsModal.isOpen}
        event={eventDetailsModal.event}
        onClose={() => setEventDetailsModal({ isOpen: false, event: null })}
        onEdit={handleEditEvent}
        onDelete={handleDeleteEvent}
        onLeave={handleLeaveEvent}
        onGenerateQR={(eventId, eventTitle) => 
          handleGenerateQRCode(eventId, eventTitle, eventDetailsModal.event?.qrCodes)}
        onJoin={handleJoinEvent}
        isAdmin={isAdmin}
        isAuthenticated={isAuthenticated}
        userHasJoined={eventDetailsModal.event ? hasUserJoined(eventDetailsModal.event) : false}
        isCreator={eventDetailsModal.event ? isEventCreator(eventDetailsModal.event) : false}
      />

      {/* Edit Event Modal */}
      {editEventModal.isOpen && editEventModal.eventId && (
        <EditEventModal
          isOpen={editEventModal.isOpen}
          onClose={() => setEditEventModal({ isOpen: false, eventId: undefined })}
          eventId={editEventModal.eventId}
          onEventUpdated={() => {
            mutate();
            toast.success('Event updated successfully');
          }}
        />
      )}

      {/* UPDATED: QR Code Modal */}
      <QRCodeModal
        isOpen={qrModalState.isOpen}
        onClose={handleCloseQRModal}
        eventId={qrModalState.eventId}
        eventTitle={qrModalState.eventTitle}
        eventQRCodes={qrModalState.eventQRCodes}
        onQRCodeGenerated={handleQRCodeGenerated}
      />
    </div>
  );
}