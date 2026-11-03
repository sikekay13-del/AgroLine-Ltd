import { CropItem, InventoryBatch, CartItem, EscrowTransaction, ShipmentTracking, ChatThread } from '../types';
import { INITIAL_CROPS, INITIAL_FARMER_INVENTORY, INITIAL_ESCROW_TRANSACTIONS, INITIAL_SHIPMENTS, INITIAL_CHAT_THREADS } from '../data/mockData';

const KEYS = {
  CROPS: 'agroline_crops_v5',
  INVENTORY: 'agroline_farmer_inventory_v4',
  CART: 'agroline_cart_v4',
  ESCROW: 'agroline_escrow_v4',
  SHIPMENTS: 'agroline_shipments_v4',
  THREADS: 'agroline_chat_threads_v4',
  OFFLINE_QUEUE: 'agroline_offline_queue_v4',
  SIMULATED_OFFLINE: 'agroline_simulated_offline_v4',
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
    try {
      const data = localStorage.getItem(KEYS.CROPS);
      if (!data) {
        localStorage.setItem(KEYS.CROPS, JSON.stringify(INITIAL_CROPS));
        return INITIAL_CROPS;
      }
      const parsed = JSON.parse(data);
      // Ensure valid crops with real images
      if (!Array.isArray(parsed) || parsed.length === 0 || parsed[0].image.includes('/assets/commodities/')) {
        localStorage.setItem(KEYS.CROPS, JSON.stringify(INITIAL_CROPS));
        return INITIAL_CROPS;
      }
      return parsed;
    } catch {
      return INITIAL_CROPS;
    }
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
    try {
      const data = localStorage.getItem(KEYS.INVENTORY);
      if (!data) {
        localStorage.setItem(KEYS.INVENTORY, JSON.stringify(INITIAL_FARMER_INVENTORY));
        return INITIAL_FARMER_INVENTORY;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_FARMER_INVENTORY;
    }
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
    try {
      const data = localStorage.getItem(KEYS.CART);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveCart(cart: CartItem[]): void {
    try {
      localStorage.setItem(KEYS.CART, JSON.stringify(cart));
    } catch (e) {
      console.error('Storage error', e);
    }
  },

  // Escrow
  getEscrowTransactions(): EscrowTransaction[] {
    try {
      const data = localStorage.getItem(KEYS.ESCROW);
      if (!data) {
        localStorage.setItem(KEYS.ESCROW, JSON.stringify(INITIAL_ESCROW_TRANSACTIONS));
        return INITIAL_ESCROW_TRANSACTIONS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_ESCROW_TRANSACTIONS;
    }
  },

  saveEscrowTransactions(txs: EscrowTransaction[]): void {
    try {
      localStorage.setItem(KEYS.ESCROW, JSON.stringify(txs));
    } catch (e) {
      console.error('Storage error', e);
    }
  },

  // Shipments
  getShipments(): ShipmentTracking[] {
    try {
      const data = localStorage.getItem(KEYS.SHIPMENTS);
      if (!data) {
        localStorage.setItem(KEYS.SHIPMENTS, JSON.stringify(INITIAL_SHIPMENTS));
        return INITIAL_SHIPMENTS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_SHIPMENTS;
    }
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
    try {
      const data = localStorage.getItem(KEYS.THREADS);
      if (!data) {
        localStorage.setItem(KEYS.THREADS, JSON.stringify(INITIAL_CHAT_THREADS));
        return INITIAL_CHAT_THREADS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_CHAT_THREADS;
    }
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
