import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import { LangProvider } from "@/contexts/LangContext";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/Navbar";
import { MathProvider } from "@/components/providers/MathProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "ОРТ Преп — Подготовка к ОРТ",
  description: "Подготовка к Общереспубликанскому тестированию. Тренируйтесь по разделам, отслеживайте прогресс.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900">
        <LangProvider>
          <MathProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Toaster />
          </MathProvider>
        </LangProvider>
      </body>
    </html>
  );
}
