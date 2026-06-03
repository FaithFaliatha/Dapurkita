"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Shield, BookOpen, Package, Users, TrendingUp,
  Plus, Pencil, Trash2, Eye, ChefHat, ShoppingBag,
  Home, Globe, LogOut, ShoppingCart,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import {
  getRecipes, getMenus, getOrders, mapAPIRecipeToRecipe, mapAPIMenuToProduct,
  createMenu, updateMenu, deleteMenu,
  createRecipe, updateRecipe, deleteRecipe,
  updateOrderStatus
} from "@/lib/api";
import type { APIOrder, APIMenu, APIRecipe } from "@/lib/api";
import type { Recipe, Product } from "@/lib/api";
import Link from "next/link";

type Tab = "overview" | "recipes" | "products" | "orders";

export default function AdminPage() {
  const { user, logout } = useAuth();
  const { t, lang, toggleLang } = useLang();
  const { items: cartItems, totalItems: cartTotal, totalPrice: cartTotalPrice } = useCart();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // Data
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<APIOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    nameEn: "",
    description: "",
    descriptionEn: "",
    price: 0,
    category: "Makanan Berat",
    categoryEn: "Main Course",
    image: "",
    badge: "",
    badgeEn: ""
  });

  // Recipe Modal State
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [recipeForm, setRecipeForm] = useState({
    menuId: "",
    youtubeUrl: "",
    ingredients: "",
    ingredientsEn: "",
    steps: "",
    stepsEn: ""
  });

  const [submitting, setSubmitting] = useState(false);

  const handleEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name,
      nameEn: p.nameEn || p.name,
      description: p.description,
      descriptionEn: p.descriptionEn || p.description,
      price: p.price,
      category: p.category,
      categoryEn: p.categoryEn || p.category,
      image: p.image,
      badge: p.badge || "",
      badgeEn: p.badgeEn || p.badge || ""
    });
    setIsProductModalOpen(true);
  };

  const handleAddProductClick = () => {
    setEditingProduct(null);
    setProductForm({
      name: "",
      nameEn: "",
      description: "",
      descriptionEn: "",
      price: 0,
      category: "Makanan Berat",
      categoryEn: "Main Course",
      image: "",
      badge: "",
      badgeEn: ""
    });
    setIsProductModalOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm(t("Apakah Anda yakin ingin menghapus produk ini?", "Are you sure you want to delete this product?"))) return;
    const res = await deleteMenu(id);
    if (res.success) {
      setProducts(products.filter(p => p.id !== id));
      alert(t("Produk berhasil dihapus!", "Product deleted successfully!"));
    } else {
      if (res.message && res.message.includes("500")) {
        alert(t("Gagal: Produk ini tidak bisa dihapus karena sedang digunakan dalam Riwayat Pesanan atau terikat dengan sebuah Resep.", "Failed: This product cannot be deleted because it is used in Order History or tied to a Recipe."));
      } else {
        alert(t("Gagal menghapus produk. Alasan: ", "Failed to delete product. Reason: ") + res.message);
      }
    }
  };

  const handleEditRecipe = (r: Recipe) => {
    setEditingRecipe(r);
    setRecipeForm({
      menuId: r.relatedProductId || "",
      youtubeUrl: r.youtubeUrl,
      ingredients: (r.ingredients || []).join("\n"),
      ingredientsEn: (r.ingredientsEn || []).join("\n"),
      steps: (r.steps || []).join("\n"),
      stepsEn: (r.stepsEn || []).join("\n")
    });
    setIsRecipeModalOpen(true);
  };

  const handleAddRecipeClick = () => {
    setEditingRecipe(null);
    setRecipeForm({
      menuId: "",
      youtubeUrl: "",
      ingredients: "",
      ingredientsEn: "",
      steps: "",
      stepsEn: ""
    });
    setIsRecipeModalOpen(true);
  };

  const handleDeleteRecipe = async (id: string) => {
    if (!confirm(t("Apakah Anda yakin ingin menghapus resep ini?", "Are you sure you want to delete this recipe?"))) return;
    const res = await deleteRecipe(id);
    if (res.success) {
      setRecipes(recipes.filter(r => r.id !== id));
      alert(t("Resep berhasil dihapus!", "Recipe deleted successfully!"));
    } else {
      if (res.message && res.message.includes("500")) {
        alert(t("Gagal: Resep ini tidak bisa dihapus karena ada data terkait di database.", "Failed: This recipe cannot be deleted due to related data in the database."));
      } else {
        alert(t("Gagal menghapus resep. Alasan: ", "Failed to delete recipe. Reason: ") + res.message);
      }
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Payload hanya boleh mengirimkan field yang sesuai dengan database backend.
      // (Backend tidak memiliki field: nameEn, descriptionEn, categoryEn, badge, badgeEn)
      const payload: Partial<APIMenu> = {
        name: productForm.name,
        description: productForm.description,
        price: Number(productForm.price),
        category: productForm.category,
        imageUrl: productForm.image || "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400"
      };

      if (editingProduct) {
        const updated = await updateMenu(editingProduct.id, payload);
        if (updated) {
          const mapped = mapAPIMenuToProduct(updated) as Product;
          setProducts(products.map(p => p.id === editingProduct.id ? mapped : p));
          setIsProductModalOpen(false);
          alert(t("Produk berhasil diperbarui!", "Product updated successfully!"));
        } else {
          alert(t("Gagal memperbarui produk.", "Failed to update product."));
        }
      } else {
        const created = await createMenu(payload);
        if (created) {
          const mapped = mapAPIMenuToProduct(created) as Product;
          setProducts([...products, mapped]);
          setIsProductModalOpen(false);
          alert(t("Produk berhasil ditambahkan!", "Product added successfully!"));
        } else {
          alert(t("Gagal menambahkan produk.", "Failed to add product."));
        }
      }
    } catch (err) {
      console.error(err);
      alert("Error saving product.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecipeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipeForm.menuId) {
      alert(t("Silakan pilih produk terkait.", "Please select a related product."));
      return;
    }
    setSubmitting(true);
    try {
      // Payload hanya boleh mengirimkan field yang sesuai dengan database backend.
      // (Backend tidak memiliki field: ingredientsEn, stepsEn)
      const payload: Partial<APIRecipe> = {
        menuId: Number(recipeForm.menuId),
        youtubeUrl: recipeForm.youtubeUrl,
        ingredients: recipeForm.ingredients,
        steps: recipeForm.steps
      };

      if (editingRecipe) {
        const updated = await updateRecipe(editingRecipe.id, payload);
        if (updated) {
          const mapped = mapAPIRecipeToRecipe(updated) as Recipe;
          setRecipes(recipes.map(r => r.id === editingRecipe.id ? mapped : r));
          setIsRecipeModalOpen(false);
          alert(t("Resep berhasil diperbarui!", "Recipe updated successfully!"));
        } else {
          alert(t("Gagal memperbarui resep.", "Failed to update recipe."));
        }
      } else {
        const created = await createRecipe(payload);
        if (created) {
          const mapped = mapAPIRecipeToRecipe(created) as Recipe;
          setRecipes([...recipes, mapped]);
          setIsRecipeModalOpen(false);
          alert(t("Resep berhasil ditambahkan!", "Recipe added successfully!"));
        } else {
          alert(t("Gagal menambahkan resep.", "Failed to add recipe."));
        }
      }
    } catch (err) {
      console.error(err);
      alert("Error saving recipe.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string | number, newStatus: string) => {
    try {
      const res = await updateOrderStatus(orderId, newStatus);
      if (res.success) {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      } else {
        alert(`Gagal mengubah status pesanan.\nBackend response: ${res.message}`);
      }
    } catch (e) {
      alert("Error updating order status.");
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        const [apiRecipes, apiMenus, apiOrders] = await Promise.all([
          getRecipes(),
          getMenus(),
          getOrders(),
        ]);

        if (apiRecipes.length > 0) setRecipes(apiRecipes.map(mapAPIRecipeToRecipe) as Recipe[]);
        if (apiMenus.length > 0) setProducts(apiMenus.map(mapAPIMenuToProduct) as Product[]);
        setOrders(apiOrders);
      } catch (err) {
        console.error("Failed to load admin data:", err);
      } finally {
        setLoading(false);
      }
    }
    
    // Only load admin data if user is an admin
    if (user && user.role === "admin") {
      loadData();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Redirect non-admin users
  if (!user || user.role !== "admin") {
    return (
      <div className="admin-denied">
        <Shield size={64} />
        <h1>{t("Akses Ditolak", "Access Denied")}</h1>
        <p>{t("Halaman ini hanya untuk Admin.", "This page is for Admins only.")}</p>
        <Link href="/" className="btn-primary" style={{ background: "linear-gradient(135deg, var(--orange-500), var(--amber-500))", color: "#fff", marginTop: 20 }}>
          {t("Kembali ke Beranda", "Back to Home")}
        </Link>
      </div>
    );
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);

  const stats = [
    { icon: <BookOpen size={24} />, label: t("Total Resep", "Total Recipes"), value: recipes.length, color: "#f97316" },
    { icon: <Package size={24} />, label: t("Total Produk", "Total Products"), value: products.length, color: "#f59e0b" },
    { icon: <TrendingUp size={24} />, label: t("Total Pesanan", "Total Orders"), value: orders.length, color: "#6366f1" },
  ];

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: t("Ringkasan", "Overview"), icon: <TrendingUp size={18} /> },
    { id: "recipes", label: t("Kelola Resep", "Manage Recipes"), icon: <BookOpen size={18} /> },
    { id: "products", label: t("Kelola Produk", "Manage Products"), icon: <Package size={18} /> },
    { id: "orders", label: t("Pesanan", "Orders"), icon: <ShoppingCart size={18} /> },
  ];

  return (
    <>
      {/* Admin Header */}
      <div className="admin-header">
        <div className="admin-header-inner">
          <div>
            <h1><Shield size={28} /> {t("Admin Dashboard", "Admin Dashboard")}</h1>
            <p>{t(`Selamat datang, ${user.name}`, `Welcome, ${user.name}`)}</p>
          </div>
          <div className="admin-header-actions">
            <Link href="/" className="admin-header-btn">
              <Home size={16} />
              {t("Lihat Situs", "View Site")}
            </Link>
            <button className="admin-header-btn" onClick={toggleLang}>
              <Globe size={16} />
              {lang === "id" ? "EN" : "ID"}
            </button>
            <button className="admin-header-btn admin-header-btn-logout" onClick={logout}>
              <LogOut size={16} />
              {t("Keluar", "Logout")}
            </button>
          </div>
        </div>
      </div>

      <div className="admin-layout">
        {/* Sidebar tabs */}
        <aside className="admin-sidebar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`admin-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </aside>

        {/* Main content */}
        <main className="admin-main">
          {/* Overview */}
          {activeTab === "overview" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2>{t("Ringkasan", "Overview")}</h2>
              <div className="admin-stats">
                {stats.map((s, i) => (
                  <motion.div
                    key={i}
                    className="admin-stat-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="admin-stat-icon" style={{ background: s.color + "15", color: s.color }}>
                      {s.icon}
                    </div>
                    <div className="admin-stat-info">
                      <span className="admin-stat-value">{loading ? "..." : s.value}</span>
                      <span className="admin-stat-label">{s.label}</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="admin-quick-grid">
                <div className="admin-quick-card">
                  <h3><ChefHat size={20} /> {t("Resep Terbaru", "Latest Recipes")}</h3>
                  <div className="admin-quick-list">
                    {recipes.slice(0, 4).map((r) => (
                      <div key={r.id} className="admin-quick-item">
                        <img src={r.thumbnail} alt={r.title} />
                        <div>
                          <strong>{lang === "id" ? r.title : r.titleEn}</strong>
                          <span>{lang === "id" ? r.category : r.categoryEn}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="admin-quick-card">
                  <h3><ShoppingBag size={20} /> {t("Produk Terlaris", "Top Products")}</h3>
                  <div className="admin-quick-list">
                    {products.slice(0, 4).map((p) => (
                      <div key={p.id} className="admin-quick-item">
                        <img src={p.image} alt={p.name} />
                        <div>
                          <strong>{lang === "id" ? p.name : p.nameEn}</strong>
                          <span>{formatPrice(p.price)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Recipes management */}
          {activeTab === "recipes" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="admin-section-header">
                <h2>{t("Kelola Resep", "Manage Recipes")}</h2>
                <button className="admin-add-btn" onClick={handleAddRecipeClick}>
                  <Plus size={18} /> {t("Tambah Resep", "Add Recipe")}
                </button>
              </div>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>{t("Gambar", "Image")}</th>
                      <th>{t("Nama Resep", "Recipe Name")}</th>
                      <th>{t("Kategori", "Category")}</th>
                      <th>{t("Kesulitan", "Difficulty")}</th>
                      <th>{t("Waktu", "Time")}</th>
                      <th>{t("Aksi", "Actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recipes.map((r) => (
                      <tr key={r.id}>
                        <td>
                          <img src={r.thumbnail} alt={r.title} className="admin-table-img" />
                        </td>
                        <td><strong>{lang === "id" ? r.title : r.titleEn}</strong></td>
                        <td>
                          <span className="admin-badge">{lang === "id" ? r.category : r.categoryEn}</span>
                        </td>
                        <td>
                          <span className={`admin-badge admin-badge-${r.difficulty === "Mudah" ? "green" : r.difficulty === "Sedang" ? "yellow" : "red"}`}>
                            {lang === "id" ? r.difficulty : r.difficultyEn}
                          </span>
                        </td>
                        <td>{r.cookTime}</td>
                        <td>
                          <div className="admin-actions">
                            <Link href={`/resep/${r.id}`} className="admin-action-btn view"><Eye size={16} /></Link>
                            <button className="admin-action-btn edit" onClick={() => handleEditRecipe(r)}><Pencil size={16} /></button>
                            <button className="admin-action-btn delete" onClick={() => handleDeleteRecipe(r.id)}><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Products management */}
          {activeTab === "products" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="admin-section-header">
                <h2>{t("Kelola Produk", "Manage Products")}</h2>
                <button className="admin-add-btn" onClick={handleAddProductClick}>
                  <Plus size={18} /> {t("Tambah Produk", "Add Product")}
                </button>
              </div>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>{t("Gambar", "Image")}</th>
                      <th>{t("Nama Produk", "Product Name")}</th>
                      <th>{t("Kategori", "Category")}</th>
                      <th>{t("Harga", "Price")}</th>
                      <th>Badge</th>
                      <th>{t("Aksi", "Actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <img src={p.image} alt={p.name} className="admin-table-img" />
                        </td>
                        <td><strong>{lang === "id" ? p.name : p.nameEn}</strong></td>
                        <td>
                          <span className="admin-badge">{lang === "id" ? p.category : p.categoryEn}</span>
                        </td>
                        <td className="admin-price">{formatPrice(p.price)}</td>
                        <td>
                          {p.badge ? (
                            <span className="admin-badge admin-badge-yellow">
                              {lang === "id" ? p.badge : p.badgeEn}
                            </span>
                          ) : (
                            <span style={{ color: "var(--text-muted)" }}>—</span>
                          )}
                        </td>
                        <td>
                          <div className="admin-actions">
                            <button className="admin-action-btn edit" onClick={() => handleEditProduct(p)}><Pencil size={16} /></button>
                            <button className="admin-action-btn delete" onClick={() => handleDeleteProduct(p.id)}><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Orders */}
          {activeTab === "orders" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="admin-section-header">
                <h2>{t("Pesanan", "Orders")}</h2>
              </div>

              {/* Active cart */}
              {cartItems.length > 0 && (
                <div style={{ marginBottom: 28 }}>
                  <h3 style={{ fontSize: "0.95rem", marginBottom: 12 }}>
                    🛒 {t("Keranjang Aktif", "Active Cart")} ({cartTotal} item)
                  </h3>
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>{t("Gambar", "Image")}</th>
                          <th>{t("Nama Produk", "Product Name")}</th>
                          <th>{t("Harga", "Price")}</th>
                          <th>{t("Jumlah", "Qty")}</th>
                          <th>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cartItems.map((item) => (
                          <tr key={item.id}>
                            <td>
                              <img src={item.image} alt={item.name} className="admin-table-img" />
                            </td>
                            <td><strong>{item.name}</strong></td>
                            <td className="admin-price">{formatPrice(item.price)}</td>
                            <td>
                              <span className="admin-badge admin-badge-green">{item.quantity}x</span>
                            </td>
                            <td className="admin-price">{formatPrice(item.price * item.quantity)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan={4} style={{ textAlign: "right", fontWeight: 700 }}>Total</td>
                          <td className="admin-price" style={{ fontSize: "1.1rem" }}>
                            {formatPrice(cartTotalPrice)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}

              {/* Order history */}
              <h3 style={{ fontSize: "0.95rem", marginBottom: 12 }}>
                📋 {t("Riwayat Pesanan", "Order History")}
              </h3>
              {loading ? (
                <div style={{ textAlign: "center", padding: 40 }}>
                  <div className="auth-loading-spinner" />
                </div>
              ) : orders.length === 0 ? (
                <div className="admin-empty-state">
                  <ShoppingCart size={48} />
                  <h3>{t("Belum ada riwayat pesanan", "No order history yet")}</h3>
                  <p>{t(
                    "Pesanan yang telah dibayar akan muncul di sini.",
                    "Completed orders will appear here."
                  )}</p>
                </div>
              ) : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>{t("Pembeli", "Buyer")}</th>
                        <th>{t("Item", "Items")}</th>
                        <th>{t("Pembayaran", "Payment")}</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>{t("Tanggal", "Date")}</th>
                        <th>{t("Aksi", "Actions")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => {
                        let displayName = typeof order.user === "string" ? order.user : (order.user?.name || "—");
                        let displayEmail = typeof order.user !== "string" ? order.user?.email : "";

                        return (
                          <tr key={order.id}>
                            <td><code style={{ fontSize: "0.8rem", fontWeight: 700 }}>{order.id}</code></td>
                            <td>
                              <strong>{displayName}</strong>
                              {displayEmail && (
                                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                                  {displayEmail}
                                </div>
                              )}
                            </td>
                          <td>
                            {(order.items as any[])?.map((it, i) => (
                              <div key={i} style={{ fontSize: "0.8rem" }}>
                                {it.menu?.name || it.name} ×{it.quantity}
                              </div>
                            ))}
                          </td>
                          <td>
                            <span className="admin-badge">{order.paymentMethod ? order.paymentMethod.toUpperCase() : "BANK TRANSFER"}</span>
                          </td>
                          <td className="admin-price">{formatPrice(order.totalPrice || order.total || 0)}</td>
                          <td>
                            <span className="admin-badge admin-badge-green">
                              {order.status === "paid" ? t("Lunas", "Paid") : order.status}
                            </span>
                          </td>
                          <td style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                            {(() => {
                              const d = order.createdAt || order.created_at || (order as any).date;
                              if (!d) return "—";
                              const dateObj = new Date(d);
                              return isNaN(dateObj.getTime()) ? "—" : dateObj.toLocaleDateString("id-ID", {
                                day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                              });
                            })()}
                          </td>
                          <td>
                            {order.status !== "DONE" && order.status !== "CANCELLED" && (
                              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                {order.status !== "CONFIRMED" && (
                                  <button
                                    onClick={() => handleUpdateOrderStatus(order.id, "CONFIRMED")}
                                    style={{ padding: "4px 8px", fontSize: "0.75rem", borderRadius: "6px", background: "#fef3c7", color: "#d97706", border: "1px solid #fde68a", cursor: "pointer", fontWeight: 600 }}
                                  >
                                    Konfirmasi
                                  </button>
                                )}
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, "DONE")}
                                  style={{ padding: "4px 8px", fontSize: "0.75rem", borderRadius: "6px", background: "#d1fae5", color: "#059669", border: "1px solid #a7f3d0", cursor: "pointer", fontWeight: 600 }}
                                >
                                  Selesai
                                </button>
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, "CANCELLED")}
                                  style={{ padding: "4px 8px", fontSize: "0.75rem", borderRadius: "6px", background: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca", cursor: "pointer", fontWeight: 600 }}
                                >
                                  Batalkan
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}
        </main>
      </div>

      {/* Product Add/Edit Modal */}
      {isProductModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsProductModalOpen(false)}>
          <div className="admin-modal animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>{editingProduct ? t("Edit Produk", "Edit Product") : t("Tambah Produk", "Add Product")}</h2>
              <button className="admin-modal-close" onClick={() => setIsProductModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleProductSubmit}>
              <div className="admin-modal-body">
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>{t("Nama Produk (ID)", "Product Name (ID)")}</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>{t("Nama Produk (EN)", "Product Name (EN)")}</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={productForm.nameEn}
                      onChange={(e) => setProductForm({ ...productForm, nameEn: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>{t("Deskripsi (ID)", "Description (ID)")}</label>
                    <textarea
                      className="admin-form-input admin-form-textarea"
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>{t("Deskripsi (EN)", "Description (EN)")}</label>
                    <textarea
                      className="admin-form-input admin-form-textarea"
                      value={productForm.descriptionEn}
                      onChange={(e) => setProductForm({ ...productForm, descriptionEn: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>{t("Harga (Rp)", "Price (Rp)")}</label>
                    <input
                      type="number"
                      className="admin-form-input"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                      required
                      min={0}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>{t("Kategori", "Category")}</label>
                    <select
                      className="admin-form-input"
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      required
                    >
                      <option value="Makanan Berat">{t("Makanan Berat", "Main Course")}</option>
                      <option value="Minuman">{t("Minuman", "Beverages")}</option>
                      <option value="Snack">{t("Snack", "Snack")}</option>
                      <option value="Dessert">{t("Dessert", "Dessert")}</option>
                      <option value="Bumbu & Sambal">{t("Bumbu & Sambal", "Sauces & Condiments")}</option>
                    </select>
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>{t("URL Gambar", "Image URL")}</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={productForm.image}
                      onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>{t("Kategori (EN)", "Category (EN)")}</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={productForm.categoryEn}
                      onChange={(e) => setProductForm({ ...productForm, categoryEn: e.target.value })}
                      placeholder="e.g. Beverages"
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Badge (ID)</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={productForm.badge}
                      onChange={(e) => setProductForm({ ...productForm, badge: e.target.value })}
                      placeholder="e.g. Best Seller"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>Badge (EN)</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={productForm.badgeEn}
                      onChange={(e) => setProductForm({ ...productForm, badgeEn: e.target.value })}
                      placeholder="e.g. Best Seller"
                    />
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn-cancel" onClick={() => setIsProductModalOpen(false)}>
                  {t("Batal", "Cancel")}
                </button>
                <button type="submit" className="admin-btn-save" disabled={submitting}>
                  {submitting ? t("Menyimpan...", "Saving...") : t("Simpan", "Save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recipe Add/Edit Modal */}
      {isRecipeModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsRecipeModalOpen(false)}>
          <div className="admin-modal animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>{editingRecipe ? t("Edit Resep", "Edit Recipe") : t("Tambah Resep", "Add Recipe")}</h2>
              <button className="admin-modal-close" onClick={() => setIsRecipeModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleRecipeSubmit}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label>{t("Produk / Menu Terkait", "Related Product / Menu")}</label>
                  <select
                    className="admin-form-input"
                    value={recipeForm.menuId}
                    onChange={(e) => setRecipeForm({ ...recipeForm, menuId: e.target.value })}
                    required
                  >
                    <option value="">-- {t("Pilih Produk / Menu", "Select Product / Menu")} --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {lang === "id" ? p.name : p.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="admin-form-group">
                  <label>{t("URL Video YouTube", "YouTube Video URL")}</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={recipeForm.youtubeUrl}
                    onChange={(e) => setRecipeForm({ ...recipeForm, youtubeUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>{t("Bahan-bahan (ID) - Pisahkan per baris", "Ingredients (ID) - One per line")}</label>
                    <textarea
                      className="admin-form-input admin-form-textarea"
                      value={recipeForm.ingredients}
                      onChange={(e) => setRecipeForm({ ...recipeForm, ingredients: e.target.value })}
                      placeholder="- 1 piring nasi&#10;- 2 butir telur"
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>{t("Bahan-bahan (EN) - Pisahkan per baris", "Ingredients (EN) - One per line")}</label>
                    <textarea
                      className="admin-form-input admin-form-textarea"
                      value={recipeForm.ingredientsEn}
                      onChange={(e) => setRecipeForm({ ...recipeForm, ingredientsEn: e.target.value })}
                      placeholder="- 1 plate of rice&#10;- 2 eggs"
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>{t("Langkah-langkah (ID) - Pisahkan per baris", "Steps (ID) - One per line")}</label>
                    <textarea
                      className="admin-form-input admin-form-textarea"
                      value={recipeForm.steps}
                      onChange={(e) => setRecipeForm({ ...recipeForm, steps: e.target.value })}
                      placeholder="1. Panaskan minyak&#10;2. Tumis bawang"
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label>{t("Langkah-langkah (EN) - Pisahkan per baris", "Steps (EN) - One per line")}</label>
                    <textarea
                      className="admin-form-input admin-form-textarea"
                      value={recipeForm.stepsEn}
                      onChange={(e) => setRecipeForm({ ...recipeForm, stepsEn: e.target.value })}
                      placeholder="1. Heat oil&#10;2. Sauté garlic"
                    />
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn-cancel" onClick={() => setIsRecipeModalOpen(false)}>
                  {t("Batal", "Cancel")}
                </button>
                <button type="submit" className="admin-btn-save" disabled={submitting}>
                  {submitting ? t("Menyimpan...", "Saving...") : t("Simpan", "Save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
