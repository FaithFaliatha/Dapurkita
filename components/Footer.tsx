"use client";

import { ChefHat, AtSign, Mail, MapPin } from "lucide-react";
import Link from "next/link";
import { useLang } from "@/context/LanguageContext";

export default function Footer() {
  const { t } = useLang();

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">
            <ChefHat size={24} />
            <span>DapurKita</span>
          </div>
          <p>
            {t(
              "Resep autentik Indonesia & kuliner terbaik langsung dari dapur kami ke meja Anda.",
              "Authentic Indonesian recipes & the best culinary delights from our kitchen to your table."
            )}
          </p>
        </div>

        <div className="footer-links">
          <h4>{t("Navigasi", "Navigation")}</h4>
          <Link href="/">{t("Beranda", "Home")}</Link>
          <Link href="/resep">{t("Resep", "Recipes")}</Link>
          <Link href="/menu">{t("Menu", "Menu")}</Link>
          <Link href="/tentang">{t("Tentang Kami", "About Us")}</Link>
        </div>

        <div className="footer-links">
          <h4>{t("Kategori", "Categories")}</h4>
          <Link href="/menu?category=makanan-berat">{t("Makanan Berat", "Main Course")}</Link>
          <Link href="/menu?category=dessert">{t("Dessert", "Dessert")}</Link>
          <Link href="/menu?category=minuman">{t("Minuman", "Beverages")}</Link>
          <Link href="/menu?category=snack">{t("Snack", "Snack")}</Link>
          <Link href="/menu?category=bumbu">{t("Bumbu & Sambal", "Sauces")}</Link>
        </div>

        <div className="footer-contact">
          <h4>{t("Hubungi Kami", "Contact Us")}</h4>
          <p><MapPin size={14} /> Malang, Jawa Timur</p>
          <p><Mail size={14} /> hello@dapurkita.id</p>
          <p><AtSign size={14} /> @dapurkita.id</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 DapurKita. {t("Hak cipta dilindungi.", "All rights reserved.")}</p>
      </div>
    </footer>
  );
}
