import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running inside installed standalone PWA, hide button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop prompt
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={`flex items-center gap-1.5 font-bold transition rounded-xl text-white bg-[#004D25] hover:bg-[#00381B] ${
          compact ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-1.5 text-xs shadow-sm'
        }`}
        title="Install Agroline PWA for Offline Access"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 font-medium border border-stone-300 text-stone-700 bg-stone-50 hover:bg-stone-100 rounded-lg transition ${
            compact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-xs'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Install iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl border border-stone-200">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h3 className="text-base font-semibold text-stone-900 font-display">Install Agroline on iOS</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-stone-600">
                To access Agroline even in rural areas without mobile data:
              </p>
              <div className="mt-3 space-y-2 text-xs text-stone-700 bg-stone-50 p-3 rounded-lg border border-stone-200">
                <p>1. Tap the <strong className="text-stone-900">Share</strong> icon in the Safari bottom bar.</p>
                <p>2. Scroll down and tap <strong className="text-stone-900">Add to Home Screen</strong>.</p>
                <p>3. Tap <strong className="text-stone-900">Add</strong> at the top right.</p>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-xl bg-[#004D25] py-2 text-xs font-bold text-white hover:bg-[#00381B] transition"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  const [showInfoModal, setShowInfoModal] = useState(false);

  // Fallback install helper button for test/reviewers
  return (
    <>
      <button
        onClick={() => setShowInfoModal(true)}
        className={`hidden sm:flex items-center gap-1.5 font-medium border border-stone-300 text-stone-700 bg-stone-50 hover:bg-stone-100 rounded-lg transition ${
          compact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-xs'
        }`}
        title="PWA Offline Ready"
      >
        <Download className="w-3.5 h-3.5 text-stone-500" />
        <span>PWA Ready</span>
      </button>

      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-base font-semibold text-stone-900 font-display">Agroline Offline PWA</h3>
              <button
                onClick={() => setShowInfoModal(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-stone-600">
              Agroline is a Progressive Web App (PWA). You can install it on your device for instant offline access in rural areas with no network connection.
            </p>
            <div className="mt-3 space-y-1.5 text-xs text-stone-700 bg-stone-50 p-3 rounded-lg border border-stone-200">
              <p>• <strong>Chrome / Edge:</strong> Click the install icon in the URL bar.</p>
              <p>• <strong>Android:</strong> Tap the menu &amp; choose &quot;Install App&quot;.</p>
              <p>• <strong>iOS Safari:</strong> Tap Share &gt; &quot;Add to Home Screen&quot;.</p>
            </div>
            <button
              onClick={() => setShowInfoModal(false)}
              className="mt-4 w-full rounded-xl bg-[#004D25] py-2 text-xs font-bold text-white hover:bg-[#00381B] transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
