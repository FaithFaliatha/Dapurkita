"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, Users, ChefHat, ArrowLeft, ShoppingBag } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { getRecipeById, getMenus, mapAPIRecipeToRecipe, mapAPIMenuToProduct } from "@/lib/api";
import type { Recipe, Product } from "@/lib/api";

export default function RecipeDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { lang, t } = useLang();
  const { addItem } = useCart();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [relatedProduct, setRelatedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // Try backend API first
      const apiRecipe = await getRecipeById(id);
      if (apiRecipe) {
        const mapped = mapAPIRecipeToRecipe(apiRecipe) as Recipe;
        setRecipe(mapped);

        // Load related product
        if (mapped.relatedProductId) {
          const apiMenus = await getMenus();
          const menu = apiMenus.find((m) => String(m.id) === mapped.relatedProductId);
          if (menu) {
            setRelatedProduct(mapAPIMenuToProduct(menu) as Product);
          }
        }
      }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="recipe-detail" style={{ textAlign: "center", paddingTop: 100 }}>
        <div className="auth-loading-spinner" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="recipe-detail" style={{ textAlign: "center", paddingTop: 100 }}>
        <h1>{t("Resep tidak ditemukan", "Recipe not found")}</h1>
        <Link href="/resep" className="btn-primary" style={{ marginTop: 20, display: "inline-flex", background: "linear-gradient(135deg, var(--orange-500), var(--amber-500))", color: "#fff" }}>
          {t("Kembali ke Resep", "Back to Recipes")}
        </Link>
      </div>
    );
  }

  const title = lang === "id" ? recipe.title : recipe.titleEn;
  const desc = lang === "id" ? recipe.description : recipe.descriptionEn;
  const ingredients = lang === "id" ? recipe.ingredients : recipe.ingredientsEn;
  const steps = lang === "id" ? recipe.steps : recipe.stepsEn;
  const difficulty = lang === "id" ? recipe.difficulty : recipe.difficultyEn;
  const category = lang === "id" ? recipe.category : recipe.categoryEn;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);

  return (
    <motion.div className="recipe-detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <Link href="/resep" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--orange-600)", fontWeight: 500, marginBottom: 24 }}>
        <ArrowLeft size={18} /> {t("Kembali", "Back")}
      </Link>

      <div className="recipe-detail-header">
        <h1>{title}</h1>
        <div className="recipe-detail-meta">
          <span><Clock size={16} /> {recipe.cookTime}</span>
          <span><Users size={16} /> {recipe.servings} {t("porsi", "servings")}</span>
          <span><ChefHat size={16} /> {difficulty}</span>
          <span>{category}</span>
        </div>
        <p className="recipe-detail-desc">{desc}</p>
      </div>

      {/* Ingredients */}
      <div className="recipe-section">
        <h2>{t("🥘 Bahan-bahan", "🥘 Ingredients")}</h2>
        <ul className="ingredients-list">
          {ingredients.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>

      {/* Steps */}
      <div className="recipe-section">
        <h2>{t("👨‍🍳 Langkah Memasak", "👨‍🍳 Cooking Steps")}</h2>
        <ol className="steps-list">
          {steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </div>

      {/* YouTube Video */}
      {recipe.youtubeUrl && (() => {
        const match = recipe.youtubeUrl.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
        const videoId = match ? match[1] : null;
        return videoId ? (
          <div className="recipe-section">
            <h2>{t("🎬 Video Tutorial", "🎬 Video Tutorial")}</h2>
            <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.12)" }}>
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube tutorial"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
              />
            </div>
          </div>
        ) : null;
      })()}

      {/* Buy CTA */}
      {relatedProduct && (
        <div className="recipe-cta">
          <h3>{t("Tidak sempat masak?", "No time to cook?")}</h3>
          <p>{t("Pesan langsung hasil masakan ini dari dapur kami!", "Order this dish directly from our kitchen!")}</p>
          <p style={{ fontFamily: "var(--font-outfit)", fontSize: "1.5rem", fontWeight: 700, color: "var(--orange-600)", margin: "12px 0" }}>
            {formatPrice(relatedProduct.price)}
          </p>
          <button
            className="btn-primary"
            style={{ background: "linear-gradient(135deg, var(--orange-500), var(--amber-500))", color: "#fff" }}
            onClick={() =>
              addItem({
                id: relatedProduct.id,
                name: lang === "id" ? relatedProduct.name : relatedProduct.nameEn,
                price: relatedProduct.price,
                image: relatedProduct.image,
              })
            }
          >
            <ShoppingBag size={18} /> {t("Tambah ke Keranjang", "Add to Cart")}
          </button>
        </div>
      )}
    </motion.div>
  );
}
