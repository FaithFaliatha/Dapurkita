"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import RecipeCard from "@/components/RecipeCard";
import CategoryFilter from "@/components/CategoryFilter";
import { getRecipes, mapAPIRecipeToRecipe } from "@/lib/api";
import type { Recipe } from "@/lib/api";

const categories = [
  { id: "all", label: "Semua", labelEn: "All" },
  { id: "masakan-indonesia", label: "Masakan Indonesia", labelEn: "Indonesian Cuisine" },
  { id: "minuman", label: "Minuman", labelEn: "Beverages" },
  { id: "snack", label: "Snack", labelEn: "Snack" },
  { id: "dessert", label: "Dessert", labelEn: "Dessert" }
];

export default function ResepPage() {
  const { t, lang } = useLang();
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecipes()
      .then((apiRecipes) => {
        if (apiRecipes.length > 0) {
          setRecipes(apiRecipes.map(mapAPIRecipeToRecipe) as Recipe[]);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = recipes.filter((r) => {
    const categoryId = (r.category || "").toLowerCase().replace(/\s/g, "-");
    const categoryEnId = (r.categoryEn || "").toLowerCase().replace(/\s/g, "-");
    const matchCategory =
      activeCategory === "all" ||
      categoryId === activeCategory ||
      categoryEnId === activeCategory;
    const title = lang === "id" ? (r.title || "") : (r.titleEn || "");
    const matchSearch = title.toLowerCase().includes((search || "").toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <>
      <div className="page-header">
        <h1>{t("Kumpulan Resep", "Recipe Collection")}</h1>
        <p>{t("Temukan resep favoritmu dengan video tutorial", "Find your favorite recipe with video tutorials")}</p>
      </div>
      <section className="section">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder={t("Cari resep...", "Search recipes...")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <CategoryFilter categories={categories} active={activeCategory} onChange={setActiveCategory} />
        {loading ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <div className="auth-loading-spinner" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="recipes-grid">
            {filtered.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        ) : (
          <p style={{ textAlign: "center", color: "var(--text-muted)", padding: 40 }}>
            {t("Tidak ada resep ditemukan.", "No recipes found.")}
          </p>
        )}
      </section>
    </>
  );
}
