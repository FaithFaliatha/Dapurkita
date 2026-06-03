"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, Users, ChefHat } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import type { Recipe } from "@/lib/api";

export default function RecipeCard({ recipe }: { recipe: Recipe }) {
  const { lang } = useLang();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <Link href={`/resep/${recipe.id}`} className="recipe-card">
        <div className="recipe-card-image">
          <img
            src={recipe.thumbnail}
            alt={lang === "id" ? recipe.title : recipe.titleEn}
            loading="lazy"
          />
          <span className="recipe-card-badge">
            {lang === "id" ? recipe.category : recipe.categoryEn}
          </span>
        </div>
        <div className="recipe-card-content">
          <h3>{lang === "id" ? recipe.title : recipe.titleEn}</h3>
          <p>{lang === "id" ? recipe.description : recipe.descriptionEn}</p>
          <div className="recipe-card-meta">
            <span>
              <Clock size={14} /> {recipe.cookTime}
            </span>
            <span>
              <Users size={14} /> {recipe.servings}{" "}
              {lang === "id" ? "porsi" : "servings"}
            </span>
            <span>
              <ChefHat size={14} />{" "}
              {lang === "id" ? recipe.difficulty : recipe.difficultyEn}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
