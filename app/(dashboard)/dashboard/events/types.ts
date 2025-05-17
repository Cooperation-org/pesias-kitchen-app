// types.ts
export interface Participant {
  _id: string;
  walletAddress: string;
  name: string;
  role: 'volunteer' | 'recipient';
  quantity?: number;
  status: 'registered' | 'attended' | 'cancelled';
}

export interface ServerEvent {
    _id: string;
    title: string;
    description: string;
    date: string; 
    time: string;
    location: string;
    capacity: number;
    defaultQuantity: number;
    activityType: 'food_sorting' | 'food_distribution' | 'food_pickup';
    participants: Participant[];
    createdBy: { 
      _id: string; 
      walletAddress: string; 
      name: string;
    };
    createdAt: string;
    __v: number;
    hasQrCode?: boolean;
  }
  
  export interface ProcessedEvent {
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    capacity: number;
    activityType: 'food_sorting' | 'food_distribution' | 'food_pickup';
    participants: Participant[];
    createdBy: { 
      id: string; 
      walletAddress: string; 
      name: string;
    };
    createdAt: string;
    hasQrCode?: boolean;
    qrCodeType?: 'volunteer' | 'recipient';
  }
  
  export type TimeFilter = 'upcoming' | 'past' | 'all';
  
  export const ACTIVITY_TYPE_LABELS = {
    food_sorting: 'Food Sorting',
    food_distribution: 'Food Distribution',
    food_pickup: 'Food Pickup',
  };
  
  export const ACTIVITY_TYPE_COLORS = {
    food_sorting: 'bg-blue-100 text-blue-800 border-blue-300',
    food_distribution: 'bg-green-100 text-green-800 border-green-300',
    food_pickup: 'bg-purple-100 text-purple-800 border-purple-300',
  };
  
  export const ACTIVITY_TYPE_GRADIENTS = {
    food_sorting: 'from-blue-500/20 to-blue-600/5',
    food_distribution: 'from-green-500/20 to-green-600/5',
    food_pickup: 'from-purple-500/20 to-purple-600/5',
  };