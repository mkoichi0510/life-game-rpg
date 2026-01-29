import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Header } from "@/components/layout/header";
import { PageContainer } from "@/components/layout/page-container";
import "./globals.css";

export const metadata: Metadata = {
  title: "Life Game RPG",
  description: "人生を攻略するゲーム体験",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="antialiased">
        <div className="min-h-screen bg-background">
          <Header />
          <BottomNav />
          <PageContainer>{children}</PageContainer>
        </div>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
