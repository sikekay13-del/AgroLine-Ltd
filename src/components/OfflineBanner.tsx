import React from 'react';
import { WifiOff, CloudRain } from 'lucide-react';
import { OfflineAction } from '../services/storage';

interface OfflineBannerProps {
  isOnline: boolean;
  isSimulated: boolean;
  queue: OfflineAction[];
  onToggleSimulated: () => void;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  isOnline,
  isSimulated,
  queue,
  onToggleSimulated,
}) => {
  if (isOnline && queue.length === 0 && !isSimulated) {
    return null;
  }

  return (
    <div
      className={`w-full text-xs font-medium px-4 py-2 flex flex-wrap items-center justify-between gap-3 border-b transition-colors ${
        !isOnline
          ? 'bg-amber-100/90 text-amber-900 border-amber-300'
          : queue.length > 0
            ? 'bg-amber-50 text-stone-800 border-amber-200'
          : 'bg-stone-100 text-stone-700 border-stone-200'
      }`}
    >
      <div className="flex items-center gap-2">
        {!isOnline ? (
          <>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600"></span>
            </span>
            <WifiOff className="w-4 h-4 text-amber-800" />
            <span>
              <strong>Rural Offline Mode Active:</strong> You can continue updating harvest stock, managing listings, and composing trade offers. Changes are cached locally on this device.
            </span>
          </>
        ) : queue.length > 0 ? (
          <>
            <CloudRain className="w-4 h-4 text-amber-700" />
            <span>
              <strong>Changes saved locally:</strong> {queue.length} update{queue.length > 1 ? 's' : ''} remain on this device. A server sync service is not connected.
            </span>
          </>
        ) : (
          <>
            <CloudRain className="w-4 h-4 text-stone-600" />
            <span>Field simulation mode enabled.</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <button
          onClick={onToggleSimulated}
          className="text-[11px] underline text-stone-600 hover:text-stone-900 cursor-pointer"
        >
          {isSimulated ? 'Exit Field Offline Test' : 'Test Offline Field Mode'}
        </button>
      </div>
    </div>
  );
};
