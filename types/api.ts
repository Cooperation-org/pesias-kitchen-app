// types/api.ts

/**
 * User data structure returned from the API
 */
export interface User {
    id: string;
    walletAddress: string;
    email?: string;
    name?: string;
    role: string;
    createdAt: string;
    updatedAt: string;
  }
  
  /**
   * Event data structure returned from the API
   */
  export interface Event {
    _id?: string;
    id?: string;
    title: string;
    description: string;
    date: string;
    time?: string;
    location: string;
    capacity: number;
    price?: number;
    imageUrl?: string;
    activityType?: string;
    hasQrCode?: boolean;
    defaultQuantity?: number;
    creator?: string | User;
    createdBy?: {
      _id?: string;
      id?: string;
      walletAddress?: string;
      name?: string;
    };
    participants?: any[];
    createdAt?: string;
    updatedAt?: string;
  }
  
  /**
   * Activity data structure returned from the API
   */
  export interface Activity {
    _id?: string;
    id?: string;
    event: string | any;
    qrCode?: string;
    user: string | any;
    quantity: number;
    notes?: string;
    nftMinted?: boolean;
    nftId?: string;
    nftTokenId?: string;
    txHash?: string;
    verified?: boolean;
    rewardAmount?: number;
    timestamp?: string;
    createdAt?: string;
    updatedAt?: string;
  }
  
  /**
   * Data structure for QR code generation requests
   */
  export interface QRCodeData {
    type: 'volunteer' | 'recipient';
    activityId?: string;
    eventId?: string;
    rewardAmount?: number;
    expiresAt?: string;
    [key: string]: any;
  }
  
  /**
   * Response from QR code generation
   */
  export interface QRCodeResponse {
    qrCodeUrl?: string;
    qrImage?: string;
    imageUrl?: string;
    verificationCode?: string;
    expiresAt?: string;
    qrCode?: {
      qrImage?: string;
    };
  }
  
  /**
   * Nonce response from authentication
   */
  export interface NonceResponse {
    nonce: string;
    message: string;
  }
  
  /**
   * Authentication signature verification request
   */
  export interface VerifySignatureRequest {
    walletAddress: string;
    signature: string;
  }
  
  /**
   * Response from successful authentication
   */
  export interface VerifySignatureResponse {
    token: string;
    user: User;
  }
  
  /**
   * Data for updating user profile
   */
  export interface ProfileUpdateData {
    name?: string;
    email?: string;
    bio?: string;
    avatarUrl?: string;
  }
  
  /**
   * Reward data structure returned from the API
   */
  export interface Reward {
    activityId: string;
    nftId: string;
    activityType: string;
    location: string;
    date: string;
    rewardAmount: number;
  }
  
  /**
   * Response from rewards history endpoint
   */
  export interface RewardsResponse {
    userInfo: {
      id: string;
      name: string;
      walletAddress: string;
    };
    rewards: Reward[];
    totalRewards: number;
  }
  
  /**
   * NFT attribute (trait) data structure
   */
  export interface NFTAttribute {
    trait_type: string;
    value: string;
  }
  
  /**
   * Detailed NFT information
   */
  export interface NFTDetails {
    id: string;
    name: string;
    description: string;
    image: string;
    attributes: NFTAttribute[];
    txHash: string;
    owner: string;
  }
  
  /**
   * Basic NFT information in listings
   */
  export interface NFT {
    id: string;
    name: string;
    imageUrl: string;
    activityType: string;
    location: string;
    quantity: number;
    date: string;
    txHash: string;
  }
  
  /**
   * Response from NFTs listing endpoint
   */
  export interface NFTsResponse {
    nfts: NFT[];
  }
  
  /**
   * Generic API response with data and pagination
   */
  export interface ApiResponse<T> {
    data?: T;
    message?: string;
    success?: boolean;
    totalCount?: number;
    page?: number;
    limit?: number;
  }
  
  /**
   * Server event from API response
   */
  export interface ServerEvent {
    _id: string;
    title: string;
    description: string;
    date: string; 
    time?: string;
    location: string;
    capacity: number;
    defaultQuantity?: number;
    activityType?: string;
    participants: any[];
    createdBy: { 
      _id: string; 
      walletAddress: string; 
      name?: string;
    };
    createdAt: string;
    __v?: number;
    hasQrCode?: boolean;
  }
  
  /**
   * Processed event for frontend consumption
   */
  export interface ProcessedEvent {
    id: string;
    title: string;
    description: string;
    date: string;
    time?: string;
    location: string;
    capacity: number;
    activityType?: string;
    participants: any[];
    createdBy: { 
      id: string; 
      walletAddress: string; 
      name?: string;
    };
    createdAt: string;
    hasQrCode?: boolean;
    qrCodeType?: 'volunteer' | 'recipient';
  }
  
  /**
   * SWR API Endpoint configurations
   */
  export interface SWREndpoint {
    key: string;
    url: string;
    responseKey?: string;
  }
  
  /**
   * SWR Endpoint Map - to be used with the hooks
   */
  export const SWR_ENDPOINTS = {
    EVENTS: {
      key: 'events',
      url: '/event',
      responseKey: 'data'
    },
    USER_ACTIVITIES: {
      key: 'userActivities',
      url: '/activity/user',
      responseKey: 'data'
    },
    ALL_ACTIVITIES: {
      key: 'allActivities',
      url: '/activity',
      responseKey: 'data'
    },
    NFTS: {
      key: 'nfts',
      url: '/nft/user',
      responseKey: 'nfts'
    },
    REWARDS: {
      key: 'rewards',
      url: '/rewards/history',
      responseKey: 'rewards'
    },
    USER_PROFILE: {
      key: 'userProfile',
      url: '/user/profile'
    },
    USERS: {
      key: 'users',
      url: '/user',
      responseKey: 'data'
    }
  };