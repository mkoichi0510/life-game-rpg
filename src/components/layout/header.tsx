"use client";

import { useEffect, useState } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { ja } from "date-fns/locale";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { DEFAULT_TIMEZONE } from "@/lib/date";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";

function formatToday(): string {
  return formatInTimeZone(
    new Date(),
    DEFAULT_TIMEZONE,
    "yyyy年M月d日（EEE）",
    { locale: ja }
  );
}

export function Header() {
  const [today, setToday] = useState("");
  const { data: session } = useSession();

  useEffect(() => {
    // Set initial date after hydration
    setToday(formatToday());

    // Update every minute to detect date changes
    const interval = setInterval(() => {
      setToday(formatToday());
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-3 lg:pl-64 lg:pr-6">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">{today}</p>
          <h1 className="text-lg font-semibold">Life Game RPG</h1>
        </div>
        <div className="flex items-center gap-3">
          {session?.user ? (
            <>
              <div className="hidden text-sm text-muted-foreground sm:block">
                {session.user.name ?? session.user.email ?? "ログイン中"}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => signOut({ callbackUrl: ROUTES.LOGIN })}
              >
                ログアウト
              </Button>
            </>
          ) : (
            <Button size="sm" variant="outline" asChild>
              <Link href={ROUTES.LOGIN}>ログイン</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
