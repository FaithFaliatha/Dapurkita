// ─── API Client for Kuliner Backend (Railway) ───────────────
// Use the Next.js proxy route to avoid CORS issues.
// All requests go to /api/proxy/... which forwards to the Railway backend server-side.
const API_BASE = typeof window !== "undefined" ? "/api/proxy" : (process.env.NEXT_PUBLIC_API_URL || "https://kuliner-backend-production-38c5.up.railway.app");

// ─── Token helpers ──────────────────────────────────────────

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("dapurkita_token");
}

export function setToken(token: string) {
  localStorage.setItem("dapurkita_token", token);
}

export function clearToken() {
  localStorage.removeItem("dapurkita_token");
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  if (token) {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }
  return { "Content-Type": "application/json" };
}

// ─── Auth ───────────────────────────────────────────────────

export interface LoginResponse {
  access_token: string;
  role: "USER" | "ADMIN";
}

export async function apiLogin(email: string, password: string): Promise<LoginResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch {
    return null;
  }
}

export interface RegisterResult {
  success: boolean;
  error?: string;
}

export async function apiRegister(
  name: string,
  email: string,
  password: string,
  role: "user" | "admin" = "user"
): Promise<RegisterResult> {
  try {
    const endpoint = role === "admin" ? "/auth/register-admin" : "/auth/register";
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    if (res.ok) {
      return { success: true };
    }
    // Try to extract error message from backend
    try {
      const data = await res.json();
      if (res.status === 409) {
        return { success: false, error: "email_exists" };
      }
      return { success: false, error: data.message || `Error ${res.status}` };
    } catch {
      return { success: false, error: `Error ${res.status}` };
    }
  } catch (err) {
    console.error("[apiRegister] Network error:", err);
    return { success: false, error: "network_error" };
  }
}

// ─── Types ──────────────────────────────────────────────────

export interface APIMenu {
  id: number;
  name: string;
  nameEn?: string;
  description: string;
  descriptionEn?: string;
  price: number;
  category: string;
  categoryEn?: string;
  image?: string;
  imageUrl?: string;
  badge?: string;
  badgeEn?: string;
  relatedRecipeId?: string | number | null;
}

export interface APIRecipe {
  id: number;
  title?: string;
  titleEn?: string;
  description?: string;
  descriptionEn?: string;
  category?: string;
  categoryEn?: string;
  cookTime?: string;
  servings?: number;
  difficulty?: string;
  difficultyEn?: string;
  youtubeUrl?: string;
  thumbnail?: string;
  ingredients?: string | string[];
  ingredientsEn?: string | string[];
  steps?: string | string[];
  stepsEn?: string | string[];
  relatedProductId?: string | number | null;
  menuId?: number | null;
  menu?: any;
}

export interface APIOrder {
  id: number | string;
  userId?: number | string | null;
  user?: {
    name?: string;
    email?: string;
  };
  userName?: string;
  items: {
    quantity: number;
    menu?: {
      name: string;
      price: number;
      imageUrl?: string;
    };
    // fallbacks just in case
    name?: string;
    price?: number;
    image?: string;
  }[];
  totalPrice?: number;
  total?: number;
  status: string;
  paymentMethod?: string | null;
  address?: string | null;
  phone?: string | null;
  note?: string | null;
  createdAt?: string;
  created_at?: string;
}

// ─── Menu (Products) ───────────────────────────────────────

export async function getMenus(): Promise<APIMenu[]> {
  try {
    const res = await fetch(`${API_BASE}/menu`, {
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function getMenuById(id: number | string): Promise<APIMenu | null> {
  try {
    const res = await fetch(`${API_BASE}/menu/${id}`, {
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function createMenu(menu: Partial<APIMenu>): Promise<APIMenu | null> {
  try {
    const res = await fetch(`${API_BASE}/menu`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(menu),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function updateMenu(id: number | string, menu: Partial<APIMenu>): Promise<APIMenu | null> {
  try {
    const res = await fetch(`${API_BASE}/menu/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(menu),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function deleteMenu(id: number | string): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_BASE}/menu/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    if (!res.ok) {
      const text = await res.text();
      return { success: false, message: `HTTP ${res.status} - ${text}` };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

// ─── Recipes ────────────────────────────────────────────────

export async function getRecipes(): Promise<APIRecipe[]> {
  try {
    const res = await fetch(`${API_BASE}/recipe`, {
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function getRecipeById(id: number | string): Promise<APIRecipe | null> {
  try {
    const res = await fetch(`${API_BASE}/recipe/${id}`, {
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function getRecipesByMenu(menuId: number | string): Promise<APIRecipe[]> {
  try {
    const res = await fetch(`${API_BASE}/recipe/menu/${menuId}`, {
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function createRecipe(recipe: Partial<APIRecipe>): Promise<APIRecipe | null> {
  try {
    const res = await fetch(`${API_BASE}/recipe`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(recipe),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function updateRecipe(id: number | string, recipe: Partial<APIRecipe>): Promise<APIRecipe | null> {
  try {
    const res = await fetch(`${API_BASE}/recipe/${id}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(recipe),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function deleteRecipe(id: number | string): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_BASE}/recipe/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    if (!res.ok) {
      const text = await res.text();
      return { success: false, message: `HTTP ${res.status} - ${text}` };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

// ─── Orders ─────────────────────────────────────────────────

export async function createOrder(order: Partial<APIOrder>): Promise<APIOrder | null> {
  try {
    const res = await fetch(`${API_BASE}/order`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(order),
    });
    if (!res.ok) {
      // Fallback: save to localStorage
      return null;
    }
    return await res.json();
  } catch {
    return null;
  }
}

export async function getOrders(): Promise<APIOrder[]> {
  try {
    const res = await fetch(`${API_BASE}/order`, {
      headers: authHeaders(),
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function getMyOrders(): Promise<APIOrder[]> {
  try {
    const res = await fetch(`${API_BASE}/order/my-orders`, {
      headers: authHeaders(),
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function updateOrderStatus(
  id: number | string,
  status: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_BASE}/order/${id}/status`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ status }),
    });
    if (res.ok) return { success: true };
    
    let errMsg = "Unknown error";
    try {
      const data = await res.json();
      errMsg = data.message || data.error || JSON.stringify(data);
    } catch {
      errMsg = await res.text();
    }
    return { success: false, message: errMsg };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

// ─── Map API format → Frontend format ───────────────────────

export interface Product {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  price: number;
  category: string;
  categoryEn: string;
  image: string;
  relatedRecipeId?: string;
  badge?: string;
  badgeEn?: string;
}

export interface Recipe {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  category: string;
  categoryEn: string;
  cookTime: string;
  servings: number;
  difficulty: "Mudah" | "Sedang" | "Sulit";
  difficultyEn: "Easy" | "Medium" | "Hard";
  youtubeUrl: string;
  thumbnail: string;
  ingredients: string[];
  ingredientsEn: string[];
  steps: string[];
  stepsEn: string[];
  relatedProductId?: string;
}


export function mapAPIMenuToProduct(m: APIMenu) {
  return {
    id: String(m.id),
    name: m.name,
    nameEn: m.nameEn || m.name,
    description: m.description,
    descriptionEn: m.descriptionEn || m.description,
    price: m.price,
    category: m.category,
    categoryEn: m.categoryEn || m.category,
    image: m.image || m.imageUrl || "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400",
    relatedRecipeId: m.relatedRecipeId ? String(m.relatedRecipeId) : undefined,
    badge: m.badge || undefined,
    badgeEn: m.badgeEn || m.badge || undefined,
  };
}

export function mapAPIRecipeToRecipe(r: APIRecipe) {
  const menu = r.menu || {};

  // Parse ingredients
  let ingredientsArr: string[] = [];
  if (Array.isArray(r.ingredients)) {
    ingredientsArr = r.ingredients;
  } else if (typeof r.ingredients === "string") {
    ingredientsArr = r.ingredients
      .split("\n")
      .map((item) => item.replace(/^-\s*/, "").trim())
      .filter(Boolean);
  }

  // Parse steps
  let stepsArr: string[] = [];
  if (Array.isArray(r.steps)) {
    stepsArr = r.steps;
  } else if (typeof r.steps === "string") {
    stepsArr = r.steps
      .split("\n")
      .map((item) => item.replace(/^\d+\.\s*/, "").trim())
      .filter(Boolean);
  }

  return {
    id: String(r.id),
    title: r.title || menu.name || "Resep Tanpa Nama",
    titleEn: r.titleEn || r.title || menu.name || "Recipe Without Name",
    description: r.description || menu.description || "",
    descriptionEn: r.descriptionEn || r.description || menu.description || "",
    category: r.category || menu.category || "Masakan Indonesia",
    categoryEn: r.categoryEn || r.category || menu.category || "Indonesian Cuisine",
    cookTime: r.cookTime || "30 menit",
    servings: Number(r.servings) || 2,
    difficulty: (r.difficulty || "Mudah") as "Mudah" | "Sedang" | "Sulit",
    difficultyEn: (r.difficultyEn || r.difficulty || "Easy") as "Easy" | "Medium" | "Hard",
    youtubeUrl: r.youtubeUrl || "",
    thumbnail: r.thumbnail || menu.imageUrl || menu.image || "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400",
    ingredients: ingredientsArr,
    ingredientsEn: r.ingredientsEn
      ? (Array.isArray(r.ingredientsEn)
          ? r.ingredientsEn
          : r.ingredientsEn
              .split("\n")
              .map((item) => item.replace(/^-\s*/, "").trim())
              .filter(Boolean))
      : ingredientsArr,
    steps: stepsArr,
    stepsEn: r.stepsEn
      ? (Array.isArray(r.stepsEn)
          ? r.stepsEn
          : r.stepsEn
              .split("\n")
              .map((item) => item.replace(/^\d+\.\s*/, "").trim())
              .filter(Boolean))
      : stepsArr,
    relatedProductId: r.relatedProductId ? String(r.relatedProductId) : (menu.id ? String(menu.id) : undefined),
  };
}
