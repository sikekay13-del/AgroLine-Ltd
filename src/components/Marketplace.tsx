import React, { useState, useMemo, useRef } from 'react';
import { Search, SlidersHorizontal, MapPin, MessageSquare, Plus, Check, ArrowRight, Volume2, VolumeX, ChevronRight, Sparkles, ShieldCheck, CheckCircle2, Truck, FileCheck2, Package } from 'lucide-react';
import { motion, AnimatePresence, MotionConfig, useReducedMotion } from 'motion/react';
import { CropItem, CropCategory } from '../types';
import heroPoster from '../assets/images/hero_agriculture_harvest_1793303356367.jpg';

interface MarketplaceProps {
  crops: CropItem[];
  onAddToCart: (crop: CropItem, tonnes: number) => boolean;
  onOpenMessage: (crop: CropItem) => void;
  onTrackWaybill: (waybill: string) => void;
  onSwitchToFarmer: () => void;
  onNavigateTab?: (tab: 'marketplace' | 'farmer' | 'tracking' | 'messages' | 'escrow') => void;
}

export type UnitCode = 'MT' | '50kg';

type SortOption = 'recent' | 'price-low-high' | 'price-high-low' | 'name';

export const Marketplace: React.FC<MarketplaceProps> = ({
  crops,
  onAddToCart,
  onOpenMessage,
  onTrackWaybill,
  onSwitchToFarmer,
  onNavigateTab,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CropCategory | 'all'>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [maxMoisture, setMaxMoisture] = useState<number>(15);
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [selectedCrop, setSelectedCrop] = useState<CropItem | null>(null);
  const [orderQuantity, setOrderQuantity] = useState<number>(5);
  const [addedToast, setAddedToast] = useState<string | null>(null);

  // Prices are stored in USD; the sack view is a unit conversion, not another currency.
  const [unit, setUnit] = useState<UnitCode>('MT');

  // Video playback
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const prefersReducedMotion = useReducedMotion();
  const flagshipRice = crops[0];

  const formatPrice = (pricePerTonne: number) => {
    if (unit === '50kg') {
      const bagPrice = pricePerTonne / 20;
      return `$${bagPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${Math.round(pricePerTonne).toLocaleString()}`;
  };

  const formatTotal = (amountUsd: number) => {
    return `$${Math.round(amountUsd).toLocaleString()}`;
  };

  const categories: Array<{ id: CropCategory | 'all'; label: string }> = [
    { id: 'all', label: 'All Commodities' },
    { id: 'grains', label: 'Grains & Rice' },
    { id: 'legumes', label: 'Legumes & Pulses' },
    { id: 'oilseeds', label: 'Oilseeds' },
    { id: 'tubers', label: 'Tubers & Roots' },
    { id: 'inputs', label: 'Farm Inputs' },
  ];

  const filteredCrops = useMemo(() => {
    const filtered = crops.filter((item) => {
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
    if (sortBy === 'price-low-high') {
      return filtered.sort((a, b) => a.pricePerTonne - b.pricePerTonne);
    }
    if (sortBy === 'price-high-low') {
      return filtered.sort((a, b) => b.pricePerTonne - a.pricePerTonne);
    }
    if (sortBy === 'name') {
      return filtered.sort((a, b) => a.name.localeCompare(b.name));
    }
    return filtered;
  }, [crops, searchQuery, selectedCategory, selectedGrade, maxMoisture, sortBy]);

  const handleQuickAdd = (crop: CropItem, tonnes?: number) => {
    const qty = tonnes ?? crop.minimumOrderTonnes;
    if (qty < crop.minimumOrderTonnes || qty > crop.availableStockTonnes) {
      setAddedToast(`Order quantity must be between ${crop.minimumOrderTonnes} and ${crop.availableStockTonnes} MT.`);
      setTimeout(() => setAddedToast(null), 3000);
      return;
    }
    if (!onAddToCart(crop, qty)) return;
    setAddedToast(`${qty} MT of ${crop.name} added to your order cart`);
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
          poster={heroPoster}
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
            Browse producer listings, review available lot details, and submit an order request.
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

      <section aria-labelledby="available-lots-title" className="space-y-3">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#0D5C3A]">Current producer inventory</p>
            <h2 id="available-lots-title" className="text-lg font-bold font-display text-stone-900">Available crop lots</h2>
          </div>
          <a href="#commodities-catalog" className="shrink-0 text-xs font-bold text-[#0D5C3A] hover:text-[#094B2E] underline underline-offset-4">
            Browse all lots
          </a>
        </div>
        {crops.length > 0 ? <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
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
                aria-label={`Add ${crop.name} to order cart`}
                disabled={crop.minimumOrderTonnes > crop.availableStockTonnes}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0D5C3A] text-white transition hover:bg-[#094B2E]"
              >
                <Plus className="h-4 w-4 text-[#F7B500]" />
              </button>
            </article>
          ))}
        </div> : <p className="rounded-xl border border-stone-200 bg-white p-4 text-sm text-stone-600">No active producer listings yet.</p>}
      </section>

      {/* Commodity Search & Catalog Section */}
      <section id="commodities-catalog" className="space-y-6 pt-2">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-stone-200 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#48B749]">
              <Sparkles className="w-3.5 h-3.5 text-[#F7B500]" />
              <span>Producer marketplace</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0D5C3A] font-display mt-0.5">
              Available Farm Commodities
            </h2>
            <p className="text-sm text-stone-600 mt-1">
              Listings are supplied by producers. Prices are shown in USD as provided.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
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
            <span className="text-xs text-stone-500">Currency: USD</span>
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
              <option value="organic">Organic listing</option>
            </select>

            <label className="sr-only" htmlFor="marketplace-sort">Sort listings</label>
            <select
              id="marketplace-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="min-h-10 bg-stone-50 border border-stone-200 text-stone-800 py-1.5 px-3 rounded-md focus:outline-none font-medium"
            >
              <option value="recent">Recently listed</option>
              <option value="price-low-high">Price: low to high</option>
              <option value="price-high-low">Price: high to low</option>
              <option value="name">Name: A to Z</option>
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
          <span aria-live="polite" className="text-xs text-stone-500 ml-auto whitespace-nowrap pl-4">
            Showing <strong className="text-stone-900 tabular-nums">{filteredCrops.length}</strong> available lots
          </span>
        </div>

        {/* Products Grid */}
        {filteredCrops.length === 0 ? (
          <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center text-sm text-stone-600">
            {crops.length === 0
              ? 'No active producer listings yet. Connect the shared marketplace service to publish and browse real inventory.'
              : 'No active listings match these filters. Try changing your search or filters.'}
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
                    <span className="uppercase tracking-wider font-extrabold text-[10px] text-[#48B749]">{categories.find((category) => category.id === crop.category)?.label ?? crop.category}</span>
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
                    {(crop.farmerRating > 0 || crop.farmerCompletedDeals > 0) && (
                      <div className="text-right shrink-0">
                        {crop.farmerRating > 0 && <span className="text-[#0D5C3A] font-extrabold tabular-nums">★ {crop.farmerRating}</span>}
                        {crop.farmerCompletedDeals > 0 && <p className="text-[10px] text-stone-500">{crop.farmerCompletedDeals} deals</p>}
                      </div>
                    )}
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
                      disabled={crop.minimumOrderTonnes > crop.availableStockTonnes}
                      className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#0D5C3A] hover:bg-[#094B2E] rounded-lg transition shadow-xs whitespace-nowrap cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
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
              Marketplace tools
            </h2>
            <p className="text-xs text-stone-600 mt-0.5">
              Review listings, manage inventory, exchange messages, and record shipment updates.
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
                  Keep inventory records on this device or publish shared listings when the account service is configured.
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-stone-100 text-[11px] text-stone-600 font-medium">
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#48B749] shrink-0" />
                  <span>Harvest lot cataloging</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#48B749] shrink-0" />
                  <span>Local inventory drafts</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#48B749] shrink-0" />
                  <span>Producer-entered lot details</span>
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
                  Seller-entered status
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
                  Review shipment records entered by the seller. Carrier GPS and sensor feeds are not connected.
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-stone-100 text-[11px] text-stone-600 font-medium">
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#48B749] shrink-0" />
                  <span>Seller-entered shipment events</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#48B749] shrink-0" />
                  <span>Carrier feeds are not connected</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#48B749] shrink-0" />
                  <span>No sensor or weighbridge integration</span>
                </p>
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-stone-100">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => (onNavigateTab ? onNavigateTab('tracking') : onTrackWaybill(''))}
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
                  Send messages to producers using the shared messaging service.
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-stone-100 text-[11px] text-stone-600 font-medium">
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#48B749] shrink-0" />
                  <span>Shared buyer-producer conversations</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#48B749] shrink-0" />
                  <span>Order requests stored in Supabase</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#48B749] shrink-0" />
                  <span>Payment processing is not connected</span>
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

          {/* Box 4: Order requests */}
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
                  Order requests
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
                  <span>Review request status</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#48B749] shrink-0" />
                  <span>Payments and escrow are not connected</span>
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
                <span>View order requests</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#F7B500]" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {flagshipRice && <section className="bg-[#FAF9F5] rounded-3xl border border-stone-200/80 p-6 sm:p-10 lg:p-12 overflow-hidden shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Flagship Product Packaging Image */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="relative rounded-2xl overflow-hidden shadow-xl border-4 border-white aspect-[4/3] w-full max-w-md bg-stone-100 group"
            >
              <img
                src={flagshipRice.image}
                alt={flagshipRice.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
              />
              <div className="absolute top-3 left-3 bg-[#0D5C3A] text-white px-3 py-1 rounded-full text-[11px] font-bold shadow-xs flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#F7B500]" />
                <span>Featured listing</span>
              </div>
            </motion.div>
          </div>

          {/* Flagship Content */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#48B749]">
                <span>Featured producer listing</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0D5C3A] font-display mt-1">
                {flagshipRice.name}
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 font-medium mt-1">
                {flagshipRice.variety} · {flagshipRice.location}
              </p>
              <p className="text-xs sm:text-sm text-stone-700 mt-3 leading-relaxed">
                {flagshipRice.description}
              </p>
            </div>

            {/* Quality Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-2xs">
                <span className="font-bold text-[#0D5C3A] block">Origin</span>
                <span className="text-xs text-stone-600">{flagshipRice.location}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-2xs">
                <span className="font-bold text-[#0D5C3A] block">Handling</span>
                <span className="text-xs text-stone-600">{flagshipRice.packaging || 'Not provided'}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-2xs">
                <span className="font-bold text-[#0D5C3A] block">Moisture</span>
                <span className="text-xs text-stone-600">{flagshipRice.moistureContent}%</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-2xs">
                <span className="font-bold text-[#0D5C3A] block">Producer</span>
                <span className="text-xs text-stone-600">{flagshipRice.farmerName}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <motion.button
                type="button"
                onClick={() => {
                  setSelectedCrop(flagshipRice);
                  setOrderQuantity(flagshipRice.minimumOrderTonnes);
                }}
                className="px-6 py-3 bg-[#0D5C3A] hover:bg-[#094B2E] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center gap-2"
              >
                <span>View listing details</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
              <button
                onClick={() => flagshipRice && onOpenMessage(flagshipRice)}
                className="px-5 py-3 border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 font-semibold text-xs sm:text-sm rounded-xl transition flex items-center gap-1.5"
              >
                <MessageSquare className="w-4 h-4 text-stone-600" />
                <span>Contact producer</span>
              </button>
            </div>
          </div>
        </div>
      </section>}

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
                      Producer listing
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
                    <span className="font-bold text-stone-900 truncate block">{selectedCrop.packaging || 'Not provided'}</span>
                  </div>
                </div>

                {/* Producer-provided listing information */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-stone-800">Certifications listed by producer</h4>
                    <span className="text-xs text-stone-600 font-medium">Not independently verified here</span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {selectedCrop.certifications.length > 0 ? selectedCrop.certifications.map((cert, i) => (
                      <span key={i} className="bg-stone-100 text-stone-700 px-2.5 py-1 rounded-lg border border-stone-200 font-medium">
                        {cert}
                      </span>
                    )) : <span className="text-stone-500">No certifications listed.</span>}
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
                        step="0.1"
                        value={orderQuantity}
                        onChange={(e) => setOrderQuantity(Math.min(selectedCrop.availableStockTonnes, Math.max(selectedCrop.minimumOrderTonnes, parseFloat(e.target.value) || selectedCrop.minimumOrderTonnes)))}
                        className="w-24 px-3 py-1.5 border border-stone-300 rounded-lg text-sm font-bold tabular-nums"
                      />
                      <span className="text-xs text-stone-500">Metric Tonnes</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-stone-500 block">Estimated product subtotal</span>
                    <span className="text-2xl font-extrabold text-[#0D5C3A] font-display tabular-nums block">
                      {formatTotal(orderQuantity * selectedCrop.pricePerTonne)}
                    </span>
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
                    <span>Add to order request</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
    </MotionConfig>
  );
};
