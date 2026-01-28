"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto w-full max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">読み込みに失敗しました</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            一時的にデータ取得ができませんでした。再読み込みしてください。
          </p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={reset}>再読み込み</Button>
            <Button asChild variant="outline">
              <Link href="/">ホームへ戻る</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
