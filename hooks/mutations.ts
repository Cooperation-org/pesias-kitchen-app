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
import { Event, Activity, Participant, EventsResponse, ActivitiesResponse } from '@/types/api';

// Cache keys for different resources - using string keys to match DashboardClient
const CACHE_KEYS = {
  EVENTS: 'events',
  USER_ACTIVITIES: 'user-activities',
  ALL_ACTIVITIES: 'activities',
  NFTS: 'user-nfts',
  REWARDS: 'user-rewards'
};

// Join event with optimistic update
export async function joinEventMutation(eventId: string, userId: string) {
  try {
    // Get the current data for both events and activities
    await Promise.all([
      mutate<EventsResponse>(
        CACHE_KEYS.EVENTS,
        async (current: EventsResponse | undefined) => {
          // Optimistically update the events list
          if (current?.data) {
            const updatedEvents = current.data.map((event: Event) => 
              event._id === eventId 
                ? {
                    ...event,
                    participants: [...event.participants, { _id: userId } as Participant]
                  }
                : event
            );
            return { ...current, data: updatedEvents };
          }
          return current;
        },
        false // Don't revalidate yet
      ),
      mutate<ActivitiesResponse>(
        CACHE_KEYS.USER_ACTIVITIES,
        async (current: ActivitiesResponse | undefined) => {
          // Get the event details from the events cache
          const eventData = await fetch(buildApiUrl(`/event/${eventId}`)).then(res => res.json());
          if (!eventData?.data) return current;

          const event: Event = eventData.data;
          const newActivity: Activity = {
            _id: `temp-${Date.now()}`, // Temporary ID until server response
            event: {
              _id: event._id,
              title: event.title,
              description: event.description,
              location: event.location,
              date: event.date,
              activityType: event.activityType,
              capacity: event.capacity,
              defaultQuantity: event.defaultQuantity,
              participants: event.participants,
              createdBy: event.createdBy,
              createdAt: event.createdAt,
              __v: event.__v
            },
            user: userId,
            quantity: event.defaultQuantity || 1,
            verified: false,
            nftId: null,
            txHash: null,
            notes: "Joining event",
            timestamp: new Date().toISOString(),
            nftMinted: false,
            rewardAmount: 0,
            qrCode: `temp-${Date.now()}`, // Temporary QR code ID
            __v: 0
          };

          // Optimistically update the activities list
          if (current?.data) {
            return { 
              ...current, 
              data: [newActivity, ...current.data],
              total: current.total + 1
            };
          }
          return { data: [newActivity], total: 1 };
        },
        false // Don't revalidate yet
      )
    ]);
    
    // Make the actual API call
    await apiJoinEvent(eventId);
    
    // Success notification
    toast.success('Successfully joined event!');
    
    // Revalidate both caches to ensure data is correct
    await Promise.all([
      mutate(CACHE_KEYS.EVENTS),
      mutate(CACHE_KEYS.USER_ACTIVITIES)
    ]);
    
    return true;
  } catch (error: unknown) {
    console.error('Error joining event:', error);
    toast.error('Failed to join event. Please try again.');
    
    // Revalidate both caches to revert to the correct data
    await Promise.all([
      mutate(CACHE_KEYS.EVENTS),
      mutate(CACHE_KEYS.USER_ACTIVITIES)
    ]);
    
    return false;
  }
}

// Leave event with optimistic update
export async function leaveEventMutation(eventId: string, userId: string) {
  try {
    // Get the current data for both events and activities
    await Promise.all([
      mutate<EventsResponse>(
        CACHE_KEYS.EVENTS,
        async (current: EventsResponse | undefined) => {
          // Optimistically update the events list
          if (current?.data) {
            const updatedEvents = current.data.map((event: Event) => {
              if (event._id === eventId) {
                // Filter out the current user from participants
                const updatedParticipants = event.participants.filter((p: Participant) => 
                  typeof p === 'string' ? p !== userId : p._id !== userId
                );
                return { ...event, participants: updatedParticipants };
              }
              return event;
            });
            return { ...current, data: updatedEvents };
          }
          return current;
        },
        false // Don't revalidate yet
      ),
      mutate<ActivitiesResponse>(
        CACHE_KEYS.USER_ACTIVITIES,
        async (current: ActivitiesResponse | undefined) => {
          // Optimistically remove the activity from the list
          if (current?.data) {
            const updatedActivities = current.data.filter(activity => {
              if (typeof activity.event === 'string') {
                return activity.event !== eventId;
              }
              return activity.event._id !== eventId;
            });
            return { 
              ...current, 
              data: updatedActivities,
              total: current.total - 1
            };
          }
          return current;
        },
        false // Don't revalidate yet
      )
    ]);
    
    // Make the actual API call
    await apiLeaveEvent(eventId);
    
    // Success notification
    toast.success('Successfully left event');
    
    // Revalidate both caches to ensure data is correct
    await Promise.all([
      mutate(CACHE_KEYS.EVENTS),
      mutate(CACHE_KEYS.USER_ACTIVITIES)
    ]);
    
    return true;
  } catch (error: unknown) {
    console.error('Error leaving event:', error);
    toast.error('Failed to leave event. Please try again.');
    
    // Revalidate both caches to revert to the correct data
    await Promise.all([
      mutate(CACHE_KEYS.EVENTS),
      mutate(CACHE_KEYS.USER_ACTIVITIES)
    ]);
    
    return false;
  }
}

// Create event and update cache
export async function createEventMutation(eventData: Omit<Event, '_id' | 'createdAt' | '__v'>) {
  try {
    // Make the API call first as we need the new event ID
    const response = await apiCreateEvent(eventData);
    const newEvent = response.data;
    
    // Update the events cache
    await mutate<EventsResponse>(
      CACHE_KEYS.EVENTS,
      async (current: EventsResponse | undefined) => {
        if (current?.data) {
          return { 
            ...current, 
            data: [...current.data, newEvent] 
          };
        }
        return { data: [newEvent], total: 1 };
      },
      false
    );
    
    // Success notification
    toast.success('Event created successfully!');
    
    // Revalidate all related caches to ensure data is correct
    await Promise.all([
      mutate(CACHE_KEYS.EVENTS),
      mutate(CACHE_KEYS.USER_ACTIVITIES),
      mutate(CACHE_KEYS.ALL_ACTIVITIES)
    ]);
    
    return newEvent;
  } catch (error: unknown) {
    console.error('Error creating event:', error);
    toast.error('Failed to create event. Please try again.');
    
    // Revalidate to revert to the correct data
    await Promise.all([
      mutate(CACHE_KEYS.EVENTS),
      mutate(CACHE_KEYS.USER_ACTIVITIES),
      mutate(CACHE_KEYS.ALL_ACTIVITIES)
    ]);
    
    return null;
  }
}

// Update event and refresh cache
export async function updateEventMutation(eventId: string, eventData: Partial<Event>) {
  try {
    // Optimistically update the cache
    await mutate<EventsResponse>(
      CACHE_KEYS.EVENTS,
      async (current: EventsResponse | undefined) => {
        if (current?.data) {
          const updatedEvents = current.data.map((event: Event) => 
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
    
    // Revalidate all related caches to ensure data is correct
    await Promise.all([
      mutate(CACHE_KEYS.EVENTS),
      mutate(CACHE_KEYS.USER_ACTIVITIES),
      mutate(CACHE_KEYS.ALL_ACTIVITIES)
    ]);
    
    return response.data;
  } catch (error: unknown) {
    console.error('Error updating event:', error);
    toast.error('Failed to update event. Please try again.');
    
    // Revalidate to revert to the correct data
    await Promise.all([
      mutate(CACHE_KEYS.EVENTS),
      mutate(CACHE_KEYS.USER_ACTIVITIES),
      mutate(CACHE_KEYS.ALL_ACTIVITIES)
    ]);
    
    return null;
  }
}

// Delete event and update cache
export async function deleteEventMutation(eventId: string) {
  try {
    // Optimistically update the cache
    await mutate<EventsResponse>(
      CACHE_KEYS.EVENTS,
      async (current: EventsResponse | undefined) => {
        if (current?.data) {
          const filteredEvents = current.data.filter((event: Event) =>
            event._id !== eventId && event.id !== eventId
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
    
    // Revalidate all related caches to ensure data is correct
    await Promise.all([
      mutate(CACHE_KEYS.EVENTS),
      mutate(CACHE_KEYS.USER_ACTIVITIES),
      mutate(CACHE_KEYS.ALL_ACTIVITIES)
    ]);
    
    return true;
  } catch (error: unknown) {
    console.error('Error deleting event:', error);
    toast.error('Failed to delete event. Please try again.');
    
    // Revalidate to revert to the correct data
    await Promise.all([
      mutate(CACHE_KEYS.EVENTS),
      mutate(CACHE_KEYS.USER_ACTIVITIES),
      mutate(CACHE_KEYS.ALL_ACTIVITIES)
    ]);
    
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
    await mutate<EventsResponse>(
      CACHE_KEYS.EVENTS,
      async (current: EventsResponse | undefined) => {
        if (current?.data) {
          const updatedEvents = current.data.map((event: Event) => 
            event._id === eventId || event.id === eventId
              ? { ...event, hasQrCode: true }
              : event
          );
          return { ...current, data: updatedEvents };
        }
        return current;
      },
      false
    );
    
    // Revalidate to ensure data is correct
    await mutate(CACHE_KEYS.EVENTS);
    
    return response.data;
  } catch (error: unknown) {
    console.error('Error generating QR code:', error);
    toast.error('Failed to generate QR code. Please try again.');
    
    // Revalidate to revert to the correct data
    await mutate(CACHE_KEYS.EVENTS);
    
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