import { apiPost } from '@/utils/api-client';

/**
 * Auth service for wallet-based authentication
 */

// Interface for nonce response
interface NonceResponse {
  nonce: string;
}

// Interface for user data
interface UserData {
  id: string;
  walletAddress: string;
  role: string;
  [key: string]: string | number | boolean; // For any additional user properties
}

// Interface for auth response after signature verification
interface AuthResponse {
  token: string;
  user: UserData;
}

/**
 * Request a nonce for a wallet address
 * @param walletAddress Ethereum wallet address
 */
export const getNonce = async (walletAddress: string) => {
  console.log("Requesting nonce for wallet:", walletAddress);
  return apiPost<NonceResponse>('/api/auth/nonce', { walletAddress });
};

/**
 * Verify wallet signature to authenticate
 * @param walletAddress Ethereum wallet address
 * @param signature Signed message signature
 */
export const verifySignature = async (walletAddress: string, signature: string) => {
  console.log("Verifying signature:", { walletAddress, signature: signature.substring(0, 20) + "..." });
  
  // Check if both parameters are present
  if (!walletAddress || !signature) {
    console.error("Missing required parameters:", { 
      hasWalletAddress: !!walletAddress, 
      hasSignature: !!signature 
    });
    return {
      data: null,
      error: "Wallet address and signature are required",
      status: 400
    };
  }
  
  // Make the API call with proper parameters
  return apiPost<AuthResponse>('/api/auth/verify', { 
    walletAddress, 
    signature 
  });
};

/**
 * Store authentication data in localStorage and cookies
 */
export const storeAuthData = (token: string, user: UserData) => {
  // Store in localStorage
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  
  // Store in cookies
  document.cookie = `token=${token}; path=/; max-age=2592000`; // 30 days
  document.cookie = `walletConnected=true; path=/; max-age=2592000`; // 30 days
};

/**
 * Clear authentication data from localStorage and cookies
 */
export const clearAuthData = () => {
  // Clear localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Clear cookies
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = 'walletConnected=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
};

/**
 * Set wallet connection status
 */
export const setWalletConnectionStatus = (isConnected: boolean) => {
  if (isConnected) {
    document.cookie = `walletConnected=true; path=/; max-age=2592000`; // 30 days
  } else {
    document.cookie = 'walletConnected=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    clearAuthData(); // Clear auth data when wallet disconnects
  }
};

/**
 * Get wallet connection status
 */
export const getWalletConnectionStatus = (): boolean => {
  if (typeof window !== 'undefined') {
    const cookies = document.cookie.split(';');
    const walletCookie = cookies.find(cookie => cookie.trim().startsWith('walletConnected='));
    return walletCookie ? walletCookie.split('=')[1] === 'true' : false;
  }
  return false;
};

/**
 * Get stored authentication token from cookies
 */
export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    // Try to get from cookies first
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
    if (tokenCookie) {
      return tokenCookie.split('=')[1];
    }
    // Fallback to localStorage
    return localStorage.getItem('token');
  }
  return null;
};

/**
 * Get stored user data
 */
export const getUser = (): UserData | null => {
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        return JSON.parse(userData) as UserData;
      } catch (error) {
        console.error('Error parsing user data', error);
      }
    }
  }
  return null;
};