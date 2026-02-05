"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function LoginButtons() {
  return (
    <div className="flex flex-col gap-3">
      <Button
        size="lg"
        className="w-full bg-slate-900 text-white hover:bg-slate-800"
        onClick={() => signIn("github", { callbackUrl: "/" })}
        data-testid="login-github"
      >
        GitHubでログイン
      </Button>
    </div>
  );
}
