-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "rankWindowDays" INTEGER NOT NULL DEFAULT 7,
    "xpPerPlay" INTEGER NOT NULL DEFAULT 10,
    "xpPerSp" INTEGER NOT NULL DEFAULT 20,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Action" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Action_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayLog" (
    "id" TEXT NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dayKey" TEXT NOT NULL,
    "actionId" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyResult" (
    "dayKey" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "confirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyResult_pkey" PRIMARY KEY ("dayKey")
);

-- CreateTable
CREATE TABLE "DailyCategoryResult" (
    "id" TEXT NOT NULL,
    "dayKey" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "playCount" INTEGER NOT NULL DEFAULT 0,
    "xpEarned" INTEGER NOT NULL DEFAULT 0,
    "spEarned" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyCategoryResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerCategoryState" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "xpTotal" INTEGER NOT NULL DEFAULT 0,
    "spUnspent" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerCategoryState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillTree" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SkillTree_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillNode" (
    "id" TEXT NOT NULL,
    "treeId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "costSp" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SkillNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnlockedNode" (
    "id" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UnlockedNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeasonalTitle" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "minSpEarned" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeasonalTitle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpendLog" (
    "id" TEXT NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "categoryId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "costSp" INTEGER NOT NULL,
    "refId" TEXT NOT NULL,
    "dayKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpendLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DailyCategoryResultToPlayLog" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DailyCategoryResultToPlayLog_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "Category_visible_order_idx" ON "Category"("visible", "order");

-- CreateIndex
CREATE INDEX "Action_categoryId_visible_order_idx" ON "Action"("categoryId", "visible", "order");

-- CreateIndex
CREATE INDEX "PlayLog_dayKey_idx" ON "PlayLog"("dayKey");

-- CreateIndex
CREATE INDEX "PlayLog_actionId_idx" ON "PlayLog"("actionId");

-- CreateIndex
CREATE INDEX "DailyCategoryResult_categoryId_idx" ON "DailyCategoryResult"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyCategoryResult_dayKey_categoryId_key" ON "DailyCategoryResult"("dayKey", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerCategoryState_categoryId_key" ON "PlayerCategoryState"("categoryId");

-- CreateIndex
CREATE INDEX "SkillTree_categoryId_visible_order_idx" ON "SkillTree"("categoryId", "visible", "order");

-- CreateIndex
CREATE INDEX "SkillNode_treeId_order_idx" ON "SkillNode"("treeId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "SkillNode_treeId_order_key" ON "SkillNode"("treeId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "UnlockedNode_nodeId_key" ON "UnlockedNode"("nodeId");

-- CreateIndex
CREATE INDEX "SeasonalTitle_categoryId_order_idx" ON "SeasonalTitle"("categoryId", "order");

-- CreateIndex
CREATE INDEX "SpendLog_categoryId_at_idx" ON "SpendLog"("categoryId", "at");

-- CreateIndex
CREATE INDEX "_DailyCategoryResultToPlayLog_B_index" ON "_DailyCategoryResultToPlayLog"("B");

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayLog" ADD CONSTRAINT "PlayLog_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "Action"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyCategoryResult" ADD CONSTRAINT "DailyCategoryResult_dayKey_fkey" FOREIGN KEY ("dayKey") REFERENCES "DailyResult"("dayKey") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyCategoryResult" ADD CONSTRAINT "DailyCategoryResult_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerCategoryState" ADD CONSTRAINT "PlayerCategoryState_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillTree" ADD CONSTRAINT "SkillTree_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillNode" ADD CONSTRAINT "SkillNode_treeId_fkey" FOREIGN KEY ("treeId") REFERENCES "SkillTree"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnlockedNode" ADD CONSTRAINT "UnlockedNode_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "SkillNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeasonalTitle" ADD CONSTRAINT "SeasonalTitle_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpendLog" ADD CONSTRAINT "SpendLog_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DailyCategoryResultToPlayLog" ADD CONSTRAINT "_DailyCategoryResultToPlayLog_A_fkey" FOREIGN KEY ("A") REFERENCES "DailyCategoryResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DailyCategoryResultToPlayLog" ADD CONSTRAINT "_DailyCategoryResultToPlayLog_B_fkey" FOREIGN KEY ("B") REFERENCES "PlayLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
