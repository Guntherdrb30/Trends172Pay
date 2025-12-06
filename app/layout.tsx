import { ChatWidget } from "@/components/ChatWidget";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans"
});

export const metadata: Metadata = {
  title: "trends172 Pay – Pasarela de pagos multi-negocio",
  description:
    "trends172 Pay es una pasarela de pagos centralizada y multi-negocio."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body
        className={`${inter.variable} min-h-screen bg-slate-950 text-slate-100 antialiased`}
      >
        {children}
        <ChatWidget />
      </body>
    </html>
  );
}

