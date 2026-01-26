import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <main
      className={cn(
        "min-h-screen px-4 pb-[calc(env(safe-area-inset-bottom)+5rem)] pt-4 lg:pl-64 lg:pr-6 lg:pt-6 lg:pb-8",
        className
      )}
    >
      {children}
    </main>
  );
}
