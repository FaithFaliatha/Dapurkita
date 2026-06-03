"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingCart, Globe, ChefHat, LogOut, LayoutDashboard } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useLang } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";

const navLinks = [
  { href: "/", labelId: "Beranda", labelEn: "Home" },
  { href: "/resep", labelId: "Resep", labelEn: "Recipes" },
  { href: "/menu", labelId: "Menu", labelEn: "Menu" },
  { href: "/tentang", labelId: "Tentang Kami", labelEn: "About Us" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { totalItems, setIsCartOpen } = useCart();
  const { lang, toggleLang, t } = useLang();
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="navbar-logo">
          <ChefHat size={28} />
          <span>DapurKita</span>
        </Link>

        {/* Desktop nav */}
        <div className="navbar-links">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`navbar-link ${pathname === link.href ? "active" : ""}`}
            >
              {lang === "id" ? link.labelId : link.labelEn}
            </Link>
          ))}
          {user?.role === "admin" && (
            <Link href="/admin" className="navbar-admin-btn">
              <LayoutDashboard size={16} />
              {t("Dashboard Admin", "Admin Dashboard")}
            </Link>
          )}
        </div>

        <div className="navbar-actions">
          <button
            className="lang-toggle"
            onClick={toggleLang}
            title={t("Ganti ke English", "Switch to Indonesian")}
          >
            <Globe size={18} />
            <span>{lang === "id" ? "EN" : "ID"}</span>
          </button>

          <button
            className="cart-toggle"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart size={20} />
            {totalItems > 0 && (
              <span className="cart-count">{totalItems}</span>
            )}
          </button>

          {user && (
            <div className="navbar-user">
              <span className="navbar-role-badge">{user.role === "admin" ? "Admin" : "User"}</span>
              <span className="navbar-user-name">{user.name}</span>
              <button
                className="logout-btn"
                onClick={logout}
                title={t("Keluar", "Logout")}
              >
                <LogOut size={18} />
              </button>
            </div>
          )}

          <button
            className="mobile-menu-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="mobile-nav"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`mobile-nav-link ${pathname === link.href ? "active" : ""}`}
                onClick={() => setMobileOpen(false)}
              >
                {lang === "id" ? link.labelId : link.labelEn}
              </Link>
            ))}
            {user?.role === "admin" && (
              <Link
                href="/admin"
                className="mobile-nav-admin-btn"
                onClick={() => setMobileOpen(false)}
              >
                <LayoutDashboard size={16} />
                {t("Dashboard Admin", "Admin Dashboard")}
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
