'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { getEvents, joinEvent, generateQRCode } from '@/services/api';
import { useAuth } from '@/providers/web3Provider';

import { ProcessedEvent, TimeFilter } from './types';
import { processServerEvents } from './utils';
import EventCard from './EventCard';
import QRCodeModal from './QRCodeModal';
import EditEventModal from '@/components/EditEventModal';
import NoEventsMessage from './NoEventsMessage';
import TimeFilterButtons from './TimeFilterButtons';

export default function ActivitiesPage() {
  const [events, setEvents] = useState<ProcessedEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<ProcessedEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('upcoming');
  const { user, isAuthenticated } = useAuth();
  
  // State for QR code modal
  const [qrCodeModal, setQrCodeModal] = useState({
    isOpen: false,
    qrCodeUrl: '',
    eventName: '',
    eventId: '', // Added to keep track of which event we're generating for
    qrCodeType: 'volunteer' as 'volunteer' | 'recipient',
    isGenerating: false
  });
  
  // State for edit event modal
  const [editEventModal, setEditEventModal] = useState({
    isOpen: false,
    eventId: ''
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, timeFilter]);

  const fetchEvents = async () => {
    try {
      const response = await getEvents();
      const processedEvents = processServerEvents(response.data);
      setEvents(processedEvents);
    } catch (error) {
      toast.error('Failed to fetch events');
      console.error('Error fetching events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterEvents = () => {
    const now = new Date();
    const filtered = events.filter(event => {
      const eventDate = new Date(`${event.date}`);
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
      const dateA = new Date(`${a.date}`);
      const dateB = new Date(`${b.date}`);
      
      // For upcoming events, sort chronologically (earliest first)
      // For past events, sort reverse chronologically (most recent first)
      return timeFilter === 'past' 
        ? dateB.getTime() - dateA.getTime() 
        : dateA.getTime() - dateB.getTime();
    });

    setFilteredEvents(sorted);
  };

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

  // First step - Show the modal with type selection
  const handleGenerateQRCode = async (eventId: string, eventTitle: string) => {
    try {
      // Show the modal with type selection options
      setQrCodeModal({
        isOpen: true,
        qrCodeUrl: '',
        eventName: eventTitle,
        eventId: eventId, // Store the event ID
        qrCodeType: 'volunteer',
        isGenerating: true
      });
    } catch (error) {
      toast.error('Failed to prepare QR code generator');
      console.error('Error preparing QR code generator:', error);
    }
  };
  
  // Second step - Generate the QR code after type selection
 // Second step - Generate the QR code after type selection
const handleGenerateWithType = async (type: 'volunteer' | 'recipient') => {
  try {
    setIsLoading(true);
    
    // Get the event ID from the modal state
    const eventId = qrCodeModal.eventId;
    
    // Call the API with the selected type
    const response = await generateQRCode({ 
      type: type,
      eventId 
    });
    
    // Update the modal with the generated QR code
    setQrCodeModal(prev => ({
      ...prev,
      qrCodeUrl: response.data.qrCode.qrImage, // Updated to match the API response structure
      qrCodeType: type,
      isGenerating: false
    }));
    
    // Success message
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} QR Code generated successfully!`);
    
    // Note: We've removed the fetchEvents() call here as requested
    
  } catch (error) {
    toast.error('Failed to generate QR code');
    console.error('Error generating QR code:', error);
    
    // Reset the generation state if there's an error
    setQrCodeModal(prev => ({
      ...prev,
      isGenerating: false
    }));
  } finally {
    setIsLoading(false);
  }
};

const handleViewQRCode = async (
  eventId: string, 
  eventTitle: string, 
  qrCodeType: 'volunteer' | 'recipient' = 'volunteer'
) => {
  try {
    // For viewing an existing QR code, you'd typically fetch it from the server
    // But for now we'll simulate this by constructing a URL with the necessary parameters
    
    setQrCodeModal({
      isOpen: true,
      qrCodeUrl: `/api/qr/${eventId}?type=${qrCodeType}`,
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
  
  const openEditModal = (eventId: string) => {
    setEditEventModal({
      isOpen: true,
      eventId
    });
  };
  
  const closeEditModal = () => {
    setEditEventModal({
      isOpen: false,
      eventId: ''
    });
  };
  
  const handleEventUpdated = () => {
    fetchEvents();
  };

  // Function to check if the current user is the creator of an event
  const isEventCreator = (event: ProcessedEvent) => {
    if (!user || !isAuthenticated) return false;
    
    // Check by ID
    if (event.createdBy && event.createdBy.id === user.id) {
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
  const hasUserJoined = (event: ProcessedEvent) => {
    if (!user || !isAuthenticated) return false;
    
    // Check if user is in participants array
    return event.participants.some(participant => {
      // Check by ID if available
      if (typeof participant === 'object' && participant._id && user.id) {
        return participant._id === user.id;
      }
      
      // Check by wallet address if available
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

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  // Animation variants for containers
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div 
                key={i} 
                className="bg-card rounded-xl overflow-hidden"
              >
                <div className="h-40 bg-gradient-to-r from-secondary/40 to-secondary/10 animate-pulse"></div>
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-secondary/40 rounded w-3/4 animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-secondary/30 rounded animate-pulse"></div>
                    <div className="h-4 bg-secondary/30 rounded animate-pulse"></div>
                    <div className="h-4 bg-secondary/30 rounded animate-pulse"></div>
                  </div>
                  <div className="h-10 bg-secondary/40 rounded animate-pulse mt-4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              type: "spring",
              stiffness: 100,
              damping: 15
            }}
            className="mb-12 text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 relative inline-block">
              <span className="relative z-10">Community Activities</span>
              <motion.span 
                className="absolute -z-10 left-0 right-0 bottom-2 h-3 bg-primary/30 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.5, delay: 0.2 }}
              ></motion.span>
            </h1>
            <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
              Join our community events, make meaningful connections, and create positive change together
            </p>

            {/* Time filter buttons */}
            <TimeFilterButtons 
              currentFilter={timeFilter} 
              onFilterChange={setTimeFilter} 
            />
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                isCreator={isEventCreator(event)}
                isAdmin={isAdmin}
                userJoined={hasUserJoined(event)}
                isAuthenticated={isAuthenticated}
                onJoin={handleJoinEvent}
                onGenerateQRCode={handleGenerateQRCode}
                onViewQRCode={handleViewQRCode}
                onEdit={openEditModal}
              />
            ))}
          </motion.div>

          {filteredEvents.length === 0 && !isLoading && (
            <NoEventsMessage timeFilter={timeFilter} />
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
      {editEventModal.isOpen && (
        <EditEventModal
          isOpen={editEventModal.isOpen}
          onClose={closeEditModal}
          eventId={editEventModal.eventId}
          onEventUpdated={handleEventUpdated}
        />
      )}
    </>
  );
}