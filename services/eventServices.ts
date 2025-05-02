import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export type ActivityType = 'food_sorting' | 'food_distribution' | 'food_pickup';

export interface CreateEventData {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  price: number;
  imageUrl?: string;
  activityType: ActivityType;
}

// Helper function to get the auth token from localStorage
const getAuthToken = (): string | null => {
  // Check if we're in a browser environment (not server-side)
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

export const eventServices = {
  createEvent: async (eventData: CreateEventData) => {
    try {
      // Get the auth token
      const token = getAuthToken();
      
      // If no token is found, throw an error
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }
      
      // Combine date and time fields
      const { date, time, ...restData } = eventData;
      const combinedDateTime = date && time 
        ? `${date}T${time}:00` 
        : date;
      
      // Create the request data with combined date
      const requestData = {
        ...restData,
        date: combinedDateTime
      };
      
      // Include the token in the Authorization header
      const response = await axios.post(`${API_URL}/api/event`, requestData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Use Bearer token format
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  },
  
  // You can add other event-related API calls here
  getEvents: async () => {
    try {
      // Get the auth token
      const token = getAuthToken();
      
      // If no token is found, throw an error
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }
      
      const response = await axios.get(`${API_URL}/api/event`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  },
  
  getEventById: async (eventId: string) => {
    try {
      // Get the auth token
      const token = getAuthToken();
      
      // If no token is found, throw an error
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }
      
      const response = await axios.get(`${API_URL}/api/event/${eventId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching event with ID ${eventId}:`, error);
      throw error;
    }
  },
};