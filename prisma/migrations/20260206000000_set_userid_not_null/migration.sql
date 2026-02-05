-- Set NOT NULL constraints on userId columns
-- Run this AFTER executing attach-default-user.ts

ALTER TABLE "Category" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "Action" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "PlayLog" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "DailyCategoryResult" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "PlayerCategoryState" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "SkillTree" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "SkillNode" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "UnlockedNode" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "SeasonalTitle" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "SpendLog" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "DailyResult" ALTER COLUMN "userId" SET NOT NULL;
