import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // カテゴリの作成
  const healthCategory = await prisma.category.upsert({
    where: { id: 'health-category' },
    update: {},
    create: {
      id: 'health-category',
      name: '健康',
      visible: true,
      order: 1,
      rankWindowDays: 7,
      xpPerPlay: 10,
      xpPerSp: 20,
    },
  })

  const certificationCategory = await prisma.category.upsert({
    where: { id: 'certification-category' },
    update: {},
    create: {
      id: 'certification-category',
      name: '資格・学習',
      visible: true,
      order: 2,
      rankWindowDays: 7,
      xpPerPlay: 10,
      xpPerSp: 20,
    },
  })

  // 健康カテゴリのアクション
  const healthActions = [
    { label: '筋トレ（上半身）', order: 1, unit: '回' },
    { label: '筋トレ（下半身）', order: 2, unit: '回' },
    { label: '有酸素運動（30分以上）', order: 3, unit: '分' },
    { label: 'ストレッチ', order: 4, unit: '分' },
    { label: '早寝早起き', order: 5, unit: null },
  ]

  for (const action of healthActions) {
    await prisma.action.upsert({
      where: { id: `health-${action.order}` },
      update: {},
      create: {
        id: `health-${action.order}`,
        categoryId: healthCategory.id,
        label: action.label,
        unit: action.unit,
        visible: true,
        order: action.order,
      },
    })
  }

  // 資格・学習カテゴリのアクション
  const certActions = [
    { label: '教材・参考書学習', order: 1, unit: '分' },
    { label: 'オンライン講座視聴', order: 2, unit: '分' },
    { label: '問題演習', order: 3, unit: '問' },
    { label: '模擬試験', order: 4, unit: null },
    { label: '復習・まとめ作成', order: 5, unit: '分' },
  ]

  for (const action of certActions) {
    await prisma.action.upsert({
      where: { id: `cert-${action.order}` },
      update: {},
      create: {
        id: `cert-${action.order}`,
        categoryId: certificationCategory.id,
        label: action.label,
        unit: action.unit,
        visible: true,
        order: action.order,
      },
    })
  }

  // 健康カテゴリのスキルツリー
  const healthSkillTree = await prisma.skillTree.upsert({
    where: { id: 'health-skill-tree' },
    update: {},
    create: {
      id: 'health-skill-tree',
      categoryId: healthCategory.id,
      name: '健康マスター',
      visible: true,
      order: 1,
    },
  })

  // 健康スキルツリーのノード
  const healthNodes = [
    { title: '健康への目覚め', costSp: 1, order: 1 },
    { title: '習慣化の兆し', costSp: 3, order: 2 },
    { title: '継続する者', costSp: 5, order: 3 },
    { title: '健康の番人', costSp: 10, order: 4 },
    { title: '健康マスター', costSp: 20, order: 5 },
  ]

  for (const node of healthNodes) {
    await prisma.skillNode.upsert({
      where: { id: `health-node-${node.order}` },
      update: {},
      create: {
        id: `health-node-${node.order}`,
        treeId: healthSkillTree.id,
        title: node.title,
        costSp: node.costSp,
        order: node.order,
      },
    })
  }

  // 資格・学習カテゴリのスキルツリー
  const certSkillTree = await prisma.skillTree.upsert({
    where: { id: 'cert-skill-tree' },
    update: {},
    create: {
      id: 'cert-skill-tree',
      categoryId: certificationCategory.id,
      name: '知識の探求者',
      visible: true,
      order: 1,
    },
  })

  // 資格・学習スキルツリーのノード
  const certNodes = [
    { title: '学びの第一歩', costSp: 1, order: 1 },
    { title: '知識の蓄積', costSp: 3, order: 2 },
    { title: '理解の深化', costSp: 5, order: 3 },
    { title: '実践者', costSp: 10, order: 4 },
    { title: '知識の探求者', costSp: 20, order: 5 },
  ]

  for (const node of certNodes) {
    await prisma.skillNode.upsert({
      where: { id: `cert-node-${node.order}` },
      update: {},
      create: {
        id: `cert-node-${node.order}`,
        treeId: certSkillTree.id,
        title: node.title,
        costSp: node.costSp,
        order: node.order,
      },
    })
  }

  // 健康カテゴリの週ランク称号
  const healthSeasonalTitles = [
    { label: 'ビギナー', minSpEarned: 0, order: 1 },
    { label: 'アクティブ', minSpEarned: 3, order: 2 },
    { label: 'ストイック', minSpEarned: 7, order: 3 },
    { label: 'アスリート', minSpEarned: 14, order: 4 },
    { label: 'レジェンド', minSpEarned: 21, order: 5 },
  ]

  for (const title of healthSeasonalTitles) {
    await prisma.seasonalTitle.upsert({
      where: { id: `health-seasonal-${title.order}` },
      update: {},
      create: {
        id: `health-seasonal-${title.order}`,
        categoryId: healthCategory.id,
        label: title.label,
        minSpEarned: title.minSpEarned,
        order: title.order,
      },
    })
  }

  // プレイヤーステータスの初期化
  await prisma.playerCategoryState.upsert({
    where: { categoryId: healthCategory.id },
    update: {},
    create: {
      categoryId: healthCategory.id,
      xpTotal: 0,
      spUnspent: 0,
    },
  })

  await prisma.playerCategoryState.upsert({
    where: { categoryId: certificationCategory.id },
    update: {},
    create: {
      categoryId: certificationCategory.id,
      xpTotal: 0,
      spUnspent: 0,
    },
  })

  console.log('✅ Seed completed!')
  console.log('Created categories:', { healthCategory, certificationCategory })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
