"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useLang } from "@/context/LanguageContext";
import CheckoutModal from "./CheckoutModal";

export default function CartDrawer() {
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalPrice, isCartOpen, setIsCartOpen } = useCart();
  const { t } = useLang();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);

  const handleCheckout = () => {
    setIsCartOpen(false);
    setTimeout(() => setCheckoutOpen(true), 300);
  };

  return (
    <>
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              className="cart-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
            />
            <motion.div
              className="cart-drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <div className="cart-header">
                <h2>
                  <ShoppingBag size={20} />
                  {t("Keranjang", "Cart")} ({totalItems})
                </h2>
                <button onClick={() => setIsCartOpen(false)} className="cart-close">
                  <X size={20} />
                </button>
              </div>

              {items.length === 0 ? (
                <div className="cart-empty">
                  <ShoppingBag size={48} />
                  <p>{t("Keranjang masih kosong", "Your cart is empty")}</p>
                </div>
              ) : (
                <>
                  <div className="cart-items">
                    {items.map((item) => (
                      <div key={item.id} className="cart-item">
                        <img src={item.image} alt={item.name} />
                        <div className="cart-item-info">
                          <h4>{item.name}</h4>
                          <span className="cart-item-price">{formatPrice(item.price)}</span>
                          <div className="cart-item-qty">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                              <Minus size={14} />
                            </button>
                            <span>{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                              <Plus size={14} />
                            </button>
                            <button className="cart-item-delete" onClick={() => removeItem(item.id)}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="cart-footer">
                    <div className="cart-total">
                      <span>Total</span>
                      <span>{formatPrice(totalPrice)}</span>
                    </div>
                    <button className="cart-checkout-btn" onClick={handleCheckout}>
                      {t("Checkout Sekarang", "Checkout Now")}
                    </button>
                    <button className="cart-clear-btn" onClick={clearCart}>
                      {t("Kosongkan Keranjang", "Clear Cart")}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <CheckoutModal isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
    </>
  );
}
