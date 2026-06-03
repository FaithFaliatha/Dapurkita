"use client";

import { motion } from "framer-motion";
import { Heart, Leaf, Award, Users } from "lucide-react";
import { useLang } from "@/context/LanguageContext";

export default function TentangPage() {
  const { t } = useLang();

  const values = [
    {
      icon: <Heart size={32} />,
      title: t("Dimasak dengan Cinta", "Cooked with Love"),
      desc: t("Setiap hidangan kami dibuat dengan sepenuh hati dan perhatian terhadap detail.", "Every dish we make is prepared wholeheartedly with attention to detail."),
    },
    {
      icon: <Leaf size={32} />,
      title: t("Bahan Segar & Alami", "Fresh & Natural Ingredients"),
      desc: t("Kami hanya menggunakan bahan-bahan segar berkualitas tinggi tanpa pengawet.", "We only use high-quality fresh ingredients without preservatives."),
    },
    {
      icon: <Award size={32} />,
      title: t("Resep Warisan", "Heritage Recipes"),
      desc: t("Resep turun-temurun dari berbagai daerah di Indonesia yang telah teruji waktu.", "Time-tested recipes passed down through generations from across Indonesia."),
    },
    {
      icon: <Users size={32} />,
      title: t("Komunitas Kuliner", "Culinary Community"),
      desc: t("Bergabung dengan komunitas pecinta masakan Indonesia yang terus berkembang.", "Join our growing community of Indonesian food enthusiasts."),
    },
  ];

  return (
    <>
      <div 
        className="about-hero"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1505253758473-96b7015fcd40?q=80&w=1920&auto=format&fit=crop')` }}
      >
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1>{t("Tentang DapurKita", "About DapurKita")}</h1>
          <p>{t("Dari dapur kami, untuk meja makan Anda", "From our kitchen, to your dining table")}</p>
        </motion.div>
      </div>

      <div className="about-section">
        <h2>{t("Cerita Kami", "Our Story")}</h2>
        <p>
          {t(
            "DapurKita lahir dari kecintaan mendalam terhadap kuliner Nusantara. Kami percaya bahwa setiap hidangan Indonesia memiliki cerita dan warisan budaya yang patut dilestarikan. Berawal dari dapur kecil di Malang, kini kami hadir untuk berbagi resep autentik dan menyajikan masakan berkualitas untuk semua pecinta kuliner.",
            "DapurKita was born from a deep love for Indonesian cuisine. We believe that every Indonesian dish carries a story and cultural heritage worth preserving. Starting from a small kitchen in Malang, we are now here to share authentic recipes and serve quality food for all food lovers."
          )}
        </p>
        <p>
          {t(
            "Misi kami sederhana: membuat masakan Indonesia yang autentik dapat diakses oleh semua orang, baik melalui resep yang mudah diikuti maupun makanan siap santap yang kami kirim langsung ke rumah Anda.",
            "Our mission is simple: to make authentic Indonesian cuisine accessible to everyone, whether through easy-to-follow recipes or ready-to-eat meals delivered straight to your home."
          )}
        </p>
      </div>

      <div className="about-section">
        <h2>{t("Nilai-nilai Kami", "Our Values")}</h2>
        <div className="values-grid">
          {values.map((val, i) => (
            <motion.div
              key={i}
              className="value-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
            >
              <div className="value-icon" style={{ color: "var(--orange-500)" }}>{val.icon}</div>
              <h3>{val.title}</h3>
              <p>{val.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
}
