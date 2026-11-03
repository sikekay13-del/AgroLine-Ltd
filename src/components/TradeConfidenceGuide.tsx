import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, Truck, ArrowRight, Sparkles, Scale, FileCheck2, Lock, Banknote } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TradeConfidenceGuideProps {
  onExploreEscrow?: () => void;
  onExploreTracking?: () => void;
}

export const TradeConfidenceGuide: React.FC<TradeConfidenceGuideProps> = ({
  onExploreEscrow,
  onExploreTracking,
}) => {
  const [activeStep, setActiveStep] = useState<number>(0);

  const steps = [
    {
      step: '01',
      title: 'Quality Review & Origin Details',
      subtitle: 'Review the information shown on each listing',
      icon: FileCheck2,
      accentColor: '#0D5C3A',
      badge: 'Listing Details',
      highlights: [
        'Compare listed grade and moisture information',
        'Review sample certificate details where available',
        'See the producer and farm origin on each listing',
        'Request a crop sample before discussing an order',
      ],
      deliverable: 'Listing information and sample certificate details',
    },
    {
      step: '02',
      title: 'Order & Settlement Workflow',
      subtitle: 'Illustrative steps only; no funds are transferred',
      icon: Lock,
      accentColor: '#F7B500',
      badge: 'Example Workflow',
      highlights: [
        'Review the sample order and escrow-status steps',
        'Follow simulated hold and release states',
        'Explore the delivery review workflow',
        'Payment processing is not connected',
      ],
      deliverable: 'Example order record; no funds are transferred',
    },
    {
      step: '03',
      title: 'Shipment Status Flow',
      subtitle: 'Explore illustrative shipment milestones',
      icon: Truck,
      accentColor: '#48B749',
      badge: 'Sample Tracking',
      highlights: [
        'Explore sample shipment milestones and cargo details',
        'Review example waybill and delivery information',
        'Shipment progress is simulated, not live carrier data',
        'No payment is initiated through this interface',
      ],
      deliverable: 'Sample waybill and shipment status details',
    },
  ];

  return (
    <section className="bg-white rounded-xl border border-stone-200/90 p-5 sm:p-8 relative overflow-hidden">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#48B749]">
            <ShieldCheck className="w-4 h-4 text-[#F7B500]" />
            <span>Buyer &amp; Producer Trade Workflow</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0D5C3A] font-display mt-1">
            How the Trade Flow Works
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl">
            Explore listing review, order steps, and shipment updates. Listings and transaction records are illustrative.
          </p>
        </div>

        {/* Quick Stepper Badges */}
        <div className="flex items-center gap-2 p-1.5 bg-stone-100 rounded-2xl border border-stone-200 shrink-0">
          {steps.map((st, i) => (
            <button
              key={st.step}
              onClick={() => setActiveStep(i)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeStep === i
                  ? 'bg-[#0D5C3A] text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <span>{st.step}</span>
              <span className="hidden sm:inline">{i === 0 ? 'Verification' : i === 1 ? 'Escrow Lock' : 'Delivery Release'}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3 Step Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {steps.map((item, idx) => {
          const Icon = item.icon;
          const isSelected = activeStep === idx;

          return (
            <motion.div
              key={item.step}
              className={`rounded-lg p-5 border transition-all flex flex-col justify-between relative ${
                isSelected
                  ? 'bg-white border-[#0D5C3A] shadow-lg ring-2 ring-[#0D5C3A]/10'
                  : 'bg-stone-50/70 hover:bg-white border-stone-200/90 shadow-2xs'
              }`}
            >
              <div>
                {/* Step Pill & Icon */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-black px-2.5 py-1 rounded-lg ${
                        isSelected ? 'bg-[#0D5C3A] text-white' : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      Step {item.step}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                      {item.badge}
                    </span>
                  </div>

                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${
                      isSelected
                        ? 'bg-[#0D5C3A]/10 text-[#0D5C3A]'
                        : 'bg-stone-200/70 text-stone-600'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="text-base font-extrabold text-stone-900 font-display">
                  {item.title}
                </h3>
                <p className="text-xs font-medium text-[#48B749] mt-0.5">
                  {item.subtitle}
                </p>

                {/* Bullets */}
                <ul className="mt-4 space-y-2 text-xs text-stone-600">
                  {item.highlights.map((hl, hIdx) => (
                    <li key={hIdx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#48B749] shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{hl}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Sample flow summary */}
              <div className="mt-5 pt-4 border-t border-stone-100">
                <div className="bg-emerald-50/70 rounded-xl p-2.5 border border-emerald-100 flex items-center gap-2 text-[11px] text-[#0D5C3A] font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-[#F7B500] shrink-0" />
                  <span className="truncate">{item.deliverable}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Call to action bar */}
      <div className="mt-8 pt-6 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-xs text-stone-600">
          <div className="w-8 h-8 rounded-full bg-[#0D5C3A]/10 text-[#0D5C3A] flex items-center justify-center font-bold">
            ✓
          </div>
          <div>
            <p className="font-bold text-stone-900">Illustrative trade flow</p>
            <p className="text-xs text-stone-600">Sample listings, transactions, and shipment statuses only.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onExploreEscrow && (
            <button
              onClick={onExploreEscrow}
              className="px-4 py-2 bg-white hover:bg-stone-50 text-[#0D5C3A] border border-[#0D5C3A]/40 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <span>Explore Escrow Process</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#F7B500]" />
            </button>
          )}
          {onExploreTracking && (
            <button
              onClick={onExploreTracking}
              className="px-4 py-2 bg-[#0D5C3A] hover:bg-[#094B2E] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <span>Shipment Status</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
