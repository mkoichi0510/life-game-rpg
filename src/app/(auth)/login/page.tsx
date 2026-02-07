import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginButtons } from "./login-buttons";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  if (session?.user) {
    redirect(ROUTES.HOME);
  }

  const { callbackUrl } = await searchParams;
  const resolvedCallbackUrl =
    typeof callbackUrl === "string" ? callbackUrl : ROUTES.HOME;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background px-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-bold">ログインしてはじめる</CardTitle>
          <p className="text-sm text-muted-foreground">
            Life Game RPG をもっと楽しむためにログインしましょう。
          </p>
        </CardHeader>
        <CardContent>
          <LoginButtons callbackUrl={resolvedCallbackUrl} />
        </CardContent>
      </Card>
    </div>
  );
}
