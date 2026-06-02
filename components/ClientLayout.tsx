'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ConfigProvider } from 'antd';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import LoginModal from '@/components/LoginModal';
import { showNotification } from '@/lib/notification';
import { useCartStore } from '@/stores/cartStore';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const resetCart = useCartStore((state) => state.resetCart);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    resetCart();
    setIsLoggedIn(false);
    showNotification('success', 'Logged Out!');
    router.push('/');
  };

  const handleLoginSuccess = (token: string) => {
    setIsLoggedIn(!!token);
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#388072',
        },
      }}
    >
      <Header
        isLoggedIn={isLoggedIn}
        onShowDrawer={() => setDrawerVisible(true)}
        onShowLoginModal={() => setLoginModalOpen(true)}
        onLogout={handleLogout}
      />

      <main>
        <div className="bg-[#f9fafb] dark:bg-gray-900">
          <div className="container mx-auto">{children}</div>
          <Footer />
        </div>
      </main>

      <CartDrawer visible={drawerVisible} onClose={() => setDrawerVisible(false)} />
      <LoginModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </ConfigProvider>
  );
}
