// services/api.ts
import axios, { AxiosInstance, AxiosResponse } from "axios";
import { mutate } from "swr";
import { buildApiUrl } from "@/utils/swr-config";
import { 
  User, 
  Event, 
  Activity, 
  QRCodeData, 
  QRCodeResponse, 
  NonceResponse, 
  VerifySignatureResponse, 
  ProfileUpdateData, 
  RewardsResponse, 
  NFTsResponse, 
  NFTDetails,
  SWR_ENDPOINTS,
  QRCodeVerifyResponse,
  QRCodeVerifyAndMintResponse,
  FoodHeroesImpactResponse,
  EventImpactResponse
} from "@/types/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://pesias-kitchen-api-git-main-agneskoinanges-projects.vercel.app/api";

// Define the events cache key for consistent usage
const EVENTS_CACHE_KEY = buildApiUrl('event');

/**
 * Configured Axios instance for API requests
 */
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds timeout
});

/**
 * Add authentication token to outgoing requests
 */
api.interceptors.request.use(
  (config) => {
    // Skip adding token for auth endpoints
    if (config.url?.includes('/auth/')) {
      return config;
    }
    
    // Add token only if available in client environment
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem("token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Process API response errors centrally
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Add custom error handling logic here
    if (error.response?.status === 401) {
      // Handle unauthorized access - could redirect to login or clear auth
      if (typeof window !== 'undefined') {
        // Clear auth data on 401 errors
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    // Format error message
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    error.displayMessage = errorMessage;
    
    return Promise.reject(error);
  }
);

// ===== Auth Endpoints =====

/**
 * Request a nonce for wallet authentication
 */
export const getNonce = (
  walletAddress: string
): Promise<AxiosResponse<NonceResponse>> => {
  return api.post("/auth/nonce", { walletAddress });
};

/**
 * Verify wallet signature for authentication
 */
export const verifySignature = (
  walletAddress: string,
  signature: string
): Promise<AxiosResponse<VerifySignatureResponse>> => {
  return api.post("/auth/verify", { walletAddress, signature });
};

// ===== QR Code Endpoints =====

/**
 * Generate a QR code for an event or activity
 */
export const generateQRCode = (
  data: QRCodeData
): Promise<AxiosResponse<QRCodeResponse>> => {
  return api.post("/qr/generate", data);
};

/**
 * Verify a QR code
 */
export const verifyQRCode = (
  qrData: string
): Promise<AxiosResponse<QRCodeVerifyResponse>> => {
  return api.post("/qr/verify", { qrData });
};

/**
 * Verify a QR code and mint an NFT in one step
 */
export const verifyQRAndMintNFT = (
  qrData: string,
  quantity?: number,
  notes?: string
): Promise<AxiosResponse<QRCodeVerifyAndMintResponse>> => {
  return api.post("/qr/verify-and-mint", { qrData, quantity, notes });
};

// ===== Activity Endpoints =====

/**
 * Record a new activity
 */
export const recordActivity = (
  data: Partial<Activity>
): Promise<AxiosResponse<Activity>> => {
  return api.post("/activity/record", data);
};

/**
 * Mint an NFT for an activity
 */
export const mintActivityNFT = (
  activityId: string
): Promise<AxiosResponse<Activity>> => {
  return api.post(`/activity/mint/${activityId}`);
};

/**
 * Get activities for current user
 */
export const getUserActivities = (): Promise<AxiosResponse<Activity[]>> => {
  return api.get(SWR_ENDPOINTS.USER_ACTIVITIES.url);
};

/**
 * Get all activities (admin only)
 */
export const getallActivities = (): Promise<AxiosResponse<Activity[]>> => {
  return api.get(SWR_ENDPOINTS.ALL_ACTIVITIES.url);
};

// ===== User Endpoints =====

/**
 * Get current user profile
 */
export const getCurrentUser = (): Promise<AxiosResponse<User>> => {
  return api.get(SWR_ENDPOINTS.USER_PROFILE.url);
};

/**
 * Update user profile
 */
export const updateProfile = (
  data: ProfileUpdateData
): Promise<AxiosResponse<User>> => {
  return api.put(SWR_ENDPOINTS.USER_PROFILE.url, data);
};

// ===== Admin User Endpoints =====

/**
 * Get all users (admin only)
 */
export const getAllUsers = (): Promise<AxiosResponse<User[]>> => {
  return api.get(SWR_ENDPOINTS.USERS.url);
};

/**
 * Get user by ID (admin only)
 */
export const getUserById = (userId: string): Promise<AxiosResponse<User>> => {
  return api.get(`/user/${userId}`);
};

/**
 * Update user role (admin only)
 */
export const updateUserRole = (
  userId: string,
  role: string
): Promise<AxiosResponse<User>> => {
  return api.put(`/user/${userId}/role`, { role });
};

// ===== Event Endpoints with SWR Integration =====

/**
 * Get all events
 */
export const getEvents = (): Promise<AxiosResponse<Event[]>> => {
  return api.get(SWR_ENDPOINTS.EVENTS.url);
};

/**
 * Get event by ID
 */
export const getEventById = (eventId: string): Promise<AxiosResponse<Event>> => {
  return api.get(`/event/${eventId}`);
};

/**
 * Create a new event with immediate SWR cache update
 */
export const createEvent = async (
  data: Partial<Event>
): Promise<AxiosResponse<Event>> => {
  try {
    // Send API request
    const response = await api.post(SWR_ENDPOINTS.EVENTS.url, data);
    const createdEvent = response.data;
    
    // Update the SWR cache immediately
    await mutate(
      EVENTS_CACHE_KEY,
      (currentEvents: Event[] = []) => {
        // Add the new event to the existing list
        return [...currentEvents, createdEvent];
      },
      false // Don't revalidate immediately to avoid race conditions
    );
    
    // Force a revalidation after a short delay
    setTimeout(() => {
      mutate(EVENTS_CACHE_KEY);
    }, 300);
    
    return response;
  } catch (error) {
    // If there's an error, revalidate the cache to ensure it's in sync
    mutate(EVENTS_CACHE_KEY);
    throw error;
  }
};

/**
 * Update an event with immediate SWR cache update
 */
export const updateEvent = async (
  eventId: string,
  data: Partial<Event>
): Promise<AxiosResponse<Event>> => {
  try {
    // Send API request
    const response = await api.put(`/event/${eventId}`, data);
    const updatedEvent = response.data;
    
    // Update the SWR cache immediately
    await mutate(
      EVENTS_CACHE_KEY,
      (currentEvents: Event[] = []) => {
        // Replace the updated event in the array
        return currentEvents.map(event => 
          event._id === eventId ? updatedEvent : event
        );
      },
      false
    );
    
    // Force a revalidation after a short delay
    setTimeout(() => {
      mutate(EVENTS_CACHE_KEY);
    }, 300);
    
    return response;
  } catch (error) {
    // If there's an error, revalidate the cache
    mutate(EVENTS_CACHE_KEY);
    throw error;
  }
};

/**
 * Delete an event with immediate SWR cache update
 */
export const deleteEvent = async (
  eventId: string
): Promise<AxiosResponse<{ message: string }>> => {
  try {
    // Send API request
    const response = await api.delete(`/event/${eventId}`);
    
    // Update the SWR cache immediately
    await mutate(
      EVENTS_CACHE_KEY,
      (currentEvents: Event[] = []) => {
        // Remove the deleted event from the array
        return currentEvents.filter(event => event._id !== eventId);
      },
      false
    );
    
    // Force a revalidation after a short delay
    setTimeout(() => {
      mutate(EVENTS_CACHE_KEY);
    }, 300);
    
    return response;
  } catch (error) {
    // If there's an error, revalidate the cache
    mutate(EVENTS_CACHE_KEY);
    throw error;
  }
};

/**
 * Join an event with immediate SWR cache update
 */
export const joinEvent = async (eventId: string): Promise<AxiosResponse<Event>> => {
  try {
    // Send API request
    const response = await api.post(`/event/${eventId}/join`);
    const updatedEvent = response.data;
    
    // Update the SWR cache immediately
    await mutate(
      EVENTS_CACHE_KEY,
      (currentEvents: Event[] = []) => {
        // Replace the updated event in the array
        return currentEvents.map(event => 
          event._id === eventId ? updatedEvent : event
        );
      },
      false
    );
    
    // Force a revalidation after a short delay
    setTimeout(() => {
      mutate(EVENTS_CACHE_KEY);
    }, 300);
    
    return response;
  } catch (error) {
    // If there's an error, revalidate the cache
    mutate(EVENTS_CACHE_KEY);
    throw error;
  }
};

/**
 * Leave an event with immediate SWR cache update
 */
export const leaveEvent = async (eventId: string): Promise<AxiosResponse<Event>> => {
  try {
    // Send API request
    const response = await api.post(`/event/${eventId}/leave`);
    const updatedEvent = response.data;
    
    // Update the SWR cache immediately
    await mutate(
      EVENTS_CACHE_KEY,
      (currentEvents: Event[] = []) => {
        // Replace the updated event in the array
        return currentEvents.map(event => 
          event._id === eventId ? updatedEvent : event
        );
      },
      false
    );
    
    // Force a revalidation after a short delay
    setTimeout(() => {
      mutate(EVENTS_CACHE_KEY);
    }, 300);
    
    return response;
  } catch (error) {
    // If there's an error, revalidate the cache
    mutate(EVENTS_CACHE_KEY);
    throw error;
  }
};

// ===== Rewards and NFTs =====

/**
 * Get rewards history
 */
export const getRewardsHistory = async (): Promise<RewardsResponse> => {
  const response = await api.get(SWR_ENDPOINTS.REWARDS.url);
  return response.data;
};

/**
 * Get user NFTs
 */
export const getUserNFTs = async (): Promise<NFTsResponse> => {
  const response = await api.get(SWR_ENDPOINTS.NFTS.url);
  return response.data;
};

/**
 * Get NFT details
 */
export const getNFTDetails = async (nftId: string): Promise<NFTDetails> => {
  const response = await api.get(`/nft/${nftId}`);
  return response.data;
};

/**
 * Get food heroes impact analytics
 */
export const getFoodHeroesImpact = (): Promise<AxiosResponse<FoodHeroesImpactResponse>> => {
  return api.get('/stats/dashboard/impact');
};

export const getEventImpact = (eventId: string): Promise<AxiosResponse<EventImpactResponse>> => {
  console.log(eventId, 'eventId');
  return api.get(`/stats/dashboard/event/${eventId}`);
};

export default api;