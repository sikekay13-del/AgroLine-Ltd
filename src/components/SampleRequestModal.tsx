import React, { useState } from 'react';
import { CropItem } from '../types';
import { Package, Truck, CheckCircle2, X, Sparkles, Building2, MapPin, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SampleRequestModalProps {
  crop: CropItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess?: (sampleCode: string, cropName: string) => void;
}

export const SampleRequestModal: React.FC<SampleRequestModalProps> = ({
  crop,
  isOpen,
  onClose,
  onSubmitSuccess,
}) => {
  const [companyName, setCompanyName] = useState('East Africa Grain Millers Ltd');
  const [recipientName, setRecipientName] = useState('Chief Quality Inspector');
  const [deliveryAddress, setDeliveryAddress] = useState('Industrial Area Silo Complex, Gate 4');
  const [courier, setCourier] = useState<'agro_express' | 'dhl'>('agro_express');
  const [testingFocus, setTestingFocus] = useState<string[]>([
    'Moisture Calibration',
    'Optical Destoning Verification',
  ]);
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);

  if (!isOpen || !crop) return null;

  const toggleTest = (test: string) => {
    setTestingFocus((prev) =>
      prev.includes(test) ? prev.filter((t) => t !== test) : [...prev, test]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sampleCode = `SMP-AGRO-${Math.floor(100000 + Math.random() * 900000)}`;
    setSubmittedCode(sampleCode);
    if (onSubmitSuccess) {
      onSubmitSuccess(sampleCode, crop.name);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6 flex flex-col"
        >
          {/* Header */}
          <div className="bg-[#06331F] text-white p-5 flex items-center justify-between border-b border-emerald-950">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#0D5C3A] text-white flex items-center justify-center border border-[#48B749]/40">
                <Package className="w-5 h-5 text-[#F7B500]" />
              </div>
              <div>
                <h3 className="text-base font-extrabold font-display">
                  Sample Request
                </h3>
                <p className="text-xs text-emerald-300">
                  Preview the sample-request workflow. No sample will be shipped.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setSubmittedCode(null);
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form or Confirmation View */}
          {submittedCode ? (
            <div className="p-8 text-center space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-[#0D5C3A] flex items-center justify-center mx-auto border-2 border-emerald-300">
                <CheckCircle2 className="w-9 h-9 text-[#0D5C3A]" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#48B749]">
                  Request saved
                </span>
                <h3 className="text-2xl font-extrabold text-stone-900 font-display mt-1">
                  Sample Request Preview
                </h3>
                <p className="text-xs text-stone-600 mt-1 max-w-sm mx-auto">
                  This form saved a sample request for <strong>{crop.name}</strong>. No courier is booked.
                </p>
              </div>

              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 max-w-sm mx-auto text-left text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-stone-500">Request reference:</span>
                  <span className="font-mono font-bold text-[#0D5C3A]">{submittedCode}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-500">Courier option:</span>
                  <span className="font-bold text-stone-800">
                    {courier === 'agro_express' ? 'Sample option A' : 'Sample option B'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-500">Delivery:</span>
                  <span className="font-bold text-stone-800">Not scheduled</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-500">Cost:</span>
                  <span className="font-bold text-stone-700">Not calculated</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setSubmittedCode(null);
                  onClose();
                }}
                className="w-full max-w-sm py-3 bg-[#0D5C3A] hover:bg-[#094B2E] text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                Back to Marketplace
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-5">
              {/* Selected Crop Banner */}
              <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-200">
                <img
                  src={crop.image}
                  alt={crop.name}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-xl object-cover border border-stone-200 shrink-0"
                />
                <div className="truncate">
                  <h4 className="text-xs font-bold text-stone-900 truncate">{crop.name}</h4>
                  <p className="text-[11px] text-stone-500 truncate">{crop.variety} · {crop.location}</p>
                  <p className="text-xs text-stone-600 font-medium">Sample workflow only · no physical sample provided</p>
                </div>
              </div>

              {/* Delivery Details */}
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Company / Milling Firm Name:</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0D5C3A] font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Attention / Chemist Name:</label>
                    <input
                      type="text"
                      required
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0D5C3A] font-medium"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Courier Service:</label>
                    <select
                      value={courier}
                      onChange={(e) => setCourier(e.target.value as any)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0D5C3A] font-medium"
                    >
                      <option value="agro_express">Sample courier option A</option>
                      <option value="dhl">Sample courier option B</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Lab Destination / Silo Complex Address:</label>
                  <input
                    type="text"
                    required
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0D5C3A] font-medium"
                  />
                </div>
              </div>

              {/* Tests requested */}
              <div>
                <label className="font-bold text-stone-700 text-xs block mb-2">
                  Key Lab Parameters You Plan to Test:
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    'Moisture Calibration',
                    'Optical Destoning Verification',
                    'Protein / Gluten Content',
                    'Cooking Aroma & Puff Yield',
                  ].map((test) => {
                    const active = testingFocus.includes(test);
                    return (
                      <button
                        type="button"
                        key={test}
                        onClick={() => toggleTest(test)}
                        className={`p-2 rounded-xl border text-left text-[11px] transition flex items-center justify-between ${
                          active
                            ? 'bg-[#0D5C3A]/10 border-[#0D5C3A] text-[#0D5C3A] font-bold'
                            : 'bg-stone-50 border-stone-200 text-stone-600'
                        }`}
                      >
                        <span>{test}</span>
                        {active && <CheckCircle2 className="w-3.5 h-3.5 text-[#0D5C3A]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-3 border-t border-stone-200 flex items-center justify-between gap-3">
                <span className="text-[11px] text-stone-500">
                  No courier booking will be created
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#0D5C3A] hover:bg-[#094B2E] text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5 text-[#F7B500]" />
                    <span>Save Sample Request</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
