import React, { useState } from 'react';
import { Plus, Package, TrendingUp, ShieldCheck, Truck, RefreshCw, AlertCircle, CheckCircle, Trash2, Edit2, Download, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { InventoryBatch, CropCategory } from '../types';

interface FarmerDashboardProps {
  inventory: InventoryBatch[];
  onAddBatch: (batch: Omit<InventoryBatch, 'id'>) => void;
  onUpdateBatch: (id: string, updates: Partial<InventoryBatch>) => void;
  onDeleteBatch: (id: string) => void;
  isOnline: boolean;
  isShared?: boolean;
  onOpenTracking: (trackingNumber: string) => void;
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({
  inventory,
  onAddBatch,
  onUpdateBatch,
  onDeleteBatch,
  isOnline,
  isShared = false,
  onOpenTracking,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState<InventoryBatch | null>(null);

  // New batch form state
  const [cropName, setCropName] = useState('Hard Red Winter Wheat');
  const [variety, setVariety] = useState('Kwale High-Protein Grain');
  const [category, setCategory] = useState<CropCategory>('grains');
  const [lotNumber, setLotNumber] = useState(`LOT-ELD-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  const [quantityTonnes, setQuantityTonnes] = useState<number>(50);
  const [pricePerTonne, setPricePerTonne] = useState<number>(340);
  const [moistureContent, setMoistureContent] = useState<number>(12.2);
  const [grade, setGrade] = useState('Grade 1 (Premium)');
  const [warehouseLocation, setWarehouseLocation] = useState('Eldoret Silo Bay 3');

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
      lotNumber: lotNumber || `LOT-${Math.floor(Math.random() * 9000 + 1000)}`,
      quantityTonnes,
      pricePerTonne,
      moistureContent,
      grade,
      status: 'Available',
      warehouseLocation,
      harvestDate: new Date().toISOString().split('T')[0],
      syncStatus: isOnline ? 'synced' : 'pending_sync',
    });
    setShowAddModal(false);
    // Reset defaults
    setLotNumber(`LOT-ELD-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
    setQuantityTonnes(50);
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
      syncStatus: isOnline ? 'synced' : 'pending_sync',
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
                <span>Outgrower Management Console</span>
                <span aria-hidden="true">·</span>
                <span>{isShared ? 'Shared Inventory Portal' : 'Offline-Ready Farm Portal'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-stone-900">
                Farmer Hub · Silo &amp; Inventory Terminal
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 mt-1">
                Catalog harvests, calibrate moisture tolerances, monitor pending escrow disbursements, and dispatch haulage.
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
          <p className="text-[11px] text-stone-500 mt-1">Calculated at current spot rates</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs"
        >
          <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
            <span className="font-medium">Escrow In Transit</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold font-display text-stone-900 tabular-nums">
            $31,125 <span className="text-xs font-bold text-emerald-700">Secured</span>
          </p>
          <p className="text-[11px] text-stone-500 mt-1">2 orders awaiting buyer weigh-in</p>
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
            ) : pendingSyncCount > 0 ? (
              <span className="text-amber-700">{pendingSyncCount} Queued</span>
            ) : (
              <span className="text-emerald-800">Synced to Cloud</span>
            )}
          </p>
          <p className="text-[11px] text-stone-500 mt-1">
            {!isOnline ? 'Entries will sync upon re-link' : 'All farm records current'}
          </p>
        </motion.div>
      </div>

      {/* Harvest Batches & Inventory Management Table */}
      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="p-5 sm:p-6 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50/70">
          <div>
            <h2 className="text-base font-bold text-stone-900 font-display">Active Farm Batches & Silo Lots</h2>
            <p className="text-sm text-stone-600 mt-1">Inventory records saved in this browser.</p>
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
                        Queued for sync (offline)
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

      {/* Recent Fulfillment Orders & Haulage Dispatches */}
      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="p-5 sm:p-6 border-b border-stone-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-stone-900 font-display">Active Purchase Orders & Freight Dispatches</h2>
            <p className="text-sm text-stone-600 mt-1">Example order and shipment records stored on this device.</p>
          </div>
          <button
            onClick={() => onOpenTracking('AGRO-TRK-88294')}
            className="text-xs font-bold text-[#0D5C3A] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Track All Dispatches</span>
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div whileHover={{ y: -2 }} className="p-4 rounded-2xl border border-stone-200 bg-stone-50/60 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-stone-900">PO #ORD-9921 · Millstream Grain Millers</span>
                <p className="text-[11px] text-stone-500">Agroline Royal Rice & Wheat · 50 Metric Tonnes</p>
              </div>
              <span className="text-xs font-extrabold text-[#0D5C3A] tabular-nums">$29,000 in Escrow</span>
            </div>
            <div className="flex items-center justify-between text-xs pt-2 border-t border-stone-200 text-stone-600">
              <span>Status: <strong className="text-blue-700">In Transit on Highway</strong></span>
              <button
                onClick={() => onOpenTracking('AGRO-TRK-88294')}
                className="px-3 py-1 bg-white border border-stone-300 rounded-lg font-bold hover:bg-stone-50 text-[11px] shadow-2xs cursor-pointer"
              >
                Track AGRO-TRK-88294
              </button>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -2 }} className="p-4 rounded-2xl border border-stone-200 bg-stone-50/60 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-stone-900">PO #ORD-9884 · Pan-African Oilseed Refiners</span>
                <p className="text-[11px] text-stone-500">Organic Soybeans · 30 Metric Tonnes</p>
              </div>
              <span className="text-xs font-extrabold text-[#0D5C3A] tabular-nums">$15,600 in Escrow</span>
            </div>
            <div className="flex items-center justify-between text-xs pt-2 border-t border-stone-200 text-stone-600">
              <span>Status: <strong className="text-amber-700">Hub Inspection Passed</strong></span>
              <button
                onClick={() => onOpenTracking('AGRO-TRK-77312')}
                className="px-3 py-1 bg-white border border-stone-300 rounded-lg font-bold hover:bg-stone-50 text-[11px] shadow-2xs cursor-pointer"
              >
                Track AGRO-TRK-77312
              </button>
            </div>
          </motion.div>
        </div>
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
                      min="1"
                      required
                      value={quantityTonnes}
                      onChange={(e) => setQuantityTonnes(parseFloat(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl tabular-nums font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Price / MT ($)</label>
                    <input
                      type="number"
                      min="10"
                      required
                      value={pricePerTonne}
                      onChange={(e) => setPricePerTonne(parseFloat(e.target.value) || 10)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl tabular-nums font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Moisture (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="5"
                      max="25"
                      required
                      value={moistureContent}
                      onChange={(e) => setMoistureContent(parseFloat(e.target.value) || 12)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl tabular-nums font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Quality Grade</label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white font-medium"
                    >
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
                    <span>Working in rural offline mode: saved locally and will sync automatically once network returns.</span>
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
                    Confirm & List Lot
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
