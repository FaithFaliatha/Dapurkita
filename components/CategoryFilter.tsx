"use client";

import { useLang } from "@/context/LanguageContext";

interface CategoryFilterProps {
  categories: { id: string; label: string; labelEn: string }[];
  active: string;
  onChange: (id: string) => void;
}

export default function CategoryFilter({
  categories,
  active,
  onChange,
}: CategoryFilterProps) {
  const { lang } = useLang();

  return (
    <div className="category-filter">
      {categories.map((cat) => (
        <button
          key={cat.id}
          className={`category-pill ${active === cat.id ? "active" : ""}`}
          onClick={() => onChange(cat.id)}
        >
          {lang === "id" ? cat.label : cat.labelEn}
        </button>
      ))}
    </div>
  );
}
