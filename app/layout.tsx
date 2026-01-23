import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// --- AQUÍ ESTÁ LA MAGIA DEL SEO ---
export const metadata: Metadata = {
  title: "Que Precio Le Pongo | Calculadora de Costos y Sueldos Reales",
  description: "Herramienta gratuita para emprendedores y empleados. Calculá el precio de tus productos, costos fijos y verificá si tu sueldo está bien liquidado según convenio.",
  keywords: ["calculadora de costos", "precio de venta", "sueldo comercio", "paritarias 2025", "emprendedores argentina"],
  authors: [{ name: "En Red Consultora", url: "https://www.enredconsultora.com.ar" }],
  openGraph: {
    title: "Que Precio Le Pongo | Dejá de perder plata",
    description: "¿Sabés cuánto cobrar tu producto? ¿Sabés si te están pagando bien el sueldo? Calculalo acá gratis.",
    url: "https://quepreciole pongo.vercel.app", // Asegúrate de que esta URL sea la correcta cuando despliegues
    siteName: "Que Precio Le Pongo",
    locale: "es_AR",
    type: "website",
    images: [
      {
        url: "/og-image.png", // Recuerda subir esta imagen a la carpeta 'public'
        width: 1200,
        height: 630,
        alt: "Que Precio Le Pongo Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Que Precio Le Pongo",
    description: "Calculadora de Costos y Sueldos Reales para Argentina.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-zinc-100 text-slate-900 min-h-screen`}>
        {children}
      </body>
    </html>
  );
}