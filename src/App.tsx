/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { AppTab, Header } from './components/Header';
import { AuthPage } from './components/AuthPage';
import { Marketplace } from './components/Marketplace';
import { FarmerDashboard } from './components/FarmerDashboard';
import { ShipmentTracker } from './components/ShipmentTracker';
import { MessagingCenter } from './components/MessagingCenter';
import { EscrowVaultView } from './components/EscrowVaultView';
import { EscrowPaymentModal } from './components/EscrowPaymentModal';
import { AdminDashboard } from './components/AdminDashboard';
import { OfflineBanner } from './components/OfflineBanner';
import { storageService, OfflineAction } from './services/storage';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { authConfigured, supabase } from './services/supabase';
import { BackendOrder, marketplaceBackend } from './services/marketplaceBackend';
import { adminBackend } from './services/adminBackend';
import { CropItem, InventoryBatch, CartItem, EscrowTransaction, ShipmentTracking, ChatThread, ChatMessage } from './types';
import { MapPin, Phone, Mail, ShieldCheck, Heart } from 'lucide-react';

const TAB_PATHS: Record<AppTab, string> = {
  marketplace: '/marketplace',
  farmer: '/farmer',
  tracking: '/tracking',
  messages: '/messages',
  escrow: '/escrow',
  admin: '/admin',
  'sign-in': '/account/sign-in',
  'sign-up': '/account/sign-up',
  'reset-password': '/account/reset-password',
};

const getTabFromPath = (pathname: string): AppTab => {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/';
  const route = Object.entries(TAB_PATHS).find(([, path]) => path === normalizedPath);
  return (route?.[0] as AppTab | undefined) ?? 'marketplace';
};

export default function App() {
  const [activeTab, setActiveTabState] = useState<AppTab>(() => getTabFromPath(window.location.pathname));

  const setActiveTab = (tab: AppTab) => {
    const nextPath = TAB_PATHS[tab];
    if (window.location.pathname !== nextPath) {
      window.history.pushState({ tab }, '', nextPath);
    }
    setActiveTabState(tab);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  useEffect(() => {
    const initialPath = window.location.pathname;
    const initialTab = getTabFromPath(initialPath);
    if (initialPath !== TAB_PATHS[initialTab]) {
      window.history.replaceState({ tab: initialTab }, '', TAB_PATHS[initialTab]);
    }

    const handlePopState = () => setActiveTabState(getTabFromPath(window.location.pathname));
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        setToastMessage(`Could not restore your sign-in: ${error.message}`);
        return;
      }
      setUserEmail(data.session?.user.email ?? null);
      setUserId(data.session?.user.id ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user.email ?? null);
      setUserId(session?.user.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let active = true;
    setIsAdmin(false);
    if (!userId || !supabase) return () => { active = false; };
    void adminBackend.isAdmin().then((result) => {
      if (active) setIsAdmin(result);
    }).catch((error: unknown) => {
      if (active) {
        setIsAdmin(false);
        showToast(`Could not check admin access: ${error instanceof Error ? error.message : 'Unknown backend error'}`);
      }
    });
    return () => { active = false; };
  }, [userId]);

  useEffect(() => {
    const pageTitles: Record<AppTab, string> = {
      marketplace: 'Marketplace',
      farmer: 'Farmer Hub',
      tracking: 'Shipment Tracking',
      messages: 'Direct Trade',
      escrow: 'Escrow Vault',
      admin: 'Admin',
      'sign-in': 'Sign in',
      'sign-up': 'Create account',
      'reset-password': 'Reset password',
    };
    document.title = `${pageTitles[activeTab]} | Agroline Ltd`;
  }, [activeTab]);
  
  // Data state
  const [crops, setCrops] = useState<CropItem[]>(() => authConfigured ? [] : storageService.getCrops());
  const [inventory, setInventory] = useState<InventoryBatch[]>(() => authConfigured ? [] : storageService.getInventory());
  const [cart, setCart] = useState<CartItem[]>(() => storageService.getCart());
  const [shipments, setShipments] = useState<ShipmentTracking[]>(() => authConfigured ? [] : storageService.getShipments());
  const [escrowTransactions, setEscrowTransactions] = useState<EscrowTransaction[]>(() => authConfigured ? [] : storageService.getEscrowTransactions());
  const [chatThreads, setChatThreads] = useState<ChatThread[]>(() => authConfigured ? [] : storageService.getChatThreads());
  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [offlineQueue, setOfflineQueue] = useState<OfflineAction[]>(() => storageService.getOfflineQueue());

  // UI state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [selectedTrackingWaybill, setSelectedTrackingWaybill] = useState<string>('AGRO-TRK-88294');
  const [activeChatThreadId, setActiveChatThreadId] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Connectivity
  const { isOnline, isSimulated, toggleSimulatedOffline } = useOnlineStatus();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    const loadSharedData = async () => {
      try {
        const marketplaceCrops = await marketplaceBackend.listMarketplaceInventory();
        if (!active) return;
        setCrops(marketplaceCrops);
        if (!userId) {
          setInventory([]);
          setChatThreads([]);
          setShipments([]);
          setEscrowTransactions([]);
          setOrders([]);
          return;
        }

        const [myInventory, threads, remoteShipments, myOrders] = await Promise.all([
          marketplaceBackend.listMyInventory(userId),
          marketplaceBackend.listMyConversations(userId),
          marketplaceBackend.listMyShipments(userId),
          marketplaceBackend.listMyOrders(userId),
        ]);
        if (!active) return;
        setInventory(myInventory);
        setChatThreads(threads);
        setOrders(myOrders);
        setShipments(remoteShipments.map((shipment) => ({
          backendShipmentId: shipment.id,
          canUpdate: shipment.canUpdate,
          trackingNumber: shipment.tracking_number,
          orderId: shipment.order_id,
          cropName: 'Order shipment',
          quantityTonnes: 0,
          carrier: shipment.carrier,
          driverName: '',
          driverPhone: '',
          origin: shipment.origin,
          destination: shipment.destination,
          status: shipment.status,
          progressPercentage: 0,
          estimatedArrival: shipment.estimated_arrival ?? '',
          currentTempCelsius: null,
          currentHumidity: null,
          checkpoints: shipment.events,
        })));
      } catch (error) {
        if (active) {
          const message = error instanceof Error ? error.message : 'Unknown backend error';
          setToastMessage(`Could not load shared marketplace data: ${message}`);
        }
      }
    };
    void loadSharedData();
    return () => { active = false; };
  }, [userId]);

  // Persist cart updates
  useEffect(() => {
    storageService.saveCart(cart);
  }, [cart]);

  // Persist inventory updates
  useEffect(() => {
    if (supabase) return;
    storageService.saveInventory(inventory);
  }, [inventory]);

  // Cart operations
  const handleAddToCart = (crop: CropItem, tonnes: number) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.crop.id === crop.id);
      if (existing) {
        return prev.map((i) =>
          i.crop.id === crop.id ? { ...i, quantityTonnes: i.quantityTonnes + tonnes } : i
        );
      }
      return [...prev, { crop, quantityTonnes: tonnes }];
    });
  };

  const handleUpdateCartQuantity = (cropId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCartItem(cropId);
      return;
    }
    setCart((prev) =>
      prev.map((i) => (i.crop.id === cropId ? { ...i, quantityTonnes: quantity } : i))
    );
  };

  const handleRemoveCartItem = (cropId: string) => {
    setCart((prev) => prev.filter((i) => i.crop.id !== cropId));
  };

  // Farmer batch actions
  const handleAddBatch = async (batchData: Omit<InventoryBatch, 'id'>) => {
    if (supabase) {
      if (!userId) {
        showToast('Sign in before publishing inventory.');
        setActiveTab('sign-in');
        return;
      }
      try {
        const created = await marketplaceBackend.createInventory(userId, batchData);
        setInventory((prev) => [created, ...prev]);
        setCrops(await marketplaceBackend.listMarketplaceInventory());
        showToast(`Harvest lot ${created.lotNumber} published to the marketplace.`);
      } catch (error) {
        showToast(`Could not publish inventory: ${error instanceof Error ? error.message : 'Unknown backend error'}`);
      }
      return;
    }

    const newBatch: InventoryBatch = {
      ...batchData,
      id: `batch-${Date.now()}`,
    };

    setInventory((prev) => [newBatch, ...prev]);

    if (!isOnline) {
      const action = storageService.addToOfflineQueue({
        type: 'add_inventory',
        payload: newBatch,
        description: `Added harvest lot ${newBatch.lotNumber} (${newBatch.quantityTonnes} MT ${newBatch.cropName})`,
      });
      setOfflineQueue(storageService.getOfflineQueue());
      showToast(`Batch saved locally on device. Queued for sync when online.`);
    } else {
      showToast(`Harvest lot ${newBatch.lotNumber} saved on this device.`);
    }
  };

  const handleUpdateBatch = async (id: string, updates: Partial<InventoryBatch>) => {
    if (supabase) {
      if (!userId) {
        showToast('Sign in before editing inventory.');
        return;
      }
      try {
        await marketplaceBackend.updateInventory(userId, id, updates);
        const [myInventory, marketplaceCrops] = await Promise.all([
          marketplaceBackend.listMyInventory(userId),
          marketplaceBackend.listMarketplaceInventory(),
        ]);
        setInventory(myInventory);
        setCrops(marketplaceCrops);
        showToast('Shared inventory updated.');
      } catch (error) {
        showToast(`Could not update inventory: ${error instanceof Error ? error.message : 'Unknown backend error'}`);
      }
      return;
    }

    setInventory((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );
    if (!isOnline) {
      storageService.addToOfflineQueue({
        type: 'update_inventory',
        payload: { id, updates },
        description: `Updated lot settings`,
      });
      setOfflineQueue(storageService.getOfflineQueue());
    }
    showToast(`Batch details updated.`);
  };

  const handleDeleteBatch = async (id: string) => {
    if (supabase) {
      if (!userId) {
        showToast('Sign in before removing inventory.');
        return;
      }
      try {
        await marketplaceBackend.deleteInventory(userId, id);
        setInventory(await marketplaceBackend.listMyInventory(userId));
        setCrops(await marketplaceBackend.listMarketplaceInventory());
        showToast('Shared inventory removed.');
      } catch (error) {
        showToast(`Could not remove inventory: ${error instanceof Error ? error.message : 'Unknown backend error'}`);
      }
      return;
    }

    setInventory((prev) => prev.filter((b) => b.id !== id));
    if (!isOnline) {
      storageService.addToOfflineQueue({
        type: 'delete_inventory',
        payload: { id },
        description: `Archived lot batch`,
      });
      setOfflineQueue(storageService.getOfflineQueue());
    }
    showToast(`Batch removed.`);
  };

  const handleReleaseEscrow = (txId: string) => {
    const updated = escrowTransactions.map((tx) =>
      tx.id === txId ? { ...tx, escrowStatus: 'Released to Farmer' as const } : tx
    );
    setEscrowTransactions(updated);
    storageService.saveEscrowTransactions(updated);
    showToast('Local escrow status updated. No funds were transferred.');
  };

  // Messaging operations
  const handleSendMessage = async (threadId: string, text: string, proposal?: ChatMessage['proposal']) => {
    if (supabase) {
      if (!userId) {
        showToast('Sign in before sending a trade message.');
        return;
      }
      try {
        await marketplaceBackend.sendMessage(threadId, userId, text, proposal);
        setChatThreads(await marketplaceBackend.listMyConversations(userId));
      } catch (error) {
        showToast(`Could not send message: ${error instanceof Error ? error.message : 'Unknown backend error'}`);
      }
      return;
    }

    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      senderId: 'buyer-me',
      senderName: 'You (Procurement)',
      senderRole: 'buyer',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      proposal,
    };

    const updatedThreads = chatThreads.map((thread) => {
      if (thread.id === threadId) {
        return {
          ...thread,
          lastMessage: text,
          lastTimestamp: newMsg.timestamp,
          messages: [...thread.messages, newMsg],
        };
      }
      return thread;
    });

    setChatThreads(updatedThreads);
    storageService.saveChatThreads(updatedThreads);

    if (!isOnline) {
      storageService.addToOfflineQueue({
        type: 'send_message',
        payload: { threadId, message: newMsg },
        description: `Sent message to thread`,
      });
      setOfflineQueue(storageService.getOfflineQueue());
    }
  };

  const handleOpenMessageFromCrop = async (crop: CropItem) => {
    if (supabase) {
      if (!userId) {
        showToast('Sign in to start a shared trade conversation.');
        setActiveTab('sign-in');
        return;
      }
      if (!crop.sellerId) {
        showToast('This sample listing is not connected to a producer account.');
        return;
      }
      try {
        const threadId = await marketplaceBackend.getOrCreateConversation(userId, crop.sellerId, crop.id, crop.name);
        setChatThreads(await marketplaceBackend.listMyConversations(userId));
        setActiveChatThreadId(threadId);
        setActiveTab('messages');
      } catch (error) {
        showToast(`Could not open conversation: ${error instanceof Error ? error.message : 'Unknown backend error'}`);
      }
      return;
    }

    let thread = chatThreads.find((t) => t.contactName.toLowerCase().includes(crop.farmerName.toLowerCase()));
    if (!thread) {
      thread = chatThreads[0];
    }
    setActiveChatThreadId(thread.id);
    setActiveTab('messages');
  };

  const handleAcceptProposal = (proposal: NonNullable<ChatMessage['proposal']>) => {
    const crop = crops.find((c) => c.name.toLowerCase().includes(proposal.cropName.toLowerCase())) || crops[0];
    if (!crop) {
      showToast('No matching live listing is available for this proposal.');
      return;
    }
    handleAddToCart(crop, proposal.tonnes);
    setIsCartOpen(true);
  };

  const handleOpenTrackingWaybill = (waybill: string) => {
    setSelectedTrackingWaybill(waybill);
    setActiveTab('tracking');
  };

  const handleUpdateShipment = (updated: ShipmentTracking) => {
    if (supabase) {
      if (!userId || !updated.backendShipmentId || !updated.canUpdate) {
        showToast('Only the order seller can update this shipment.');
        return;
      }
      const latestCheckpoint = updated.checkpoints[updated.checkpoints.length - 1];
      void marketplaceBackend.addShipmentEvent(
        updated.backendShipmentId,
        updated.status,
        latestCheckpoint?.location ?? updated.origin,
        latestCheckpoint?.notes ?? '',
      ).then(async () => {
        const remoteShipments = await marketplaceBackend.listMyShipments(userId);
        setShipments(remoteShipments.map((shipment) => ({
          backendShipmentId: shipment.id,
          canUpdate: shipment.canUpdate,
          trackingNumber: shipment.tracking_number,
          orderId: shipment.order_id,
          cropName: 'Order shipment',
          quantityTonnes: 0,
          carrier: shipment.carrier,
          driverName: '',
          driverPhone: '',
          origin: shipment.origin,
          destination: shipment.destination,
          status: shipment.status,
          progressPercentage: 0,
          estimatedArrival: shipment.estimated_arrival ?? '',
          currentTempCelsius: null,
          currentHumidity: null,
          checkpoints: shipment.events,
        })));
        showToast('Shipment update saved.');
      }).catch((error: unknown) => {
        showToast(`Could not update shipment: ${error instanceof Error ? error.message : 'Unknown backend error'}`);
      });
      return;
    }
    const newShipments = shipments.map((s) =>
      s.trackingNumber === updated.trackingNumber ? updated : s
    );
    setShipments(newShipments);
    storageService.saveShipments(newShipments);
  };

  const handlePlaceOrder = async (buyerOrganization: string, deliveryAddress: string) => {
    if (!supabase || !userId) {
      showToast('Sign in to submit an order request.');
      return;
    }
    setIsSubmittingOrder(true);
    try {
      await marketplaceBackend.createOrder(
        cart.map(({ crop, quantityTonnes }) => ({
          inventoryId: crop.id,
          quantityTonnes,
        })),
        buyerOrganization,
        deliveryAddress,
      );
      setCart([]);
      const [marketplaceCrops, myOrders] = await Promise.all([
        marketplaceBackend.listMarketplaceInventory(),
        marketplaceBackend.listMyOrders(userId),
      ]);
      setCrops(marketplaceCrops);
      setOrders(myOrders);
      setIsCartOpen(false);
      showToast('Order request recorded. No payment was collected or escrow funded.');
    } catch (error) {
      showToast(`Could not submit order: ${error instanceof Error ? error.message : 'Unknown backend error'}`);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const handleUpdateOrderStatus = async (
    orderId: string,
    status: 'accepted' | 'rejected' | 'cancelled' | 'fulfilled',
  ) => {
    try {
      await marketplaceBackend.updateOrderStatus(orderId, status);
      if (!userId) return;
      const [myOrders, myInventory, marketplaceCrops] = await Promise.all([
        marketplaceBackend.listMyOrders(userId),
        marketplaceBackend.listMyInventory(userId),
        marketplaceBackend.listMarketplaceInventory(),
      ]);
      setOrders(myOrders);
      setInventory(myInventory);
      setCrops(marketplaceCrops);
      showToast(`Order request ${status}. No payment was processed.`);
    } catch (error) {
      showToast(`Could not update order: ${error instanceof Error ? error.message : 'Unknown backend error'}`);
    }
  };

  const handleCreateShipment = async (input: {
    orderId: string;
    trackingNumber: string;
    carrier: string;
    origin: string;
    destination: string;
    estimatedArrival?: string;
    initialStatus: string;
  }) => {
    try {
      await marketplaceBackend.createShipment(input);
      if (!userId) return;
      const remoteShipments = await marketplaceBackend.listMyShipments(userId);
      setShipments(remoteShipments.map((shipment) => ({
        backendShipmentId: shipment.id,
        canUpdate: shipment.canUpdate,
        trackingNumber: shipment.tracking_number,
        orderId: shipment.order_id,
        cropName: 'Order shipment',
        quantityTonnes: 0,
        carrier: shipment.carrier,
        driverName: '',
        driverPhone: '',
        origin: shipment.origin,
        destination: shipment.destination,
        status: shipment.status,
        progressPercentage: 0,
        estimatedArrival: shipment.estimated_arrival ?? '',
        currentTempCelsius: null,
        currentHumidity: null,
        checkpoints: shipment.events,
      })));
      showToast('Shipment record saved. Carrier updates are not connected.');
    } catch (error) {
      showToast(`Could not add shipment: ${error instanceof Error ? error.message : 'Unknown backend error'}`);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="agro-canvas min-h-screen flex flex-col text-stone-900">
      {/* Offline Status & Sync Queue Banner */}
      <OfflineBanner
        isOnline={isOnline}
        isSimulated={isSimulated}
        queue={offlineQueue}
        onToggleSimulated={toggleSimulatedOffline}
      />

      {/* Top Bar Header with Official Logo */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={cart.length}
        onOpenCart={() => setIsCartOpen(true)}
        isOnline={isOnline}
        isSimulated={isSimulated}
        onToggleSimulated={toggleSimulatedOffline}
        unreadCount={1}
        userEmail={userEmail}
        showAdminLink={isAdmin}
        onSignOut={async () => {
          if (supabase) await supabase.auth.signOut();
          setActiveTab('marketplace');
        }}
      />

      {/* Floating Action Toast */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 bg-[#0D5C3A] text-white text-xs px-4 py-2.5 rounded-xl shadow-xl border border-[#48B749]/40 flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-[#F7B500]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-12">
        <motion.div
          key={activeTab}
          initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, ease: 'easeOut' }}
        >
        {(activeTab === 'sign-in' || activeTab === 'sign-up' || activeTab === 'reset-password') && (
          <AuthPage mode={activeTab} onNavigate={setActiveTab} />
        )}

        {activeTab === 'marketplace' && (
          <Marketplace
            crops={crops}
            onAddToCart={handleAddToCart}
            onOpenMessage={handleOpenMessageFromCrop}
            onTrackWaybill={handleOpenTrackingWaybill}
            onSwitchToFarmer={() => setActiveTab('farmer')}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'farmer' && (
          <FarmerDashboard
            inventory={inventory}
            onAddBatch={handleAddBatch}
            onUpdateBatch={handleUpdateBatch}
            onDeleteBatch={handleDeleteBatch}
            isOnline={isOnline}
            isShared={Boolean(supabase)}
            onOpenTracking={handleOpenTrackingWaybill}
          />
        )}

        {activeTab === 'tracking' && (
          <ShipmentTracker
            shipments={shipments}
            selectedTrackingNumber={selectedTrackingWaybill}
            onUpdateShipment={handleUpdateShipment}
            allowSimulation={!supabase}
          />
        )}

        {activeTab === 'messages' && (
          <MessagingCenter
            threads={chatThreads}
            activeThreadId={activeChatThreadId}
            onSendMessage={handleSendMessage}
            isOnline={isOnline}
            isShared={Boolean(supabase)}
            onAcceptProposal={handleAcceptProposal}
          />
        )}

        {activeTab === 'escrow' && (
          <EscrowVaultView
            transactions={escrowTransactions}
            onOpenTracking={handleOpenTrackingWaybill}
            onReleaseEscrow={handleReleaseEscrow}
            orders={orders}
            currentUserId={userId}
            onUpdateOrderStatus={supabase ? handleUpdateOrderStatus : undefined}
            onCreateShipment={supabase ? handleCreateShipment : undefined}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard isAdmin={isAdmin} isSignedIn={Boolean(userId)} />
        )}
        </motion.div>
      </main>

      {/* Escrow Checkout & Cart Drawer Modal */}
      <EscrowPaymentModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onPlaceOrder={handlePlaceOrder}
        isAuthenticated={Boolean(userId)}
        isSubmitting={isSubmittingOrder}
      />

      {/* Clean, Refined Footer with Logo */}
      <footer className="mt-20 border-t border-stone-200 bg-[#06331F] text-white py-14 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Brand column with Logo */}
            <div className="md:col-span-5 space-y-3">
              <div className="bg-white/95 rounded-xl p-2.5 inline-block shadow-sm">
                <img
                  src="/assets/aistudio/file_000000009e7c81f483beba4cbc7e99b0_de416a15.png"
                  alt="Agroline Ltd"
                  className="h-10 w-auto object-contain"
                />
              </div>
              <p className="text-stone-300 text-xs leading-relaxed max-w-sm">
                Empowering smallholder farmers, advancing food sovereignty, and transforming agricultural commerce across Africa through technology, direct escrow, and sustainable value-added production.
              </p>
              <div className="pt-1 flex items-center gap-2 text-[#F7B500] font-semibold text-xs">
                <Heart className="w-4 h-4 fill-current text-[#F7B500]" />
                <span>Agricultural Trade, Rooted in Trust</span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="md:col-span-2 space-y-2">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px] text-[#48B749]">Platform</h4>
              <ul className="space-y-1.5 text-stone-300">
                <li><button onClick={() => setActiveTab('marketplace')} className="hover:text-white transition">Marketplace</button></li>
                <li><button onClick={() => setActiveTab('farmer')} className="hover:text-white transition">Farmer Hub</button></li>
                <li><button onClick={() => setActiveTab('tracking')} className="hover:text-white transition">Shipment Tracking</button></li>
                <li><button onClick={() => setActiveTab('messages')} className="hover:text-white transition">Direct Trade Chat</button></li>
                <li><button onClick={() => setActiveTab('escrow')} className="hover:text-white transition">AgroEscrow™ Vault</button></li>
              </ul>
            </div>

            {/* Standards & Trust */}
            <div className="md:col-span-2 space-y-2">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px] text-[#48B749]">Standards</h4>
              <ul className="space-y-1.5 text-stone-300">
                <li>Crop listings</li>
                <li>Inventory tools</li>
                <li>Shipment status</li>
                <li>Trade messaging</li>
                <li>Offline-ready interface</li>
              </ul>
            </div>

            {/* Regional Hubs & Contact */}
            <div className="md:col-span-3 space-y-2 text-stone-300">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px] text-[#48B749]">Hub Locations</h4>
              <p className="flex items-start gap-1.5">
                <MapPin className="w-4 h-4 text-[#F7B500] shrink-0 mt-0.5" />
                <span>Kasunya Farm Station, Greater Accra & Rift Valley Agricultural Hub</span>
              </p>
              <p className="flex items-center gap-1.5 pt-1">
                <Mail className="w-4 h-4 text-[#F7B500] shrink-0" />
                <span>trade@agroline-agrikings.com</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-[#F7B500] shrink-0" />
                <span>+254 712 884 920 / +233 24 551 9022</span>
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-stone-400">
            <p>© {new Date().getFullYear()} Agroline Ltd. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span>Privacy Policy</span>
              <span>·</span>
              <span>Terms of Trade</span>
              <span>·</span>
              <span>Escrow Protection</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
