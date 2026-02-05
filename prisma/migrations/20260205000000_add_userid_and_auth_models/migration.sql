-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================
-- Add userId column to all game models
-- Step 1: Add as nullable
-- Step 2: (Run attach-default-user.ts script to backfill)
-- Step 3: Set NOT NULL constraint
-- ============================================================

-- AlterTable: Category
ALTER TABLE "Category" ADD COLUMN "userId" TEXT;

-- AlterTable: Action
ALTER TABLE "Action" ADD COLUMN "userId" TEXT;

-- AlterTable: PlayLog
ALTER TABLE "PlayLog" ADD COLUMN "userId" TEXT;

-- AlterTable: DailyCategoryResult
ALTER TABLE "DailyCategoryResult" ADD COLUMN "userId" TEXT;

-- AlterTable: PlayerCategoryState
ALTER TABLE "PlayerCategoryState" ADD COLUMN "userId" TEXT;

-- AlterTable: SkillTree
ALTER TABLE "SkillTree" ADD COLUMN "userId" TEXT;

-- AlterTable: SkillNode
ALTER TABLE "SkillNode" ADD COLUMN "userId" TEXT;

-- AlterTable: UnlockedNode
ALTER TABLE "UnlockedNode" ADD COLUMN "userId" TEXT;

-- AlterTable: SeasonalTitle
ALTER TABLE "SeasonalTitle" ADD COLUMN "userId" TEXT;

-- AlterTable: SpendLog
ALTER TABLE "SpendLog" ADD COLUMN "userId" TEXT;

-- AlterTable: DailyResult - change PK from dayKey to [userId, dayKey]
ALTER TABLE "DailyResult" ADD COLUMN "userId" TEXT;

-- ============================================================
-- After running attach-default-user.ts, apply NOT NULL constraints:
--
--   ALTER TABLE "Category" ALTER COLUMN "userId" SET NOT NULL;
--   ALTER TABLE "Action" ALTER COLUMN "userId" SET NOT NULL;
--   ALTER TABLE "PlayLog" ALTER COLUMN "userId" SET NOT NULL;
--   ALTER TABLE "DailyCategoryResult" ALTER COLUMN "userId" SET NOT NULL;
--   ALTER TABLE "PlayerCategoryState" ALTER COLUMN "userId" SET NOT NULL;
--   ALTER TABLE "SkillTree" ALTER COLUMN "userId" SET NOT NULL;
--   ALTER TABLE "SkillNode" ALTER COLUMN "userId" SET NOT NULL;
--   ALTER TABLE "UnlockedNode" ALTER COLUMN "userId" SET NOT NULL;
--   ALTER TABLE "SeasonalTitle" ALTER COLUMN "userId" SET NOT NULL;
--   ALTER TABLE "SpendLog" ALTER COLUMN "userId" SET NOT NULL;
--   ALTER TABLE "DailyResult" ALTER COLUMN "userId" SET NOT NULL;
-- ============================================================

-- Drop old PK and indexes that need to change
DROP INDEX "Category_visible_order_idx";
DROP INDEX "Action_categoryId_visible_order_idx";
DROP INDEX "PlayLog_dayKey_idx";
DROP INDEX "PlayLog_actionId_idx";
DROP INDEX "DailyCategoryResult_dayKey_categoryId_key";
DROP INDEX "DailyCategoryResult_categoryId_idx";
DROP INDEX "SkillTree_categoryId_visible_order_idx";
DROP INDEX "SkillNode_treeId_order_idx";
DROP INDEX "SkillNode_treeId_order_key";
DROP INDEX "UnlockedNode_nodeId_key";
DROP INDEX "SeasonalTitle_categoryId_order_idx";
DROP INDEX "SpendLog_categoryId_at_idx";

-- DailyResult: change PK from (dayKey) to (userId, dayKey)
ALTER TABLE "DailyCategoryResult" DROP CONSTRAINT "DailyCategoryResult_dayKey_fkey";
ALTER TABLE "DailyResult" DROP CONSTRAINT "DailyResult_pkey";
ALTER TABLE "DailyResult" ADD CONSTRAINT "DailyResult_pkey" PRIMARY KEY ("userId", "dayKey");

-- CreateIndex (new indexes with userId)
CREATE INDEX "Category_userId_visible_order_idx" ON "Category"("userId", "visible", "order");
CREATE INDEX "Action_userId_categoryId_visible_order_idx" ON "Action"("userId", "categoryId", "visible", "order");
CREATE INDEX "PlayLog_userId_dayKey_idx" ON "PlayLog"("userId", "dayKey");
CREATE INDEX "PlayLog_userId_actionId_idx" ON "PlayLog"("userId", "actionId");
CREATE UNIQUE INDEX "DailyCategoryResult_userId_dayKey_categoryId_key" ON "DailyCategoryResult"("userId", "dayKey", "categoryId");
CREATE INDEX "DailyCategoryResult_userId_categoryId_idx" ON "DailyCategoryResult"("userId", "categoryId");
CREATE INDEX "PlayerCategoryState_userId_idx" ON "PlayerCategoryState"("userId");
CREATE INDEX "SkillTree_userId_categoryId_visible_order_idx" ON "SkillTree"("userId", "categoryId", "visible", "order");
CREATE INDEX "SkillNode_userId_treeId_order_idx" ON "SkillNode"("userId", "treeId", "order");
CREATE UNIQUE INDEX "SkillNode_userId_treeId_order_key" ON "SkillNode"("userId", "treeId", "order");
CREATE UNIQUE INDEX "UnlockedNode_userId_nodeId_key" ON "UnlockedNode"("userId", "nodeId");
CREATE INDEX "UnlockedNode_userId_unlockedAt_idx" ON "UnlockedNode"("userId", "unlockedAt");
CREATE INDEX "SeasonalTitle_userId_categoryId_order_idx" ON "SeasonalTitle"("userId", "categoryId", "order");
CREATE INDEX "SpendLog_userId_categoryId_at_idx" ON "SpendLog"("userId", "categoryId", "at");

-- AddForeignKey (userId references)
ALTER TABLE "Category" ADD CONSTRAINT "Category_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Action" ADD CONSTRAINT "Action_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlayLog" ADD CONSTRAINT "PlayLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DailyResult" ADD CONSTRAINT "DailyResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DailyCategoryResult" ADD CONSTRAINT "DailyCategoryResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DailyCategoryResult" ADD CONSTRAINT "DailyCategoryResult_userId_dayKey_fkey" FOREIGN KEY ("userId", "dayKey") REFERENCES "DailyResult"("userId", "dayKey") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlayerCategoryState" ADD CONSTRAINT "PlayerCategoryState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SkillTree" ADD CONSTRAINT "SkillTree_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SkillNode" ADD CONSTRAINT "SkillNode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UnlockedNode" ADD CONSTRAINT "UnlockedNode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SeasonalTitle" ADD CONSTRAINT "SeasonalTitle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SpendLog" ADD CONSTRAINT "SpendLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
