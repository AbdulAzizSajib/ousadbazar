'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { Badge } from 'antd';
import { useCartStore } from '@/stores/cartStore';
import { useSearchStore } from '@/stores/searchStore';
import { formatNumber, asset } from '@/lib/config';

interface HeaderProps {
  isLoggedIn: boolean;
  onShowDrawer: () => void;
  onShowLoginModal: () => void;
  onLogout: () => void;
}

export default function Header({
  isLoggedIn,
  onShowDrawer,
  onShowLoginModal,
  onLogout,
}: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showTopBar, setShowTopBar] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const cartProduct = useCartStore((s) => s.cartProduct);
  const totalPrice = useCartStore((s) => s.totalPrice);
  const searchStore = useSearchStore();
  const navSearchInput = useRef<HTMLInputElement>(null);
  const mobileSearchInput = useRef<HTMLInputElement>(null);
  const lastScrollY = useRef(0);

  const navMenus: Record<string, { title: string; items: string[] }[]> = {
    Products: [
      {
        title: 'Personal Care',
        items: ['Skin Care', 'Hair Care', 'Oral Care', 'Bath & Body', 'Men Grooming'],
      },
      {
        title: 'Baby Care',
        items: ['Diapers', 'Baby Food', 'Baby Skin Care', 'Baby Bath', 'Baby Accessories'],
      },
      {
        title: 'Health Food',
        items: ['Protein Supplements', 'Vitamins', 'Herbal Products', 'Nutrition Bars'],
      },
      {
        title: 'Wellness',
        items: ['Immunity Boosters', 'Weight Management', 'Sexual Wellness', 'Ayurveda'],
      },
    ],
    Medicines: [
      {
        title: 'By Category',
        items: [
          'Pain Relief',
          'Cold & Flu',
          'Diabetes Care',
          'Heart Care',
          'Digestive Care',
          'Antibiotics',
        ],
      },
      {
        title: 'Prescription',
        items: ['Upload Prescription', 'Chronic Medicines', 'Refill Medicines'],
      },
      {
        title: 'Popular Brands',
        items: ['Square', 'Beximco', 'Incepta', 'Renata', 'ACI Pharma', 'Eskayef'],
      },
      {
        title: 'Forms',
        items: ['Tablets', 'Capsules', 'Syrups', 'Injections', 'Ointments', 'Drops'],
      },
    ],
    Equipment: [
      {
        title: 'Diagnostic',
        items: ['Thermometers', 'BP Monitors', 'Glucometers', 'Pulse Oximeter', 'Stethoscopes'],
      },
      {
        title: 'Mobility Aids',
        items: ['Wheelchairs', 'Walking Sticks', 'Crutches', 'Walkers'],
      },
      {
        title: 'Respiratory',
        items: ['Nebulizers', 'Oxygen Concentrators', 'CPAP Machines', 'Inhalers'],
      },
      {
        title: 'Orthopedic',
        items: ['Knee Support', 'Back Support', 'Ankle Support', 'Cervical Pillows'],
      },
    ],
  };

  const isSearchPage = pathname === '/search' || pathname === '/search/';

  useEffect(() => {
    if (isSearchPage) {
      setTimeout(() => {
        navSearchInput.current?.focus();
        mobileSearchInput.current?.focus();
      }, 100);
    }
  }, [isSearchPage]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 10) {
        setShowTopBar(true);
      } else if (currentScrollY > lastScrollY.current) {
        setShowTopBar(false);
      } else {
        setShowTopBar(true);
      }
      lastScrollY.current = currentScrollY;
      setShowScrollTop(currentScrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className={`w-full bg-white sticky top-0 z-50 shadow-sm transition-transform duration-300 ease-in-out ${
        showTopBar ? 'translate-y-0' : '-translate-y-[30px]'
      }`}
    >
      {/* Top bar — fixed 30px height */}
      <div className="bg-primary font-light h-[30px] flex items-center">
        <div className="flex items-center justify-center sm:justify-end px-2 container mx-auto text-white">
          <div className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-[13px]">
            <Link className="flex items-center gap-1 sm:gap-2" href="/order-tracking">
              <Icon icon="subway:location" className="shrink-0" />
              <span className="hidden sm:inline">Track Order</span>
              <span className="sm:hidden">Track</span>
            </Link>
            <div className="border-l border-slate-300 h-3" />
            <Link className="flex items-center gap-1 sm:gap-2" href="/order-history">
              <Icon icon="tdesign:chat-bubble-history-filled" className="shrink-0" />
              <span className="hidden sm:inline">Order History</span>
              <span className="sm:hidden">History</span>
            </Link>
            <div className="border-l border-slate-300 h-3" />
            <Link className="flex items-center gap-1 sm:gap-2" href="/">
              <Icon icon="garden:upload-fill-16" className="shrink-0" />
              <span className="hidden sm:inline">Upload Prescription</span>
              <span className="sm:hidden">Upload</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Navbar */}
      <nav className="z-[999] container mx-auto dark:bg-gray-900 px-3 md:px-0">
        <div className="my-0  md:my-3">
          <div className="flex justify-between items-center h-[56px]">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center group">
                <img
                  className="h-9 sm:h-10 md:h-12 w-auto transition-transform duration-300 group-hover:scale-105"
                  src={asset('/images/logo.svg')}
                  alt="Logo"
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center justify-end flex-1 space-x-6 lg:space-x-8 ">
              {/* Search Bar */}
              <div className="flex-1 ml-[75px]">
                {isSearchPage ? (
                  <div className="flex items-center bg-[#f1f5f7] border rounded-xl overflow-hidden shadow-sm">
                    <div className="pl-4">
                      {!searchStore.searchLoading ? (
                        <Icon icon="mingcute:search-line" className="text-primary w-5 h-5" />
                      ) : (
                        <Icon icon="ep:loading" className="text-primary w-5 h-5 animate-spin" />
                      )}
                    </div>
                    <input
                      ref={navSearchInput}
                      type="text"
                      value={searchStore.searchQuery}
                      onChange={(e) => searchStore.search(e.target.value)}
                      placeholder="Search for medicine, brand, symptom..."
                      className="flex-1 px-3 py-2.5 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
                    />
                    {searchStore.searchQuery && (
                      <button
                        onClick={() => searchStore.clearSearch()}
                        type="button"
                        className="px-3"
                      >
                        <Icon
                          icon="mdi:close-circle"
                          className="text-gray-300 w-5 h-5 hover:text-gray-500 transition-colors"
                        />
                      </button>
                    )}
                  </div>
                ) : (
                  <div
                    onClick={() => router.push('/search')}
                    className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 cursor-pointer hover:border-[#012068] hover:bg-white transition-all duration-300 group"
                  >
                    <Icon
                      icon="mingcute:search-line"
                      className="text-gray-400 w-5 h-5 group-hover:text-[#012068] transition-colors"
                    />
                    <span className="ml-3 text-gray-400 text-sm">
                      Search for medicine, brand, symptom...
                    </span>
                  </div>
                )}
              </div>

              {/* Right Side Actions */}
              <div className="flex items-center space-x-3">
                <span className="border p-2 rounded-lg flex items-center gap-2 font-semibold">
                  <Icon className="size-5 text-[#012068]" icon="material-symbols:call" />
                  <h2>01915606090</h2>
                </span>

                <Badge
                  count={cartProduct.length}
                  offset={[-5, 5]}
                  style={{
                    backgroundColor: '#ff3d71',
                    color: '#fff',
                    boxShadow: '0 2px 8px rgba(56,128,114,0.4)',
                  }}
                >
                  <button
                    onClick={onShowDrawer}
                    className="px-4 py-2 rounded-xl bg-[#012068] text-white transition-all duration-300 active:scale-95 flex items-center gap-1.5 text-base font-semibold"
                  >
                    <Icon className="size-5" icon="solar:cart-large-2-outline" />
                    cart
                  </button>
                </Badge>

                {!isLoggedIn ? (
                  <button
                    onClick={onShowLoginModal}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-all duration-300 active:scale-95"
                  >
                    <Icon icon="solar:user-circle-linear" className="w-8 h-8 text-gray-500" />
                    <div className="flex flex-col items-start leading-tight">
                      <span className="text-xs text-gray-500">Hello, Sign in</span>
                      <span className="text-sm font-semibold text-gray-800">Account & Orders</span>
                    </div>
                  </button>
                ) : (
                  <button
                    onClick={onLogout}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-red-600 rounded-lg hover:bg-red-50 transition-all duration-200 active:scale-95"
                  >
                    <Icon icon="solar:logout-2-outline" className="w-4 h-4" />
                    Logout
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-1">
              <Badge
                count={cartProduct.length}
                offset={[-5, 5]}
                style={{
                  backgroundColor: '#388072',
                  color: '#fff',
                  boxShadow: '0 2px 8px rgba(56,128,114,0.4)',
                }}
              >
                <button
                  onClick={onShowDrawer}
                  className="p-2.5 rounded-xl hover:bg-[#388072]/10 transition-all duration-300 active:scale-95"
                >
                  <Icon
                    className="w-6 h-6 text-gray-600 dark:text-gray-300"
                    icon="solar:cart-large-2-outline"
                  />
                </button>
              </Badge>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2.5 rounded-xl hover:bg-[#388072]/10 transition-all duration-300 active:scale-95"
              >
                <Icon
                  className="w-6 h-6 text-gray-700 dark:text-gray-200"
                  icon={isMenuOpen ? 'solar:close-circle-outline' : 'solar:hamburger-menu-outline'}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-b border-[#388072]/10 shadow-lg">
            <div className="px-4 pt-3 pb-4 space-y-1">
              <Link
                href="/all-medicines"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold text-gray-700 dark:text-gray-200 hover:text-[#388072] hover:bg-[#388072]/10 transition-all duration-200"
              >
                <Icon icon="solar:shop-outline" className="w-5 h-5" /> Shop
              </Link>
              <Link
                href={isLoggedIn ? '/order' : '/guest-order'}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold text-gray-700 dark:text-gray-200 hover:text-[#388072] hover:bg-[#388072]/10 transition-all duration-200"
              >
                <Icon icon="solar:bag-check-outline" className="w-5 h-5" /> My Orders
              </Link>
              <div className="pt-3 px-1">
                {!isLoggedIn ? (
                  <button
                    type="button"
                    onClick={onShowLoginModal}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl hover:bg-gray-100 transition-all duration-300 active:scale-[0.98]"
                  >
                    <Icon icon="solar:user-circle-linear" className="w-8 h-8 text-gray-500" />
                    <div className="flex flex-col items-start leading-tight">
                      <span className="text-xs text-gray-500">Hello, Sign in</span>
                      <span className="text-sm font-semibold text-gray-800">Account & Orders</span>
                    </div>
                  </button>
                ) : (
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-red-600 font-semibold hover:bg-red-50 transition-all duration-200"
                  >
                    <Icon icon="solar:logout-2-outline" /> Logout
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Search */}
        <div className="md:hidden bg-white dark:bg-gray-800 relative z-[998] px-3 pb-2">
          {isSearchPage ? (
            <div className="flex items-center bg-white border-2 border-[#388072] rounded-full overflow-hidden shadow-sm">
              <div className="pl-4">
                {!searchStore.searchLoading ? (
                  <Icon icon="mingcute:search-line" className="text-[#388072] w-[18px] h-[18px]" />
                ) : (
                  <Icon
                    icon="ep:loading"
                    className="text-[#388072] w-[18px] h-[18px] animate-spin"
                  />
                )}
              </div>
              <input
                ref={mobileSearchInput}
                type="text"
                value={searchStore.searchQuery}
                onChange={(e) => searchStore.search(e.target.value)}
                placeholder="Search medicines..."
                className="flex-1 px-3 py-2.5 bg-transparent outline-none text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400"
              />
              {searchStore.searchQuery && (
                <button onClick={() => searchStore.clearSearch()} type="button" className="px-3">
                  <Icon
                    icon="mdi:close-circle"
                    className="text-gray-300 w-[18px] h-[18px] hover:text-gray-500 transition-colors"
                  />
                </button>
              )}
            </div>
          ) : (
            <div
              onClick={() => router.push('/search')}
              className="flex items-center bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 px-4 py-2.5 cursor-pointer hover:border-[#388072] transition-all duration-300"
            >
              <Icon icon="mingcute:search-line" className="text-gray-400 w-[18px] h-[18px]" />
              <span className="ml-3 text-gray-400 text-sm">Search for medicine, brand, symptom...</span>
            </div>
          )}
        </div>
      </nav>

      {/* Desktop sub-navigation */}
      <div className="py-2 hidden md:block bg-opacity-50 bg-[#eaebf4] relative" ref={dropdownRef}>
        <div className="flex items-center text-base text-zinc-900 font-medium space-x-4 justify-center gap-5 container mx-auto px-4">
          <Link
            href="/"
            onClick={() => setOpenDropdown(null)}
            className="cursor-pointer hover:text-[#012068] transition-colors"
          >
            Home
          </Link>
          {Object.keys(navMenus).map((menu) => (
            <button
              key={menu}
              type="button"
              onClick={() => setOpenDropdown(openDropdown === menu ? null : menu)}
              className={`flex items-center cursor-pointer hover:text-[#012068] transition-colors ${
                openDropdown === menu ? 'text-[#012068]' : ''
              }`}
            >
              {menu}
              <span>
                <Icon
                  icon="iconamoon:arrow-down-2"
                  className={`w-5 h-5 transition-transform duration-200 ${
                    openDropdown === menu ? 'rotate-180' : ''
                  }`}
                />
              </span>
            </button>
          ))}
        </div>

        {openDropdown && navMenus[openDropdown] && (
       <div className="absolute left-0 right-0 top-full bg-gradient-to-b from-[#FFFFFF] to-[#EAEBF4] shadow-xl border-t border-gray-200 z-50">
            <div className="container mx-auto px-4 py-6 my-6">
              <div className="grid grid-cols-4 gap-8">
                {navMenus[openDropdown].map((column) => (
                  <div key={column.title}>
                    <h3 className="text-sm font-bold text-[#012068] uppercase tracking-wide mb-3 pb-2 border-b border-gray-100">
                      {column.title}
                    </h3>
                    <ul className="space-y-2">
                      {column.items.map((item) => (
                        <li key={item}>
                          <Link
                            href={`/search?q=${encodeURIComponent(item)}`}
                            onClick={() => setOpenDropdown(null)}
                            className="text-sm text-gray-700 hover:text-[#012068] hover:translate-x-1 inline-block transition-all duration-200"
                          >
                            {item}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
