import React, { useState } from 'react';
import { OUTGROWER_COOPERATIVES, OutgrowerCooperative } from '../data/mockData';
import { MessageSquare, ArrowRight, MapPin, Sprout, HeartHandshake } from 'lucide-react';
import { motion } from 'motion/react';

interface OutgrowerSpotlightProps {
  onOpenMessage: (farmerName: string, cropName: string) => void;
  onFilterByProducer?: (farmerName: string) => void;
}

export const OutgrowerSpotlight: React.FC<OutgrowerSpotlightProps> = ({
  onOpenMessage,
  onFilterByProducer,
}) => {
  const [selectedCoop, setSelectedCoop] = useState<OutgrowerCooperative>(OUTGROWER_COOPERATIVES[0]);

  return (
    <section className="bg-white rounded-xl border border-stone-200 p-5 sm:p-8 relative overflow-hidden">
      {/* Top Identity Ribbon */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#48B749]">
            <HeartHandshake className="w-4 h-4 text-[#F7B500]" />
            <span>Producer Directory</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0D5C3A] font-display mt-1">
            Meet the Outgrower Cooperatives
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl">
            Browse example producer profiles, locations, and crop types. Confirm availability and qualifications directly before placing an order.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-stone-50 border border-stone-200 p-2.5 rounded-lg shrink-0">
          <div className="px-3 border-r border-stone-200 text-center">
            <span className="text-lg font-bold text-[#0D5C3A] font-display block">Producer</span>
            <span className="text-xs font-medium text-stone-600">Profiles</span>
          </div>
          <div className="px-3 text-center">
            <span className="text-lg font-bold text-[#0D5C3A] font-display block">Regional</span>
            <span className="text-xs font-medium text-stone-600">Crop groups</span>
          </div>
        </div>
      </div>

      {/* Grid of 4 Cooperatives */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {OUTGROWER_COOPERATIVES.map((coop) => {
          const isSelected = selectedCoop.id === coop.id;

          return (
            <motion.div
              key={coop.id}
              onClick={() => setSelectedCoop(coop)}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className={`rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between overflow-hidden group ${
                isSelected
                  ? 'border-[#0D5C3A] shadow-md ring-2 ring-[#0D5C3A]/10 bg-stone-50/50'
                  : 'border-stone-200/90 hover:border-stone-300 bg-white'
              }`}
            >
              {/* Image banner */}
              <div className="relative aspect-[16/10] bg-stone-100 overflow-hidden">
                <img
                  src={coop.farmImage}
                  alt={coop.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Cooperative Location Pin */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white text-[11px]">
                  <span className="flex items-center gap-1 font-medium truncate drop-shadow-xs">
                    <MapPin className="w-3 h-3 text-[#F7B500] shrink-0" />
                    <span className="truncate">{coop.region}</span>
                  </span>
                  <span className="font-black text-[#F7B500] shrink-0 drop-shadow-xs">
                    ★ {coop.inspectionRating}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between gap-1 text-[10px] text-stone-500 font-bold uppercase tracking-wider mb-1">
                    <span className="text-[#48B749]">{coop.primaryCrop}</span>
                    <span>{coop.membersCount} listed members</span>
                  </div>

                  <h3 className="text-sm font-extrabold text-stone-900 font-display group-hover:text-[#0D5C3A] transition">
                    {coop.name}
                  </h3>

                  <div className="mt-2 flex items-center gap-2">
                    <img
                      src={coop.avatar}
                      alt={coop.leader}
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-full object-cover border border-stone-200"
                    />
                    <div className="truncate">
                      <p className="text-xs font-bold text-stone-800 truncate">{coop.leader}</p>
                      <p className="text-[10px] text-stone-500 truncate">{coop.role}</p>
                    </div>
                  </div>

                  {/* Silo stock indicator */}
                  <div className="mt-3 bg-white p-2 rounded-xl border border-stone-200/80 text-[11px] flex items-center justify-between">
                    <span className="text-stone-500">Listed inventory:</span>
                    <span className="font-extrabold text-[#0D5C3A]">{coop.siloStock}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-stone-100 flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenMessage(coop.leader, coop.primaryCrop);
                    }}
                    className="flex-1 py-1.5 px-2 bg-[#0D5C3A] hover:bg-[#094B2E] text-white text-[11px] font-bold rounded-lg transition flex items-center justify-center gap-1 shadow-2xs"
                    title="Send message to cooperative leadership"
                  >
                    <MessageSquare className="w-3 h-3 text-[#F7B500]" />
                    <span>Inquire</span>
                  </button>

                  {onFilterByProducer && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onFilterByProducer(coop.name);
                      }}
                      className="py-1.5 px-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-semibold rounded-lg transition"
                      title="Filter catalog by this cooperative"
                    >
                      Lots
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Expanded Featured Narrative for Selected Cooperative */}
      <div className="mt-8 bg-stone-50/80 rounded-2xl border border-stone-200/80 p-5 sm:p-6 flex flex-col md:flex-row items-center gap-6">
        <div className="relative shrink-0">
          <img
            src={selectedCoop.avatar}
            alt={selectedCoop.leader}
            referrerPolicy="no-referrer"
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white shadow-md"
          />
          <div className="absolute -bottom-2 -right-2 bg-[#0D5C3A] text-white p-1 rounded-lg">
            <Sprout className="w-3.5 h-3.5 text-[#F7B500]" />
          </div>
        </div>

        <div className="space-y-2 flex-1 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <span className="text-xs font-black text-[#0D5C3A] uppercase tracking-wider">
              {selectedCoop.name}
            </span>
            <span className="text-stone-300">·</span>
            <span className="text-xs text-stone-600 font-medium">{selectedCoop.acreage} acres listed</span>
            <span className="text-stone-300">·</span>
            <span className="text-xs text-[#0D5C3A] font-semibold">Example profile</span>
          </div>

          <p className="text-sm text-stone-700 leading-relaxed">
            Producer profile details are illustrative. Confirm location, availability, and quality records with the producer before trading.
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1 text-[11px] text-stone-600">
            <span className="font-bold text-stone-800">Listed practices:</span>
            {selectedCoop.sustainablePractices.map((prac, pIdx) => (
              <span key={pIdx} className="bg-white px-2 py-0.5 rounded-md border border-stone-200 font-medium">
                ✓ {prac}
              </span>
            ))}
          </div>
        </div>

        <button
          onClick={() => onOpenMessage(selectedCoop.leader, selectedCoop.primaryCrop)}
          className="shrink-0 px-4 py-2.5 bg-white hover:bg-stone-100 text-[#0D5C3A] border border-[#0D5C3A]/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
        >
          <span>Chat with {selectedCoop.leader.split(' ')[0]}</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#F7B500]" />
        </button>
      </div>
    </section>
  );
};
