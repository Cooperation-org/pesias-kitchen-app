import { apiGet, apiPost } from '@/utils/api-client';

/**
 * Auth service for wallet-based authentication
 */

// Interface for nonce response
interface NonceResponse {
  nonce: string;
}

// Interface for auth response after signature verification
interface AuthResponse {
  token: string;
  user: {
    id: string;
    walletAddress: string;
    role: string;
    [key: string]: any; // For any additional user properties
  };
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
 * Store authentication data in localStorage
 */
export const storeAuthData = (token: string, user: any) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

/**
 * Clear authentication data from localStorage
 */
export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/**
 * Get stored authentication token
 */
export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

/**
 * Get stored user data
 */
export const getUser = () => {
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (error) {
        console.error('Error parsing user data', error);
      }
    }
  }
  return null;
};