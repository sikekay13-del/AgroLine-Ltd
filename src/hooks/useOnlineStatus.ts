import { useState, useEffect } from 'react';
import { storageService } from '../services/storage';

export function useOnlineStatus() {
  const [browserOnline, setBrowserOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [simulatedOffline, setSimulatedOfflineState] = useState<boolean>(() =>
    storageService.getSimulatedOffline()
  );

  useEffect(() => {
    const handleOnline = () => setBrowserOnline(true);
    const handleOffline = () => setBrowserOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleSimulatedOffline = () => {
    const nextVal = !simulatedOffline;
    setSimulatedOfflineState(nextVal);
    storageService.setSimulatedOffline(nextVal);
  };

  const isEffectiveOnline = browserOnline && !simulatedOffline;

  return {
    isOnline: isEffectiveOnline,
    browserOnline,
    isSimulated: simulatedOffline,
    toggleSimulatedOffline,
  };
}
