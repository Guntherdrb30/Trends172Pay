import { ChatWidget } from "@/components/ChatWidget";
import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import "../styles/globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body"
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display"
});

export const metadata: Metadata = {
  title: "trends172 Pay - Boton de Pago para Empresas",
  description:
    "Activa un boton de pago guiado para tu empresa. Mira el video, prueba el flujo y contrata con apoyo."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body
        className={`${manrope.variable} ${spaceGrotesk.variable} min-h-screen bg-slate-950 text-slate-100 antialiased`}
      >
        {children}
        <ChatWidget />
      </body>
    </html>
  );
}
