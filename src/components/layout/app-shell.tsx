"use client";

import type { ReactNode } from "react";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Header } from "@/components/layout/header";
import { PageContainer } from "@/components/layout/page-container";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <BottomNav />
      <PageContainer>{children}</PageContainer>
    </div>
  );
}
