import React, { useState } from 'react';
import { Plus, Package, TrendingUp, ShieldCheck, Truck, RefreshCw, AlertCircle, CheckCircle, Trash2, Edit2, Download, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { InventoryBatch, CropCategory } from '../types';
import { BackendOrder } from '../services/marketplaceBackend';

interface FarmerDashboardProps {
  inventory: InventoryBatch[];
  orders: BackendOrder[];
  onAddBatch: (batch: Omit<InventoryBatch, 'id'>) => void;
  onUpdateBatch: (id: string, updates: Partial<InventoryBatch>) => void;
  onDeleteBatch: (id: string) => void;
  isOnline: boolean;
  isShared?: boolean;
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({
  inventory,
  orders,
  onAddBatch,
  onUpdateBatch,
  onDeleteBatch,
  isOnline,
  isShared = false,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState<InventoryBatch | null>(null);

  // New batch form state
  const [cropName, setCropName] = useState('');
  const [variety, setVariety] = useState('');
  const [category, setCategory] = useState<CropCategory>('grains');
  const [lotNumber, setLotNumber] = useState('');
  const [quantityTonnes, setQuantityTonnes] = useState<number>(0);
  const [pricePerTonne, setPricePerTonne] = useState<number>(0);
  const [moistureContent, setMoistureContent] = useState<number>(0);
  const [grade, setGrade] = useState('');
  const [warehouseLocation, setWarehouseLocation] = useState('');
  const [harvestDate, setHarvestDate] = useState('');

  // Compute metrics
  const totalStockMT = inventory.reduce((acc, curr) => acc + curr.quantityTonnes, 0);
  const totalValuation = inventory.reduce((acc, curr) => acc + curr.quantityTonnes * curr.pricePerTonne, 0);
  const pendingSyncCount = inventory.filter((b) => b.syncStatus === 'pending_sync').length;

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    onAddBatch({
      cropName,
      variety,
      category,
      lotNumber,
      quantityTonnes,
      pricePerTonne,
      moistureContent,
      grade,
      status: 'Available',
      warehouseLocation,
      harvestDate,
      syncStatus: isShared && isOnline ? 'synced' : 'pending_sync',
    });
    setShowAddModal(false);
    // Reset defaults
    setCropName('');
    setVariety('');
    setLotNumber('');
    setQuantityTonnes(0);
    setPricePerTonne(0);
    setMoistureContent(0);
    setGrade('');
    setWarehouseLocation('');
    setHarvestDate('');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBatch) return;
    onUpdateBatch(editingBatch.id, {
      cropName: editingBatch.cropName,
      quantityTonnes: editingBatch.quantityTonnes,
      pricePerTonne: editingBatch.pricePerTonne,
      moistureContent: editingBatch.moistureContent,
      status: editingBatch.status,
      warehouseLocation: editingBatch.warehouseLocation,
      syncStatus: isShared && isOnline ? 'synced' : 'pending_sync',
    });
    setEditingBatch(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="pb-16"
    >
      <div className="space-y-8">
          {/* Header with Title and Add Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#48B749] mb-1">
                <Sparkles className="w-3.5 h-3.5 text-[#F7B500]" />
                <span>Producer Inventory</span>
                <span aria-hidden="true">·</span>
                <span>{isShared ? 'Shared Inventory Portal' : 'Local-only inventory'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-stone-900">
                Farmer Hub · Silo &amp; Inventory Terminal
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 mt-1">
                Record inventory and manage current order requests. Payment processing is not connected.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-5 py-3 bg-[#0D5C3A] hover:bg-[#094B2E] text-white text-xs font-bold rounded-xl shadow-md transition whitespace-nowrap cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#F7B500]" />
                <span>Add Harvest Batch</span>
              </motion.button>
            </div>
          </div>

      {/* KPI Stat Cards with Framer Motion Stagger */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs"
        >
          <div className="flex items-center justify-between text-sm text-stone-600 mb-2">
            <span className="font-medium">{isShared ? 'Your shared inventory' : 'Inventory on this device'}</span>
            <Package className="w-4 h-4 text-[#0D5C3A]" />
          </div>
          <p className="text-2xl font-extrabold font-display text-stone-900 tabular-nums">
            {totalStockMT.toLocaleString()} <span className="text-sm font-normal text-stone-500">MT</span>
          </p>
          <p className="text-xs text-stone-600 mt-1">Across {inventory.length} {isShared ? 'published lots' : 'stored lots'}</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs"
        >
          <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
            <span className="font-medium">Inventory Valuation</span>
            <TrendingUp className="w-4 h-4 text-[#F7B500]" />
          </div>
          <p className="text-2xl font-extrabold font-display text-[#0D5C3A] tabular-nums">
            ${totalValuation.toLocaleString()}
          </p>
          <p className="text-[11px] text-stone-500 mt-1">Based on producer-entered prices</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs"
        >
          <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
            <span className="font-medium">Order requests</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold font-display text-stone-900 tabular-nums">
            {orders.length}
          </p>
          <p className="text-[11px] text-stone-500 mt-1">No payment or escrow processing</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs"
        >
          <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
            <span className="font-medium">Field Sync Status</span>
            <RefreshCw className={`w-4 h-4 ${!isOnline ? 'text-amber-600 animate-spin' : 'text-emerald-700'}`} />
          </div>
          <p className="text-base font-bold font-display text-stone-900 mt-1">
            {!isOnline ? (
              <span className="text-amber-800">{isShared ? 'Offline (cloud unavailable)' : 'Offline (Local Cache)'}</span>
            ) : !isShared ? (
              <span className="text-stone-700">Local only</span>
            ) : pendingSyncCount > 0 ? (
              <span className="text-amber-700">{pendingSyncCount} not synced</span>
            ) : (
              <span className="text-emerald-800">Synced to Cloud</span>
            )}
          </p>
          <p className="text-[11px] text-stone-500 mt-1">
            {!isOnline ? 'Shared updates unavailable while offline' : isShared ? 'Shared records are current' : 'Records stay on this device'}
          </p>
        </motion.div>
      </div>

      {/* Harvest Batches & Inventory Management Table */}
      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="p-5 sm:p-6 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50/70">
          <div>
            <h2 className="text-base font-bold text-stone-900 font-display">Active Farm Batches & Silo Lots</h2>
            <p className="text-sm text-stone-600 mt-1">{isShared ? 'Inventory shared with your producer account.' : 'Inventory records are saved on this device only.'}</p>
          </div>
          <div className="text-xs text-stone-500 flex items-center gap-3">
            <span>Click actions to calibrate or edit</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-100/80 text-stone-600 uppercase font-semibold text-[10px] tracking-wider border-b border-stone-200">
              <tr>
                <th className="py-3 px-4">Lot ID / Crop</th>
                <th className="py-3 px-4">Grade & Moisture</th>
                <th className="py-3 px-4">Silo Quantity</th>
                <th className="py-3 px-4">Price / MT</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Warehouse Depot</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {inventory.map((batch) => (
                <tr key={batch.id} className="hover:bg-stone-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-stone-900 text-sm font-display">{batch.cropName}</p>
                    <p className="text-[11px] text-stone-500 mt-0.5">{batch.variety} · {batch.lotNumber}</p>
                    {batch.syncStatus === 'pending_sync' && (
                      <span className="inline-block mt-1 text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 font-bold">
                        Saved locally; not synced
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-stone-800">{batch.grade}</p>
                    <p className="text-[11px] text-stone-500 tabular-nums">Moisture: {batch.moistureContent}%</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-extrabold text-stone-900 text-sm tabular-nums">{batch.quantityTonnes}</span>
                    <span className="text-stone-500 ml-1">MT</span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-stone-900 tabular-nums">
                    ${batch.pricePerTonne}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        batch.status === 'Available'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : batch.status === 'Reserved'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : batch.status === 'In Transit'
                          ? 'bg-blue-50 text-blue-800 border border-blue-200'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {batch.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-stone-600 text-[11px]">
                    {batch.warehouseLocation}
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-1">
                    <button
                      onClick={() => setEditingBatch({ ...batch })}
                      className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition"
                      title="Edit Batch"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteBatch(batch.id)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                      title="Delete Batch"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      {/* Shared order requests */}
      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="p-5 sm:p-6 border-b border-stone-200">
          <div>
            <h2 className="text-base font-bold text-stone-900 font-display">Order requests</h2>
            <p className="text-sm text-stone-600 mt-1">Requests submitted to your shared producer account. Payment is not processed here.</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <p className="p-6 text-sm text-stone-600">
            {isShared ? 'No order requests yet.' : 'Order requests require the shared Supabase service; local records are not sent to producers.'}
          </p>
        ) : (
          <div className="divide-y divide-stone-200">
            {orders.map((order) => (
              <article key={order.id} className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-stone-900">Order {order.id.slice(0, 8)}</p>
                  <p className="mt-1 text-xs text-stone-600">
                    {order.items.map((item) => `${item.crop_name} · ${item.quantity_tonnes} MT`).join(', ')}
                  </p>
                  <p className="mt-1 text-xs text-stone-500">{order.buyer_organization}</p>
                </div>
                <div className="text-sm sm:text-right">
                  <p className="font-bold text-stone-900">${Number(order.subtotal).toLocaleString()}</p>
                  <p className="text-xs capitalize text-stone-600">{order.status} · order request only</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
      </div>
      </div>

      {/* Modal: Add Harvest Batch */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 p-6 sm:p-8 space-y-5 my-8"
            >
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div>
                  <h3 className="text-lg font-bold font-display text-stone-900">Register New Harvest Lot</h3>
                  <p className="text-xs text-stone-500">Add fresh yield to your farm silo inventory.</p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="text-stone-400 hover:text-stone-700">✕</button>
              </div>

              <form onSubmit={handleCreateBatch} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Crop Name</label>
                  <input
                    type="text"
                    required
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0D5C3A]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Lot Number</label>
                    <input
                      type="text"
                      required
                      value={lotNumber}
                      onChange={(e) => setLotNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Harvest Date</label>
                    <input
                      type="date"
                      required
                      value={harvestDate}
                      onChange={(e) => setHarvestDate(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Variety / Seed Line</label>
                    <input
                      type="text"
                      required
                      value={variety}
                      onChange={(e) => setVariety(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as CropCategory)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none bg-white font-medium"
                    >
                      <option value="grains">Cereals & Grains</option>
                      <option value="legumes">Legumes & Pulses</option>
                      <option value="oilseeds">Oilseeds</option>
                      <option value="tubers">Tubers & Roots</option>
                      <option value="inputs">Farm Inputs</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Stock (Tonnes)</label>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      required
                      value={quantityTonnes}
                      onChange={(e) => setQuantityTonnes(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl tabular-nums font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Price / MT ($)</label>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      required
                      value={pricePerTonne}
                      onChange={(e) => setPricePerTonne(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl tabular-nums font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Moisture (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      required
                      value={moistureContent}
                      onChange={(e) => setMoistureContent(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl tabular-nums font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Quality Grade</label>
                    <select
                      required
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white font-medium"
                    >
                      <option value="">Select a producer-entered grade</option>
                      <option value="Grade 1 (Premium)">Grade 1 (Premium)</option>
                      <option value="Grade 2 (Standard)">Grade 2 (Standard)</option>
                      <option value="Organic Certified">Organic Certified</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Silo / Bay Depot</label>
                    <input
                      type="text"
                      required
                      value={warehouseLocation}
                      onChange={(e) => setWarehouseLocation(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl"
                    />
                  </div>
                </div>

                {!isOnline && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-[11px] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Saved on this device only. Automatic synchronization is not available.</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-stone-300 text-stone-700 rounded-xl font-semibold"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    className="px-6 py-2.5 bg-[#0D5C3A] text-white rounded-xl font-bold hover:bg-[#094B2E] shadow-md cursor-pointer"
                  >
                    {isShared ? 'Publish inventory' : 'Save local inventory'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Edit Batch */}
      <AnimatePresence>
        {editingBatch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 p-6 space-y-4"
            >
              <h3 className="text-base font-bold font-display text-stone-900">
                Calibrate Batch: {editingBatch.lotNumber}
              </h3>

              <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Remaining Silo Tonnes</label>
                  <input
                    type="number"
                    min="0"
                    value={editingBatch.quantityTonnes}
                    onChange={(e) => setEditingBatch({ ...editingBatch, quantityTonnes: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl tabular-nums font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Price per MT ($)</label>
                  <input
                    type="number"
                    min="1"
                    value={editingBatch.pricePerTonne}
                    onChange={(e) => setEditingBatch({ ...editingBatch, pricePerTonne: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl tabular-nums font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Moisture Content (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingBatch.moistureContent}
                    onChange={(e) => setEditingBatch({ ...editingBatch, moistureContent: parseFloat(e.target.value) || 12 })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl tabular-nums font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Status</label>
                  <select
                    value={editingBatch.status}
                    onChange={(e) => setEditingBatch({ ...editingBatch, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white font-medium"
                  >
                    <option value="Available">Available</option>
                    <option value="Reserved">Reserved</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Sold Out">Sold Out</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setEditingBatch(null)}
                    className="px-3.5 py-2 border border-stone-300 rounded-xl text-stone-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    className="px-5 py-2 bg-[#0D5C3A] text-white rounded-xl font-bold hover:bg-[#094B2E] shadow-sm cursor-pointer"
                  >
                    Save Changes
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
