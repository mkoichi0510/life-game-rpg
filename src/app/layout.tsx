import type { Metadata } from "next";
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
        {children}
      </body>
    </html>
  );
}
