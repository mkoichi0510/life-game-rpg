"use client";

import { signIn } from "next-auth/react";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";

interface LoginButtonsProps {
  callbackUrl?: string;
}

export function LoginButtons({ callbackUrl = ROUTES.HOME }: LoginButtonsProps) {
  return (
    <div className="flex flex-col gap-3">
      <Button
        size="lg"
        variant="default"
        className="w-full"
        onClick={() => signIn("github", { callbackUrl })}
        data-testid="login-github"
      >
        GitHubでログイン
      </Button>
    </div>
  );
}
