import React, { useState } from 'react';
import { BackendOrder } from '../services/marketplaceBackend';

interface OrderShipmentFormProps {
  orderId: string;
  onCreateShipment: (input: {
    orderId: string;
    trackingNumber: string;
    carrier: string;
    origin: string;
    destination: string;
    estimatedArrival?: string;
    initialStatus: string;
  }) => Promise<void>;
}

const OrderShipmentForm: React.FC<OrderShipmentFormProps> = ({ orderId, onCreateShipment }) => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [estimatedArrival, setEstimatedArrival] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await onCreateShipment({
        orderId,
        trackingNumber,
        carrier,
        origin,
        destination,
        estimatedArrival: estimatedArrival || undefined,
        initialStatus: 'Label created',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 grid gap-2 rounded-xl border border-stone-200 bg-stone-50 p-3 sm:grid-cols-2">
      <input required value={trackingNumber} onChange={(event) => setTrackingNumber(event.target.value)} placeholder="Tracking number" className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs" />
      <input required value={carrier} onChange={(event) => setCarrier(event.target.value)} placeholder="Carrier" className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs" />
      <input required value={origin} onChange={(event) => setOrigin(event.target.value)} placeholder="Origin" className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs" />
      <input required value={destination} onChange={(event) => setDestination(event.target.value)} placeholder="Destination" className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs" />
      <label className="text-xs text-stone-600">Estimated arrival
        <input type="date" value={estimatedArrival} onChange={(event) => setEstimatedArrival(event.target.value)} className="mt-1 block w-full rounded-lg border border-stone-300 bg-white px-3 py-2" />
      </label>
      <button type="submit" disabled={isSubmitting} className="self-end rounded-lg bg-[#0D5C3A] px-3 py-2 text-xs font-bold text-white disabled:opacity-50">
        {isSubmitting ? 'Saving…' : 'Add shipment tracking'}
      </button>
    </form>
  );
};

interface EscrowVaultViewProps {
  orders: BackendOrder[];
  currentUserId: string | null;
  isShared: boolean;
  onUpdateOrderStatus: (orderId: string, status: 'accepted' | 'rejected' | 'cancelled' | 'fulfilled') => void;
  onCreateShipment?: OrderShipmentFormProps['onCreateShipment'];
}

export const EscrowVaultView: React.FC<EscrowVaultViewProps> = ({
  orders,
  currentUserId,
  isShared,
  onUpdateOrderStatus,
  onCreateShipment,
}) => {
  return (
    <div className="pb-16">
      <div className="space-y-8">
          {/* Header */}
          <div className="pb-6 border-b border-stone-100">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#48B749] mb-1">
              <span>Buyer &amp; Producer Orders</span>
              <span aria-hidden="true">·</span>
              <span>{isShared ? 'Shared order requests' : 'Shared service unavailable'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-stone-900">
              Orders and delivery
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Review requests and seller-entered shipment details. Payments and carrier updates are not connected.
            </p>
          </div>

          <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xs">
              <div className="border-b border-stone-200 bg-stone-50/50 p-5">
                <h2 className="font-bold text-stone-900">Shared trade orders</h2>
                <p className="mt-1 text-sm text-stone-600">Order requests are stored in Supabase; no payment is collected or held.</p>
              </div>
              {orders.length === 0 ? (
                <p className="p-6 text-sm text-stone-600">
                  {isShared ? 'No shared order requests yet.' : 'Sign in with the shared Supabase service configured to view order requests.'}
                </p>
              ) : (
                <div className="divide-y divide-stone-200">
                  {orders.map((order) => {
                    const isSeller = order.seller_id === currentUserId;
                    return (
                      <article key={order.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-semibold text-stone-900">{order.buyer_organization}</p>
                          <p className="mt-1 text-xs text-stone-600">{order.items.map((item) => `${item.crop_name} · ${item.quantity_tonnes} MT`).join(', ')}</p>
                          <p className="mt-1 text-xs text-stone-500">Deliver to: {order.delivery_address}</p>
                          <p className="mt-1 text-xs font-semibold text-stone-800">Order subtotal: ${Number(order.subtotal).toLocaleString()}</p>
                          <p className="mt-1 text-[11px] text-stone-500">{new Date(order.created_at).toLocaleString()}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold capitalize text-stone-700">{order.status}</span>
                          {order.status === 'pending' && isSeller && (
                            <>
                              <button onClick={() => onUpdateOrderStatus(order.id, 'accepted')} className="rounded-lg bg-[#0D5C3A] px-3 py-2 text-xs font-bold text-white">Accept request</button>
                              <button onClick={() => onUpdateOrderStatus(order.id, 'rejected')} className="rounded-lg border border-stone-300 px-3 py-2 text-xs font-bold text-stone-700">Decline</button>
                            </>
                          )}
                          {order.status === 'pending' && !isSeller && (
                            <button onClick={() => onUpdateOrderStatus(order.id, 'cancelled')} className="rounded-lg border border-stone-300 px-3 py-2 text-xs font-bold text-stone-700">Cancel request</button>
                          )}
                        </div>
                        {order.status === 'accepted' && isSeller && onCreateShipment && (
                          <div className="basis-full">
                            <OrderShipmentForm orderId={order.id} onCreateShipment={onCreateShipment} />
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
          </section>

          {/* Order and shipment limitations */}
          <div className="bg-stone-50/70 p-6 rounded-2xl border border-stone-200 shadow-2xs">
            <h2 className="text-base font-bold font-display text-stone-900 mb-4">What this page supports</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-white border border-stone-200 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-[#0D5C3A] text-white flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <h3 className="font-bold text-stone-900 font-display">Order requests</h3>
                <p className="text-stone-600 leading-relaxed text-[11px]">
                  Buyers can submit requests; producers can accept or decline. This does not create a payment obligation through this site.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-stone-200 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-[#0D5C3A] text-white flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <h3 className="font-bold text-stone-900 font-display">Shipment records</h3>
                <p className="text-stone-600 leading-relaxed text-[11px]">
                  Sellers may record shipment details for accepted orders. Carrier verification and live tracking are not connected.
                </p>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};
