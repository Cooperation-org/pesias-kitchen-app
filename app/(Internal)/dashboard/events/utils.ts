// utils.ts
import { ProcessedEvent, ServerEvent } from "./types";

// Helper function to convert server event format to our component format
// export const processServerEvents = (serverEvents: ServerEvent[]): ProcessedEvent[] => {
//     return serverEvents.map(event => {
//       // Convert the API data structure to our internal format
//       return {
//         id: event._id,
//         title: event.title,
//         description: event.description,
//         date: event.date,
//         time: event.time || '',
//         location: event.location,
//         capacity: event.capacity,
//         activityType: event.activityType,
//         participants: event.participants || [],
//         createdBy: {
//           id: event.createdBy._id,
//           walletAddress: event.createdBy.walletAddress,
//           name: event.createdBy.name
//         },
//         createdAt: event.createdAt,
//         hasQrCode: event.hasQrCode,
//         qrCodeType: event.qrCodeType
//       };
//     });
//   };
export const mapServerEventToProcessedEvent = (e: ServerEvent): ProcessedEvent => {
  const dateObj = new Date(e.date);
  const timeString = dateObj.toTimeString().slice(0, 5); // "HH:MM"

  const volunteerQr = e.qrCodes?.volunteer ?? null;
  const recipientQr = e.qrCodes?.recipient ?? null;

  return {
    id: e._id,
    title: e.title,
    description: e.description,
    location: e.location,
    date: e.date,
    time: timeString,
    activityType: e.activityType,
    capacity: e.capacity,
    defaultQuantity: e.defaultQuantity,
    participants: e.participants,
    createdBy: {
      id: e.createdBy._id,
      walletAddress: e.createdBy.walletAddress,
      name: e.createdBy.name,
    },
    createdAt: e.createdAt,
    hasQrCode: Boolean(volunteerQr || recipientQr),
    qrCodeType: volunteerQr ? 'volunteer' : recipientQr ? 'recipient' : undefined,
  };
};

// Date and time formatting utilities
export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatTime = (dateString: string) => {
  if (!dateString) return '';
  
  try {
    // Create a date object from the date string
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return '';
    
    // Format the time with AM/PM
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return '';
  }
};

// Check if an event is in the past
export const isEventPast = (event: ProcessedEvent) => {
  const eventDate = new Date(`${event.date}T${event.time || '00:00'}`);
  return eventDate < new Date();
};