// hooks/useEvents.ts
import useSWR from 'swr';
import { buildApiUrl, fetcher } from '@/utils/swr-config';

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

export function useEvents(timeFilter: TimeFilter = 'upcoming') {
  console.log('useEvents hook called with timeFilter:', timeFilter);
  
  const url = buildApiUrl('event');
  console.log('Built API URL:', url);
  
  const { data, error, isLoading, mutate } = useSWR<Event[]>(
    url,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000, // 5 seconds
      onSuccess: (data) => {
        console.log('Events fetched successfully:', data);
      },
      onError: (error) => {
        console.error('Error fetching events:', error);
      }
    }
  );

  console.log('SWR state:', { 
    hasData: !!data,
    isArray: Array.isArray(data),
    length: data?.length,
    firstEvent: data?.[0]
  });

  const events = data || [];

  // Filter events based on time filter
  const filteredEvents = events.filter(event => {
    if (!event.date) return false;
    const eventDate = new Date(event.date);
    const now = new Date();
    
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
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    const dateA = new Date(a.date || 0);
    const dateB = new Date(b.date || 0);
    
    // For upcoming events, sort chronologically (earliest first)
    // For past events, sort reverse chronologically (most recent first)
    return timeFilter === 'past' 
      ? dateB.getTime() - dateA.getTime() 
      : dateA.getTime() - dateB.getTime();
  });

  return {
    events: sortedEvents,
    isLoading,
    error,
    mutate
  };
}