export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-4xl font-bold mb-4">Life Game RPG</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          人生を攻略するゲーム体験
        </p>
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 text-left">
          <h2 className="text-2xl font-semibold mb-4">セットアップ完了</h2>
          <p className="mb-4">プロジェクトの初期設定が完了しました。</p>
          <div className="space-y-2">
            <p>✅ Next.js 16 (App Router)</p>
            <p>✅ React 19</p>
            <p>✅ Node.js 24</p>
            <p>✅ TypeScript</p>
            <p>✅ Tailwind CSS</p>
            <p>✅ Prisma + PostgreSQL</p>
          </div>
        </div>
      </div>
    </main>
  );
}
