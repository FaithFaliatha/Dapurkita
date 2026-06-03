"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield, LayoutDashboard, BookOpen, Package, Users,
  LogOut, Globe, ChefHat, Home,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";

export default function AdminNavbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { lang, toggleLang, t } = useLang();

  const adminLinks = [
    { href: "/admin", label: t("Dashboard", "Dashboard"), icon: <LayoutDashboard size={16} /> },
    { href: "/admin/resep", label: t("Resep", "Recipes"), icon: <BookOpen size={16} /> },
    { href: "/admin/produk", label: t("Produk", "Products"), icon: <Package size={16} /> },
    { href: "/admin/pengguna", label: t("Pengguna", "Users"), icon: <Users size={16} /> },
  ];

  return (
    <nav className="admin-navbar">
      <div className="admin-navbar-inner">
        {/* Logo */}
        <Link href="/admin" className="admin-navbar-logo">
          <Shield size={22} />
          <span>DapurKita</span>
          <span className="admin-navbar-tag">Admin</span>
        </Link>

        {/* Nav links */}
        <div className="admin-navbar-links">
          {adminLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`admin-navbar-link ${pathname === link.href ? "active" : ""}`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right actions */}
        <div className="admin-navbar-actions">
          <Link href="/" className="admin-navbar-site-btn">
            <Home size={16} />
            <span>{t("Lihat Situs", "View Site")}</span>
          </Link>

          <button className="admin-navbar-lang" onClick={toggleLang}>
            <Globe size={16} />
            {lang === "id" ? "EN" : "ID"}
          </button>

          <div className="admin-navbar-user">
            <div className="admin-navbar-avatar">
              {user?.name?.charAt(0).toUpperCase() || "A"}
            </div>
            <span className="admin-navbar-name">{user?.name}</span>
            <button className="admin-navbar-logout" onClick={logout} title={t("Keluar", "Logout")}>
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
