// types/api.ts

/**
 * User data structure returned from the API
 */
export interface User {
    _id: string;
    walletAddress: string;
    name: string;
    email?: string;
    role?: 'user' | 'admin' | 'volunteer';
    createdAt: string;
    updatedAt: string;
}

/**
 * Event data structure returned from the API
 */
export interface Event {
    _id: string;
    title: string;
    description: string;
    location: string;
    date: string;
    activityType: 'food_sorting' | 'food_distribution' | 'other';
    capacity: number;
    defaultQuantity: number;
    participants: Participant[];
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

/**
 * Activity data structure returned from the API
 */
export interface Activity {
    _id: string;
    event: {
        _id: string;
        title: string;
        description: string;
        location: string;
        date: string;
        activityType: 'food_sorting' | 'food_distribution' | 'other';
        capacity: number;
        defaultQuantity: number;
        participants: Participant[];
        createdBy: string;
        createdAt: string;
        __v: number;
    } | string;
    qrCode: string;
    user: {
        _id: string;
        walletAddress: string;
        name: string;
    } | string;
    quantity: number;
    verified: boolean;
    nftId: string | null;
    txHash: string | null;
    notes: string;
    timestamp: string;
    __v: number;
    rewardAmount?: number;
    nftMinted?: boolean;
    nftTokenId?: string;
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
    metadata?: Record<string, string | number | boolean>;
}

/**
 * Response from QR code generation
 */
export interface QRCodeResponse {
    qrCode: QRCode;
    eventTitle: string;
    eventLocation: string;
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
    activityId: string;
}

/**
 * Response from NFTs listing endpoint
 */
export interface NFTsResponse {
    nfts: NFT[];
    total: number;
}

/**
 * Generic API response with data and pagination
 */
export interface ApiResponse<T> {
    data: T;
    message?: string;
    error?: ApiError;
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
    participants: Participant[];
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
    participants: Participant[];
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

export interface ActivitiesResponse {
    data: Activity[];
    total: number;
}

export interface EventDetails {
    _id: string;
    title: string;
    description: string;
    location: string;
    date: string;
    activityType: 'food_sorting' | 'food_distribution' | 'other';
    capacity: number;
    defaultQuantity: number;
    participants: Participant[];
    createdBy: string;
    createdAt: string;
    __v: number;
}

export interface QRCode {
    id: string;
    eventId: string;
    type: 'volunteer' | 'recipient';
    qrImage: string;
    ipfsCid?: string;
    expiresAt?: string;
    createdAt: string;
}

export interface ActivityMetrics {
    totalGDollars: number;
    totalNFTs: number;
    totalFoodDistributed: number;
    totalMealsProvided: number;
    totalWasteReduced: number;
    uniqueVolunteers: number;
    uniqueRecipients: number;
}

export interface Participant {
    _id: string;
    walletAddress: string;
    name: string;
}

export interface EventResponse {
    data: Event;
    message: string;
}

export interface EventsResponse {
    data: Event[];
    total: number;
}

export interface EventCreateData {
    title: string;
    description: string;
    location: string;
    date: string;
    activityType: 'food_sorting' | 'food_distribution' | 'other';
    capacity: number;
    defaultQuantity: number;
}

export interface EventUpdateData extends Partial<EventCreateData> {
    _id: string;
}

export interface QRScanResult {
    text: string;
    timestamp: number;
}

export interface QRScanError {
    name: string;
    message: string;
}

export interface ApiError {
    message: string;
    code?: string;
    status?: number;
}