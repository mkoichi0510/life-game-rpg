"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, Home, PlusCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "ホーム", Icon: Home, match: (path: string) => path === "/" },
  {
    href: "/play",
    label: "プレイ",
    Icon: PlusCircle,
    match: (path: string) => path.startsWith("/play"),
  },
  {
    href: "/result",
    label: "リザルト",
    Icon: ClipboardList,
    match: (path: string) => path.startsWith("/result"),
  },
  {
    href: "/skills",
    label: "スキル",
    Icon: Sparkles,
    match: (path: string) => path.startsWith("/skills"),
  },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="メインナビゲーション"
      className="fixed bottom-0 left-0 right-0 z-30 border-t bg-background/95 backdrop-blur lg:inset-y-0 lg:left-0 lg:right-auto lg:w-60 lg:border-r lg:border-t-0"
    >
      <div className="flex h-16 items-center justify-around px-2 pb-[env(safe-area-inset-bottom)] lg:h-full lg:flex-col lg:items-stretch lg:justify-start lg:gap-2 lg:px-4 lg:py-6">
        {navItems.map(({ href, label, Icon, match }) => {
          const isActive = match(pathname ?? "");

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex flex-1 flex-col items-center justify-center gap-1 rounded-md px-2 py-2 text-xs font-medium text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background lg:flex-none lg:flex-row lg:justify-start lg:gap-3 lg:px-3 lg:py-2.5 lg:text-sm",
                isActive && "text-foreground",
                !isActive && "hover:text-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                className={cn(
                  "h-5 w-5",
                  isActive && "text-primary",
                  !isActive && "text-muted-foreground group-hover:text-foreground"
                )}
              />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
