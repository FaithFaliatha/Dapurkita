"use client";

import ProductCard from "@/components/ProductCard";
import RecipeCard from "@/components/RecipeCard";
import { useLang } from "@/context/LanguageContext";
import type { Product, Recipe } from "@/lib/api";
import { getMenus, getRecipes, mapAPIMenuToProduct, mapAPIRecipeToRecipe } from "@/lib/api";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, ChefHat, ShoppingBag, Star, Users, Utensils, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const heroImages = [
  // Foto resolusi tinggi (HD) dari Unsplash
  "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?q=80&w=1920&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=1920&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1920&auto=format&fit=crop",
];

export default function HomePage() {
  const { t } = useLang();
  const [featuredRecipes, setFeaturedRecipes] = useState<Recipe[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    // Load from backend API
    getRecipes().then((apiRecipes) => {
      if (apiRecipes.length > 0) {
        setFeaturedRecipes((apiRecipes.map(mapAPIRecipeToRecipe) as Recipe[]).slice(0, 3));
      }
    });
    getMenus().then((apiMenus) => {
      if (apiMenus.length > 0) {
        const mapped = apiMenus.map(mapAPIMenuToProduct) as Product[];
        setBestSellers(mapped.filter((p) => p.badge).slice(0, 4));
      }
    });

    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <AnimatePresence mode="popLayout">
          <motion.img
            key={currentImage}
            src={heroImages[currentImage]}
            className="hero-slider-bg"
            alt="Hero Background"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          />
        </AnimatePresence>

        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="hero-badge">
            <Star size={14} /> {t("Resep Autentik Indonesia", "Authentic Indonesian Recipes")}
          </div>
          <h1>{t("Masak, Nikmati, & Bagikan Kelezatan", "Cook, Enjoy, & Share the Flavor")}</h1>
          <p>
            {t(
              "Temukan resep masakan Indonesia terbaik dengan video tutorial langkah demi langkah. Tidak sempat masak? Pesan langsung hasil masakan kami!",
              "Discover the best Indonesian recipes with step-by-step video tutorials. No time to cook? Order our ready-made dishes directly!"
            )}
          </p>
          <div className="hero-buttons">
            <Link href="/resep" className="btn-primary">
              <BookOpen size={18} /> {t("Lihat Resep", "Browse Recipes")}
            </Link>
            <Link href="/menu" className="btn-secondary">
              <ShoppingBag size={18} /> {t("Pesan Makanan", "Order Food")}
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <div className="stats-bar">
        {[
          { icon: "🍳", num: "50+", label: t("Resep", "Recipes") },
          { icon: "📦", num: "1.2K+", label: t("Pesanan", "Orders") },
          { icon: "⭐", num: "4.9", label: "Rating" },
          { icon: "👨‍🍳", num: "5", label: t("Chef Ahli", "Expert Chefs") },
        ].map((stat, i) => (
          <motion.div
            key={i}
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <div style={{ fontSize: "1.5rem", marginBottom: 4 }}>{stat.icon}</div>
            <div className="stat-num">{stat.num}</div>
            <div className="stat-label">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Featured Recipes */}
      <section className="section">
        <div className="section-header">
          <h2>{t("🍽️ Resep Pilihan", "🍽️ Featured Recipes")}</h2>
          <p>{t("Resep-resep terbaik yang paling disukai pelanggan kami", "Our most loved recipes by customers")}</p>
        </div>
        <div className="recipes-grid">
          {featuredRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 32 }}>
          <Link href="/resep" className="btn-primary" style={{ background: "linear-gradient(135deg, var(--orange-500), var(--amber-500))", color: "#fff" }}>
            {t("Lihat Semua Resep", "View All Recipes")} →
          </Link>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="section" style={{ background: "var(--cream-dark)", maxWidth: "100%", padding: "80px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="section-header">
            <h2>{t("🔥 Produk Terlaris", "🔥 Best Sellers")}</h2>
            <p>{t("Hasil masakan siap santap langsung dari dapur kami", "Ready-to-eat dishes straight from our kitchen")}</p>
          </div>
          <div className="products-grid">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <Link href="/menu" className="btn-primary" style={{ background: "linear-gradient(135deg, var(--orange-500), var(--amber-500))", color: "#fff" }}>
              {t("Lihat Semua Menu", "View Full Menu")} →
            </Link>
          </div>
        </div>
      </section>

      {/* Why DapurKita */}
      <section className="section">
        <div className="section-header">
          <h2>{t("Kenapa DapurKita?", "Why DapurKita?")}</h2>
          <p>{t("Alasan pelanggan memilih kami", "Reasons our customers choose us")}</p>
        </div>
        <div className="values-grid">
          {[
            { icon: <Utensils size={32} />, title: t("Resep Autentik", "Authentic Recipes"), desc: t("Resep turun-temurun dari berbagai daerah Indonesia", "Heritage recipes from various Indonesian regions") },
            { icon: <ChefHat size={32} />, title: t("Chef Berpengalaman", "Experienced Chefs"), desc: t("Dimasak oleh chef profesional dengan bahan pilihan", "Prepared by professional chefs with selected ingredients") },
            { icon: <Users size={32} />, title: t("Komunitas Aktif", "Active Community"), desc: t("Bergabung dengan ribuan pecinta kuliner Indonesia", "Join thousands of Indonesian food enthusiasts") },
            { icon: <ShieldCheck size={32} />, title: t("Kualitas Terjamin", "Guaranteed Quality"), desc: t("Bahan segar setiap hari dan terjamin kebersihannya", "Fresh ingredients everyday with guaranteed hygiene") },
          ].map((val, i) => (
            <motion.div
              key={i}
              className="value-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
            >
              <div className="value-icon" style={{ color: "var(--orange-500)" }}>{val.icon}</div>
              <h3>{val.title}</h3>
              <p>{val.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}
