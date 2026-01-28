import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">ページが見つかりません</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            URLが正しいか確認してください。
          </p>
          <Button asChild>
            <Link href="/">ホームへ戻る</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
