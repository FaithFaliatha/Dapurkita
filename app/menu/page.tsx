"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import ProductCard from "@/components/ProductCard";
import { getMenus, mapAPIMenuToProduct } from "@/lib/api";
import type { Product } from "@/lib/api";

const menuCategories = [
  { id: "all", label: "Semua", labelEn: "All" },
  { id: "makanan-berat", label: "Makanan Berat", labelEn: "Main Course" },
  { id: "dessert", label: "Dessert", labelEn: "Dessert" },
  { id: "minuman", label: "Minuman", labelEn: "Beverages" },
  { id: "snack", label: "Snack", labelEn: "Snack" },
  { id: "bumbu", label: "Bumbu & Sambal", labelEn: "Sauces" },
];

function MenuContent() {
  const { t, lang } = useLang();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category");
  
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (initialCategory && menuCategories.some(c => c.id === initialCategory)) {
      setActiveCategory(initialCategory);
    }
  }, [initialCategory]);



  useEffect(() => {
    getMenus()
      .then((apiMenus) => {
        if (apiMenus.length > 0) {
          setProducts(apiMenus.map(mapAPIMenuToProduct) as Product[]);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter((p) => {
    const matchCat =
      activeCategory === "all" ||
      p.category.toLowerCase().replace(/\s|&/g, "-").includes(activeCategory) ||
      p.categoryEn.toLowerCase().replace(/\s|&/g, "-").includes(activeCategory);
    const name = lang === "id" ? p.name : p.nameEn;
    const matchSearch = name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <>
      <div 
        className="page-header"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1920&auto=format&fit=crop')` }}
      >
        <h1>{t("Menu Kami", "Our Menu")}</h1>
        <p>{t("Pesan makanan lezat langsung dari dapur kami", "Order delicious food straight from our kitchen")}</p>
      </div>
      <section className="section">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input
            placeholder={t("Cari menu...", "Search menu...")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="category-filter">
          {menuCategories.map((cat) => (
            <button
              key={cat.id}
              className={`category-pill ${activeCategory === cat.id ? "active" : ""}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {lang === "id" ? cat.label : cat.labelEn}
            </button>
          ))}
        </div>
        {loading ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <div className="auth-loading-spinner" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="products-grid">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p style={{ textAlign: "center", color: "var(--text-muted)", padding: 40 }}>
            {t("Tidak ada menu ditemukan.", "No menu items found.")}
          </p>
        )}
      </section>
    </>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: 40 }}><div className="auth-loading-spinner" /></div>}>
      <MenuContent />
    </Suspense>
  );
}