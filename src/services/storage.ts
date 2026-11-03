import { CropItem, InventoryBatch, CartItem, ShipmentTracking, ChatThread } from '../types';

const KEYS = {
  CROPS: 'agroline_crops_v5',
  INVENTORY: 'agroline_farmer_inventory_v4',
  CART: 'agroline_cart_v5',
  SHIPMENTS: 'agroline_shipments_v4',
  THREADS: 'agroline_chat_threads_v4',
  OFFLINE_QUEUE: 'agroline_offline_queue_v4',
  SIMULATED_OFFLINE: 'agroline_simulated_offline_v4',
};

const readStoredArray = <T,>(key: string, excludedIds: readonly string[] = []): T[] => {
  try {
    const data = localStorage.getItem(key);
    if (!data) return [];
    const parsed: unknown = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    const excluded = new Set(excludedIds);
    return parsed.filter((item): item is T => {
      if (typeof item !== 'object' || item === null) return false;
      const id = 'id' in item && typeof item.id === 'string' ? item.id : '';
      const trackingNumber = 'trackingNumber' in item && typeof item.trackingNumber === 'string'
        ? item.trackingNumber
        : '';
      return !excluded.has(id) && !excluded.has(trackingNumber);
    });
  } catch (error) {
    console.error(`Could not read saved ${key} data.`, error);
    return [];
  }
};

export interface OfflineAction {
  id: string;
  type: 'add_inventory' | 'update_inventory' | 'delete_inventory' | 'send_message' | 'create_order';
  payload: any;
  timestamp: string;
  description: string;
}

export const storageService = {
  // Crops
  getCrops(): CropItem[] {
    return readStoredArray<CropItem>(KEYS.CROPS, [
      'crop-flagship-rice',
      'crop-1',
      'crop-2',
      'crop-3',
      'crop-4',
      'crop-5',
      'crop-6',
    ]);
  },

  saveCrops(crops: CropItem[]): void {
    try {
      localStorage.setItem(KEYS.CROPS, JSON.stringify(crops));
    } catch (e) {
      console.error('Storage error', e);
    }
  },

  // Farmer Inventory
  getInventory(): InventoryBatch[] {
    return readStoredArray<InventoryBatch>(KEYS.INVENTORY, [
      'batch-rice-01',
      'batch-01',
      'batch-02',
      'batch-03',
      'batch-04',
    ]);
  },

  saveInventory(inventory: InventoryBatch[]): void {
    try {
      localStorage.setItem(KEYS.INVENTORY, JSON.stringify(inventory));
    } catch (e) {
      console.error('Storage error', e);
    }
  },

  // Cart
  getCart(): CartItem[] {
    return readStoredArray<CartItem>(KEYS.CART);
  },

  saveCart(cart: CartItem[]): void {
    try {
      localStorage.setItem(KEYS.CART, JSON.stringify(cart));
    } catch (e) {
      console.error('Storage error', e);
    }
  },

  // Shipments
  getShipments(): ShipmentTracking[] {
    return readStoredArray<ShipmentTracking>(KEYS.SHIPMENTS, [
      'AGRO-TRK-88294',
      'AGRO-TRK-77312',
      'AGRO-TRK-66104',
    ]);
  },

  saveShipments(shipments: ShipmentTracking[]): void {
    try {
      localStorage.setItem(KEYS.SHIPMENTS, JSON.stringify(shipments));
    } catch (e) {
      console.error('Storage error', e);
    }
  },

  // Chat Threads
  getChatThreads(): ChatThread[] {
    return readStoredArray<ChatThread>(KEYS.THREADS, [
      'thread-1',
      'thread-2',
      'thread-3',
    ]);
  },

  saveChatThreads(threads: ChatThread[]): void {
    try {
      localStorage.setItem(KEYS.THREADS, JSON.stringify(threads));
    } catch (e) {
      console.error('Storage error', e);
    }
  },

  // Offline Sync Queue
  getOfflineQueue(): OfflineAction[] {
    try {
      const data = localStorage.getItem(KEYS.OFFLINE_QUEUE);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addToOfflineQueue(action: Omit<OfflineAction, 'id' | 'timestamp'>): OfflineAction {
    const queue = this.getOfflineQueue();
    const newAction: OfflineAction = {
      ...action,
      id: `queue-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    queue.push(newAction);
    try {
      localStorage.setItem(KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
    } catch (e) {
      console.error(e);
    }
    return newAction;
  },

  clearOfflineQueue(): void {
    try {
      localStorage.removeItem(KEYS.OFFLINE_QUEUE);
    } catch (e) {
      console.error(e);
    }
  },

  getSimulatedOffline(): boolean {
    try {
      return localStorage.getItem(KEYS.SIMULATED_OFFLINE) === 'true';
    } catch {
      return false;
    }
  },

  setSimulatedOffline(val: boolean): void {
    try {
      localStorage.setItem(KEYS.SIMULATED_OFFLINE, String(val));
    } catch (e) {
      console.error(e);
    }
  },
};
