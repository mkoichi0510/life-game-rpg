export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 text-center">
      <div>
        <h2 className="text-3xl font-semibold">Life Game RPG</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          人生を攻略するゲーム体験
        </p>
      </div>
      <div className="rounded-lg border bg-card p-6 text-left shadow-sm">
        <h3 className="text-lg font-semibold">セットアップ完了</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          プロジェクトの初期設定が完了しました。
        </p>
        <div className="mt-4 space-y-2 text-sm">
          <p>✅ Next.js 16 (App Router)</p>
          <p>✅ React 19</p>
          <p>✅ Node.js 24</p>
          <p>✅ TypeScript</p>
          <p>✅ Tailwind CSS</p>
          <p>✅ Prisma + PostgreSQL</p>
        </div>
      </div>
    </div>
  );
}
