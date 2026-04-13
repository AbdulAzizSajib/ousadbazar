"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Badge } from "antd";
import { useCartStore } from "@/stores/cartStore";
import { useSearchStore } from "@/stores/searchStore";
import { formatNumber, asset } from "@/lib/config";

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
  const [showScrollTop, setShowScrollTop] = useState(false);
  const cartProduct = useCartStore((s) => s.cartProduct);
  const totalPrice = useCartStore((s) => s.totalPrice);
  const searchStore = useSearchStore();
  const navSearchInput = useRef<HTMLInputElement>(null);
  const mobileSearchInput = useRef<HTMLInputElement>(null);

  const isSearchPage = pathname === "/search" || pathname === "/search/";

  useEffect(() => {
    if (isSearchPage) {
      setTimeout(() => {
        navSearchInput.current?.focus();
        mobileSearchInput.current?.focus();
      }, 100);
    }
  }, [isSearchPage]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="w-full bg-white sticky top-0 z-50 shadow-sm">
      {/* Top bar */}
      <div className="bg-[#388072] font-bold py-2">
        <div className="flex items-center justify-between border-x border-white px-2 max-w-6xl mx-auto text-white">
          <h2>Welcome to Ousad Bazar</h2>
          <div className="flex items-center gap-3">
            <h2>Contact Us</h2>
            <h2>About Us</h2>
          </div>
        </div>
      </div>

      {/* Navbar */}
      <nav className="z-[999] max-w-6xl mx-auto transition-all duration-500 ease-in-out dark:bg-gray-900">
        <div className="px-4">
          <div className="flex justify-between items-center h-[64px]">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center group">
                <img
                  className="h-10 w-32 md:w-full transition-transform duration-300 group-hover:scale-105"
                  src={asset("/images/ousadbazar.svg")}
                  alt="Logo"
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center justify-end flex-1 space-x-6 lg:space-x-8">
              {/* Search Bar */}
              <div className="flex-1 ml-[75px] max-w-xl">
                {isSearchPage ? (
                  <div className="flex items-center bg-white border-2 border-[#388072] rounded-full overflow-hidden shadow-sm">
                    <div className="pl-4">
                      {!searchStore.searchLoading ? (
                        <Icon icon="mingcute:search-line" className="text-[#388072] w-5 h-5" />
                      ) : (
                        <Icon icon="ep:loading" className="text-[#388072] w-5 h-5 animate-spin" />
                      )}
                    </div>
                    <input
                      ref={navSearchInput}
                      type="text"
                      value={searchStore.searchQuery}
                      onChange={(e) => searchStore.search(e.target.value)}
                      placeholder="Search products..."
                      className="flex-1 px-3 py-2.5 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
                    />
                    {searchStore.searchQuery && (
                      <button onClick={() => searchStore.clearSearch()} type="button" className="px-3">
                        <Icon icon="mdi:close-circle" className="text-gray-300 w-5 h-5 hover:text-gray-500 transition-colors" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div
                    onClick={() => router.push("/search")}
                    className="flex items-center bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 cursor-pointer hover:border-[#388072] hover:bg-white transition-all duration-300 group"
                  >
                    <Icon icon="mingcute:search-line" className="text-gray-400 w-5 h-5 group-hover:text-[#388072] transition-colors" />
                    <span className="ml-3 text-gray-400 text-sm">Search products...</span>
                  </div>
                )}
              </div>

              <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />

              {/* Right Side Actions */}
              <div className="flex items-center space-x-3">
                <Badge
                  count={cartProduct.length}
                  offset={[-5, 5]}
                  style={{ backgroundColor: "#388072", color: "#fff", boxShadow: "0 2px 8px rgba(56,128,114,0.4)" }}
                >
                  <button onClick={onShowDrawer} className="p-2.5 rounded-xl hover:bg-[#388072]/10 transition-all duration-300 group active:scale-95">
                    <Icon className="w-[22px] h-[22px] text-gray-600 dark:text-gray-300 group-hover:text-[#388072] transition-colors duration-300" icon="solar:cart-large-2-outline" />
                  </button>
                </Badge>

                <span className="text-xl text-gray-900 dark:text-gray-100">
                  ৳ {formatNumber(totalPrice || 0)}
                </span>

                {!isLoggedIn ? (
                  <button onClick={onShowLoginModal} className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-all duration-300 active:scale-95">
                    <Icon icon="solar:user-circle-linear" className="w-8 h-8 text-gray-500" />
                    <div className="flex flex-col items-start leading-tight">
                      <span className="text-xs text-gray-500">Hello, Sign in</span>
                      <span className="text-sm font-semibold text-gray-800">Account & Orders</span>
                    </div>
                  </button>
                ) : (
                  <button onClick={onLogout} className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-red-600 rounded-lg hover:bg-red-50 transition-all duration-200 active:scale-95">
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
                style={{ backgroundColor: "#388072", color: "#fff", boxShadow: "0 2px 8px rgba(56,128,114,0.4)" }}
              >
                <button onClick={onShowDrawer} className="p-2.5 rounded-xl hover:bg-[#388072]/10 transition-all duration-300 active:scale-95">
                  <Icon className="w-6 h-6 text-gray-600 dark:text-gray-300" icon="solar:cart-large-2-outline" />
                </button>
              </Badge>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2.5 rounded-xl hover:bg-[#388072]/10 transition-all duration-300 active:scale-95">
                <Icon className="w-6 h-6 text-gray-700 dark:text-gray-200" icon={isMenuOpen ? "solar:close-circle-outline" : "solar:hamburger-menu-outline"} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-b border-[#388072]/10 shadow-lg">
            <div className="px-4 pt-3 pb-4 space-y-1">
              <Link href="/all-medicines" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold text-gray-700 dark:text-gray-200 hover:text-[#388072] hover:bg-[#388072]/10 transition-all duration-200">
                <Icon icon="solar:shop-outline" className="w-5 h-5" /> Shop
              </Link>
              <Link href={isLoggedIn ? "/order" : "/guest-order"} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold text-gray-700 dark:text-gray-200 hover:text-[#388072] hover:bg-[#388072]/10 transition-all duration-200">
                <Icon icon="solar:bag-check-outline" className="w-5 h-5" /> My Orders
              </Link>
              <div className="pt-3 px-1">
                {!isLoggedIn ? (
                  <button type="button" onClick={onShowLoginModal} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl hover:bg-gray-100 transition-all duration-300 active:scale-[0.98]">
                    <Icon icon="solar:user-circle-linear" className="w-8 h-8 text-gray-500" />
                    <div className="flex flex-col items-start leading-tight">
                      <span className="text-xs text-gray-500">Hello, Sign in</span>
                      <span className="text-sm font-semibold text-gray-800">Account & Orders</span>
                    </div>
                  </button>
                ) : (
                  <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-red-600 font-semibold hover:bg-red-50 transition-all duration-200">
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
                  <Icon icon="ep:loading" className="text-[#388072] w-[18px] h-[18px] animate-spin" />
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
                  <Icon icon="mdi:close-circle" className="text-gray-300 w-[18px] h-[18px] hover:text-gray-500 transition-colors" />
                </button>
              )}
            </div>
          ) : (
            <div onClick={() => router.push("/search")} className="flex items-center bg-gray-50 dark:bg-gray-700 rounded-full border border-gray-200 dark:border-gray-600 px-4 py-2.5 cursor-pointer hover:border-[#388072] transition-all duration-300">
              <Icon icon="mingcute:search-line" className="text-gray-400 w-[18px] h-[18px]" />
              <span className="ml-3 text-gray-400 text-sm">Search medicines...</span>
            </div>
          )}
        </div>
      </nav>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 p-3 bg-[#388072] text-white rounded-full shadow-lg shadow-[#388072]/30 hover:bg-[#2d6a5a] transition-all duration-300 active:scale-90 animate-bounce-in"
          aria-label="Scroll to top"
        >
          <Icon icon="solar:arrow-up-linear" className="w-6 h-6" />
        </button>
      )}

      {/* Desktop sub-navigation */}
      {/* <div className="border-y border-[#e8e8e8] py-4 hidden md:block">
        <div className="flex items-center justify-between px-2 max-w-6xl mx-auto text-black">
          <div className="flex items-center font-semibold text-gray-600 gap-3">
            <Link href="/" className={pathname === "/" ? "active-link" : ""}>
              <div className="relative group px-4 py-2 rounded-full transition-all duration-300 hover:bg-[#388072]/10">
                <span className="text-gray-700 dark:text-gray-200 font-semibold text-[15px] tracking-wide transition-colors duration-200 group-hover:text-[#388072]">Home</span>
              </div>
            </Link>
            <Link href="/all-medicines" className={pathname === "/all-medicines" ? "active-link" : ""}>
              <div className="relative group px-4 py-2 rounded-full transition-all duration-300 hover:bg-[#388072]/10">
                <span className="text-gray-700 dark:text-gray-200 font-semibold text-[15px] tracking-wide transition-colors duration-200 group-hover:text-[#388072]">All Medicines</span>
              </div>
            </Link>
            {isLoggedIn && (
              <>
                <Link href="/order-history" className={pathname === "/order-history" ? "active-link" : ""}>
                  <div className="relative group px-4 py-2 rounded-full transition-all duration-300 hover:bg-[#388072]/10">
                    <span className="text-gray-700 dark:text-gray-200 font-semibold text-[15px] tracking-wide transition-colors duration-200 group-hover:text-[#388072]">Order History</span>
                  </div>
                </Link>
                <Link href="/order-tracking" className={pathname === "/order-tracking" ? "active-link" : ""}>
                  <div className="relative group px-4 py-2 rounded-full transition-all duration-300 hover:bg-[#388072]/10">
                    <span className="text-gray-700 dark:text-gray-200 font-semibold text-[15px] tracking-wide transition-colors duration-200 group-hover:text-[#388072]">Order Tracking</span>
                  </div>
                </Link>
              </>
            )}
          </div>
        </div>
      </div> */}
    </div>
  );
}
