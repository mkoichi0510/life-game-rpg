import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const TABLES = [
  'Category',
  'Action',
  'PlayLog',
  'DailyResult',
  'DailyCategoryResult',
  'PlayerCategoryState',
  'SkillTree',
  'SkillNode',
  'UnlockedNode',
  'SeasonalTitle',
  'SpendLog',
]

async function main() {
  const defaultUserEmail = process.env.DEFAULT_USER_EMAIL
  if (!defaultUserEmail) {
    throw new Error('DEFAULT_USER_EMAIL is required for migration')
  }

  const user = await prisma.user.upsert({
    where: { email: defaultUserEmail },
    update: {},
    create: { email: defaultUserEmail, name: 'Default User' },
  })

  const userId = user.id

  for (const table of TABLES) {
    const count = await prisma.$executeRawUnsafe(
      `UPDATE "${table}" SET "userId" = $1 WHERE "userId" IS NULL`,
      userId
    )
    console.log(`  ${table}: ${count} rows updated`)
  }

  console.log(`\n✅ Backfilled data with userId=${userId}`)
}

main()
  .catch(async (error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
