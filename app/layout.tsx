import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import ClientProviders from "@/components/ClientProviders";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: "DapurKita — Resep & Kuliner Indonesia",
  description: "Temukan resep masakan Indonesia autentik dengan video tutorial dan beli hasil masakan langsung dari dapur kami.",
  keywords: ["resep", "kuliner", "masakan indonesia", "makanan", "DapurKita"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={`${outfit.variable} ${inter.variable}`}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
