import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Pause, Play } from 'lucide-react';
import { useReducedMotion } from 'motion/react';

interface TickerItem {
  commodity: string;
  price: string;
  delta: string;
  trend: 'up' | 'down' | 'neutral';
  hub: string;
}

const SPOT_ITEMS: TickerItem[] = [
  { commodity: 'Aromatic Jasmine Rice', price: '$580/MT', delta: '+1.8%', trend: 'up', hub: 'Kasunya Basin' },
  { commodity: 'Hard Red Winter Wheat', price: '$345/MT', delta: '+0.6%', trend: 'up', hub: 'Nakuru Hub' },
  { commodity: 'Organic Non-GMO Soybeans', price: '$520/MT', delta: '-0.4%', trend: 'down', hub: 'Eldoret Agrozones' },
  { commodity: 'Yellow Flint Feed Corn', price: '$280/MT', delta: '+2.1%', trend: 'up', hub: 'Kitale Terminal' },
  { commodity: 'Whole Green Lentils', price: '$640/MT', delta: '0.0%', trend: 'neutral', hub: 'Machakos Cluster' },
  { commodity: 'High-Oil Sunflower Seeds', price: '$460/MT', delta: '+1.2%', trend: 'up', hub: 'Laikipia Plateau' },
  { commodity: 'Dried High-Starch Cassava', price: '$195/MT', delta: '+0.3%', trend: 'up', hub: 'Kilifi Farm Hub' },
];

export const CommodityTicker: React.FC = () => {
  const [isPaused, setIsPaused] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="bg-[#06331F] text-white border-y border-emerald-950/40 text-xs overflow-hidden select-none py-2.5 shadow-inner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-4">
        {/* Live Badge */}
        <div className="flex items-center gap-2 bg-[#0D5C3A] text-white px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase shrink-0 border border-[#48B749]/40 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-[#F7B500]" />
          <span>Sample Market Data</span>
        </div>

        {/* Ticker Continuous Marquee */}
        <div className="relative flex-1 overflow-hidden mask-gradient-x">
          <div className={`flex items-center gap-6 whitespace-nowrap ${!prefersReducedMotion && !isPaused ? 'animate-marquee' : ''}`}>
            {/* First sequence */}
            {SPOT_ITEMS.map((item, idx) => (
              <div key={`spot-1-${idx}`} className="flex items-center gap-2 text-stone-200">
                <span className="font-semibold text-white">{item.commodity}:</span>
                <span className="font-bold text-[#F7B500] tabular-nums">{item.price}</span>
                <span
                  className={`inline-flex items-center text-[11px] font-bold px-1.5 py-0.5 rounded ${
                    item.trend === 'up'
                      ? 'text-emerald-300 bg-emerald-900/50'
                      : item.trend === 'down'
                      ? 'text-rose-300 bg-rose-900/50'
                      : 'text-stone-300 bg-stone-800'
                  }`}
                >
                  {item.trend === 'up' && <TrendingUp className="w-3 h-3 mr-0.5" />}
                  {item.trend === 'down' && <TrendingDown className="w-3 h-3 mr-0.5" />}
                  {item.trend === 'neutral' && <Minus className="w-3 h-3 mr-0.5" />}
                  {item.delta}
                </span>
                <span className="text-[10px] text-emerald-400/80">({item.hub})</span>
                <span className="text-emerald-800/60 font-mono">|</span>
              </div>
            ))}

            {/* Duplicate sequence for seamless loop */}
            {SPOT_ITEMS.map((item, idx) => (
              <div key={`spot-2-${idx}`} className="flex items-center gap-2 text-stone-200">
                <span className="font-semibold text-white">{item.commodity}:</span>
                <span className="font-bold text-[#F7B500] tabular-nums">{item.price}</span>
                <span
                  className={`inline-flex items-center text-[11px] font-bold px-1.5 py-0.5 rounded ${
                    item.trend === 'up'
                      ? 'text-emerald-300 bg-emerald-900/50'
                      : item.trend === 'down'
                      ? 'text-rose-300 bg-rose-900/50'
                      : 'text-stone-300 bg-stone-800'
                  }`}
                >
                  {item.trend === 'up' && <TrendingUp className="w-3 h-3 mr-0.5" />}
                  {item.trend === 'down' && <TrendingDown className="w-3 h-3 mr-0.5" />}
                  {item.trend === 'neutral' && <Minus className="w-3 h-3 mr-0.5" />}
                  {item.delta}
                </span>
                <span className="text-[10px] text-emerald-400/80">({item.hub})</span>
                <span className="text-emerald-800/60 font-mono">|</span>
              </div>
            ))}
          </div>
        </div>

        {!prefersReducedMotion && (
          <button
            type="button"
            onClick={() => setIsPaused((paused) => !paused)}
            aria-label={isPaused ? 'Resume sample market ticker' : 'Pause sample market ticker'}
            title={isPaused ? 'Resume ticker' : 'Pause ticker'}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/20 text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F7B500]"
          >
            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  );
};
