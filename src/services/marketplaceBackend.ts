import { supabase } from './supabase';
import {
  ChatMessage,
  ChatThread,
  CropItem,
  InventoryBatch,
  ShipmentCheckpoint,
} from '../types';

type InventoryRow = {
  id: string;
  seller_id: string;
  crop_name: string;
  variety: string;
  category: CropItem['category'];
  lot_number: string;
  quantity_tonnes: number;
  price_per_tonne: number;
  minimum_order_tonnes: number;
  moisture_content: number;
  grade: string;
  status: InventoryBatch['status'];
  warehouse_location: string;
  harvest_date: string;
  image_url: string;
  description: string;
  packaging: string;
  certifications: string[];
  seller?: { display_name: string } | { display_name: string }[] | null;
};

export interface BackendShipment {
  id: string;
  order_id: string;
  tracking_number: string;
  carrier: string;
  origin: string;
  destination: string;
  status: string;
  estimated_arrival: string | null;
  seller_id: string;
  canUpdate: boolean;
  events: ShipmentCheckpoint[];
}

export interface BackendOrder {
  id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'fulfilled';
  buyer_organization: string;
  delivery_address: string;
  subtotal: number;
  created_at: string;
  buyer_id: string;
  seller_id: string;
  items: Array<{
    id: string;
    crop_name: string;
    variety: string;
    quantity_tonnes: number;
    price_per_tonne: number;
    line_total: number;
  }>;
}

const client = () => {
  if (!supabase) {
    throw new Error('Supabase is not configured. Add the public project URL and anon/publishable key to .env.local.');
  }
  return supabase;
};

const toInventoryBatch = (row: InventoryRow): InventoryBatch => ({
  id: row.id,
  cropName: row.crop_name,
  variety: row.variety,
  category: row.category,
  lotNumber: row.lot_number,
  quantityTonnes: Number(row.quantity_tonnes),
  pricePerTonne: Number(row.price_per_tonne),
  moistureContent: Number(row.moisture_content),
  grade: row.grade,
  status: row.status,
  warehouseLocation: row.warehouse_location,
  harvestDate: row.harvest_date,
  syncStatus: 'synced',
});

const toCropItem = (row: InventoryRow): CropItem => {
  const seller = Array.isArray(row.seller) ? row.seller[0] : row.seller;
  const sellerName = seller?.display_name || 'Agroline producer';
  return {
    id: row.id,
    sellerId: row.seller_id,
    name: row.crop_name,
    variety: row.variety,
    category: row.category,
    pricePerTonne: Number(row.price_per_tonne),
    moistureContent: Number(row.moisture_content),
    grade: row.grade as CropItem['grade'],
    minimumOrderTonnes: Number(row.minimum_order_tonnes),
    availableStockTonnes: Number(row.quantity_tonnes),
    harvestDate: row.harvest_date,
    location: row.warehouse_location,
    farmerName: sellerName,
    farmerFarm: sellerName,
    farmerRating: 0,
    farmerCompletedDeals: 0,
    image: row.image_url || '',
    description: row.description,
    packaging: row.packaging,
    certifications: row.certifications ?? [],
  };
};

export const marketplaceBackend = {
  async listMarketplaceInventory(): Promise<CropItem[]> {
    const { data, error } = await client()
      .from('inventory')
      .select('id, seller_id, crop_name, variety, category, lot_number, quantity_tonnes, price_per_tonne, minimum_order_tonnes, moisture_content, grade, status, warehouse_location, harvest_date, image_url, description, packaging, certifications, seller:profiles!inventory_seller_id_fkey(display_name)')
      .eq('status', 'Available')
      .gt('quantity_tonnes', 0)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return ((data ?? []) as InventoryRow[]).map(toCropItem);
  },

  async listMyInventory(userId: string): Promise<InventoryBatch[]> {
    const { data, error } = await client()
      .from('inventory')
      .select('id, seller_id, crop_name, variety, category, lot_number, quantity_tonnes, price_per_tonne, minimum_order_tonnes, moisture_content, grade, status, warehouse_location, harvest_date, image_url, description, packaging, certifications')
      .eq('seller_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return ((data ?? []) as InventoryRow[]).map(toInventoryBatch);
  },

  async createInventory(userId: string, batch: Omit<InventoryBatch, 'id' | 'syncStatus'>): Promise<InventoryBatch> {
    const { data, error } = await client()
      .from('inventory')
      .insert({
        seller_id: userId,
        crop_name: batch.cropName,
        variety: batch.variety,
        category: batch.category,
        lot_number: batch.lotNumber,
        quantity_tonnes: batch.quantityTonnes,
        price_per_tonne: batch.pricePerTonne,
        minimum_order_tonnes: 1,
        moisture_content: batch.moistureContent,
        grade: batch.grade,
        status: batch.status,
        warehouse_location: batch.warehouseLocation,
        harvest_date: batch.harvestDate,
      })
      .select('*')
      .single();
    if (error) throw error;
    return toInventoryBatch(data as InventoryRow);
  },

  async updateInventory(userId: string, id: string, updates: Partial<InventoryBatch>): Promise<void> {
    const payload: Record<string, unknown> = {};
    if (updates.cropName !== undefined) payload.crop_name = updates.cropName;
    if (updates.variety !== undefined) payload.variety = updates.variety;
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.lotNumber !== undefined) payload.lot_number = updates.lotNumber;
    if (updates.quantityTonnes !== undefined) payload.quantity_tonnes = updates.quantityTonnes;
    if (updates.pricePerTonne !== undefined) payload.price_per_tonne = updates.pricePerTonne;
    if (updates.moistureContent !== undefined) payload.moisture_content = updates.moistureContent;
    if (updates.grade !== undefined) payload.grade = updates.grade;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.warehouseLocation !== undefined) payload.warehouse_location = updates.warehouseLocation;
    if (updates.harvestDate !== undefined) payload.harvest_date = updates.harvestDate;

    const { error } = await client()
      .from('inventory')
      .update(payload)
      .eq('id', id)
      .eq('seller_id', userId);
    if (error) throw error;
  },

  async deleteInventory(userId: string, id: string): Promise<void> {
    const { error } = await client()
      .from('inventory')
      .delete()
      .eq('id', id)
      .eq('seller_id', userId);
    if (error) throw error;
  },

  async createOrder(
    items: Array<{ inventoryId: string; quantityTonnes: number }>,
    buyerOrganization: string,
    deliveryAddress: string,
  ): Promise<string> {
    const { data, error } = await client().rpc('create_trade_order', {
      p_items: items.map(({ inventoryId, quantityTonnes }) => ({
        inventory_id: inventoryId,
        quantity_tonnes: quantityTonnes,
      })),
      p_buyer_organization: buyerOrganization,
      p_delivery_address: deliveryAddress,
    });
    if (error) throw error;
    return data as string;
  },

  async updateOrderStatus(orderId: string, status: 'accepted' | 'rejected' | 'cancelled' | 'fulfilled'): Promise<void> {
    const { error } = await client().rpc('update_trade_order_status', {
      p_order_id: orderId,
      p_status: status,
    });
    if (error) throw error;
  },

  async listMyOrders(userId: string): Promise<BackendOrder[]> {
    const { data, error } = await client()
      .from('orders')
      .select('*, items:order_items(*)')
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as BackendOrder[];
  },

  async getOrCreateConversation(
    buyerId: string,
    sellerId: string,
    inventoryId: string | null,
    subject: string,
  ): Promise<string> {
    const { data, error } = await client().rpc('open_trade_conversation', {
      p_seller_id: sellerId,
      p_inventory_id: inventoryId,
      p_subject: subject,
      p_buyer_id: buyerId,
    });
    if (error) throw error;
    return data as string;
  },

  async listMyConversations(userId: string): Promise<ChatThread[]> {
    const { data, error } = await client()
      .from('conversations')
      .select(`
        id, buyer_id, seller_id, inventory_id, subject, created_at,
        buyer:profiles!conversations_buyer_id_fkey(display_name),
        seller:profiles!conversations_seller_id_fkey(display_name),
        messages(id, sender_id, content, proposal, created_at)
      `)
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order('created_at', { ascending: false });
    if (error) throw error;

    return (data ?? []).map((row: any) => {
      const isBuyer = row.buyer_id === userId;
      const contact = isBuyer ? row.seller : row.buyer;
      const messages = [...(row.messages ?? [])]
        .sort((a, b) => a.created_at.localeCompare(b.created_at))
        .map((message): ChatMessage => ({
          id: message.id,
          senderId: message.sender_id,
          senderName: message.sender_id === userId ? 'You' : contact?.display_name || 'Agroline user',
          senderRole: message.sender_id === row.buyer_id ? 'buyer' : 'seller',
          text: message.content,
          timestamp: new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          proposal: message.proposal ?? undefined,
        }));
      const lastMessage = messages[messages.length - 1];
      const contactName = contact?.display_name || 'Agroline user';
      return {
        id: row.id,
        contactName,
        contactRole: isBuyer ? 'Producer' : 'Buyer',
        contactFarm: contactName,
        avatarSeed: contactName.slice(0, 2).toUpperCase(),
        lastMessage: lastMessage?.text ?? 'Conversation started',
        lastTimestamp: lastMessage?.timestamp ?? '',
        unreadCount: 0,
        cropSubject: row.subject || 'Trade discussion',
        messages,
      };
    });
  },

  async sendMessage(
    conversationId: string,
    senderId: string,
    text: string,
    proposal?: ChatMessage['proposal'],
  ): Promise<void> {
    const { error } = await client().from('messages').insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content: text,
      proposal: proposal ?? null,
    });
    if (error) throw error;
  },

  async createShipment(input: {
    orderId: string;
    trackingNumber: string;
    carrier: string;
    origin: string;
    destination: string;
    estimatedArrival?: string;
    initialStatus: string;
  }): Promise<void> {
    const { error } = await client().rpc('create_order_shipment', {
      p_order_id: input.orderId,
      p_tracking_number: input.trackingNumber,
      p_carrier: input.carrier,
      p_origin: input.origin,
      p_destination: input.destination,
      p_estimated_arrival: input.estimatedArrival || null,
      p_status: input.initialStatus,
    });
    if (error) throw error;
  },

  async addShipmentEvent(
    shipmentId: string,
    status: string,
    location: string,
    notes = '',
  ): Promise<void> {
    const { error } = await client().rpc('append_shipment_event', {
      p_shipment_id: shipmentId,
      p_status: status,
      p_location: location,
      p_notes: notes,
    });
    if (error) throw error;
  },

  async listMyShipments(userId: string): Promise<BackendShipment[]> {
    const { data, error } = await client()
      .from('shipments')
      .select(`
        id, order_id, tracking_number, carrier, origin, destination, status, estimated_arrival,
        order:orders!shipments_order_id_fkey(seller_id),
        events:shipment_events(location, status, notes, occurred_at)
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;

    return (data ?? [])
      .map((shipment: any) => ({
        id: shipment.id,
        ...shipment,
        seller_id: shipment.order?.seller_id,
        canUpdate: shipment.order?.seller_id === userId,
        events: [...(shipment.events ?? [])]
          .sort((a, b) => a.occurred_at.localeCompare(b.occurred_at))
          .map((event): ShipmentCheckpoint => ({
            time: new Date(event.occurred_at).toLocaleString(),
            location: event.location,
            status: event.status,
            completed: true,
            notes: event.notes || undefined,
          })),
      }));
  },
};
