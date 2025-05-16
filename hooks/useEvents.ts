// hooks/useEvents.ts
import useSWR, { mutate } from 'swr';
import { buildApiUrl, fetcher } from '@/utils/swr-config';
import { toast } from 'sonner';

export interface Event {
  _id: string;
  title: string;
  description?: string;
  date?: string;
  location?: string;
  capacity?: number;
  participants: Array<{
    _id?: string;
    id?: string;
    walletAddress?: string;
    name?: string;
  }>;
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

export type TimeFilter = 'all' | 'upcoming' | 'past';

/**
 * Custom hook for fetching and filtering events
 */
export function useEvents(timeFilter: TimeFilter = 'upcoming') {
  console.log('useEvents hook called with timeFilter:', timeFilter);
  
  // Build the API URL - this is the SWR cache key
  const url = buildApiUrl('event');
  console.log('Using API URL:', url);
  
  // Use SWR with optimized configuration
  const { data, error, isLoading, mutate: boundMutate } = useSWR<Event[]>(
    url,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 0, // No deduping interval to allow immediate refreshes
      refreshInterval: 30000, // Auto-refresh every 30 seconds
      errorRetryCount: 3,
      onSuccess: (data) => {
        console.log('Events fetched successfully:', data?.length);
      },
      onError: (error) => {
        console.error('Error fetching events:', error);
        toast.error('Failed to load events. Please try again.');
      }
    }
  );

  // Always have a defined events array
  const events = data || [];

  /**
   * Filter events based on time filter
   */
  const filteredEvents = events.filter(event => {
    if (!event.date) return timeFilter === 'all'; // Include events without dates only in 'all' filter
    
    try {
      const eventDate = new Date(event.date);
      const now = new Date();
      
      // Handle timezone offsets properly for accurate date comparison
      eventDate.setMinutes(eventDate.getMinutes() + eventDate.getTimezoneOffset());
      
      switch (timeFilter) {
        case 'upcoming':
          return eventDate >= now;
        case 'past':
          return eventDate < now;
        default:
          return true;
      }
    } catch (err) {
      console.error('Date parsing error:', err, event.date);
      return timeFilter === 'all'; // If date parsing fails, only show in 'all'
    }
  });

  /**
   * Sort events by date
   */
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1; // Move events without dates to the end
    if (!b.date) return -1;
    
    try {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      
      // For upcoming events, sort chronologically (earliest first)
      // For past events, sort reverse chronologically (most recent first)
      return timeFilter === 'past' 
        ? dateB.getTime() - dateA.getTime() 
        : dateA.getTime() - dateB.getTime();
    } catch (err) {
      console.error('Sort error:', err);
      return 0;
    }
  });

  /**
   * Force refresh the events data
   */
  const refreshEvents = () => {
    console.log('Manually refreshing events data');
    return boundMutate();
  };
  
  /**
   * Add a new event to the cache optimistically
   */
  const addEventToCache = (newEvent: Event) => {
    console.log('Adding event to cache:', newEvent);
    return mutate(
      url,
      (currentEvents: Event[] = []) => {
        return [...currentEvents, newEvent];
      },
      { revalidate: true }
    );
  };

  return {
    events: sortedEvents,
    isLoading,
    error,
    mutate: boundMutate,
    refreshEvents,
    addEventToCache,
    eventsApiUrl: url,
    rawEvents: events
  };
}