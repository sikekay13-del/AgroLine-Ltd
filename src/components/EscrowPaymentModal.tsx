import React, { useState } from 'react';
import { FileText, Info, X } from 'lucide-react';
import { motion } from 'motion/react';
import { CartItem } from '../types';

interface EscrowPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (cropId: string, quantity: number) => void;
  onRemoveItem: (cropId: string) => void;
  onPlaceOrder: (buyerOrganization: string, deliveryAddress: string) => void;
  isAuthenticated: boolean;
  isSubmitting: boolean;
}

export const EscrowPaymentModal: React.FC<EscrowPaymentModalProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onPlaceOrder,
  isAuthenticated,
  isSubmitting,
}) => {
  const [buyerOrganization, setBuyerOrganization] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  if (!isOpen) return null;

  const subtotal = cart.reduce(
    (sum, item) => sum + item.crop.pricePerTonne * item.quantityTonnes,
    0
  );
  const sellerIds = new Set(cart.map(({ crop }) => crop.sellerId).filter(Boolean));
  const canSubmit = isAuthenticated && !isSubmitting && sellerIds.size === 1 && cart.every(({ crop }) => Boolean(crop.sellerId));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 15 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6"
      >
        {/* Modal Top Header */}
        <div className="p-5 border-b border-stone-200 bg-stone-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#004D25] text-[#E69500] flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-display text-stone-900">
                Order request
              </h2>
              <p className="text-xs text-stone-500">
                Payment processing is not connected. No funds are transferred.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {cart.length === 0 ? (
          /* Empty Cart State */
          <div className="p-12 text-center space-y-4">
            <p className="text-sm font-bold text-stone-700 font-display">Your order cart is empty</p>
            <p className="text-sm text-stone-600">Browse active producer listings to start an order request.</p>
            <button
              onClick={onClose}
              className="px-5 py-2 text-xs font-bold text-white bg-[#004D25] rounded-xl hover:bg-[#00381B]"
            >
              Browse Commodities
            </button>
          </div>
        ) : (
          /* Order request form */
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (canSubmit) onPlaceOrder(buyerOrganization, deliveryAddress);
            }}
            className="p-6 sm:p-8 space-y-6"
          >
            {/* Itemized Cart List */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
                Selected Agricultural Commodities
              </h3>
              <div className="divide-y divide-stone-200 border border-stone-200 rounded-2xl overflow-hidden text-xs">
                {cart.map((item) => (
                  <div key={item.crop.id} className="p-3.5 flex items-center justify-between gap-4 bg-white">
                    <div className="flex-1">
                      <p className="font-bold text-stone-900 font-display text-sm">{item.crop.name}</p>
                      <p className="text-[11px] text-stone-500">{item.crop.variety} · Seller: {item.crop.farmerFarm}</p>
                      <p className="text-[11px] text-[#E69500] font-bold mt-0.5">
                        ${item.crop.pricePerTonne} / MT · Moisture: {item.crop.moistureContent}%
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-300 rounded-lg px-2 py-1">
                        <span className="text-[11px] text-stone-500 font-medium">Qty:</span>
                        <input
                          type="number"
                          min={item.crop.minimumOrderTonnes}
                          max={item.crop.availableStockTonnes}
                          step="0.01"
                          value={item.quantityTonnes}
                          onChange={(e) => onUpdateQuantity(item.crop.id, parseFloat(e.target.value) || item.crop.minimumOrderTonnes)}
                          className="w-14 text-center font-bold text-stone-900 tabular-nums focus:outline-none"
                        />
                        <span className="text-[11px] text-stone-500 font-medium">MT</span>
                      </div>

                      <span className="font-extrabold text-stone-900 tabular-nums min-w-[70px] text-right">
                        ${(item.crop.pricePerTonne * item.quantityTonnes).toLocaleString()}
                      </span>

                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.crop.id)}
                        className="text-stone-400 hover:text-rose-600 p-1 font-bold"
                        title="Remove commodity"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {sellerIds.size > 1 && (
              <p role="alert" className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
                Submit one order request per producer. Remove listings from other producers to continue.
              </p>
            )}

            {/* Buyer Delivery & Organization Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Purchasing Entity / Miller</label>
                <input
                  type="text"
                  required
                  value={buyerOrganization}
                  onChange={(e) => setBuyerOrganization(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#004D25]"
                />
              </div>
              <div>
                <label className="block font-bold text-stone-700 mb-1">Destination Silo / Warehouse Address</label>
                <input
                  type="text"
                  required
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#004D25]"
                />
              </div>
            </div>

              <div role="status" className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-stone-800">
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-800" />
                <div>
                  <p className="font-bold">Order request only — payment is not connected</p>
                  <p className="mt-1 text-stone-700">Submitting records a pending order and reserves the listed stock. It does not authorize, charge, or hold funds.</p>
                </div>
              </div>

            {/* Order estimate */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Estimated product subtotal</span>
                <span className="tabular-nums font-bold text-stone-900">${subtotal.toLocaleString()}</span>
              </div>
              <p className="pt-2 border-t border-stone-200 text-stone-600">
                Freight, taxes, and payment are not calculated or collected by this site.
              </p>
            </div>

            <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-700 flex items-start gap-2">
              <div>
                <strong>Payment:</strong> Not collected here. Agree payment and delivery terms directly with the producer.
              </div>
            </div>

            {/* Submit Action */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 border border-stone-300 text-stone-700 rounded-xl text-xs font-bold hover:bg-stone-50 transition"
              >
                Back to Market
              </button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={!canSubmit}
                title={!isAuthenticated ? 'Sign in to submit an order request' : sellerIds.size > 1 ? 'Create one order per seller' : 'Payment processing is not connected'}
                className="px-6 py-2.5 bg-[#0D5C3A] text-white rounded-lg text-sm font-bold disabled:bg-stone-300 disabled:text-stone-600 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <span>{isSubmitting ? 'Submitting…' : !isAuthenticated ? 'Sign in to order' : 'Submit order request'}</span>
              </motion.button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};
