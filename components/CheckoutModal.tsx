"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, CreditCard, Wallet, Truck, Building2,
  CheckCircle2, Copy, Clock, ArrowRight, ShieldCheck, Printer,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";
import { createOrder } from "@/lib/api";

type Step = "summary" | "payment" | "confirm" | "success";

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  category: string;
  info?: string;
}

export default function CheckoutModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { items, totalPrice, totalItems, clearCart } = useCart();
  const { user } = useAuth();
  const { t } = useLang();

  const [step, setStep] = useState<Step>("summary");
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [processing, setProcessing] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [receiptData, setReceiptData] = useState<any>(null);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);

  const shippingCost = totalPrice >= 100000 ? 0 : 15000;
  const grandTotal = totalPrice + shippingCost;

  const paymentMethods: PaymentMethod[] = [
    { id: "bca", name: "Bank BCA", icon: <Building2 size={20} />, category: "bank", info: "1234 5678 9012" },
    { id: "bri", name: "Bank BRI", icon: <Building2 size={20} />, category: "bank", info: "9876 5432 1098" },
    { id: "mandiri", name: "Bank Mandiri", icon: <Building2 size={20} />, category: "bank", info: "1122 3344 5566" },
    { id: "gopay", name: "GoPay", icon: <Wallet size={20} />, category: "ewallet" },
    { id: "ovo", name: "OVO", icon: <Wallet size={20} />, category: "ewallet" },
    { id: "dana", name: "DANA", icon: <Wallet size={20} />, category: "ewallet" },
    { id: "qris", name: "QRIS", icon: <CreditCard size={20} />, category: "qris" },
    { id: "cod", name: "COD (Bayar di Tempat)", icon: <Truck size={20} />, category: "cod" },
  ];

  const handleProceedToPayment = () => {
    if (!address.trim() || !phone.trim()) return;
    setStep("payment");
  };

  const handleConfirmPayment = () => {
    if (!selectedMethod) return;
    setStep("confirm");
  };

  const handlePay = async () => {
    setProcessing(true);

    const newOrderId = "DK-" + Date.now().toString(36).toUpperCase();

    // Try to save order to backend API using exact Postman format
    const apiPayload = {
      items: items.map((i) => ({
        menuId: Number(i.id),
        quantity: i.quantity,
      })),
      // We pass these extra fields just in case the backend adds support for them later
      paymentMethod: selectedMethod,
      address,
      phone,
      note,
    };

    const order = await createOrder(apiPayload as any);

    if (order) {
      setOrderId(order.id ? String(order.id) : newOrderId);
      setReceiptData({
        items: [...items],
        totalPrice,
        shippingCost,
        grandTotal,
        paymentMethod: selectedMethod,
        address,
        phone,
        note,
        date: new Date().toISOString(),
      });
      clearCart();
      setStep("success");
    } else {
      alert("Gagal memproses pesanan. Silakan coba lagi.");
    }

    setProcessing(false);
  };

  const handleClose = () => {
    setStep("summary");
    setSelectedMethod(null);
    setAddress("");
    setPhone("");
    setNote("");
    setReceiptData(null);
    onClose();
  };

  const selectedPayment = paymentMethods.find((m) => m.id === selectedMethod);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="checkout-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={step !== "success" ? handleClose : undefined}
        >
          <motion.div
            className="checkout-modal"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            {step !== "success" && (
              <div className="checkout-header">
                <h2>
                  <CreditCard size={22} />
                  {step === "summary" && t("Checkout", "Checkout")}
                  {step === "payment" && t("Metode Pembayaran", "Payment Method")}
                  {step === "confirm" && t("Konfirmasi Pembayaran", "Confirm Payment")}
                </h2>
                <button onClick={handleClose} className="checkout-close">
                  <X size={20} />
                </button>
              </div>
            )}

            {/* Progress bar */}
            {step !== "success" && (
              <div className="checkout-progress">
                <div className={`checkout-step ${step === "summary" ? "active" : "done"}`}>
                  <span>1</span> {t("Ringkasan", "Summary")}
                </div>
                <div className="checkout-step-line" />
                <div className={`checkout-step ${step === "payment" ? "active" : step === "confirm" ? "done" : ""}`}>
                  <span>2</span> {t("Pembayaran", "Payment")}
                </div>
                <div className="checkout-step-line" />
                <div className={`checkout-step ${step === "confirm" ? "active" : ""}`}>
                  <span>3</span> {t("Konfirmasi", "Confirm")}
                </div>
              </div>
            )}

            <div className="checkout-body">
              {/* STEP 1: Summary */}
              {step === "summary" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="checkout-section">
                    <h3>{t("Pesanan Anda", "Your Order")} ({totalItems} item)</h3>
                    <div className="checkout-items">
                      {items.map((item) => (
                        <div key={item.id} className="checkout-item">
                          <img src={item.image} alt={item.name} />
                          <div className="checkout-item-info">
                            <strong>{item.name}</strong>
                            <span>{item.quantity}x {formatPrice(item.price)}</span>
                          </div>
                          <span className="checkout-item-subtotal">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="checkout-section">
                    <h3>{t("Alamat Pengiriman", "Shipping Address")}</h3>
                    <textarea
                      className="checkout-input"
                      placeholder={t("Masukkan alamat lengkap...", "Enter full address...")}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      rows={3}
                    />
                    <input
                      className="checkout-input"
                      placeholder={t("Nomor HP (contoh: 08123456789)", "Phone number")}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                    <input
                      className="checkout-input"
                      placeholder={t("Catatan (opsional)", "Note (optional)")}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </div>

                  <div className="checkout-cost">
                    <div className="checkout-cost-row">
                      <span>Subtotal</span>
                      <span>{formatPrice(totalPrice)}</span>
                    </div>
                    <div className="checkout-cost-row">
                      <span>{t("Ongkir", "Shipping")}</span>
                      <span>{shippingCost === 0 ? <span className="checkout-free">GRATIS</span> : formatPrice(shippingCost)}</span>
                    </div>
                    {shippingCost === 0 && (
                      <div className="checkout-free-note">
                        🎉 {t("Gratis ongkir untuk pesanan di atas Rp 100.000!", "Free shipping for orders above Rp 100,000!")}
                      </div>
                    )}
                    <div className="checkout-cost-total">
                      <span>Total</span>
                      <span>{formatPrice(grandTotal)}</span>
                    </div>
                  </div>

                  <button
                    className="checkout-next-btn"
                    onClick={handleProceedToPayment}
                    disabled={!address.trim() || !phone.trim()}
                  >
                    {t("Pilih Pembayaran", "Choose Payment")} <ArrowRight size={18} />
                  </button>
                </motion.div>
              )}

              {/* STEP 2: Payment method */}
              {step === "payment" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="checkout-section">
                    <h3>{t("Transfer Bank", "Bank Transfer")}</h3>
                    <div className="checkout-methods">
                      {paymentMethods.filter((m) => m.category === "bank").map((m) => (
                        <button
                          key={m.id}
                          className={`checkout-method ${selectedMethod === m.id ? "active" : ""}`}
                          onClick={() => setSelectedMethod(m.id)}
                        >
                          {m.icon}
                          <span>{m.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="checkout-section">
                    <h3>E-Wallet</h3>
                    <div className="checkout-methods">
                      {paymentMethods.filter((m) => m.category === "ewallet").map((m) => (
                        <button
                          key={m.id}
                          className={`checkout-method ${selectedMethod === m.id ? "active" : ""}`}
                          onClick={() => setSelectedMethod(m.id)}
                        >
                          {m.icon}
                          <span>{m.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="checkout-section">
                    <h3>{t("Lainnya", "Other")}</h3>
                    <div className="checkout-methods">
                      {paymentMethods.filter((m) => m.category === "qris" || m.category === "cod").map((m) => (
                        <button
                          key={m.id}
                          className={`checkout-method ${selectedMethod === m.id ? "active" : ""}`}
                          onClick={() => setSelectedMethod(m.id)}
                        >
                          {m.icon}
                          <span>{m.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="checkout-actions">
                    <button className="checkout-back-btn" onClick={() => setStep("summary")}>
                      {t("Kembali", "Back")}
                    </button>
                    <button
                      className="checkout-next-btn"
                      onClick={handleConfirmPayment}
                      disabled={!selectedMethod}
                    >
                      {t("Konfirmasi", "Confirm")} <ArrowRight size={18} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Confirm payment */}
              {step === "confirm" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="checkout-confirm-card">
                    <ShieldCheck size={32} className="checkout-confirm-icon" />
                    <h3>{t("Rincian Pembayaran", "Payment Details")}</h3>

                    <div className="checkout-confirm-detail">
                      <span>{t("Metode", "Method")}</span>
                      <strong>{selectedPayment?.name}</strong>
                    </div>
                    <div className="checkout-confirm-detail">
                      <span>Total</span>
                      <strong className="checkout-confirm-total">{formatPrice(grandTotal)}</strong>
                    </div>

                    {selectedPayment?.info && (
                      <div className="checkout-va-box">
                        <span>{t("No. Rekening Virtual", "Virtual Account No.")}</span>
                        <div className="checkout-va-number">
                          <code>{selectedPayment.info}</code>
                          <button onClick={() => navigator.clipboard.writeText(selectedPayment.info || "")}>
                            <Copy size={14} /> Copy
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="checkout-timer">
                      <Clock size={16} />
                      {t("Selesaikan pembayaran dalam 24 jam", "Complete payment within 24 hours")}
                    </div>
                  </div>

                  <div className="checkout-actions">
                    <button className="checkout-back-btn" onClick={() => setStep("payment")}>
                      {t("Kembali", "Back")}
                    </button>
                    <button className="checkout-pay-btn" onClick={handlePay} disabled={processing}>
                      {processing ? (
                        <span className="checkout-spinner" />
                      ) : (
                        <>{t("Bayar Sekarang", "Pay Now")} — {formatPrice(grandTotal)}</>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: Success */}
              {step === "success" && (
                <motion.div
                  className="checkout-success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", damping: 15, stiffness: 200 }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="no-print"
                  >
                    <CheckCircle2 size={72} className="checkout-success-icon" />
                  </motion.div>
                  <h2 className="no-print">{t("Pembayaran Berhasil! 🎉", "Payment Successful! 🎉")}</h2>
                  <p className="no-print">{t("Terima kasih atas pesanan Anda.", "Thank you for your order.")}</p>
                  
                  {receiptData && (
                    <div className="receipt-container" id="receipt-area">
                      <div className="receipt-header">
                        <h2>DapurKita</h2>
                        <p>{t("Resi Pembelian", "Purchase Receipt")}</p>
                      </div>
                      <div className="receipt-info">
                        <div><span>{t("ID Pesanan", "Order ID")}:</span> <strong>{orderId}</strong></div>
                        <div><span>{t("Tanggal", "Date")}:</span> {new Date(receiptData.date).toLocaleString('id-ID')}</div>
                        <div><span>{t("Pelanggan", "Customer")}:</span> {user?.name || "Guest"}</div>
                        <div><span>{t("No. HP", "Phone")}:</span> {receiptData.phone}</div>
                        <div><span>{t("Alamat", "Address")}:</span> {receiptData.address}</div>
                        <div><span>{t("Pembayaran", "Payment")}:</span> {paymentMethods.find(m => m.id === receiptData.paymentMethod)?.name || receiptData.paymentMethod}</div>
                      </div>
                      <div className="receipt-divider" />
                      <table className="receipt-items">
                        <thead>
                          <tr>
                            <th>Item</th>
                            <th>Qty</th>
                            <th style={{ textAlign: "right" }}>Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {receiptData.items.map((item: any) => (
                            <tr key={item.id}>
                              <td>{item.name}</td>
                              <td>{item.quantity}</td>
                              <td style={{ textAlign: "right" }}>{formatPrice(item.price * item.quantity)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="receipt-divider" />
                      <div className="receipt-totals">
                        <div className="receipt-row">
                          <span>Subtotal</span>
                          <span>{formatPrice(receiptData.totalPrice)}</span>
                        </div>
                        <div className="receipt-row">
                          <span>{t("Ongkos Kirim", "Shipping")}</span>
                          <span>{receiptData.shippingCost === 0 ? "Gratis" : formatPrice(receiptData.shippingCost)}</span>
                        </div>
                        <div className="receipt-row receipt-grand-total">
                          <span>Total</span>
                          <span>{formatPrice(receiptData.grandTotal)}</span>
                        </div>
                      </div>
                      <div className="receipt-footer">
                        {t("Terima kasih telah berbelanja di DapurKita!", "Thank you for shopping at DapurKita!")}
                      </div>
                    </div>
                  )}

                  <div className="checkout-success-actions no-print">
                    <button className="checkout-print-btn" onClick={() => window.print()}>
                      <Printer size={18} /> {t("Cetak Resi", "Print Receipt")}
                    </button>
                    <button className="checkout-done-btn" onClick={handleClose}>
                      {t("Selesai", "Done")}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
