import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const defaultUserEmail = process.env.DEFAULT_USER_EMAIL
  if (!defaultUserEmail) {
    throw new Error('DEFAULT_USER_EMAIL is required for migration')
  }

  const user = await prisma.user.upsert({
    where: { email: defaultUserEmail },
    update: {},
    create: {
      email: defaultUserEmail,
      name: 'Default User',
    },
  })

  const userId = user.id

  await prisma.category.updateMany({
    where: { userId: null },
    data: { userId },
  })
  await prisma.action.updateMany({
    where: { userId: null },
    data: { userId },
  })
  await prisma.playLog.updateMany({
    where: { userId: null },
    data: { userId },
  })
  await prisma.dailyResult.updateMany({
    where: { userId: null },
    data: { userId },
  })
  await prisma.dailyCategoryResult.updateMany({
    where: { userId: null },
    data: { userId },
  })
  await prisma.playerCategoryState.updateMany({
    where: { userId: null },
    data: { userId },
  })
  await prisma.skillTree.updateMany({
    where: { userId: null },
    data: { userId },
  })
  await prisma.skillNode.updateMany({
    where: { userId: null },
    data: { userId },
  })
  await prisma.unlockedNode.updateMany({
    where: { userId: null },
    data: { userId },
  })
  await prisma.seasonalTitle.updateMany({
    where: { userId: null },
    data: { userId },
  })
  await prisma.spendLog.updateMany({
    where: { userId: null },
    data: { userId },
  })

  console.log(`✅ Backfilled data with userId=${userId}`)
}

main()
  .catch(async (error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
