"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ConfigProvider } from "antd";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import LoginModal from "@/components/LoginModal";
import { showNotification } from "@/lib/notification";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    showNotification("success", "Logged Out!");
    router.push("/");
  };

  const handleLoginSuccess = (token: string) => {
    setIsLoggedIn(!!token);
  };

  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/ousadbazar/fav.png" />
      </head>
      <body>
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: "#388072",
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
              <div className="max-w-6xl mx-auto">{children}</div>
              <Footer />
            </div>
          </main>

          <CartDrawer visible={drawerVisible} onClose={() => setDrawerVisible(false)} />
          <LoginModal open={loginModalOpen} onClose={() => setLoginModalOpen(false)} onLoginSuccess={handleLoginSuccess} />
        </ConfigProvider>
      </body>
    </html>
  );
}
