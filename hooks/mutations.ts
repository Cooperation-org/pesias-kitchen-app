// hooks/mutations.ts
import { toast } from 'sonner';
import { mutate } from 'swr';
import { buildApiUrl } from '@/utils/swr-config';
import { 
  joinEvent as apiJoinEvent,
  leaveEvent as apiLeaveEvent,
  createEvent as apiCreateEvent,
  updateEvent as apiUpdateEvent,
  deleteEvent as apiDeleteEvent,
  mintActivityNFT as apiMintActivityNFT,
  generateQRCode as apiGenerateQRCode
} from '@/services/api';

// Cache keys for different resources
const CACHE_KEYS = {
  EVENTS: buildApiUrl('/event'),
  USER_ACTIVITIES: buildApiUrl('/activity/user'),
  ALL_ACTIVITIES: buildApiUrl('/activity'),
  NFTS: buildApiUrl('/nft/user'),
  REWARDS: buildApiUrl('/rewards/history')
};

// Join event with optimistic update
export async function joinEventMutation(eventId: string, userId: string) {
  try {
    // Get the current data
    const currentData = await mutate(
      CACHE_KEYS.EVENTS,
      async (current) => {
        // Optimistically update the events list
        if (current?.data) {
          const updatedEvents = current.data.map(event => 
            event._id === eventId 
              ? {...event, participants: [...event.participants, userId]} 
              : event
          );
          return { ...current, data: updatedEvents };
        }
        return current;
      },
      false // Don't revalidate yet
    );
    
    // Make the actual API call
    await apiJoinEvent(eventId);
    
    // Success notification
    toast.success('Successfully joined event!');
    
    // Revalidate to ensure data is correct
    mutate(CACHE_KEYS.EVENTS);
    
    return true;
  } catch (error) {
    console.error('Error joining event:', error);
    toast.error('Failed to join event. Please try again.');
    
    // Revalidate to revert to the correct data
    mutate(CACHE_KEYS.EVENTS);
    
    return false;
  }
}

// Leave event with optimistic update
export async function leaveEventMutation(eventId: string, userId: string) {
  try {
    // Get the current data
    const currentData = await mutate(
      CACHE_KEYS.EVENTS,
      async (current) => {
        // Optimistically update the events list
        if (current?.data) {
          const updatedEvents = current.data.map(event => {
            if (event._id === eventId) {
              // Filter out the current user from participants
              const updatedParticipants = event.participants.filter(p => {
                if (typeof p === 'string') return p !== userId;
                return p._id !== userId;
              });
              
              return {...event, participants: updatedParticipants};
            }
            return event;
          });
          return { ...current, data: updatedEvents };
        }
        return current;
      },
      false // Don't revalidate yet
    );
    
    // Make the actual API call
    await apiLeaveEvent(eventId);
    
    // Success notification
    toast.success('Successfully left event');
    
    // Revalidate to ensure data is correct
    mutate(CACHE_KEYS.EVENTS);
    
    return true;
  } catch (error) {
    console.error('Error leaving event:', error);
    toast.error('Failed to leave event. Please try again.');
    
    // Revalidate to revert to the correct data
    mutate(CACHE_KEYS.EVENTS);
    
    return false;
  }
}

// Create event and update cache
export async function createEventMutation(eventData: any) {
  try {
    // Make the API call first as we need the new event ID
    const response = await apiCreateEvent(eventData);
    const newEvent = response.data;
    
    // Update the events cache
    mutate(
      CACHE_KEYS.EVENTS,
      async (current) => {
        if (current?.data) {
          return { 
            ...current, 
            data: [...current.data, newEvent] 
          };
        }
        return current;
      },
      false
    );
    
    // Success notification
    toast.success('Event created successfully!');
    
    // Revalidate to ensure data is correct
    mutate(CACHE_KEYS.EVENTS);
    
    return newEvent;
  } catch (error) {
    console.error('Error creating event:', error);
    toast.error('Failed to create event. Please try again.');
    
    return null;
  }
}

// Update event and refresh cache
export async function updateEventMutation(eventId: string, eventData: any) {
  try {
    // Optimistically update the cache
    const previousData = await mutate(
      CACHE_KEYS.EVENTS,
      async (current) => {
        if (current?.data) {
          const updatedEvents = current.data.map(event => 
            event._id === eventId || event.id === eventId
              ? { ...event, ...eventData }
              : event
          );
          return { ...current, data: updatedEvents };
        }
        return current;
      },
      false
    );
    
    // Make the actual API call
    const response = await apiUpdateEvent(eventId, eventData);
    
    // Success notification
    toast.success('Event updated successfully!');
    
    // Revalidate to ensure data is correct
    mutate(CACHE_KEYS.EVENTS);
    
    return response.data;
  } catch (error) {
    console.error('Error updating event:', error);
    toast.error('Failed to update event. Please try again.');
    
    // Revalidate to revert to the correct data
    mutate(CACHE_KEYS.EVENTS);
    
    return null;
  }
}

// Delete event and update cache
export async function deleteEventMutation(eventId: string) {
  try {
    // Store the current data for rollback if needed
    let previousData;
    
    // Optimistically update the cache
    previousData = await mutate(
      CACHE_KEYS.EVENTS,
      async (current) => {
        if (current?.data) {
          const filteredEvents = current.data.filter(
            event => event._id !== eventId && event.id !== eventId
          );
          return { ...current, data: filteredEvents };
        }
        return current;
      },
      false
    );
    
    // Make the actual API call
    await apiDeleteEvent(eventId);
    
    // Success notification
    toast.success('Event deleted successfully');
    
    // Revalidate to ensure data is correct
    mutate(CACHE_KEYS.EVENTS);
    
    return true;
  } catch (error) {
    console.error('Error deleting event:', error);
    toast.error('Failed to delete event. Please try again.');
    
    // Revalidate to revert to the correct data
    mutate(CACHE_KEYS.EVENTS);
    
    return false;
  }
}

// Mint NFT for an activity
export async function mintNFTMutation(activityId: string) {
  try {
    // Make the API call
    const response = await apiMintActivityNFT(activityId);
    
    // Success notification
    toast.success('NFT minted successfully!');
    
    // Revalidate related caches
    mutate(CACHE_KEYS.USER_ACTIVITIES);
    mutate(CACHE_KEYS.NFTS);
    mutate(CACHE_KEYS.REWARDS);
    
    return response.data;
  } catch (error) {
    console.error('Error minting NFT:', error);
    toast.error('Failed to mint NFT. Please try again.');
    
    return null;
  }
}

// Generate QR code for an event
export async function generateQRCodeMutation(eventId: string, qrCodeType: 'volunteer' | 'recipient') {
  try {
    // Make the API call
    const response = await apiGenerateQRCode({ 
      type: qrCodeType,
      eventId 
    });
    
    // Success notification
    toast.success(`${qrCodeType.charAt(0).toUpperCase() + qrCodeType.slice(1)} QR Code generated successfully!`);
    
    // Update the events cache to reflect QR code presence
    mutate(
      CACHE_KEYS.EVENTS,
      async (current) => {
        if (current?.data) {
          const updatedEvents = current.data.map(event => 
            event._id === eventId || event.id === eventId
              ? { ...event, hasQrCode: true }
              : event
          );
          return { ...current, data: updatedEvents };
        }
        return current;
      },
      true // Revalidate immediately
    );
    
    return response.data;
  } catch (error) {
    console.error('Error generating QR code:', error);
    toast.error('Failed to generate QR code. Please try again.');
    
    return null;
  }
}

// Batch mint NFTs for rewards
export async function batchMintNFTsMutation(activityIds: string[]) {
  try {
    // Create an array of promises for each mint operation
    const mintPromises = activityIds.map(id => apiMintActivityNFT(id));
    
    // Execute all mint operations in parallel
    const results = await Promise.allSettled(mintPromises);
    
    // Count successful operations
    const successCount = results.filter(result => result.status === 'fulfilled').length;
    
    // Show appropriate notification
    if (successCount === activityIds.length) {
      toast.success(`Successfully minted ${successCount} NFTs!`);
    } else if (successCount > 0) {
      toast.success(`Minted ${successCount} out of ${activityIds.length} NFTs`);
    } else {
      toast.error('Failed to mint NFTs');
    }
    
    // Revalidate all related caches
    mutate(CACHE_KEYS.USER_ACTIVITIES);
    mutate(CACHE_KEYS.NFTS);
    mutate(CACHE_KEYS.REWARDS);
    
    return {
      total: activityIds.length,
      successful: successCount,
      results
    };
  } catch (error) {
    console.error('Error batch minting NFTs:', error);
    toast.error('Failed to batch mint NFTs');
    
    return {
      total: activityIds.length,
      successful: 0,
      results: []
    };
  }
}

// Use this to refresh all caches after multiple operations
export function refreshAllCaches() {
  Object.values(CACHE_KEYS).forEach(key => {
    mutate(key);
  });
}