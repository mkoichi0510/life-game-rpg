import type { Metadata } from "next";
import { auth } from "@/auth";
import { Toaster } from "@/components/ui/sonner";
import { AppShell } from "@/components/layout/app-shell";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Life Game RPG",
  description: "人生を攻略するゲーム体験",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="ja">
      <body className="antialiased">
        <Providers session={session}>
          <AppShell>{children}</AppShell>
          <Toaster position="top-center" richColors />
        </Providers>
      </body>
    </html>
  );
}
