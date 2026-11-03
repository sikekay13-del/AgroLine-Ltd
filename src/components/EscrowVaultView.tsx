import React, { useState } from 'react';
import { ShieldCheck, Lock, CheckCircle2, AlertCircle, ArrowUpRight, DollarSign, Clock, FileCheck } from 'lucide-react';
import { EscrowTransaction } from '../types';
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
  transactions: EscrowTransaction[];
  onOpenTracking: (trackingNumber: string) => void;
  onReleaseEscrow: (id: string) => void;
  orders?: BackendOrder[];
  currentUserId?: string | null;
  onUpdateOrderStatus?: (orderId: string, status: 'accepted' | 'rejected' | 'cancelled' | 'fulfilled') => void;
  onCreateShipment?: OrderShipmentFormProps['onCreateShipment'];
}

export const EscrowVaultView: React.FC<EscrowVaultViewProps> = ({
  transactions,
  onOpenTracking,
  onReleaseEscrow,
  orders = [],
  currentUserId = null,
  onUpdateOrderStatus,
  onCreateShipment,
}) => {
  const totalHeld = transactions
    .filter((t) => t.escrowStatus === 'Held in Escrow')
    .reduce((sum, t) => sum + t.totalAmount, 0);

  const totalDisbursed = transactions
    .filter((t) => t.escrowStatus === 'Released to Farmer')
    .reduce((sum, t) => sum + t.totalAmount, 0);

  return (
    <div className="pb-16">
      <div className="space-y-8">
          {/* Header */}
          <div className="pb-6 border-b border-stone-100">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#48B749] mb-1">
              <span>Order Summary</span>
              <span aria-hidden="true">·</span>
              <span>Stored Transaction Records</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-stone-900">
              The Escrow Vault · Payment Status
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Payment processing is not connected, and no funds are held or transferred. Sample escrow records below are local demo data.
            </p>
          </div>

          {/* Escrow Value Overview Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                <span className="font-medium">Active order value (local records)</span>
                <Lock className="w-4 h-4 text-[#F7B500]" />
              </div>
              <p className="text-2xl font-extrabold font-display text-stone-900 tabular-nums">
                ${totalHeld.toLocaleString()}
              </p>
              <p className="text-xs text-stone-600 mt-1">No funds are held by this site</p>
            </div>

            <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                <span className="font-medium">Marked released in records</span>
                <CheckCircle2 className="w-4 h-4 text-[#48B749]" />
              </div>
              <p className="text-2xl font-extrabold font-display text-[#0D5C3A] tabular-nums">
                ${totalDisbursed.toLocaleString()}
              </p>
              <p className="text-xs text-stone-600 mt-1">No transfer is initiated here</p>
            </div>

            <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                <span className="font-medium">Payment connection</span>
                <Clock className="w-4 h-4 text-[#F7B500]" />
              </div>
              <p className="text-2xl font-extrabold font-display text-stone-900 tabular-nums">
                Not connected
              </p>
              <p className="text-xs text-stone-600 mt-1">Checkout cannot transfer funds</p>
            </div>
          </div>

          {onUpdateOrderStatus && (
            <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xs">
              <div className="border-b border-stone-200 bg-stone-50/50 p-5">
                <h2 className="font-bold text-stone-900">Shared trade orders</h2>
                <p className="mt-1 text-sm text-stone-600">These are order requests stored in Supabase; they are not paid or held in escrow.</p>
              </div>
              {orders.length === 0 ? (
                <p className="p-6 text-sm text-stone-600">No shared orders yet.</p>
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
                          <p className="mt-1 text-xs font-semibold text-stone-800">Illustrative subtotal: ${Number(order.subtotal).toLocaleString()}</p>
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
          )}

          {/* Order and delivery workflow */}
          <div className="bg-stone-50/70 p-6 rounded-2xl border border-stone-200 shadow-2xs">
            <h2 className="text-base font-bold font-display text-stone-900 mb-4">
              Order and delivery workflow
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-white border border-stone-200 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-[#0D5C3A] text-white flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <h3 className="font-bold text-stone-900 font-display">Review order</h3>
                <p className="text-stone-600 leading-relaxed text-[11px]">
                  Review the selected lots and estimated total. This site does not accept or hold deposits.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-stone-200 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-[#0D5C3A] text-white flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <h3 className="font-bold text-stone-900 font-display">Shipment status</h3>
                <p className="text-stone-600 leading-relaxed text-[11px]">
                  Shipment details are stored locally; no carrier service is connected to this page.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-stone-200 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-[#0D5C3A] text-white flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <h3 className="font-bold text-stone-900 font-display">Delivery review</h3>
                <p className="text-stone-600 leading-relaxed text-[11px]">
                  Record the intended inspection steps for a delivery. No inspection data is received here.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-stone-200 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-[#0D5C3A] text-white flex items-center justify-center font-bold text-xs">
                  4
                </div>
                <h3 className="font-bold text-stone-900 font-display">Release status</h3>
                <p className="text-stone-600 leading-relaxed text-[11px]">
                  Updating a row changes its local status only; it does not transfer money.
                </p>
              </div>
            </div>
          </div>

          {/* Escrow Ledger Table */}
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs">
            <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/50">
              <div>
                <h2 className="text-base font-bold font-display text-stone-900">Order status register</h2>
                <p className="text-sm text-stone-600 mt-0.5">Stored records from this browser, not payment transactions.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-100 text-stone-600 uppercase font-semibold text-[10px] tracking-wider border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Contract / Order</th>
                    <th className="py-3 px-4">Commodity / Volume</th>
                    <th className="py-3 px-4">Buyer &amp; Producer</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Escrow Status</th>
                    <th className="py-3 px-4">Waybill</th>
                    <th className="py-3 px-4 text-right">Settlement Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-stone-50 transition">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-stone-900 font-display text-sm">{tx.orderNumber}</p>
                        <p className="text-[11px] text-stone-500">{tx.createdAt}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-stone-900">{tx.cropName}</p>
                        <p className="text-[11px] text-stone-500 tabular-nums">{tx.quantityTonnes} Metric Tonnes</p>
                      </td>
                      <td className="py-3.5 px-4 text-[11px]">
                        <p className="text-stone-900">Buyer: <span className="font-medium">{tx.buyerName}</span></p>
                        <p className="text-stone-500">Seller: {tx.sellerName}</p>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-stone-900 tabular-nums text-sm">
                        ${tx.totalAmount.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            tx.escrowStatus === 'Released to Farmer'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {tx.escrowStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => onOpenTracking(tx.trackingNumber)}
                          className="text-xs font-bold text-[#0D5C3A] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>{tx.trackingNumber}</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {tx.escrowStatus === 'Held in Escrow' ? (
                          <button
                            onClick={() => onReleaseEscrow(tx.id)}
                            className="px-3 py-1 bg-[#0D5C3A] hover:bg-[#094B2E] text-white rounded-lg font-bold text-[11px] transition shadow-xs cursor-pointer"
                          >
                            Mark released locally
                          </button>
                        ) : (
                          <span className="text-emerald-700 font-semibold text-xs">Marked released</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
    </div>
  );
};
