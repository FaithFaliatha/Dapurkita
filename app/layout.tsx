import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import ClientProviders from "@/components/ClientProviders";

const poppins = Poppins({ 
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["latin"], 
  variable: "--font-poppins", 
  display: "swap" 
});

export const metadata: Metadata = {
  title: "DapurKita — Resep & Kuliner Indonesia",
  description: "Temukan resep masakan Indonesia autentik dengan video tutorial dan beli hasil masakan langsung dari dapur kami.",
  keywords: ["resep", "kuliner", "masakan indonesia", "makanan", "DapurKita"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={`${poppins.variable} ${poppins.className}`}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
