import React, { useState, useMemo, useRef } from 'react';
import { Search, SlidersHorizontal, MapPin, ShieldCheck, MessageSquare, Plus, Check, ArrowRight, Award, Sparkles, CheckCircle2, Volume2, VolumeX, ChevronRight, Package, Truck, Lock, ArrowUpRight, FileCheck2, Beaker, Globe, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence, MotionConfig, useReducedMotion } from 'motion/react';
import { CropItem, CropCategory } from '../types';
import { CommodityTicker } from './CommodityTicker';
import { TradeConfidenceGuide } from './TradeConfidenceGuide';
import { OutgrowerSpotlight } from './OutgrowerSpotlight';
import { LabCertificateModal } from './LabCertificateModal';
import { SampleRequestModal } from './SampleRequestModal';

interface MarketplaceProps {
  crops: CropItem[];
  onAddToCart: (crop: CropItem, tonnes: number) => void;
  onOpenMessage: (crop: CropItem) => void;
  onTrackWaybill: (waybill: string) => void;
  onSwitchToFarmer: () => void;
  onNavigateTab?: (tab: 'marketplace' | 'farmer' | 'tracking' | 'messages' | 'escrow') => void;
}

export type CurrencyCode = 'USD' | 'GHS' | 'KES' | 'EUR';
export type UnitCode = 'MT' | '50kg';

export const CURRENCY_CONFIG: Record<CurrencyCode, { symbol: string; rate: number; label: string }> = {
  USD: { symbol: '$', rate: 1.0, label: 'USD ($)' },
  GHS: { symbol: 'GH₵', rate: 15.2, label: 'GHS (GH₵)' },
  KES: { symbol: 'KSh ', rate: 129.5, label: 'KES (KSh)' },
  EUR: { symbol: '€', rate: 0.92, label: 'EUR (€)' },
};

export const Marketplace: React.FC<MarketplaceProps> = ({
  crops,
  onAddToCart,
  onOpenMessage,
  onTrackWaybill,
  onSwitchToFarmer,
  onNavigateTab,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [maxMoisture, setMaxMoisture] = useState<number>(15);
  const [selectedCrop, setSelectedCrop] = useState<CropItem | null>(null);
  const [orderQuantity, setOrderQuantity] = useState<number>(5);
  const [addedToast, setAddedToast] = useState<string | null>(null);

  // Multi-currency and unit preferences
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [unit, setUnit] = useState<UnitCode>('MT');

  // Modals for Lab Inspection Certificate & 1kg Physical Sample
  const [certModalCrop, setCertModalCrop] = useState<CropItem | null>(null);
  const [sampleModalCrop, setSampleModalCrop] = useState<CropItem | null>(null);

  // Video playback
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const prefersReducedMotion = useReducedMotion();

  // Flagship rice pack selector
  const [selectedPackSize, setSelectedPackSize] = useState<'5kg' | '25kg' | '50kg' | '1MT'>('50kg');

  const formatPrice = (pricePerTonne: number) => {
    const cfg = CURRENCY_CONFIG[currency];
    if (unit === '50kg') {
      const bagPrice = (pricePerTonne / 20) * cfg.rate;
      return `${cfg.symbol}${bagPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    const tonnePrice = pricePerTonne * cfg.rate;
    return `${cfg.symbol}${Math.round(tonnePrice).toLocaleString()}`;
  };

  const formatTotal = (amountUsd: number) => {
    const cfg = CURRENCY_CONFIG[currency];
    const converted = amountUsd * cfg.rate;
    return `${cfg.symbol}${Math.round(converted).toLocaleString()}`;
  };

  const categories = [
    { id: 'all', label: 'All Commodities' },
    { id: 'grains', label: 'Grains & Rice' },
    { id: 'legumes', label: 'Legumes & Pulses' },
    { id: 'oilseeds', label: 'Oilseeds' },
    { id: 'tubers', label: 'Tubers & Roots' },
  ];

  const flagshipRice = crops.find((c) => c.id === 'crop-flagship-rice') || crops[0];

  const filteredCrops = useMemo(() => {
    return crops.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.variety.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.farmerName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory =
        selectedCategory === 'all' || item.category === selectedCategory;

      const matchGrade =
        selectedGrade === 'all' ||
        (selectedGrade === 'organic' && item.grade.includes('Organic')) ||
        (selectedGrade === 'grade1' && item.grade.includes('Grade 1'));

      const matchMoisture = item.moistureContent <= maxMoisture;

      return matchSearch && matchCategory && matchGrade && matchMoisture;
    });
  }, [crops, searchQuery, selectedCategory, selectedGrade, maxMoisture]);

  const handleQuickAdd = (crop: CropItem, tonnes?: number) => {
    const qty = tonnes || crop.minimumOrderTonnes;
    onAddToCart(crop, qty);
    setAddedToast(`${qty} MT of ${crop.name} added to Escrow Cart`);
    setTimeout(() => setAddedToast(null), 3000);
  };

  const handleAddFlagshipPack = () => {
    if (!flagshipRice) return;
    let tonnes = 1;
    if (selectedPackSize === '5kg') tonnes = 0.05;
    else if (selectedPackSize === '25kg') tonnes = 0.25;
    else if (selectedPackSize === '50kg') tonnes = 1;
    else if (selectedPackSize === '1MT') tonnes = 1;

    onAddToCart(flagshipRice, tonnes);
    setAddedToast(`Added ${selectedPackSize} format of Agroline Royal Aromatic Rice to Escrow Cart`);
    setTimeout(() => setAddedToast(null), 3000);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <MotionConfig reducedMotion="user">
    <div className="space-y-8 pb-20">
      {/* Toast Notification */}
      <AnimatePresence>
        {addedToast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-6 right-6 z-50 bg-[#0D5C3A] text-white text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-[#48B749]/40"
          >
            <Check className="w-4 h-4 text-[#F7B500]" />
            <span>{addedToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Minimal, Aesthetic Cinematic Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative rounded-2xl overflow-hidden min-h-[320px] sm:min-h-[360px] flex items-center shadow-lg border border-stone-200/60"
      >
        {/* Full-Bleed Video Background */}
        <video
          ref={videoRef}
          src="/assets/aistudio/10847025-hd_1920_1080_25fps_c75dc868.mp4"
          poster="/src/assets/images/hero_agriculture_harvest_1793303356367.jpg"
          autoPlay={!prefersReducedMotion}
          loop
          muted={isMuted}
          playsInline
          className="absolute inset-0 w-full h-full object-cover object-center"
        />

        {/* Sophisticated Dark Green Scrim for Clean Legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#06331F]/90 via-[#0D5C3A]/70 to-[#06331F]/50" />

        {/* Clean, Minimal Hero Content */}
        <div className="relative z-10 max-w-3xl px-6 sm:px-12 py-8 text-white space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#F7B500] tracking-wide"
          >
            <span className="w-2 h-2 rounded-full bg-[#48B749] animate-pulse" />
            <span>Agricultural Trade, Rooted in Trust</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-3xl sm:text-5xl lg:text-5xl font-extrabold font-display text-white leading-[1.12]"
          >
            Feeding The Future. Empowering Farmers.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-sm sm:text-base text-stone-100 max-w-xl font-normal leading-relaxed"
          >
            Compare sample listings from producers, review crop details, and explore the order and delivery workflow.
          </motion.p>

          {/* Minimal 2-Button Action Bar */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="pt-2 flex flex-wrap items-center gap-3.5"
          >
            <motion.a
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              href="#commodities-catalog"
              className="px-6 py-3 bg-[#48B749] hover:bg-[#3da33e] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center gap-2"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </motion.a>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onSwitchToFarmer}
              className="px-6 py-3 bg-white/15 hover:bg-white/25 text-white font-semibold text-xs sm:text-sm rounded-xl border border-white/25 backdrop-blur-md transition flex items-center gap-1.5"
            >
              <span>Farmer Hub</span>
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        </div>

        {/* Minimal Audio Toggle in bottom corner */}
        {!prefersReducedMotion && <div className="absolute bottom-5 right-6 z-20">
          <button
            onClick={toggleMute}
            className="w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white/90 border border-white/20 flex items-center justify-center transition"
            title={isMuted ? 'Unmute video' : 'Mute video'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>}
      </motion.section>

      {/* Live Commodity Spot Market Ticker Bar */}
      <CommodityTicker />

      <section aria-labelledby="available-lots-title" className="space-y-3">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#0D5C3A]">Ready to trade</p>
            <h2 id="available-lots-title" className="text-lg font-bold font-display text-stone-900">Available crop lots</h2>
          </div>
          <a href="#commodities-catalog" className="shrink-0 text-xs font-bold text-[#0D5C3A] hover:text-[#094B2E] underline underline-offset-4">
            Browse all lots
          </a>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
          {crops.slice(0, 3).map((crop) => (
            <article key={crop.id} className="flex min-w-[min(84vw,340px)] snap-start items-center gap-3 rounded-xl border border-stone-200 bg-white p-3 shadow-xs sm:min-w-0 sm:flex-1">
              <img src={crop.image} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-bold text-stone-900">{crop.name}</h3>
                <p className="truncate text-xs text-stone-500">{crop.location} · {crop.availableStockTonnes} MT</p>
                <p className="mt-1 text-sm font-extrabold tabular-nums text-[#0D5C3A]">{formatPrice(crop.pricePerTonne)} <span className="text-xs font-medium text-stone-500">/ {unit === '50kg' ? '50kg sack' : 'MT'}</span></p>
              </div>
              <button
                type="button"
                onClick={() => handleQuickAdd(crop)}
                aria-label={`Add ${crop.name} to escrow cart`}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0D5C3A] text-white transition hover:bg-[#094B2E]"
              >
                <Plus className="h-4 w-4 text-[#F7B500]" />
              </button>
            </article>
          ))}
        </div>
      </section>

      {/* Commodity Search & Catalog Section */}
      <section id="commodities-catalog" className="space-y-6 pt-2">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-stone-200 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#48B749]">
              <Sparkles className="w-3.5 h-3.5 text-[#F7B500]" />
              <span>Wholesale Commodity Clearinghouse</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0D5C3A] font-display mt-0.5">
              Available Farm Commodities
            </h2>
            <p className="text-sm text-stone-600 mt-1">
              Illustrative listings for comparing crop price, quantity, grade, and location.
            </p>
          </div>

          {/* Multi-Currency & Unit Toggles */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Currency Selector */}
            <div role="group" aria-label="Currency" className="flex items-center gap-1 p-1 bg-white rounded-lg border border-stone-200/90 text-sm">
              <Globe className="w-3.5 h-3.5 text-stone-400 ml-2 mr-1" />
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider hidden sm:inline mr-1">Currency:</span>
              {(['USD', 'GHS', 'KES', 'EUR'] as CurrencyCode[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  aria-pressed={currency === c}
                  className={`min-h-9 px-3 py-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
                    currency === c
                      ? 'bg-[#0D5C3A] text-white shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                  title={CURRENCY_CONFIG[c].label}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Unit Selector */}
            <div role="group" aria-label="Price unit" className="flex items-center gap-1 p-1 bg-white rounded-lg border border-stone-200/90 text-sm">
              <button
                onClick={() => setUnit('MT')}
                aria-pressed={unit === 'MT'}
                className={`min-h-9 px-3 py-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
                  unit === 'MT'
                    ? 'bg-[#0D5C3A] text-white shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                Per Tonne (MT)
              </button>
              <button
                onClick={() => setUnit('50kg')}
                aria-pressed={unit === '50kg'}
                className={`min-h-9 px-3 py-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
                  unit === '50kg'
                    ? 'bg-[#0D5C3A] text-white shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                Per 50kg Sack
              </button>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-lg border border-stone-200/80">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              aria-label="Search crop listings"
              placeholder="Search by commodity, variety, county, or farmer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full min-h-11 pl-9 pr-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0D5C3A]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-stone-600">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="font-medium">Filter:</span>
            </div>

            <select
              aria-label="Filter by grade"
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="min-h-10 bg-stone-50 border border-stone-200 text-stone-800 py-1.5 px-3 rounded-md focus:outline-none font-medium"
            >
              <option value="all">All Grades</option>
              <option value="grade1">Grade 1 (Premium)</option>
              <option value="organic">Organic label (sample)</option>
            </select>

            <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-lg">
              <span className="text-stone-600">Max Moisture:</span>
              <span className="font-bold text-stone-900 tabular-nums">{maxMoisture}%</span>
              <input
                aria-label="Maximum moisture content"
                type="range"
                min="9"
                max="16"
                step="0.5"
                value={maxMoisture}
                onChange={(e) => setMaxMoisture(parseFloat(e.target.value))}
                className="w-16 accent-[#0D5C3A] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div role="group" aria-label="Filter by crop category" className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              aria-pressed={selectedCategory === cat.id}
              className={`min-h-10 px-4 py-2 text-sm font-bold rounded-md transition-all whitespace-nowrap shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-[#0D5C3A] text-white shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
          <span className="text-xs text-stone-500 ml-auto whitespace-nowrap pl-4">
            Showing <strong className="text-stone-900 tabular-nums">{filteredCrops.length}</strong> available lots
          </span>
        </div>

        {/* Products Grid */}
        {filteredCrops.length === 0 ? (
          <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center text-sm text-stone-600">
            No active listings match these filters. Producers can publish inventory from the Farmer Hub.
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCrops.map((crop, idx) => (
            <motion.div
              key={crop.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (idx % 3) * 0.08, duration: 0.4 }}
              whileHover={{ y: -4 }}
              className="group bg-white rounded-lg border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
            >
              {/* Product Image */}
              <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                <img
                  src={crop.image}
                  alt={crop.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-[#0D5C3A] text-white px-2.5 py-1 rounded-md text-[11px] font-bold shadow-xs">
                  {crop.grade}
                </div>
                <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px] font-semibold text-white">
                  Moisture: <span className="text-[#F7B500] tabular-nums">{crop.moistureContent}%</span>
                </div>
              </div>

              {/* Card Details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-stone-500 mb-1.5">
                    <span className="uppercase tracking-wider font-extrabold text-[10px] text-[#48B749]">{crop.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>MOQ: {crop.minimumOrderTonnes} MT</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums font-medium">{crop.availableStockTonnes} MT In Silo</span>
                  </div>

                  <h3 className="font-display">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCrop(crop);
                        setOrderQuantity(crop.minimumOrderTonnes);
                      }}
                      className="text-left text-base font-bold text-stone-900 group-hover:text-[#0D5C3A] transition"
                    >
                      {crop.name}
                    </button>
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">{crop.variety}</p>

                  <div className="flex items-center gap-1.5 text-xs text-stone-600 mt-3">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="truncate">{crop.location}</span>
                  </div>

                  <div className="mt-2.5 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs">
                    <div className="truncate">
                      <p className="font-semibold text-stone-800 truncate">{crop.farmerName}</p>
                      <p className="text-[11px] text-stone-500 truncate">{crop.farmerFarm}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[#0D5C3A] font-extrabold tabular-nums">★ {crop.farmerRating}</span>
                      <p className="text-[10px] text-stone-500">{crop.farmerCompletedDeals} deals</p>
                    </div>
                  </div>

                  {/* Verification & Sample Actions Strip */}
                  <div className="mt-2.5 pt-2 flex items-center gap-2">
                    <button
                      onClick={() => setCertModalCrop(crop)}
                      className="flex-1 py-1 px-2 bg-emerald-50 hover:bg-emerald-100/80 text-[#0D5C3A] rounded-lg border border-emerald-200/70 text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                      title="View illustrative quality record"
                    >
                      <FileCheck2 className="w-3.5 h-3.5 text-[#48B749] shrink-0" />
                      <span>Lab Sheet</span>
                    </button>
                    <button
                      onClick={() => setSampleModalCrop(crop)}
                      className="flex-1 py-1 px-2 bg-amber-50/80 hover:bg-amber-100/80 text-amber-900 rounded-lg border border-amber-200/80 text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                      title="Preview the sample-request workflow"
                    >
                      <Package className="w-3.5 h-3.5 text-[#F7B500] shrink-0" />
                      <span>1kg Sample</span>
                    </button>
                  </div>
                </div>

                {/* Price Baseline and Primary CTA */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-extrabold text-[#0D5C3A] font-display tabular-nums">
                        {formatPrice(crop.pricePerTonne)}
                      </span>
                      <span className="text-xs text-stone-500 font-normal">
                        / {unit === '50kg' ? '50kg sack' : 'MT'}
                      </span>
                    </div>
                    <span className="text-xs text-stone-600 font-medium">Order terms</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenMessage(crop)}
                      className="p-2 border border-stone-200 text-stone-700 hover:text-stone-900 hover:bg-stone-50 rounded-lg transition"
                      title="Direct message producer"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleQuickAdd(crop)}
                      className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#0D5C3A] hover:bg-[#094B2E] rounded-lg transition shadow-xs whitespace-nowrap cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#F7B500]" />
                      <span>Order Lot</span>
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        )}
      </section>

      {/* Platform capabilities */}
      <section className="bg-white rounded-xl border border-stone-200/80 p-5 sm:p-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-stone-100">
          <div className="px-4 first:pl-0">
            <span className="text-xl sm:text-2xl font-bold text-[#0D5C3A] font-display">Direct</span>
            <p className="text-sm font-bold text-stone-800 mt-1">Farm sourcing</p>
            <p className="text-xs text-stone-600 mt-0.5">Connect with farmer groups and producers</p>
          </div>
          <div className="px-4 pt-4 sm:pt-0">
            <span className="text-xl sm:text-2xl font-bold text-[#0D5C3A] font-display">Lot-level</span>
            <p className="text-sm font-bold text-stone-800 mt-1">Inventory details</p>
            <p className="text-xs text-stone-600 mt-0.5">Compare grade, quantity, and location</p>
          </div>
          <div className="px-4 pt-4 sm:pt-0">
            <span className="text-xl sm:text-2xl font-bold text-[#0D5C3A] font-display">Quality</span>
            <p className="text-sm font-bold text-stone-800 mt-1">Review information</p>
            <p className="text-xs text-stone-600 mt-0.5">Inspect listed moisture and certificates</p>
          </div>
          <div className="px-4 pt-4 sm:pt-0">
            <span className="text-xl sm:text-2xl font-bold text-[#0D5C3A] font-display">Trade</span>
            <p className="text-sm font-bold text-stone-800 mt-1">Order workflow</p>
            <p className="text-xs text-stone-600 mt-0.5">Follow checkout and delivery steps</p>
          </div>
        </div>
      </section>

      {/* 4 Core Platform Ecosystem Modules in Dedicated Container Boxes */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#48B749]">
              <Sparkles className="w-3.5 h-3.5 text-[#F7B500]" />
              <span>Integrated Agricultural Platform</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0D5C3A] font-display mt-0.5">
              Core Platform Ecosystem
            </h2>
            <p className="text-xs text-stone-600 mt-0.5">
              Four dedicated, secure modules designed to streamline trade, logistics, and farmer livelihoods.
            </p>
          </div>
          <span className="text-xs text-stone-500 font-medium hidden sm:inline">
            Click any container to enter module
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Box 1: Farmer Hub */}
          <motion.div
            whileHover={{ y: -5, boxShadow: "0 12px 30px -8px rgba(13, 92, 58, 0.18)" }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded-lg border border-stone-200 hover:border-[#0D5C3A] p-5 flex flex-col justify-between transition-all relative overflow-hidden group"
          >
            {/* Top Color Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#0D5C3A]" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#0D5C3A]/10 text-[#0D5C3A] flex items-center justify-center group-hover:bg-[#0D5C3A] group-hover:text-white transition-colors duration-300 shadow-xs">
                  <Package className="w-6 h-6 text-[#0D5C3A] group-hover:text-[#F7B500] transition-colors" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-[#0D5C3A] border border-emerald-200/80">
                  Silo Management
                </span>
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-stone-900 font-display group-hover:text-[#0D5C3A] transition-colors">
                  Farmer Hub
                </h3>
                <p className="text-xs font-semibold text-[#48B749] mt-0.5">
                  Inventory &amp; Sales Terminal
                </p>
                <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                  Register new harvest batches, calibrate moisture levels, monitor silo stocks, and manage outgrower sales with rural offline sync.
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-stone-100 text-[11px] text-stone-600 font-medium">
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#48B749] shrink-0" />
                  <span>Harvest lot cataloging</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#48B749] shrink-0" />
                  <span>Offline field data persistence</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#48B749] shrink-0" />
                  <span>Automated lot &amp; moisture tags</span>
                </p>
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-stone-100">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => (onNavigateTab ? onNavigateTab('farmer') : onSwitchToFarmer())}
                className="w-full py-2.5 px-4 bg-[#0D5C3A] hover:bg-[#094B2E] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Enter Farmer Hub</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#F7B500]" />
              </motion.button>
            </div>
          </motion.div>

          {/* Box 2: Shipment Tracking */}
          <motion.div
            whileHover={{ y: -5, boxShadow: "0 12px 30px -8px rgba(13, 92, 58, 0.18)" }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded-lg border border-stone-200 hover:border-[#0D5C3A] p-5 flex flex-col justify-between transition-all relative overflow-hidden group"
          >
            {/* Top Color Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#48B749]" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#48B749]/10 text-[#0D5C3A] flex items-center justify-center group-hover:bg-[#0D5C3A] group-hover:text-white transition-colors duration-300 shadow-xs">
                  <Truck className="w-6 h-6 text-[#0D5C3A] group-hover:text-[#F7B500] transition-colors" />
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200/80">
                  Sample tracking
                </span>
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-stone-900 font-display group-hover:text-[#0D5C3A] transition-colors">
                  Shipment Tracking
                </h3>
                <p className="text-xs font-semibold text-[#48B749] mt-0.5">
                  Saved shipment status
                </p>
                <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                  Explore sample shipment progress and cargo-condition details from farm gate to destination.
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-stone-100 text-[11px] text-stone-600 font-medium">
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#48B749] shrink-0" />
                  <span>Simulated GPS trip progress</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#48B749] shrink-0" />
                  <span>Cargo temperature &amp; humidity</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#48B749] shrink-0" />
                  <span>Weighbridge electronic receipts</span>
                </p>
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-stone-100">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => (onNavigateTab ? onNavigateTab('tracking') : onTrackWaybill('AGRO-TRK-88294'))}
                className="w-full py-2.5 px-4 bg-[#0D5C3A] hover:bg-[#094B2E] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Track Consignments</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#F7B500]" />
              </motion.button>
            </div>
          </motion.div>

          {/* Box 3: Direct Trade */}
          <motion.div
            whileHover={{ y: -5, boxShadow: "0 12px 30px -8px rgba(13, 92, 58, 0.18)" }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded-lg border border-stone-200 hover:border-[#0D5C3A] p-5 flex flex-col justify-between transition-all relative overflow-hidden group"
          >
            {/* Top Color Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#F7B500]" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#F7B500]/15 text-[#0D5C3A] flex items-center justify-center group-hover:bg-[#0D5C3A] group-hover:text-white transition-colors duration-300 shadow-xs">
                  <MessageSquare className="w-6 h-6 text-[#0D5C3A] group-hover:text-[#F7B500] transition-colors" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200/80">
                  Buyer-Seller Chat
                </span>
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-stone-900 font-display group-hover:text-[#0D5C3A] transition-colors">
                  Direct Trade
                </h3>
                <p className="text-xs font-semibold text-[#48B749] mt-0.5">
                  Direct Contract Negotiation
                </p>
                <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                  Connect commercial procurement teams directly with farmer syndicates. Issue instant price quotes and schedule pickups.
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-stone-100 text-[11px] text-stone-600 font-medium">
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#48B749] shrink-0" />
                  <span>Instant volume &amp; price quotes</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#48B749] shrink-0" />
                  <span>Interactive trade proposals</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#48B749] shrink-0" />
                  <span>Seamless escrow checkout link</span>
                </p>
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-stone-100">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (onNavigateTab) onNavigateTab('messages');
                  else if (flagshipRice) onOpenMessage(flagshipRice);
                }}
                className="w-full py-2.5 px-4 bg-[#0D5C3A] hover:bg-[#094B2E] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Open Direct Trade</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#F7B500]" />
              </motion.button>
            </div>
          </motion.div>

          {/* Box 4: The Escrow Vault */}
          <motion.div
            whileHover={{ y: -5, boxShadow: "0 12px 30px -8px rgba(13, 92, 58, 0.18)" }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded-lg border border-stone-200 hover:border-[#0D5C3A] p-5 flex flex-col justify-between transition-all relative overflow-hidden group"
          >
            {/* Top Color Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#06331F]" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#0D5C3A]/10 text-[#0D5C3A] flex items-center justify-center group-hover:bg-[#0D5C3A] group-hover:text-white transition-colors duration-300 shadow-xs">
                  <ShieldCheck className="w-6 h-6 text-[#0D5C3A] group-hover:text-[#F7B500] transition-colors" />
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-[#0D5C3A] border border-emerald-200/80">
                  Order sequence
                </span>
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-stone-900 font-display group-hover:text-[#0D5C3A] transition-colors">
                  The Escrow Vault
                </h3>
                <p className="text-xs font-semibold text-[#48B749] mt-0.5">
                  Order Settlement Workflow
                </p>
                <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                  Review the proposed order steps. Payment processing is not connected.
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-stone-100 text-[11px] text-stone-600 font-medium">
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#48B749] shrink-0" />
                  <span>Order and delivery milestones</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#48B749] shrink-0" />
                  <span>Example payout destinations</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#48B749] shrink-0" />
                  <span>Inspection-linked release step</span>
                </p>
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-stone-100">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => (onNavigateTab ? onNavigateTab('escrow') : null)}
                className="w-full py-2.5 px-4 bg-[#0D5C3A] hover:bg-[#094B2E] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>View Escrow Vault</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#F7B500]" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3-Step "How to Trade with Confidence" Buyer/Farmer Onboarding Guide */}
      <TradeConfidenceGuide
        onExploreEscrow={() => onNavigateTab && onNavigateTab('escrow')}
        onExploreTracking={() => onNavigateTab && onNavigateTab('tracking')}
      />

      {/* Flagship Brand Spotlight */}
      <section id="flagship-spotlight" className="bg-[#FAF9F5] rounded-3xl border border-stone-200/80 p-6 sm:p-10 lg:p-12 overflow-hidden shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Flagship Product Packaging Image */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="relative rounded-2xl overflow-hidden shadow-xl border-4 border-white aspect-[4/3] w-full max-w-md bg-stone-100 group"
            >
              <img
                src="https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=800&q=80"
                alt="Agroline Royal Aromatic Long-Grain Rice Sacks"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
              />
              <div className="absolute top-3 left-3 bg-[#0D5C3A] text-white px-3 py-1 rounded-full text-[11px] font-bold shadow-xs flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#F7B500]" />
                <span>Flagship Consumer Brand</span>
              </div>
            </motion.div>
          </div>

          {/* Flagship Content */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#48B749]">
                <span>Our Flagship Harvest</span>
                <span aria-hidden="true">·</span>
                <span>Kasunya Valley Scheme</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0D5C3A] font-display mt-1">
                Agroline Royal Aromatic Rice
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 font-medium mt-1">
                Super-Fragrant Jasmine Long-Grain · Cultivated by 850 Women Outgrowers
              </p>
              <p className="text-xs sm:text-sm text-stone-700 mt-3 leading-relaxed">
                  Example details for origin, packaging, and quality fields.
              </p>
            </div>

            {/* Quality Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-2xs">
                <span className="font-bold text-[#0D5C3A] block">Origin</span>
                <span className="text-xs text-stone-600">Sample location</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-2xs">
                <span className="font-bold text-[#0D5C3A] block">Handling</span>
                <span className="text-xs text-stone-600">Example detail</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-2xs">
                <span className="font-bold text-[#0D5C3A] block">Moisture</span>
                <span className="text-xs text-stone-600">Sample reading</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-2xs">
                <span className="font-bold text-[#0D5C3A] block">Producer</span>
                <span className="text-xs text-stone-600">Sample profile</span>
              </div>
            </div>

            {/* Pack Size Selector */}
            <div className="pt-2">
              <span className="text-xs font-bold text-stone-800 block mb-2">Select Packaging Size:</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { size: '5kg', label: '5kg Pouch', price: '$8.50' },
                  { size: '25kg', label: '25kg Sack', price: '$38.00' },
                  { size: '50kg', label: '50kg Wholesale', price: '$72.00' },
                  { size: '1MT', label: '1 MT Bulk Pallet', price: '$580.00' },
                ].map((pack) => (
                  <button
                    key={pack.size}
                    onClick={() => setSelectedPackSize(pack.size as any)}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      selectedPackSize === pack.size
                        ? 'border-[#0D5C3A] bg-[#0D5C3A]/10 font-bold text-[#0D5C3A]'
                        : 'border-stone-300 bg-white hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <span className="block text-xs">{pack.label}</span>
                    <span className="text-sm font-extrabold text-[#0D5C3A] tabular-nums">{pack.price}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Row */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddFlagshipPack}
                className="px-6 py-3 bg-[#0D5C3A] hover:bg-[#094B2E] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4 text-[#F7B500]" />
                <span>Add {selectedPackSize} to Escrow Cart</span>
              </motion.button>
              <button
                onClick={() => flagshipRice && onOpenMessage(flagshipRice)}
                className="px-5 py-3 border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 font-semibold text-xs sm:text-sm rounded-xl transition flex items-center gap-1.5"
              >
                <MessageSquare className="w-4 h-4 text-stone-600" />
                <span>Chat with Outgrower Scheme</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Meet the Outgrowers Ribbon & Cooperative Stories */}
      <OutgrowerSpotlight
        onOpenMessage={(_farmerName, cropName) => {
          const crop = crops.find((item) => item.name.toLowerCase().includes(cropName.toLowerCase()));
          if (crop) onOpenMessage(crop);
          else if (onNavigateTab) onNavigateTab('messages');
        }}
        onFilterByProducer={(producerName) => {
          setSearchQuery(producerName);
          document.getElementById('commodities-catalog')?.scrollIntoView({
            behavior: prefersReducedMotion ? 'auto' : 'smooth',
          });
        }}
      />

      {/* Crop Lot Detail & Escrow Purchase Modal */}
      <AnimatePresence>
        {selectedCrop && (
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
              transition={{ duration: 0.25 }}
              className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8"
            >
              <div className="relative aspect-[16/9] bg-stone-100">
                <img
                  src={selectedCrop.image}
                  alt={selectedCrop.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setSelectedCrop(null)}
                  className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-xs transition"
                >
                  ✕
                </button>
                <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#0D5C3A] border border-stone-200">
                  {selectedCrop.grade} · Moisture: {selectedCrop.moistureContent}%
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-extrabold text-[#48B749] tracking-wider">
                      {selectedCrop.category} · Harvest {selectedCrop.harvestDate}
                    </span>
                    <span className="text-xs font-bold text-[#0D5C3A] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Sample inventory
                    </span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-stone-900 font-display mt-1">{selectedCrop.name}</h2>
                  <p className="text-sm text-stone-600 mt-1">{selectedCrop.variety} · Produced by {selectedCrop.farmerFarm}</p>
                  <p className="text-xs text-stone-700 mt-3 leading-relaxed">{selectedCrop.description}</p>
                </div>

                {/* Technical Specifications */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs">
                  <div>
                    <span className="text-stone-500 block">Moisture Content</span>
                    <span className="font-bold text-stone-900 tabular-nums">{selectedCrop.moistureContent}%</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block">Available Stock</span>
                    <span className="font-bold text-stone-900 tabular-nums">{selectedCrop.availableStockTonnes} MT</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block">Min. Order (MOQ)</span>
                    <span className="font-bold text-stone-900 tabular-nums">{selectedCrop.minimumOrderTonnes} MT</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block">Packaging</span>
                    <span className="font-bold text-stone-900 truncate block">{selectedCrop.packaging}</span>
                  </div>
                </div>

                {/* Verified Certificates & Actions */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-stone-800">Listed Quality Information</h4>
                    <span className="text-xs text-stone-600 font-medium">Sample certificates</span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {selectedCrop.certifications.map((cert, i) => (
                      <span key={i} className="bg-stone-100 text-stone-700 px-2.5 py-1 rounded-lg border border-stone-200 font-medium">
                        ✓ {cert}
                      </span>
                    ))}
                  </div>

                  {/* Actions for Laboratory Certificate and Free 1kg Sample */}
                  <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setCertModalCrop(selectedCrop)}
                      className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100/90 text-[#0D5C3A] rounded-xl text-xs font-bold border border-emerald-200/90 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileCheck2 className="w-4 h-4 text-[#48B749]" />
                      <span>View Sample Lab Data</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSampleModalCrop(selectedCrop)}
                      className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100/90 text-amber-900 rounded-xl text-xs font-bold border border-amber-200/90 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Package className="w-4 h-4 text-[#F7B500]" />
                      <span>Request 1kg Free Physical Sample</span>
                    </button>
                  </div>
                </div>

                {/* Quantity Stepper & Calculation */}
                <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">
                      Select Metric Tonnes (Min {selectedCrop.minimumOrderTonnes} MT):
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={selectedCrop.minimumOrderTonnes}
                        max={selectedCrop.availableStockTonnes}
                        value={orderQuantity}
                        onChange={(e) => setOrderQuantity(Math.max(selectedCrop.minimumOrderTonnes, parseInt(e.target.value) || selectedCrop.minimumOrderTonnes))}
                        className="w-24 px-3 py-1.5 border border-stone-300 rounded-lg text-sm font-bold tabular-nums"
                      />
                      <span className="text-xs text-stone-500">Metric Tonnes</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-stone-500 block">Total Escrow Amount</span>
                    <span className="text-2xl font-extrabold text-[#0D5C3A] font-display tabular-nums block">
                      {formatTotal(orderQuantity * selectedCrop.pricePerTonne)}
                    </span>
                    {currency !== 'USD' && (
                      <span className="text-[11px] text-stone-500">
                        (≈ ${(orderQuantity * selectedCrop.pricePerTonne).toLocaleString()} USD)
                      </span>
                    )}
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => {
                      onOpenMessage(selectedCrop);
                      setSelectedCrop(null);
                    }}
                    className="px-4 py-2.5 border border-stone-300 text-stone-700 hover:bg-stone-50 rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    Direct Chat with {selectedCrop.farmerName}
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      handleQuickAdd(selectedCrop, orderQuantity);
                      setSelectedCrop(null);
                    }}
                    className="px-6 py-2.5 bg-[#0D5C3A] hover:bg-[#094B2E] text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
                  >
                    <span>Add to Escrow Order</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Official Laboratory Quality Inspection Certificate Modal */}
      <LabCertificateModal
        crop={certModalCrop}
        isOpen={!!certModalCrop}
        onClose={() => setCertModalCrop(null)}
      />

      {/* Commercial 1kg Vacuum-Sealed Lab Sample Request Modal */}
      <SampleRequestModal
        crop={sampleModalCrop}
        isOpen={!!sampleModalCrop}
        onClose={() => setSampleModalCrop(null)}
        onSubmitSuccess={(code, name) => {
          setAddedToast(`Sample request saved for ${name}. Reference: ${code}`);
          setTimeout(() => setAddedToast(null), 5000);
        }}
      />
    </div>
    </MotionConfig>
  );
};
