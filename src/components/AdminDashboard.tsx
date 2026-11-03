import React, { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, ClipboardList, PackageCheck, RefreshCw, ShieldCheck, Users } from 'lucide-react';
import { AdminListing, AdminOrder, AdminSummary, AdminUser, adminBackend } from '../services/adminBackend';

type AdminSection = 'overview' | 'users' | 'listings' | 'orders';

const EMPTY_SUMMARY: AdminSummary = {
  users: 0,
  listings: 0,
  unlisted: 0,
  orders: 0,
  pending_orders: 0,
};

interface AdminDashboardProps {
  isAdmin: boolean;
  isSignedIn: boolean;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isAdmin, isSignedIn }) => {
  const [section, setSection] = useState<AdminSection>('overview');
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [notice, setNotice] = useState('');

  const refresh = useCallback(async () => {
    if (!isAdmin) return;
    setIsLoading(true);
    setErrorMessage('');
    try {
      const data = await adminBackend.loadDashboard();
      setSummary(data.summary);
      setUsers(data.users);
      setListings(data.listings);
      setOrders(data.orders);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not load admin data.');
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const moderateListing = async (listing: AdminListing) => {
    const note = window.prompt(
      listing.is_listed ? 'Why are you unlisting this item? (optional)' : 'Moderation note (optional)',
      listing.moderation_note,
    );
    if (note === null) return;
    setBusyId(listing.id);
    setErrorMessage('');
    try {
      await adminBackend.setListingVisibility(listing.id, !listing.is_listed, note);
      setNotice(listing.is_listed ? 'Listing removed from public marketplace.' : 'Listing is visible in the marketplace again.');
      await refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not moderate listing.');
    } finally {
      setBusyId(null);
    }
  };

  const updateOrder = async (order: AdminOrder, status: 'accepted' | 'rejected' | 'cancelled' | 'fulfilled') => {
    const confirmed = window.confirm(`Change order ${order.id.slice(0, 8)} to ${status}?`);
    if (!confirmed) return;
    setBusyId(order.id);
    setErrorMessage('');
    try {
      await adminBackend.updateOrderStatus(order.id, status);
      setNotice(`Order updated to ${status}. No payment was processed.`);
      await refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not update the order.');
    } finally {
      setBusyId(null);
    }
  };

  if (!isSignedIn || !isAdmin) {
    return (
      <section className="mx-auto max-w-2xl rounded-2xl border border-amber-300 bg-amber-50 p-8 text-center">
        <ShieldCheck className="mx-auto h-9 w-9 text-amber-800" />
        <h1 className="mt-3 text-xl font-bold text-stone-900">Administrator access required</h1>
        <p className="mt-2 text-sm text-stone-700">
          {isSignedIn
            ? 'This account has not been granted the admin role.'
            : 'Sign in with an account that has been granted the admin role.'}
        </p>
        <p className="mt-2 text-xs text-stone-600">Admin permissions are verified by Supabase database functions.</p>
      </section>
    );
  }

  const sections: Array<{ id: AdminSection; label: string }> = [
    { id: 'overview', label: 'Overview' },
    { id: 'users', label: 'Users' },
    { id: 'listings', label: 'Listings' },
    { id: 'orders', label: 'Orders' },
  ];

  return (
    <section className="space-y-6 pb-16">
      <header className="flex flex-col gap-4 border-b border-stone-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0D5C3A]">
            <ShieldCheck className="h-4 w-4" />
            Admin workspace
          </div>
          <h1 className="mt-1 text-3xl font-extrabold text-stone-900">Platform administration</h1>
          <p className="mt-1 text-sm text-stone-600">Review accounts, moderate public listings, and manage trade order status.</p>
        </div>
        <button onClick={() => void refresh()} disabled={isLoading} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-4 text-sm font-semibold text-stone-700 disabled:opacity-50">
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </header>

      {errorMessage && (
        <div role="alert" className="flex items-start gap-2 rounded-lg border border-rose-300 bg-rose-50 p-3 text-sm text-rose-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
      {notice && (
        <div role="status" className="flex items-start justify-between gap-3 rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-900">
          <span>{notice}</span>
          <button onClick={() => setNotice('')} aria-label="Dismiss notice">×</button>
        </div>
      )}

      <nav aria-label="Admin sections" className="flex gap-2 overflow-x-auto border-b border-stone-200">
        {sections.map((item) => (
          <button key={item.id} onClick={() => setSection(item.id)} aria-current={section === item.id ? 'page' : undefined} className={`min-h-10 whitespace-nowrap border-b-2 px-4 text-sm font-semibold ${section === item.id ? 'border-[#0D5C3A] text-[#0D5C3A]' : 'border-transparent text-stone-600 hover:text-stone-900'}`}>
            {item.label}
          </button>
        ))}
      </nav>

      {(section === 'overview' || section === 'users') && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Registered accounts', value: summary.users, icon: Users },
            { label: 'Inventory listings', value: summary.listings, icon: PackageCheck },
            { label: 'Unlisted for review', value: summary.unlisted, icon: AlertTriangle },
            { label: 'Orders · pending', value: `${summary.orders} · ${summary.pending_orders}`, icon: ClipboardList },
          ].map(({ label, value, icon: Icon }) => (
            <article key={label} className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between text-sm text-stone-600">
                <span>{label}</span>
                <Icon className="h-4 w-4 text-[#0D5C3A]" />
              </div>
              <p className="mt-2 text-2xl font-extrabold tabular-nums text-stone-900">{value}</p>
            </article>
          ))}
        </div>
      )}

      {(section === 'overview' || section === 'users') && (
        <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
          <div className="border-b border-stone-200 p-4">
            <h2 className="font-bold text-stone-900">Accounts</h2>
            <p className="mt-1 text-xs text-stone-600">Account directory. Grant or remove administrator access directly in Supabase SQL.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-stone-50 text-xs uppercase text-stone-600">
                <tr><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Listings</th><th className="p-3">Orders</th><th className="p-3">Joined</th></tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="p-3 font-medium text-stone-900">{user.display_name || '—'}</td>
                    <td className="p-3 text-stone-700">{user.email}</td>
                    <td className="p-3 tabular-nums">{user.inventory_count}</td>
                    <td className="p-3 tabular-nums">{user.order_count}</td>
                    <td className="p-3 text-stone-600">{new Date(user.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {users.length === 0 && <tr><td colSpan={5} className="p-5 text-center text-sm text-stone-600">{isLoading ? 'Loading accounts…' : 'No accounts found.'}</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(section === 'overview' || section === 'listings') && (
        <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
          <div className="border-b border-stone-200 p-4">
            <h2 className="font-bold text-stone-900">Inventory moderation</h2>
            <p className="mt-1 text-xs text-stone-600">Unlisting hides an item from buyers; it does not delete the seller’s record.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead className="bg-stone-50 text-xs uppercase text-stone-600">
                <tr><th className="p-3">Listing</th><th className="p-3">Seller</th><th className="p-3">Quantity</th><th className="p-3">Price / MT</th><th className="p-3">Visibility</th><th className="p-3">Moderation</th></tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {listings.map((listing) => (
                  <tr key={listing.id}>
                    <td className="p-3"><p className="font-semibold text-stone-900">{listing.crop_name}</p><p className="text-xs text-stone-500">{listing.lot_number} · {listing.category}</p></td>
                    <td className="p-3"><p>{listing.seller_name || 'Producer'}</p><p className="text-xs text-stone-500">{listing.seller_email}</p></td>
                    <td className="p-3 tabular-nums">{listing.quantity_tonnes} MT</td>
                    <td className="p-3 tabular-nums">${Number(listing.price_per_tonne).toLocaleString()}</td>
                    <td className="p-3"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${listing.is_listed ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-900'}`}>{listing.is_listed ? 'Listed' : 'Hidden'}</span></td>
                    <td className="p-3">
                      <button disabled={busyId === listing.id} onClick={() => void moderateListing(listing)} className="rounded-lg border border-stone-300 px-3 py-2 text-xs font-bold text-stone-700 disabled:opacity-50">
                        {listing.is_listed ? 'Hide listing' : 'Restore listing'}
                      </button>
                      {listing.moderation_note && <p className="mt-1 max-w-52 text-xs text-stone-500">{listing.moderation_note}</p>}
                    </td>
                  </tr>
                ))}
                {listings.length === 0 && <tr><td colSpan={6} className="p-5 text-center text-sm text-stone-600">{isLoading ? 'Loading listings…' : 'No listings found.'}</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(section === 'overview' || section === 'orders') && (
        <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
          <div className="border-b border-stone-200 p-4">
            <h2 className="font-bold text-stone-900">Trade orders</h2>
            <p className="mt-1 text-xs text-stone-600">Admin status changes are recorded in the database. No payment or escrow action is available.</p>
          </div>
          <div className="divide-y divide-stone-100">
            {orders.map((order) => (
              <article key={order.id} className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <p className="font-semibold text-stone-900">{order.buyer_organization} <span className="font-normal text-stone-500">· {order.status}</span></p>
                  <p className="mt-1 text-xs text-stone-600">Buyer: {order.buyer_email} · Seller: {order.seller_email}</p>
                  <p className="mt-1 text-xs text-stone-600">{order.items.map((item) => `${item.crop_name}: ${item.quantity_tonnes} MT`).join(' · ')}</p>
                  <p className="mt-1 text-xs text-stone-500">Destination: {order.delivery_address} · ${Number(order.subtotal).toLocaleString()} · {new Date(order.created_at).toLocaleString()}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {order.status === 'pending' && (
                    <>
                      <button disabled={busyId === order.id} onClick={() => void updateOrder(order, 'accepted')} className="rounded-lg bg-[#0D5C3A] px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Accept</button>
                      <button disabled={busyId === order.id} onClick={() => void updateOrder(order, 'rejected')} className="rounded-lg border border-stone-300 px-3 py-2 text-xs font-bold text-stone-700 disabled:opacity-50">Reject</button>
                      <button disabled={busyId === order.id} onClick={() => void updateOrder(order, 'cancelled')} className="rounded-lg border border-stone-300 px-3 py-2 text-xs font-bold text-stone-700 disabled:opacity-50">Cancel</button>
                    </>
                  )}
                  {order.status === 'accepted' && (
                    <button disabled={busyId === order.id} onClick={() => void updateOrder(order, 'fulfilled')} className="rounded-lg border border-stone-300 px-3 py-2 text-xs font-bold text-stone-700 disabled:opacity-50">Mark fulfilled</button>
                  )}
                </div>
              </article>
            ))}
            {orders.length === 0 && <p className="p-5 text-center text-sm text-stone-600">{isLoading ? 'Loading orders…' : 'No orders found.'}</p>}
          </div>
        </div>
      )}
    </section>
  );
};
