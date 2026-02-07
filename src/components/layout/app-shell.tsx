"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Header } from "@/components/layout/header";
import { PageContainer } from "@/components/layout/page-container";
import { ROUTES } from "@/lib/constants";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  if (pathname === ROUTES.LOGIN) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <BottomNav />
      <PageContainer>{children}</PageContainer>
    </div>
  );
}
