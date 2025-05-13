'use client';

// Common utility functions for date/time formatting and event status

// For server-side rendering, use a fixed locale and options to ensure consistency
// between server and client rendering
export const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    // Use explicit options and en-US locale to ensure consistent rendering
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      timeZone: 'UTC' // Use UTC to ensure consistency
    });
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid date';
  }
};

export const formatShortDate = (dateString: string | undefined): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      timeZone: 'UTC' // Use UTC to ensure consistency
    });
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid date';
  }
};

export const formatTime = (dateString: string | undefined): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'UTC' // Use UTC to ensure consistency
    });
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid time';
  }
};

export const formatDateTime = (dateString: string | undefined): string => {
  if (!dateString) return 'N/A';
  try {
    return `${formatDate(dateString)} at ${formatTime(dateString)}`;
  } catch (error) {
    console.error('DateTime formatting error:', error);
    return 'Invalid date/time';
  }
};

export const formatShortDateTime = (dateString: string | undefined): string => {
  if (!dateString) return 'N/A';
  try {
    return `${formatShortDate(dateString)} at ${formatTime(dateString)}`;
  } catch (error) {
    console.error('Short DateTime formatting error:', error);
    return 'Invalid date/time';
  }
};

// Server-safe event pastness check
export const isEventPast = (event: any): boolean => {
  if (!event?.date) return false;
  try {
    const eventDate = new Date(event.date);
    // For SSR consistency, compare with a fixed date during rendering
    // or use server-side data to determine if an event is past
    return eventDate.getTime() < Date.now();
  } catch (error) {
    console.error('Event past check error:', error);
    return false;
  }
};

// Activity type constants
export const ACTIVITY_TYPE_COLORS = {
  'food': 'bg-green-500 text-white',
  'education': 'bg-blue-500 text-white',
  'community': 'bg-purple-500 text-white',
  'volunteer': 'bg-yellow-500 text-black',
  'other': 'bg-gray-500 text-white',
};

// Function to safely get the background color class
export const getActivityBgColor = (activityType: string | undefined): string => {
  if (!activityType || !ACTIVITY_TYPE_COLORS[activityType]) {
    return 'bg-gray-500'; // Default background color
  }
  
  // Safely split and get the first class (background color)
  const colorClasses = ACTIVITY_TYPE_COLORS[activityType].split(' ');
  return colorClasses.length > 0 ? colorClasses[0] : 'bg-gray-500';
};

export const ACTIVITY_TYPE_LABELS = {
  'food': 'Food Donation',
  'education': 'Education',
  'community': 'Community',
  'volunteer': 'Volunteer',
  'other': 'Other',
};

// Event interface
export interface Event {
  _id: string;
  title: string;
  description?: string;
  date?: string;
  location?: string;
  capacity?: number;
  participants: any[];
  activityType?: string;
  hasQrCode?: boolean;
  createdBy?: {
    _id?: string;
    id?: string;
    walletAddress?: string;
    name?: string;
  }
  createdAt?: string;
}

// User authorization helpers
export const isEventCreator = (event: Event, user: any, isAuthenticated: boolean): boolean => {
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

export const hasUserJoined = (event: Event, user: any, isAuthenticated: boolean): boolean => {
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