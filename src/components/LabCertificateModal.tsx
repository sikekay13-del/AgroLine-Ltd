import React, { useState } from 'react';
import { CropItem } from '../types';
import { ShieldCheck, CheckCircle2, Download, Printer, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LabCertificateModalProps {
  crop: CropItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const LabCertificateModal: React.FC<LabCertificateModalProps> = ({
  crop,
  isOpen,
  onClose,
}) => {
  const [downloadToast, setDownloadToast] = useState(false);

  if (!isOpen || !crop) return null;

  const certificateId = `SAMPLE-${crop.id.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(-6) || '884920'}`;
  const inspectionDate = 'Example date · October 2026';
  const labFacility = 'Illustrative sample facility';

  const handleDownload = () => {
    const record = [
      'SAMPLE QUALITY RECORD',
      'Illustrative data only. Not a laboratory certificate or inspection result.',
      `Record: ${certificateId}`,
      `Crop: ${crop.name}`,
      `Origin: ${crop.location}`,
      `Example moisture reading: ${crop.moistureContent}%`,
    ].join('\n');
    const url = URL.createObjectURL(new Blob([record], { type: 'text/plain' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${certificateId.toLowerCase()}.txt`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setDownloadToast(true);
    setTimeout(() => setDownloadToast(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6 flex flex-col"
        >
          {/* Top Modal Controls */}
          <div className="bg-[#06331F] text-white p-4 sm:p-5 flex items-center justify-between border-b border-emerald-950">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#0D5C3A] text-white flex items-center justify-center border border-[#48B749]/40">
                <ShieldCheck className="w-5 h-5 text-[#F7B500]" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold font-display">
                  Sample Quality Record
                </h3>
                <p className="text-[11px] text-emerald-300">
                  Illustrative data only · Not issued or verified by a laboratory
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Certificate Document Canvas (Simulated Official Sheet) */}
          <div className="p-6 sm:p-8 space-y-6 text-stone-900 overflow-y-auto max-h-[70vh]">
            {/* Certificate Header Banner */}
            <div className="border-b-2 border-stone-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-[#0D5C3A]">
                    AGRICULTURAL SERVICES · SAMPLE
                  </span>
                  <span className="text-stone-300">|</span>
                  <span className="text-xs font-semibold text-stone-600">ILLUSTRATIVE RECORD</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-stone-900 font-display">
                  EXAMPLE QUALITY DATA
                </h1>
                <p className="text-xs text-stone-500">
                  Laboratory Testing Facility: {labFacility}
                </p>
              </div>

              {/* Status Stamp */}
              <div className="border-2 border-[#0D5C3A] rounded-2xl p-3 text-center bg-emerald-50/70 shrink-0">
                <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider block">
                  Example Result
                </span>
                <span className="text-sm font-black text-[#0D5C3A] uppercase tracking-wide block">
                  GRADE 1 · ILLUSTRATIVE
                </span>
                <span className="text-[9px] text-stone-500 block">Export Standard KS-05-43</span>
              </div>
            </div>

            {/* Lot & Consignment Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-200/80 text-xs">
              <div>
                <span className="text-stone-500 block text-[11px]">Sample record ID</span>
                <span className="font-mono font-bold text-stone-900">{certificateId}</span>
              </div>
              <div>
                <span className="text-stone-500 block text-[11px]">Example date</span>
                <span className="font-bold text-stone-900">{inspectionDate}</span>
              </div>
              <div>
                <span className="text-stone-500 block text-[11px]">Commodity Lot</span>
                <span className="font-bold text-stone-900 truncate block">{crop.name}</span>
              </div>
              <div>
                <span className="text-stone-500 block text-[11px]">Origin Silo Hub</span>
                <span className="font-bold text-stone-900 truncate block">{crop.location}</span>
              </div>
            </div>

            {/* Detailed Laboratory Test Parameters Table */}
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-stone-700 mb-2.5">
                Illustrative quality measurements · not lab results
              </h4>

              <div className="border border-stone-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-stone-100/90 text-stone-700 font-bold border-b border-stone-200">
                    <tr>
                      <th className="py-2.5 px-3">Test Parameter</th>
                      <th className="py-2.5 px-3">Methodology</th>
                      <th className="py-2.5 px-3">Example reference</th>
                      <th className="py-2.5 px-3">Sample value</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-800">
                    <tr>
                      <td className="py-2.5 px-3 font-semibold">Moisture Content</td>
                      <td className="py-2.5 px-3 text-stone-500 font-mono text-[11px]">ISO 712:2009</td>
                      <td className="py-2.5 px-3 text-stone-500">&le; 13.0% Max</td>
                      <td className="py-2.5 px-3 font-bold text-[#0D5C3A]">{crop.moistureContent}%</td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">PASS</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold">Destoning Purity Index</td>
                      <td className="py-2.5 px-3 text-stone-500 font-mono text-[11px]">Gravimetric ISO 605</td>
                      <td className="py-2.5 px-3 text-stone-500">0.05% Stones Max</td>
                      <td className="py-2.5 px-3 font-bold text-[#0D5C3A]">0.00% (Stone-Free)</td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">PASS</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold">Foreign Organic Matter</td>
                      <td className="py-2.5 px-3 text-stone-500 font-mono text-[11px]">Manual Optical Sieve</td>
                      <td className="py-2.5 px-3 text-stone-500">&le; 0.50% Max</td>
                      <td className="py-2.5 px-3 font-bold text-stone-900">0.12%</td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">PASS</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold">Aflatoxin B1+B2+G1+G2</td>
                      <td className="py-2.5 px-3 text-stone-500 font-mono text-[11px]">HPLC Fluorescence</td>
                      <td className="py-2.5 px-3 text-stone-500">&le; 4.0 ppb</td>
                      <td className="py-2.5 px-3 font-bold text-[#0D5C3A]">1.4 ppb (Safe)</td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">PASS</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold">Broken / Damaged Kernels</td>
                      <td className="py-2.5 px-3 text-stone-500 font-mono text-[11px]">Standard Seed Metric</td>
                      <td className="py-2.5 px-3 text-stone-500">&le; 4.0% Max</td>
                      <td className="py-2.5 px-3 font-bold text-stone-900">1.8%</td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">PASS</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sample data disclosure */}
            <div className="pt-4 border-t border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
              <div className="space-y-2 text-xs text-stone-600">
                <p className="font-semibold text-stone-900">Sample data notice</p>
                <p className="text-[11px] leading-relaxed">
                  "Values on this screen are illustrative and do not represent a real inspection, laboratory result, or certification."
                </p>
                <div className="flex items-center gap-2 pt-1 text-[11px] text-[#0D5C3A] font-bold">
                  <CheckCircle2 className="w-4 h-4 text-[#48B749]" />
                  <span>No laboratory or blockchain verification is performed</span>
                </div>
              </div>

              <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 text-right space-y-1">
                <span className="text-[10px] uppercase font-bold text-stone-500">Record status</span>
                <p className="font-black font-display text-sm text-stone-900">Illustrative record</p>
                <p className="text-xs text-stone-600">No signatory or certificate is associated with this sample.</p>
              </div>
            </div>
          </div>

          {/* Modal Footer Controls */}
          <div className="bg-stone-100/80 p-4 sm:p-5 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-600">Sample data · not independently verified</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-3.5 py-2 bg-white hover:bg-stone-50 text-stone-700 font-semibold rounded-xl border border-stone-300 transition flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4 text-stone-600" />
                <span>Print Sample Record</span>
              </button>

              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-[#0D5C3A] hover:bg-[#094B2E] text-white font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-4 h-4 text-[#F7B500]" />
                <span>Download Sample Data</span>
              </button>
            </div>
          </div>

          {/* Download Toast */}
          {downloadToast && (
            <div className="bg-[#0D5C3A] text-white text-xs px-4 py-2.5 text-center font-bold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#F7B500]" />
              <span>Illustrative sample record downloaded as a text file</span>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
