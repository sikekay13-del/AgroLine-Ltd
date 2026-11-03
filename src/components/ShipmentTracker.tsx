import React, { useState } from 'react';
import { Search, Truck, MapPin, Thermometer, Droplets, Clock, Phone, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ShipmentTracking } from '../types';

interface ShipmentTrackerProps {
  shipments: ShipmentTracking[];
  selectedTrackingNumber?: string;
  onUpdateShipment: (updated: ShipmentTracking) => void;
  allowSimulation?: boolean;
}

export const ShipmentTracker: React.FC<ShipmentTrackerProps> = ({
  shipments,
  selectedTrackingNumber,
  onUpdateShipment,
  allowSimulation = true,
}) => {
  const [searchQuery, setSearchQuery] = useState(selectedTrackingNumber || 'AGRO-TRK-88294');
  const [activeShipmentId, setActiveShipmentId] = useState<string>(
    selectedTrackingNumber || (shipments[0]?.trackingNumber || 'AGRO-TRK-88294')
  );

  const [notFoundNotice, setNotFoundNotice] = useState<string | null>(null);
  const [shipmentStatus, setShipmentStatus] = useState('');
  const [shipmentLocation, setShipmentLocation] = useState('');
  const [shipmentNotes, setShipmentNotes] = useState('');

  const currentShipment =
    shipments.find((s) => s.trackingNumber.toUpperCase() === activeShipmentId.toUpperCase()) ||
    shipments[0];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = shipments.find(
      (s) => s.trackingNumber.toLowerCase() === searchQuery.trim().toLowerCase()
    );
    if (found) {
      setActiveShipmentId(found.trackingNumber);
      setNotFoundNotice(null);
    } else {
      setNotFoundNotice(`Waybill "${searchQuery}" not found. Displaying active consignment.`);
      setTimeout(() => setNotFoundNotice(null), 4000);
    }
  };

  const handleStepProgress = () => {
    if (!currentShipment) return;
    const nextPercentage = Math.min(100, currentShipment.progressPercentage + 15);
    const updated: ShipmentTracking = {
      ...currentShipment,
      progressPercentage: nextPercentage,
      status:
        nextPercentage >= 100
          ? 'Delivery Confirmed'
          : nextPercentage >= 85
          ? 'Arrived at Destination'
          : 'In Regional Transit',
      checkpoints: currentShipment.checkpoints.map((cp, idx) => {
        if (nextPercentage >= 80 && idx === 3) {
          return { ...cp, completed: true, status: 'Offloading Complete & Buyer Signed' };
        }
        return cp;
      }),
    };
    onUpdateShipment(updated);
  };

  const handleSaveShipmentUpdate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentShipment || !shipmentStatus.trim()) return;
    const updated: ShipmentTracking = {
      ...currentShipment,
      status: shipmentStatus.trim(),
      checkpoints: [
        ...currentShipment.checkpoints,
        {
          time: new Date().toLocaleString(),
          location: shipmentLocation.trim(),
          status: shipmentStatus.trim(),
          completed: true,
          notes: shipmentNotes.trim() || undefined,
        },
      ],
    };
    onUpdateShipment(updated);
    setShipmentStatus('');
    setShipmentLocation('');
    setShipmentNotes('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="pb-16"
    >
      <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#48B749] mb-1">
                <Radio className="w-3.5 h-3.5 text-[#0D5C3A]" />
                <span>Shipment Status</span>
                <span aria-hidden="true">·</span>
                <span>{allowSimulation ? 'Stored Records' : 'Shared Records'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-stone-900">
                Shipment Tracking · Consignment Status
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 mt-1">
                {allowSimulation ? 'Review shipment details saved in this browser. Carrier location and sensor feeds are not connected.' : 'Review shipment records stored in Supabase. Carrier location and sensor feeds are not connected.'}
              </p>
            </div>

            {/* Quick Waybill Selector */}
            <div className="flex items-center gap-2">
              {shipments.map((s) => (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  key={s.trackingNumber}
                  onClick={() => {
                    setActiveShipmentId(s.trackingNumber);
                    setSearchQuery(s.trackingNumber);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                    activeShipmentId === s.trackingNumber
                      ? 'bg-[#0D5C3A] text-white border-[#0D5C3A] shadow-xs'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {s.trackingNumber}
                </motion.button>
              ))}
            </div>

          {/* Waybill Search Bar */}
          <div className="bg-stone-50/80 p-4 rounded-2xl border border-stone-200 shadow-2xs">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Enter Agroline Consignment Waybill (e.g. AGRO-TRK-88294)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0D5C3A]"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="px-6 py-2.5 bg-[#0D5C3A] hover:bg-[#094B2E] text-white text-xs font-bold rounded-xl shadow-xs transition whitespace-nowrap cursor-pointer"
              >
                Locate Consignment
              </motion.button>
            </form>
            {notFoundNotice && (
              <p className="mt-2 text-xs text-amber-700 font-medium pl-1">
                {notFoundNotice}
              </p>
            )}
          </div>

      {shipments.length === 0 && (
        <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center">
          <h2 className="font-bold text-stone-900">No shipment records yet</h2>
          <p className="mt-2 text-sm text-stone-600">
            Shipment records appear here after the seller adds tracking details to an accepted order.
          </p>
        </div>
      )}

      {currentShipment && (
        <div className="space-y-6">
          {/* Main Consignment Card with Logistics Photography Hero Banner */}
          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="relative h-52 sm:h-64 bg-stone-900 overflow-hidden">
              <img
                src="/src/assets/images/logistics_agro_transport_1793303357624.jpg"
                alt="Agroline Freight Transport Fleet"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover opacity-85 transition-transform duration-700 hover:scale-103"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
              <div className="absolute bottom-5 left-6 right-6 flex flex-wrap items-end justify-between gap-4 text-white">
                <div>
                  <div className="flex items-center gap-2 text-xs text-[#E69500] font-bold uppercase tracking-wider">
                    <span>{currentShipment.carrier}</span>
                    <span aria-hidden="true">·</span>
                    <span>Consignment #{currentShipment.trackingNumber}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold font-display mt-1">{currentShipment.cropName}</h2>
                  <p className="text-xs text-stone-300 mt-0.5">Order Ref: {currentShipment.orderId}</p>
                </div>
                <div className="text-right">
                    <span className="text-xs text-stone-300 block font-semibold">{allowSimulation ? 'Stored shipment status' : 'Shared shipment status'}</span>
                  <span className="text-sm sm:text-base font-bold text-emerald-400 flex items-center justify-end gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>{currentShipment.status}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Stored shipment details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-stone-200 border-b border-stone-200 bg-stone-50/70 text-xs">
              <div className="p-4 flex items-center gap-3">
                <Thermometer className="w-5 h-5 text-amber-700 shrink-0" />
                <div>
                  <span className="text-stone-600 block text-xs font-medium">Sample cargo temperature</span>
                  <span className="font-extrabold text-stone-900 text-sm tabular-nums">
                    {currentShipment.currentTempCelsius === null ? 'Not reported' : `${currentShipment.currentTempCelsius}°C`}
                  </span>
                </div>
              </div>

              <div className="p-4 flex items-center gap-3">
                <Droplets className="w-5 h-5 text-sky-700 shrink-0" />
                <div>
                  <span className="text-stone-600 block text-xs font-medium">Sample humidity</span>
                  <span className="font-extrabold text-stone-900 text-sm tabular-nums">
                    {currentShipment.currentHumidity === null ? 'Not reported' : `${currentShipment.currentHumidity}% RH`}
                  </span>
                </div>
              </div>

              <div className="p-4 flex items-center gap-3">
                <Clock className="w-5 h-5 text-[#0D5C3A] shrink-0" />
                <div>
                  <span className="text-stone-600 block text-xs font-medium">Example arrival estimate</span>
                  <span className="font-extrabold text-stone-900 text-xs sm:text-sm truncate block">
                    {currentShipment.estimatedArrival}
                  </span>
                </div>
              </div>

              <div className="p-4 flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#F7B500] shrink-0" />
                <div>
                  <span className="text-stone-600 block text-xs font-medium">Listed driver</span>
                  <span className="font-bold text-stone-900 text-xs truncate block">
                    {currentShipment.driverName || 'Not provided'}
                  </span>
                  <span className="text-[10px] text-stone-500">{currentShipment.driverPhone}</span>
                </div>
              </div>
            </div>

            {/* Route Map Visualizer & Dynamic Progress with Animated Truck */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Origin -> Destination Strip */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-200">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#0D5C3A] text-white flex items-center justify-center font-extrabold text-xs shrink-0 shadow-sm">
                    A
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-500">Origin Silo / Farm Gate</span>
                    <p className="font-bold text-stone-900 text-sm">{currentShipment.origin}</p>
                  </div>
                </div>

                {/* Animated Truck along connector */}
                <div className="hidden sm:flex items-center gap-2 text-stone-400 relative px-4">
                  <div className="w-20 h-0.5 bg-stone-300" />
                  <motion.div
                    animate={{ x: [-4, 4, -4] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="p-1.5 bg-[#0D5C3A] text-[#F7B500] rounded-full shadow-sm"
                  >
                    <Truck className="w-4 h-4" />
                  </motion.div>
                  <div className="w-20 h-0.5 bg-stone-300" />
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#F7B500] text-stone-950 flex items-center justify-center font-extrabold text-xs shrink-0 shadow-sm">
                    B
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-500">Destination Warehouse</span>
                    <p className="font-bold text-stone-900 text-sm">{currentShipment.destination}</p>
                  </div>
                </div>
              </div>

              {/* Progress Bar with Animated Width */}
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-stone-800">Sample route progress</span>
                  <span className="font-extrabold text-[#0D5C3A] tabular-nums text-sm">{currentShipment.progressPercentage}% Completed</span>
                </div>
                <div className="w-full bg-stone-200 h-3 rounded-full overflow-hidden p-0.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${currentShipment.progressPercentage}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="bg-gradient-to-r from-[#0D5C3A] to-[#48B749] h-full rounded-full"
                  />
                </div>
              </div>

              {/* Checkpoint Timeline with Animated Checkmarks */}
              <div className="pt-2">
                <h3 className="text-sm font-extrabold font-display text-stone-900 mb-4">
                  Consignment Milestones &amp; Escrow Sign-Offs
                </h3>

                <div className="space-y-4">
                  {currentShipment.checkpoints.map((cp, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1, duration: 0.4 }}
                      className="flex items-start gap-3 relative"
                    >
                      <div className="mt-0.5">
                        {cp.completed ? (
                          <div className="relative">
                            <CheckCircle2 className="w-5 h-5 text-[#0D5C3A] shrink-0" />
                            <span className="absolute inset-0 rounded-full bg-[#48B749] opacity-20 animate-ping" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-stone-300 bg-white shrink-0" />
                        )}
                      </div>
                      <div className="flex-1 pb-4 border-b border-stone-100">
                        <div className="flex items-center justify-between">
                          <p className={`text-xs font-bold ${cp.completed ? 'text-stone-900' : 'text-stone-500'}`}>
                            {cp.status}
                          </p>
                          <span className="text-[11px] text-stone-500 tabular-nums font-semibold">{cp.time}</span>
                        </div>
                        <p className="text-xs text-stone-600 mt-0.5">{cp.location}</p>
                        {cp.notes && (
                          <p className="text-[11px] text-stone-600 bg-stone-50 p-2.5 rounded-xl mt-1.5 border border-stone-200/70 font-medium">
                            {cp.notes}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Simulation Helper Control with Spring Motion */}
              <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-stone-200">
                <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
                  <ShieldCheck className="w-4 h-4 text-[#0D5C3A]" />
                  <span>{allowSimulation ? 'Changing status only updates this browser’s sample record.' : 'Shipment updates are entered by the seller; no carrier integration is connected.'}</span>
                </div>
                {allowSimulation && (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleStepProgress}
                    disabled={currentShipment.progressPercentage >= 100}
                    className="px-4 py-2 bg-[#0D5C3A] hover:bg-[#094B2E] text-white rounded-xl text-xs font-bold transition disabled:opacity-50 flex items-center gap-2 shadow-sm cursor-pointer"
                  >
                    <span>Advance sample route</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#F7B500]" />
                  </motion.button>
                )}
                {!allowSimulation && currentShipment.canUpdate && (
                  <form onSubmit={handleSaveShipmentUpdate} className="grid w-full gap-2 rounded-xl border border-stone-200 bg-stone-50 p-3 sm:grid-cols-3">
                    <input required value={shipmentStatus} onChange={(event) => setShipmentStatus(event.target.value)} placeholder="New shipment status" className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs" />
                    <input value={shipmentLocation} onChange={(event) => setShipmentLocation(event.target.value)} placeholder="Current location" className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs" />
                    <input value={shipmentNotes} onChange={(event) => setShipmentNotes(event.target.value)} placeholder="Notes (optional)" className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs" />
                    <button type="submit" className="rounded-lg bg-[#0D5C3A] px-3 py-2 text-xs font-bold text-white sm:col-span-3">Save shipment update</button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
      </div>
    </motion.div>
  );
};
