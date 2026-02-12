import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const poppins = Poppins({ 
  weight: ['400', '600', '700'],
  subsets: ["latin"],
  variable: "--font-poppins"
});

export const metadata: Metadata = {
  title: "Dashboard de Reportes",
  description: "Tarea 6 Lab",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`${poppins.variable} antialiased bg-white text-gray-900`} style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
        <Navbar />
        <main className="max-w-full min-h-screen w-screen">
          {children}
        </main>
      </body>
    </html>
  );
}