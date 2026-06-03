"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LanguageProvider } from "@/context/LanguageContext";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import AuthPage from "@/components/AuthPage";

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const hasRedirected = useRef(false);

  // Redirect admin users to /admin after login
  useEffect(() => {
    if (user && user.role === "admin" && !hasRedirected.current) {
      // Only redirect if we're NOT already on an admin page
      if (!pathname.startsWith("/admin")) {
        hasRedirected.current = true;
        router.push("/admin");
      }
    }
  }, [user, pathname, router]);

  if (isLoading) {
    return (
      <div className="auth-loading">
        <div className="auth-loading-spinner" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute) {
    return (
      <>
        <main>{children}</main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <CartDrawer />
    </>
  );
}

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <AuthGate>{children}</AuthGate>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
