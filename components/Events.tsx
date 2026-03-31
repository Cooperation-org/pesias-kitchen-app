'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuthContext } from '@/providers/web3Provider';
import EditEventModal from '@/components/EditEventModal';
import EventDetailsModal, { 
  Event, 
  Participant,
  ACTIVITY_TYPE_LABELS 
} from '@/components/EventDetailsModal';
import { useEvents, TimeFilter } from '@/hooks/useEvents';
import { useRouter } from 'next/navigation';
import { buildApiUrl } from '@/utils/swr-config';
import QRCodeModal from '@/components/QRCodeModal';
import EventImpactModal from '@/components/EventImpactModal';
import { 
  ChartBarIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UsersIcon,
  EllipsisVerticalIcon,
  QrCodeIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';

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
  
  const [impactModalState, setImpactModalState] = useState<{
    isOpen: boolean;
    eventId: string;
    eventTitle: string;
  }>({
    isOpen: false,
    eventId: '',
    eventTitle: ''
  });

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  const { user, isAuthenticated } = useAuthContext();
  const router = useRouter();

  // Use the useEvents hook for data fetching
  const { events, isLoading, error: fetchError, mutate } = useEvents(timeFilter);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveDropdown(null);
    };

    if (activeDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [activeDropdown]);

  // Function to check if user is admin
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

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
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          timeFilter === 'upcoming'
            ? 'bg-gray-900 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        Upcoming
      </button>
      <button
        onClick={() => setTimeFilter('past')}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          timeFilter === 'past'
            ? 'bg-gray-900 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        Past
      </button>
      <button
        onClick={() => setTimeFilter('all')}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          timeFilter === 'all'
            ? 'bg-gray-900 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        All
      </button>
    </div>
  );

  // No events message component
  const NoEventsMessage = () => (
    <div className="text-center py-12">
      <h3 className="text-lg font-medium text-gray-700 mb-2">No events found</h3>
      <p className="text-gray-500">
        {timeFilter === 'upcoming'
          ? "There are no upcoming events scheduled."
          : timeFilter === 'past'
          ? "There are no past events to display."
          : "There are no events to display."}
      </p>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="text-center text-red-600 p-4">
        Error loading events: {fetchError.message}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Simple header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">{title}</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {description}
          </p>
          <TimeFilterButtons />
        </div>

        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const userHasJoined = hasUserJoined(event);
              const isCreator = isEventCreator(event);
              const eventIsPast = isEventPast(event);
              
              return (
                <div 
                  key={event._id} 
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
                >
                  {/* Title and activity type */}
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-medium text-gray-900 line-clamp-1 flex-1 mr-3">
                      {event.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded flex-shrink-0">
                        {ACTIVITY_TYPE_LABELS[event.activityType || 'other']}
                      </span>
                      
                      {/* 3-dot menu for admin/creator */}
                      {(isCreator || isAdmin) && !eventIsPast && (
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdown(activeDropdown === event._id ? null : event._id);
                            }}
                            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                          >
                            <EllipsisVerticalIcon className="w-4 h-4 text-gray-500" />
                          </button>
                          
                          {/* Dropdown menu */}
                          {activeDropdown === event._id && (
                            <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border py-1 min-w-40 z-20">
                              {isCreator && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditEvent(event._id);
                                    setActiveDropdown(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <PencilSquareIcon className="w-4 h-4" />
                                  Edit
                                </button>
                              )}
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleGenerateQRCode(event._id, event.title, event.qrCodes);
                                  setActiveDropdown(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <QrCodeIcon className="w-4 h-4" />
                                QR Codes
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Event info */}
                  <div className="space-y-2 mb-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-gray-400" />
                      <span>{formatDate(event.date)}</span>
                      {eventIsPast && (
                        <span className="ml-auto text-xs text-gray-500">Past</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <ClockIcon className="w-4 h-4 text-gray-400" />
                      <span>{formatTime(event.date)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPinIcon className="w-4 h-4 text-gray-400" />
                      <span className="line-clamp-1">{event.location || "Location TBD"}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <UsersIcon className="w-4 h-4 text-gray-400" />
                      <span>{event.participants.length} attending</span>
                    </div>
                  </div>
                  
                  {/* Status */}
                  {isAuthenticated && (
                    <div className="mb-4">
                      {userHasJoined ? (
                        <div className="text-green-700 text-sm">
                          ✓ You&apos;ve joined
                        </div>
                      ) : isCreator ? (
                        <div className="text-blue-700 text-sm">
                          ✓ Your event
                        </div>
                      ) : null}
                    </div>
                  )}
                  
                  {/* Actions */}
                  <div className="space-y-2">
                    {/* Impact button for admins - only show for past events */}
                    {isAdmin && eventIsPast && (
                      <button 
                        onClick={() => setImpactModalState({
                          isOpen: true,
                          eventId: event._id,
                          eventTitle: event.title
                        })}
                        className="w-full py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm transition-colors flex items-center justify-center gap-2"
                      >
                        <ChartBarIcon className="w-4 h-4" />
                        View Impact
                      </button>
                    )}
                    
                    {/* View Details button */}
                    <button 
                      onClick={() => openEventDetails(event)}
                      className="w-full py-2 px-3 bg-gray-900 hover:bg-gray-800 text-white rounded text-sm transition-colors"
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

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={qrModalState.isOpen}
        onClose={handleCloseQRModal}
        eventId={qrModalState.eventId}
        eventTitle={qrModalState.eventTitle}
        eventQRCodes={qrModalState.eventQRCodes}
        onQRCodeGenerated={handleQRCodeGenerated}
      />

      {/* Impact Modal */}
      <EventImpactModal
        isOpen={impactModalState.isOpen}
        eventId={impactModalState.eventId}
        eventTitle={impactModalState.eventTitle}
        onClose={() => setImpactModalState({ isOpen: false, eventId: '', eventTitle: '' })}
      />
    </div>
  );
}