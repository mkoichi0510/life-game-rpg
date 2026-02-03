import Link from "next/link";
import { ArrowRight, FolderPlus, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 pb-12">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">管理機能</p>
        <h1 className="text-2xl font-bold tracking-tight">設定</h1>
      </div>

      <section className="grid gap-4">
        <Card id="categories">
          <CardHeader className="space-y-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <FolderPlus className="h-4 w-4 text-emerald-500" />
              カテゴリ管理
            </CardTitle>
            <CardDescription>
              カテゴリの追加・編集・表示切り替えを行います。
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              追加UIは準備中です。まずは導線のみ用意しています。
            </p>
            <Button asChild variant="outline">
              <Link href="#categories" aria-label="カテゴリ管理セクションへ">
                カテゴリ管理へ
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card id="actions">
          <CardHeader className="space-y-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <ListChecks className="h-4 w-4 text-blue-500" />
              アクション管理
            </CardTitle>
            <CardDescription>
              カテゴリごとのアクションを追加・編集します。
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              追加UIは準備中です。まずは導線のみ用意しています。
            </p>
            <Button asChild variant="outline">
              <Link href="#actions" aria-label="アクション管理セクションへ">
                アクション管理へ
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
