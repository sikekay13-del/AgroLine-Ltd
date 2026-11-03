export type CropCategory = 'grains' | 'legumes' | 'tubers' | 'oilseeds' | 'inputs';

export interface CropItem {
  id: string;
  sellerId?: string;
  name: string;
  variety: string;
  category: CropCategory;
  pricePerTonne: number; // in USD
  moistureContent: number; // percentage
  grade: 'Grade 1 (Premium)' | 'Grade 2 (Standard)' | 'Organic Certified';
  minimumOrderTonnes: number;
  availableStockTonnes: number;
  harvestDate: string;
  location: string;
  farmerName: string;
  farmerFarm: string;
  farmerRating: number;
  farmerCompletedDeals: number;
  image: string;
  description: string;
  packaging: string;
  certifications: string[];
}

export interface InventoryBatch {
  id: string;
  cropName: string;
  variety: string;
  category: CropCategory;
  lotNumber: string;
  quantityTonnes: number;
  pricePerTonne: number;
  moistureContent: number;
  grade: string;
  status: 'Available' | 'Reserved' | 'In Transit' | 'Sold Out';
  warehouseLocation: string;
  harvestDate: string;
  syncStatus?: 'synced' | 'pending_sync';
}

export interface CartItem {
  crop: CropItem;
  quantityTonnes: number;
}

export interface ShipmentCheckpoint {
  time: string;
  location: string;
  status: string;
  completed: boolean;
  notes?: string;
}

export interface ShipmentTracking {
  backendShipmentId?: string;
  canUpdate?: boolean;
  trackingNumber: string;
  orderId: string;
  cropName: string;
  quantityTonnes: number;
  carrier: string;
  driverName?: string;
  driverPhone?: string;
  origin: string;
  destination: string;
  status: string;
  progressPercentage: number;
  estimatedArrival: string;
  currentTempCelsius: number | null;
  currentHumidity: number | null;
  checkpoints: ShipmentCheckpoint[];
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'buyer' | 'seller';
  text: string;
  timestamp: string;
  proposal?: {
    cropName: string;
    tonnes: number;
    pricePerTonne: number;
    total: number;
    status: 'Pending' | 'Accepted' | 'Declined';
  };
}

export interface ChatThread {
  id: string;
  contactName: string;
  contactRole: string;
  contactFarm: string;
  avatarSeed: string;
  lastMessage: string;
  lastTimestamp: string;
  unreadCount: number;
  cropSubject: string;
  messages: ChatMessage[];
}
