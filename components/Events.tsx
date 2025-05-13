'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { getEvents, joinEvent, generateQRCode, leaveEvent, deleteEvent } from '@/services/api';
import { useAuth } from '@/providers/web3Provider';
import { QRCodeModal } from '@/app/(dashboard)/dashboard/events';
import EditEventModal from '@/components/EditEventModal';
import EventDetailsModal, { 
  Event, 
  ACTIVITY_TYPE_COLORS, 
  ACTIVITY_TYPE_LABELS 
} from '@/components/EventDetailsModal';

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

type TimeFilter = 'all' | 'upcoming' | 'past';

interface QRCodeModalState {
  isOpen: boolean;
  qrCodeUrl: string;
  eventName: string;
  eventId: string;
  qrCodeType: 'volunteer' | 'recipient';
  isGenerating: boolean;
}

interface QRCodeResponse {
    qrCode?: {
      qrImage?: string;
    };
    qrImage?: string;
    imageUrl?: string; 
  }

interface APIEvent {
    id?: string;
    _id?: string;
    title: string;
    description?: string;
    date?: string;
    location?: string;
    capacity?: number;
    participants?: any[];
    // These might be missing in your API response
    activityType?: string;
    hasQrCode?: boolean;
    createdBy?: {
      _id?: string;
      id?: string;
      walletAddress?: string;
      name?: string;
    };
    createdAt?: string;
  }
  

interface EditEventModalState {
  isOpen: boolean;
  eventId: string;
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
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('upcoming');
  const { user, isAuthenticated } = useAuth();

  // QR code modal state
  const [qrCodeModal, setQrCodeModal] = useState<QRCodeModalState>({
    isOpen: false,
    qrCodeUrl: '',
    eventName: '',
    eventId: '',
    qrCodeType: 'volunteer',
    isGenerating: false
  });

  // Edit event modal state
  const [editEventModal, setEditEventModal] = useState<EditEventModalState>({
    isOpen: false,
    eventId: ''
  });
  
  // Event details modal state
  const [eventDetailsModal, setEventDetailsModal] = useState<EventDetailsModalState>({
    isOpen: false,
    event: null
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, timeFilter]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await getEvents();
      
      // Map API events to match your Event interface
      const mappedEvents = (response.data as APIEvent[] || []).map(event => ({
        _id: event._id || event.id, // Support both _id and id formats
        title: event.title,
        description: event.description,
        date: event.date,
        location: event.location,
        capacity: event.capacity,
        participants: event.participants || [],
        activityType: event.activityType,
        hasQrCode: event.hasQrCode,
        createdBy: event.createdBy,
        createdAt: event.createdAt
      }));

      console.log('Mapped events:', mappedEvents); // Debug log to check events data
      
      setEvents(mappedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    const now = new Date();
    const filtered = events.filter(event => {
      const eventDate = new Date(event.date || 0);
      
      switch (timeFilter) {
        case 'upcoming':
          return eventDate >= now;
        case 'past':
          return eventDate < now;
        default:
          return true;
      }
    });

    // Sort events by date
    const sorted = [...filtered].sort((a, b) => {
      const dateA = new Date(a.date || 0);
      const dateB = new Date(b.date || 0);
      
      // For upcoming events, sort chronologically (earliest first)
      // For past events, sort reverse chronologically (most recent first)
      return timeFilter === 'past' 
        ? dateB.getTime() - dateA.getTime() 
        : dateA.getTime() - dateB.getTime();
    });

    setFilteredEvents(sorted);
  };

  // Function to check if user is admin
  const isAdmin = user?.role === 'admin';

  // Function to handle joining an event
  const handleJoinEvent = async (eventId: string) => {
    if (!isAuthenticated) {
      toast.error('Please login to join this event');
      return;
    }

    try {
      await joinEvent(eventId);
      toast.success('Successfully joined the event!');
      fetchEvents(); 
    } catch (error) {
      toast.error('Failed to join event');
      console.error('Error joining event:', error);
    }
  };
  
  // Function to handle leaving an event
  const handleLeaveEvent = async (eventId: string) => {
    if (!isAuthenticated) {
      toast.error('Please login to perform this action');
      return;
    }

    try {
      await leaveEvent(eventId);
      toast.success('Successfully left the event');
      fetchEvents();
      closeEventDetails(); // Close modal after leaving
    } catch (error) {
      toast.error('Failed to leave event');
      console.error('Error leaving event:', error);
    }
  };
  
  // Function to handle deleting an event
  const handleDeleteEvent = async (eventId: string) => {
    if (!isAuthenticated || !isAdmin) {
      toast.error('You do not have permission to delete this event');
      return;
    }
    
    // Confirm before deletion
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteEvent(eventId);
      toast.success('Event deleted successfully');
      fetchEvents();
      closeEventDetails(); // Close modal after deletion
    } catch (error) {
      toast.error('Failed to delete event');
      console.error('Error deleting event:', error);
    }
  };

  // Function to handle generating QR code
  const handleGenerateQRCode = (eventId: string, eventTitle: string) => {
    // Close event details modal when opening QR code modal
    closeEventDetails();
    
    setQrCodeModal({
      isOpen: true,
      qrCodeUrl: '',
      eventName: eventTitle,
      eventId: eventId,
      qrCodeType: 'volunteer',
      isGenerating: true
    });
  };

  // Function to handle viewing QR code
  const handleViewQRCode = (
    eventId: string, 
    eventTitle: string, 
    qrCodeType: 'volunteer' | 'recipient' = 'volunteer'
  ) => {
    try {
      // Close event details modal when viewing QR code
      closeEventDetails();
      
      // In a real implementation, you would fetch the actual QR code URL
      const qrCodeUrl = `/api/qr/${eventId}?type=${qrCodeType}`;
      
      setQrCodeModal({
        isOpen: true,
        qrCodeUrl: qrCodeUrl,
        eventName: eventTitle,
        eventId: eventId,
        qrCodeType,
        isGenerating: false
      });
    } catch (error) {
      toast.error('Failed to retrieve QR code');
      console.error('Error retrieving QR code:', error);
    }
  };

  // Function to handle generating QR code with selected type
  const handleGenerateWithType = async (type: 'volunteer' | 'recipient') => {
    try {
      setLoading(true);
      
      // Get the event ID from the modal state
      const eventId = qrCodeModal.eventId;
      
      // Call the API with the selected type
      const response = await generateQRCode({ 
        type: type,
        eventId 
      });

      const qrData = response.data as QRCodeResponse;
      const qrImageUrl = 
      qrData.qrCode?.qrImage || // Option 1: response.data.qrCode.qrImage
      qrData.qrImage ||         // Option 2: response.data.qrImage
      qrData.imageUrl ||        // Option 3: response.data.imageUrl
      '';    
      
    
      setQrCodeModal(prev => ({
        ...prev,
        qrCodeUrl: qrImageUrl,
        qrCodeType: type,
        isGenerating: false
      }));
      
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} QR Code generated successfully!`);
      
      // Refresh events to update QR code status
      fetchEvents();
    } catch (error) {
      toast.error('Failed to generate QR code');
      console.error('Error generating QR code:', error);
      
      setQrCodeModal(prev => ({
        ...prev,
        isGenerating: false
      }));
    } finally {
      setLoading(false);
    }
  };

  // Function to close QR code modal
  const closeQrModal = () => {
    setQrCodeModal({
      isOpen: false,
      qrCodeUrl: '',
      eventName: '',
      eventId: '',
      qrCodeType: 'volunteer',
      isGenerating: false
    });
  };

  // Function to open edit event modal
  const openEditModal = (eventId: string) => {
    console.log('Opening edit modal with eventId:', eventId); // Debug log
    if (!eventId) {
      console.error('Cannot open edit modal: eventId is undefined');
      toast.error('Error: Cannot edit this event');
      return;
    }
    
    // Close event details modal when opening edit modal
    closeEventDetails();
    
    setEditEventModal({
      isOpen: true,
      eventId: eventId
    });
  };

  // Function to close edit event modal
  const closeEditModal = () => {
    setEditEventModal({
      isOpen: false,
      eventId: ''
    });
  };
  
  // Function to open event details modal
  const openEventDetails = (event: Event) => {
    console.log('Opening event details with event:', event); // Debug log
    setEventDetailsModal({
      isOpen: true,
      event
    });
  };
  
  // Function to close event details modal
  const closeEventDetails = () => {
    setEventDetailsModal({
      isOpen: false,
      event: null
    });
  };

  // Function to refresh events after update
  const handleEventUpdated = () => {
    fetchEvents();
    toast.success('Event updated successfully');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className="bg-white rounded-xl overflow-hidden shadow-sm"
              >
                <div className="h-24 bg-gray-200 animate-pulse"></div>
                <div className="p-4 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                  <div className="h-8 bg-gray-200 rounded animate-pulse mt-2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-4">
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
                              <span>You've joined this event</span>
                            </div>
                          ) : isCreator ? (
                            <div className="text-blue-600 text-sm flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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
      </div>

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={qrCodeModal.isOpen}
        qrCodeUrl={qrCodeModal.qrCodeUrl}
        eventName={qrCodeModal.eventName}
        qrCodeType={qrCodeModal.qrCodeType}
        isGenerating={qrCodeModal.isGenerating}
        onClose={closeQrModal}
        onGenerate={handleGenerateWithType}
      />

      {/* Edit Event Modal */}
      {editEventModal.isOpen && editEventModal.eventId && (
        <EditEventModal
          isOpen={editEventModal.isOpen}
          onClose={closeEditModal}
          eventId={editEventModal.eventId}
          onEventUpdated={handleEventUpdated}
        />
      )}
      
      {/* Event Details Modal */}
      <EventDetailsModal
        isOpen={eventDetailsModal.isOpen}
        event={eventDetailsModal.event}
        onClose={closeEventDetails}
        onEdit={(eventId) => {
          console.log('Edit button clicked with eventId:', eventId); // Debug log
          if (eventId) {
            openEditModal(eventId);
          } else if (eventDetailsModal.event && eventDetailsModal.event._id) {
            openEditModal(eventDetailsModal.event._id);
          } else {
            console.error('Cannot edit: No event ID available');
            toast.error('Error: Cannot edit this event');
          }
        }}
        onDelete={handleDeleteEvent}
        onLeave={handleLeaveEvent}
        onGenerateQR={handleGenerateQRCode}
        onViewQR={handleViewQRCode}
        onJoin={handleJoinEvent}
        isAdmin={isAdmin}
        isAuthenticated={isAuthenticated}
        userHasJoined={eventDetailsModal.event ? hasUserJoined(eventDetailsModal.event) : false}
        isCreator={eventDetailsModal.event ? isEventCreator(eventDetailsModal.event) : false}
      />
    </div>
  );
}