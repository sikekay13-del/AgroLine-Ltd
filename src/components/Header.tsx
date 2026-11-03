import React, { useState } from 'react';
import { LogOut, Menu, ShoppingBag, UserRound, WifiOff, X } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

export type AppTab = 'marketplace' | 'farmer' | 'tracking' | 'messages' | 'escrow' | 'admin' | 'sign-in' | 'sign-up' | 'reset-password';

interface HeaderProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  cartCount: number;
  onOpenCart: () => void;
  isOnline: boolean;
  isSimulated: boolean;
  onToggleSimulated: () => void;
  unreadCount: number;
  userEmail: string | null;
  showAdminLink: boolean;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  cartCount,
  onOpenCart,
  isOnline,
  isSimulated,
  onToggleSimulated,
  unreadCount,
  userEmail,
  showAdminLink,
  onSignOut,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'marketplace', label: 'Marketplace' },
    { id: 'farmer', label: 'Farmer Hub' },
    { id: 'tracking', label: 'Tracking' },
    { id: 'messages', label: `Messages${unreadCount > 0 ? ` (${unreadCount})` : ''}` },
    { id: 'escrow', label: 'Orders' },
    ...(showAdminLink ? [{ id: 'admin' as const, label: 'Admin' }] : []),
  ] as const;

  return (
    <header className="sticky top-3 z-50 mx-auto mt-3 w-[calc(100%-24px)] max-w-[1360px]">
      <div className="relative rounded-full border border-[#164C35] bg-[#0B3727]/95 shadow-lg shadow-[#123D2D]/15 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between gap-3 px-3 sm:px-5 lg:px-7">
          <button
            onClick={() => setActiveTab('marketplace')}
            className="flex shrink-0 items-center text-left focus:outline-none"
            aria-label="Agroline Ltd Home"
          >
            <img
              src="/assets/aistudio/file_000000009e7c81f483beba4cbc7e99b0_de416a15.png"
              alt="Agroline Ltd"
              className="h-10 w-auto rounded-md object-contain sm:h-11"
            />
          </button>

          <nav aria-label="Main navigation" className="hidden flex-1 items-center justify-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                aria-current={activeTab === link.id ? 'page' : undefined}
                className={`min-h-10 whitespace-nowrap rounded-full px-4 text-sm font-medium transition-colors ${
                  activeTab === link.id
                    ? 'bg-white/15 text-white'
                    : 'text-white/75 transition duration-200 hover:-translate-y-0.5 hover:bg-white/10 hover:text-white active:translate-y-0'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
            <button
              onClick={onToggleSimulated}
              aria-label={isOnline ? 'Online. Toggle offline mode' : 'Offline mode active. Toggle online mode'}
              className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${
                !isOnline
                  ? 'border-amber-300/60 bg-amber-200/15 text-amber-200'
                  : 'border-white/20 text-white/80 hover:bg-white/10'
              }`}
              title={isOnline ? 'Online. Click to test offline mode' : 'Offline mode active'}
            >
              {!isOnline ? (
                <WifiOff className="h-4 w-4" />
              ) : (
                <span className="h-2 w-2 rounded-full bg-[#85D4A5]" />
              )}
            </button>

            <div className="hidden xl:block"><PWAInstallButton compact /></div>

            <button
              onClick={onOpenCart}
              aria-label={`Open order cart${cartCount > 0 ? `, ${cartCount} items` : ''}`}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition duration-200 hover:-translate-y-0.5 hover:bg-white/10 active:translate-y-0"
            >
              <ShoppingBag className="h-4 w-4 text-[#F7B500]" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-[#F7B500] px-1 text-center text-xs font-bold text-stone-950">
                  {cartCount}
                </span>
              )}
            </button>

            {userEmail ? (
              <>
                <span className="hidden max-w-36 truncate text-sm text-white/80 xl:block">{userEmail}</span>
                <button onClick={onSignOut} aria-label="Sign out" title="Sign out" className="hidden h-10 w-10 items-center justify-center rounded-full text-white/80 hover:bg-white/10 sm:flex">
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setActiveTab('sign-in')} className="hidden min-h-10 items-center gap-2 rounded-full px-3 text-sm font-medium text-white/85 transition duration-200 hover:-translate-y-0.5 hover:bg-white/10 active:translate-y-0 sm:flex">
                  <UserRound className="h-4 w-4" />
                  <span>Sign in</span>
                </button>
                <button onClick={() => setActiveTab('sign-up')} className="hidden min-h-10 items-center rounded-full bg-[#85D4A5] px-4 text-sm font-bold text-[#103A2B] transition duration-200 hover:-translate-y-0.5 hover:bg-[#A2E3B9] hover:shadow-md active:translate-y-0 sm:flex">
                  Create account
                </button>
              </>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-white transition hover:bg-white/10 lg:hidden"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="absolute left-0 right-0 top-[calc(100%+8px)] rounded-2xl border border-stone-200 bg-white p-3 text-stone-900 shadow-xl lg:hidden">
            <nav aria-label="Mobile navigation" className="grid gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => {
                    setActiveTab(link.id);
                    setMobileMenuOpen(false);
                  }}
                  aria-current={activeTab === link.id ? 'page' : undefined}
                  className={`min-h-11 rounded-lg px-3 text-left text-sm font-semibold ${activeTab === link.id ? 'bg-[#EAF3EC] text-[#0D5C3A]' : 'text-stone-700 hover:bg-stone-50'}`}
                >
                  {link.label}
                </button>
              ))}
            </nav>
            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-stone-200 pt-3 sm:hidden">
              {userEmail ? (
                <button onClick={onSignOut} className="col-span-2 min-h-11 rounded-lg bg-stone-100 text-sm font-semibold text-stone-800">Sign out</button>
              ) : (
                <>
                  <button onClick={() => { setActiveTab('sign-in'); setMobileMenuOpen(false); }} className="min-h-11 rounded-lg border border-stone-300 text-sm font-semibold text-stone-800">Sign in</button>
                  <button onClick={() => { setActiveTab('sign-up'); setMobileMenuOpen(false); }} className="min-h-11 rounded-lg bg-[#0D5C3A] text-sm font-bold text-white">Create account</button>
                </>
              )}
            </div>
            <div className="mt-2 border-t border-stone-200 pt-2">
              <button onClick={() => { onToggleSimulated(); setMobileMenuOpen(false); }} className="min-h-10 w-full px-3 text-left text-xs font-semibold text-stone-600">
                {isSimulated ? 'Exit offline mode' : 'Test offline mode'}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
