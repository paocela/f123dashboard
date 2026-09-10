-- Phase 3A: Migrate fanta votes to entry-based fanta_entries table
-- Run this script ONCE against the database before deploying the new backend code.
--
-- Steps performed:
--   1. Create fanta_entries table
--   2. Migrate existing position data from the 8 fixed columns
--   3. Make the old position columns nullable (so new code can omit them)
--   4. DROP commands are commented; run them only after the new code is live & verified

-- ============================================================
-- Step 1: Create fanta_entries table
-- ============================================================
CREATE TABLE IF NOT EXISTS fanta_entries (
  fanta_id  INT NOT NULL REFERENCES fanta(id) ON DELETE CASCADE,
  pilot_id  INT NOT NULL REFERENCES drivers(id),
  position  INT NOT NULL,
  PRIMARY KEY (fanta_id, position)
);

-- ============================================================
-- Step 2: Migrate existing voted positions into fanta_entries
-- ============================================================
INSERT INTO fanta_entries (fanta_id, pilot_id, position)
  SELECT id, "1_place_id", 1 FROM fanta WHERE "1_place_id" IS NOT NULL AND "1_place_id" <> 0
  UNION ALL
  SELECT id, "2_place_id", 2 FROM fanta WHERE "2_place_id" IS NOT NULL AND "2_place_id" <> 0
  UNION ALL
  SELECT id, "3_place_id", 3 FROM fanta WHERE "3_place_id" IS NOT NULL AND "3_place_id" <> 0
  UNION ALL
  SELECT id, "4_place_id", 4 FROM fanta WHERE "4_place_id" IS NOT NULL AND "4_place_id" <> 0
  UNION ALL
  SELECT id, "5_place_id", 5 FROM fanta WHERE "5_place_id" IS NOT NULL AND "5_place_id" <> 0
  UNION ALL
  SELECT id, "6_place_id", 6 FROM fanta WHERE "6_place_id" IS NOT NULL AND "6_place_id" <> 0
  UNION ALL
  SELECT id, "7_place_id", 7 FROM fanta WHERE "7_place_id" IS NOT NULL AND "7_place_id" <> 0
  UNION ALL
  SELECT id, "8_place_id", 8 FROM fanta WHERE "8_place_id" IS NOT NULL AND "8_place_id" <> 0
ON CONFLICT (fanta_id, position) DO NOTHING;

-- Sanity check: count should match the sum of non-null place columns
-- SELECT COUNT(*) FROM fanta_entries;

-- ============================================================
-- Step 3: Make old position columns nullable
--         This allows new INSERT statements to omit them.
-- ============================================================
ALTER TABLE fanta ALTER COLUMN "1_place_id" DROP NOT NULL;
ALTER TABLE fanta ALTER COLUMN "2_place_id" DROP NOT NULL;
ALTER TABLE fanta ALTER COLUMN "3_place_id" DROP NOT NULL;
ALTER TABLE fanta ALTER COLUMN "4_place_id" DROP NOT NULL;
ALTER TABLE fanta ALTER COLUMN "5_place_id" DROP NOT NULL;
ALTER TABLE fanta ALTER COLUMN "6_place_id" DROP NOT NULL;
ALTER TABLE fanta ALTER COLUMN "7_place_id" DROP NOT NULL;
ALTER TABLE fanta ALTER COLUMN "8_place_id" DROP NOT NULL;

-- ============================================================
-- Step 4 (deferred): Drop old columns after new code is verified
-- ============================================================
-- ALTER TABLE fanta
--   DROP COLUMN "1_place_id",
--   DROP COLUMN "2_place_id",
--   DROP COLUMN "3_place_id",
--   DROP COLUMN "4_place_id",
--   DROP COLUMN "5_place_id",
--   DROP COLUMN "6_place_id",
--   DROP COLUMN "7_place_id",
--   DROP COLUMN "8_place_id";
