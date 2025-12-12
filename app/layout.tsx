// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Que Precio Le Pongo",
  description: "Calculadora de costos para emprendedores",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      {/* Solo definimos el color de fondo global (zinc-100) y la fuente */}
      <body className={`${inter.className} bg-zinc-100 text-slate-900 min-h-screen`}>
        {children}
      </body>
    </html>
  );
}