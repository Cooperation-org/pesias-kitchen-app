import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

// Define base types
interface User {
  id: string;
  walletAddress: string;
  email?: string;
  name?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  price: number;
  imageUrl?: string;
  creator: string | User;
  participants?: string[] | User[];
  createdAt: string;
  updatedAt: string;
}

interface Activity {
  _id?: string;
  id?: string;
  event: string;
  qrCode: string;
  user: string;
  quantity: number;
  notes: string;
  nftMinted?: boolean;
  nftTokenId?: string;
  rewardAmount?: number;
  createdAt: string;
  updatedAt: string;
}

interface QRCodeData {
  type: string;
  activityId?: string;
  eventId?: string;
  rewardAmount?: number;
  expiresAt?: string;
  [key: string]: any;
}

interface QRCodeResponse {
  qrCodeUrl: string;
  verificationCode: string;
  expiresAt: string;
}

// Auth interfaces
interface NonceResponse {
  nonce: string;
  message: string;
}

interface VerifySignatureRequest {
  walletAddress: string;
  signature: string;
}

interface VerifySignatureResponse {
  token: string;
  user: User;
}

interface ProfileUpdateData {
  name?: string;
  email?: string;
  bio?: string;
  avatarUrl?: string;
}

interface Reward {
  activityId: string;
  nftId: string;
  activityType: string;
  location: string;
  date: string;
  rewardAmount: number;
}

interface RewardsResponse {
  userInfo: {
    id: string;
    name: string;
    walletAddress: string;
  };
  rewards: Reward[];
  totalRewards: number;
}

interface NFTAttribute {
  trait_type: string;
  value: string;
}

interface NFTDetails {
  id: string;
  name: string;
  description: string;
  image: string;
  attributes: NFTAttribute[];
  txHash: string;
  owner: string;
}

interface NFT {
  id: string;
  name: string;
  imageUrl: string;
  activityType: string;
  location: string;
  quantity: number;
  date: string;
  txHash: string;
}

interface NFTsResponse {
  nfts: NFT[];
}

const API_URL = "https://pesias-kitchen-api-git-main-agneskoinanges-projects.vercel.app/api";

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Add authentication token to requests
api.interceptors.request.use(
  (config: AxiosRequestConfig): AxiosRequestConfig => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth endpoints
export const getNonce = (
  walletAddress: string
): Promise<AxiosResponse<NonceResponse>> =>
  api.post("/auth/nonce", { walletAddress });

export const verifySignature = (
  walletAddress: string,
  signature: string
): Promise<AxiosResponse<VerifySignatureResponse>> =>
  api.post("/auth/verify", { walletAddress, signature });

// QR Codes endpoints
export const generateQRCode = (
  data: QRCodeData
): Promise<AxiosResponse<QRCodeResponse>> => api.post("/qr/generate", data);

export const verifyQRCode = (qrData: string): Promise<AxiosResponse<any>> =>
  api.post("/qr/verify", { qrData });

export const verifyQRAndMintNFT = (
  qrData: string,
  quantity?: number,
  notes?: string
): Promise<AxiosResponse<any>> =>
  api.post("/qr/verify-and-mint", { qrData, quantity, notes });

// Activities endpoints
export const recordActivity = (
  data: Partial<Activity>
): Promise<AxiosResponse<Activity>> => api.post("/activity/record", data);

export const mintActivityNFT = (
  activityId: string
): Promise<AxiosResponse<Activity>> => api.post(`/activity/mint/${activityId}`);

export const getUserActivities = (): Promise<AxiosResponse<Activity[]>> =>
  api.get("/activity/user");

// User endpoints
export const getCurrentUser = (): Promise<AxiosResponse<User>> =>
  api.get("/user/profile");

export const updateProfile = (
  data: ProfileUpdateData
): Promise<AxiosResponse<User>> => api.put("/user/profile", data);

// Admin-only user endpoints
export const getAllUsers = (): Promise<AxiosResponse<User[]>> =>
  api.get("/user");

export const getUserById = (userId: string): Promise<AxiosResponse<User>> =>
  api.get(`/user/${userId}`);

export const updateUserRole = (
  userId: string,
  role: string
): Promise<AxiosResponse<User>> => api.put(`/user/${userId}/role`, { role });

// Event endpoints
export const getEvents = (): Promise<AxiosResponse<Event[]>> =>
  api.get("/event");

export const getEventById = (eventId: string): Promise<AxiosResponse<Event>> =>
  api.get(`/event/${eventId}`);

export const createEvent = (
  data: Partial<Event>
): Promise<AxiosResponse<Event>> => api.post("/event", data);

export const updateEvent = (
  eventId: string,
  data: Partial<Event>
): Promise<AxiosResponse<Event>> => api.put(`/event/${eventId}`, data);

export const deleteEvent = (
  eventId: string
): Promise<AxiosResponse<{ message: string }>> =>
  api.delete(`/event/${eventId}`);

export const joinEvent = (eventId: string): Promise<AxiosResponse<Event>> =>
  api.post(`/event/${eventId}/join`);

export const leaveEvent = (eventId: string): Promise<AxiosResponse<Event>> =>
  api.post(`/event/${eventId}/leave`);

export const getRewardsHistory = async (): Promise<RewardsResponse> => {
  const response = await api.get('/rewards/history');
  return response.data;
};

export const getUserNFTs = async (): Promise<NFTsResponse> => {
  const response = await api.get('/nft/user');
  return response.data;
};

export const getNFTDetails = async (nftId: string): Promise<NFTDetails> => {
  const response = await api.get(`/nft/${nftId}`);
  return response.data;
};

export default api;
