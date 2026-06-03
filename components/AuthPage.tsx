"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChefHat, Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader2, Shield, UserCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import type { Role } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("user");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { login, register } = useAuth();
  const { t, lang, toggleLang } = useLang();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (mode === "login") {
      const result = await login(email, password);
      if (!result.success) {
        setError(t("Email atau password salah.", "Invalid email or password."));
      } else {
        // If admin, redirect to admin page, else to home page
        if (result.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/");
        }
      }
    } else {
      if (!name.trim()) {
        setError(t("Nama tidak boleh kosong.", "Name is required."));
        setLoading(false);
        return;
      }
      const result = await register(name, email, password, role);
      if (!result.success) {
        if (result.error === "email_exists") {
          setError(t("Email sudah terdaftar.", "Email already registered."));
        } else if (result.error === "network_error") {
          setError(t("Gagal terhubung ke server. Coba lagi.", "Failed to connect to server. Try again."));
        } else {
          setError(t("Pendaftaran gagal: " + (result.error || "Unknown error"), "Registration failed: " + (result.error || "Unknown error")));
        }
      } else {
        // Don't auto-login, switch to login mode
        setSuccess(t("Akun berhasil dibuat! Silakan login.", "Account created! Please log in."));
        setMode("login");
        setName("");
        setPassword("");
        setRole("user");
      }
    }
    setLoading(false);
  };

  const switchMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setError("");
    setSuccess("");
    setName("");
    setEmail("");
    setPassword("");
    setRole("user");
  };

  return (
    <div className="auth-page">
      {/* Background decoration */}
      <div className="auth-bg">
        <div className="auth-bg-circle auth-bg-circle-1" />
        <div className="auth-bg-circle auth-bg-circle-2" />
        <div className="auth-bg-circle auth-bg-circle-3" />
      </div>

      {/* Language toggle */}
      <button className="auth-lang-toggle" onClick={toggleLang}>
        {lang === "id" ? "EN" : "ID"}
      </button>

      <motion.div
        className="auth-container"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Left panel - branding */}
        <div className="auth-brand">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="auth-brand-logo">
              <ChefHat size={40} />
              <span>DapurKita</span>
            </div>
            <h1>{t("Selamat Datang di DapurKita", "Welcome to DapurKita")}</h1>
            <p>
              {t(
                "Temukan resep autentik Indonesia & pesan makanan lezat langsung dari dapur kami.",
                "Discover authentic Indonesian recipes & order delicious food straight from our kitchen."
              )}
            </p>

            <div className="auth-brand-features">
              {[
                { emoji: "🍳", text: t("50+ Resep Autentik", "50+ Authentic Recipes") },
                { emoji: "📺", text: t("Video Tutorial Lengkap", "Complete Video Tutorials") },
                { emoji: "🛒", text: t("Pesan Makanan Online", "Order Food Online") },
              ].map((f, i) => (
                <motion.div
                  key={i}
                  className="auth-brand-feature"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.15 }}
                >
                  <span>{f.emoji}</span>
                  <span>{f.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right panel - form */}
        <div className="auth-form-panel">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2>
                {mode === "login"
                  ? t("Masuk ke Akun", "Sign In")
                  : t("Buat Akun Baru", "Create Account")}
              </h2>
              <p className="auth-subtitle">
                {mode === "login"
                  ? t("Masukkan email dan password untuk melanjutkan", "Enter your email and password to continue")
                  : t("Isi data di bawah untuk mendaftar", "Fill in the details below to register")}
              </p>

              <form onSubmit={handleSubmit} className="auth-form">
                {/* Name field (register only) */}
                <AnimatePresence>
                  {mode === "register" && (
                    <motion.div
                      className="auth-field"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <label>{t("Nama Lengkap", "Full Name")}</label>
                      <div className="auth-input-wrap">
                        <User size={18} className="auth-input-icon" />
                        <input
                          type="text"
                          placeholder={t("Masukkan nama lengkap", "Enter your full name")}
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email */}
                <div className="auth-field">
                  <label>Email</label>
                  <div className="auth-input-wrap">
                    <Mail size={18} className="auth-input-icon" />
                    <input
                      type="email"
                      placeholder={t("Masukkan email", "Enter your email")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="auth-field">
                  <label>Password</label>
                  <div className="auth-input-wrap">
                    <Lock size={18} className="auth-input-icon" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder={t("Masukkan password", "Enter your password")}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="auth-password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Role selector (register only) */}
                <AnimatePresence>
                  {mode === "register" && (
                    <motion.div
                      className="auth-field"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      style={{ overflow: "visible" }}
                    >
                      <label>{t("Daftar Sebagai", "Register As")}</label>
                      <div className="auth-role-selector">
                        <button
                          type="button"
                          className={`auth-role-btn ${role === "user" ? "active" : ""}`}
                          onClick={() => setRole("user")}
                        >
                          <UserCircle size={20} />
                          <span>User</span>
                        </button>
                        <button
                          type="button"
                          className={`auth-role-btn ${role === "admin" ? "active" : ""}`}
                          onClick={() => setRole("admin")}
                        >
                          <Shield size={20} />
                          <span>Admin</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      className="auth-error"
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Success */}
                <AnimatePresence>
                  {success && (
                    <motion.div
                      className="auth-success"
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                    >
                      ✅ {success}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <button type="submit" className="auth-submit" disabled={loading}>
                  {loading ? (
                    <Loader2 size={20} className="auth-spinner" />
                  ) : (
                    <>
                      {mode === "login" ? t("Masuk", "Sign In") : t("Daftar", "Sign Up")}
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              {/* Switch mode */}
              <div className="auth-switch">
                <span>
                  {mode === "login"
                    ? t("Belum punya akun?", "Don't have an account?")
                    : t("Sudah punya akun?", "Already have an account?")}
                </span>
                <button onClick={switchMode}>
                  {mode === "login" ? t("Daftar Sekarang", "Sign Up") : t("Masuk", "Sign In")}
                </button>
              </div>

            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
