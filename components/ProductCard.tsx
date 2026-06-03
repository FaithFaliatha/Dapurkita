"use client";

import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useLang } from "@/context/LanguageContext";
import type { Product } from "@/lib/api";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { lang, t } = useLang();

  const name = lang === "id" ? product.name : product.nameEn;
  const desc = lang === "id" ? product.description : product.descriptionEn;
  const badge = lang === "id" ? product.badge : product.badgeEn;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);

  return (
    <motion.div
      className="product-card"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <div className="product-card-image">
        <img src={product.image} alt={name} loading="lazy" />
        {badge && <span className="product-badge">{badge}</span>}
      </div>
      <div className="product-card-content">
        <h3>{name}</h3>
        <p>{desc}</p>
        <div className="product-card-footer">
          <span className="product-price">{formatPrice(product.price)}</span>
          <button
            className="add-to-cart-btn"
            onClick={() =>
              addItem({
                id: product.id,
                name,
                price: product.price,
                image: product.image,
              })
            }
          >
            <ShoppingCart size={16} />
            <span>{t("Tambah", "Add")}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
