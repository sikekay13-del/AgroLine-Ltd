import { supabase } from './supabase';

export interface AdminSummary {
  users: number;
  listings: number;
  unlisted: number;
  orders: number;
  pending_orders: number;
}

export interface AdminUser {
  id: string;
  email: string;
  display_name: string;
  created_at: string;
  inventory_count: number;
  order_count: number;
}

export interface AdminListing {
  id: string;
  seller_id: string;
  seller_email: string;
  seller_name: string;
  crop_name: string;
  variety: string;
  category: string;
  lot_number: string;
  quantity_tonnes: number;
  price_per_tonne: number;
  status: string;
  is_listed: boolean;
  moderation_note: string;
  created_at: string;
}

export interface AdminOrder {
  id: string;
  buyer_id: string;
  buyer_email: string;
  seller_id: string;
  seller_email: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'fulfilled';
  buyer_organization: string;
  delivery_address: string;
  subtotal: number;
  created_at: string;
  items: Array<{
    crop_name: string;
    quantity_tonnes: number;
    price_per_tonne: number;
    line_total: number;
  }>;
}

const client = () => {
  if (!supabase) {
    throw new Error('Supabase is not configured. Configure the public project URL and anon/publishable key first.');
  }
  return supabase;
};

export const adminBackend = {
  async isAdmin(): Promise<boolean> {
    const { data: { user }, error: userError } = await client().auth.getUser();
    if (userError) throw userError;
    if (!user) return false;
    const { data, error } = await client().rpc('is_admin');
    if (error) throw error;
    return data === true;
  },

  async loadDashboard(): Promise<{
    summary: AdminSummary;
    users: AdminUser[];
    listings: AdminListing[];
    orders: AdminOrder[];
  }> {
    const [{ data: summary, error: summaryError }, { data: users, error: usersError }, { data: listings, error: listingsError }, { data: orders, error: ordersError }] = await Promise.all([
      client().rpc('admin_dashboard_summary'),
      client().rpc('admin_list_users'),
      client().rpc('admin_list_inventory'),
      client().rpc('admin_list_orders'),
    ]);
    if (summaryError) throw summaryError;
    if (usersError) throw usersError;
    if (listingsError) throw listingsError;
    if (ordersError) throw ordersError;
    return {
      summary: summary as AdminSummary,
      users: (users ?? []) as AdminUser[],
      listings: (listings ?? []) as AdminListing[],
      orders: (orders ?? []) as AdminOrder[],
    };
  },

  async setListingVisibility(id: string, isListed: boolean, moderationNote: string): Promise<void> {
    const { error } = await client().rpc('admin_set_listing_visibility', {
      p_inventory_id: id,
      p_is_listed: isListed,
      p_moderation_note: moderationNote,
    });
    if (error) throw error;
  },

  async updateOrderStatus(
    id: string,
    status: 'accepted' | 'rejected' | 'cancelled' | 'fulfilled',
  ): Promise<void> {
    const { error } = await client().rpc('admin_update_order_status', {
      p_order_id: id,
      p_status: status,
    });
    if (error) throw error;
  },
};
