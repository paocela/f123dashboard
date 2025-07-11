
CREATE TABLE race_result_entries (
    race_results_id INTEGER NOT NULL REFERENCES race_results(id) ON DELETE CASCADE,
    pilot_id INTEGER NOT NULL REFERENCES pilots(id) ON DELETE CASCADE,
    season_id INTEGER NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,               -- 1 for winner, 2 for second, ..., 0 for DNF
    fast_lap BOOLEAN DEFAULT FALSE,          -- Fastest lap
    PRIMARY KEY (race_results_id, pilot_id, season_id)
);


INSERT INTO race_result_entries (race_results_id, pilot_id, season_id, position, fast_lap)
SELECT id, "1_place_id", 1, 1, ("fast_lap_id" = "1_place_id") FROM race_results WHERE "1_place_id" IS NOT NULL AND "1_place_id" > 0
UNION ALL
SELECT id, "2_place_id", 1, 2, ("fast_lap_id" = "2_place_id") FROM race_results WHERE "2_place_id" IS NOT NULL AND "2_place_id" > 0
UNION ALL
SELECT id, "3_place_id", 1, 3, ("fast_lap_id" = "3_place_id") FROM race_results WHERE "3_place_id" IS NOT NULL AND "3_place_id" > 0
UNION ALL
SELECT id, "4_place_id", 1, 4, ("fast_lap_id" = "4_place_id") FROM race_results WHERE "4_place_id" IS NOT NULL AND "4_place_id" > 0
UNION ALL
SELECT id, "5_place_id", 1, 5, ("fast_lap_id" = "5_place_id") FROM race_results WHERE "5_place_id" IS NOT NULL AND "5_place_id" > 0
UNION ALL
SELECT id, "6_place_id", 1, 6, ("fast_lap_id" = "6_place_id") FROM race_results WHERE "6_place_id" IS NOT NULL AND "6_place_id" > 0;


CREATE TABLE sprint_result_entries (
    sprint_results_id INTEGER NOT NULL REFERENCES sprint_results(id) ON DELETE CASCADE,
    pilot_id INTEGER NOT NULL REFERENCES pilots(id) ON DELETE CASCADE,
    season_id INTEGER NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    fast_lap BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (sprint_results_id, pilot_id, season_id)
);

-- 3. Migrate sprint_results data
INSERT INTO sprint_result_entries (sprint_results_id, pilot_id, season_id, position, fast_lap)
SELECT id, "1_place_id", 1, 1, ("fast_lap_id" = "1_place_id") FROM sprint_results WHERE "1_place_id" IS NOT NULL AND "1_place_id" > 0
UNION ALL
SELECT id, "2_place_id", 1, 2, ("fast_lap_id" = "2_place_id") FROM sprint_results WHERE "2_place_id" IS NOT NULL AND "2_place_id" > 0
UNION ALL
SELECT id, "3_place_id", 1, 3, ("fast_lap_id" = "3_place_id") FROM sprint_results WHERE "3_place_id" IS NOT NULL AND "3_place_id" > 0
UNION ALL
SELECT id, "4_place_id", 1, 4, ("fast_lap_id" = "4_place_id") FROM sprint_results WHERE "4_place_id" IS NOT NULL AND "4_place_id" > 0
UNION ALL
SELECT id, "5_place_id", 1, 5, ("fast_lap_id" = "5_place_id") FROM sprint_results WHERE "5_place_id" IS NOT NULL AND "5_place_id" > 0
UNION ALL
SELECT id, "6_place_id", 1, 6, ("fast_lap_id" = "6_place_id") FROM sprint_results WHERE "6_place_id" IS NOT NULL AND "6_place_id" > 0;

CREATE TABLE qualifying_result_entries (
    qualifying_results_id INTEGER NOT NULL REFERENCES qualifying_results(id) ON DELETE CASCADE,
    pilot_id INTEGER NOT NULL REFERENCES pilots(id) ON DELETE CASCADE,
    season_id INTEGER NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    PRIMARY KEY (qualifying_results_id, pilot_id, season_id)
);

-- 4. Migrate qualifying_results data
INSERT INTO qualifying_result_entries (qualifying_results_id, pilot_id, season_id, position)
SELECT id, "1_place_id", 1, 1 FROM qualifying_results WHERE "1_place_id" IS NOT NULL AND "1_place_id" > 0
UNION ALL
SELECT id, "2_place_id", 1, 2 FROM qualifying_results WHERE "2_place_id" IS NOT NULL AND "2_place_id" > 0
UNION ALL
SELECT id, "3_place_id", 1, 3 FROM qualifying_results WHERE "3_place_id" IS NOT NULL AND "3_place_id" > 0
UNION ALL
SELECT id, "4_place_id", 1, 4 FROM qualifying_results WHERE "4_place_id" IS NOT NULL AND "4_place_id" > 0
UNION ALL
SELECT id, "5_place_id", 1, 5 FROM qualifying_results WHERE "5_place_id" IS NOT NULL AND "5_place_id" > 0
UNION ALL
SELECT id, "6_place_id", 1, 6 FROM qualifying_results WHERE "6_place_id" IS NOT NULL AND "6_place_id" > 0;

-- 1. Create free_practice_result_entries (senza fast_lap)
CREATE TABLE free_practice_result_entries (
    free_practice_results_id INTEGER NOT NULL REFERENCES free_practice_results(id) ON DELETE CASCADE,
    pilot_id INTEGER NOT NULL REFERENCES pilots(id) ON DELETE CASCADE,
    season_id INTEGER NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,            -- 1 per il migliore, ..., 0 per DNF
    PRIMARY KEY (free_practice_results_id, pilot_id, season_id)
);

-- 2. Migrate free_practice_results data
INSERT INTO free_practice_result_entries (free_practice_results_id, pilot_id, season_id, position)
SELECT id, "1_place_id", 1, 1 FROM free_practice_results WHERE "1_place_id" IS NOT NULL AND "1_place_id" > 0
UNION ALL
SELECT id, "2_place_id", 1, 2 FROM free_practice_results WHERE "2_place_id" IS NOT NULL AND "2_place_id" > 0
UNION ALL
SELECT id, "3_place_id", 1, 3 FROM free_practice_results WHERE "3_place_id" IS NOT NULL AND "3_place_id" > 0
UNION ALL
SELECT id, "4_place_id", 1, 4 FROM free_practice_results WHERE "4_place_id" IS NOT NULL AND "4_place_id" > 0
UNION ALL
SELECT id, "5_place_id", 1, 5 FROM free_practice_results WHERE "5_place_id" IS NOT NULL AND "5_place_id" > 0
UNION ALL
SELECT id, "6_place_id", 1, 6 FROM free_practice_results WHERE "6_place_id" IS NOT NULL AND "6_place_id" > 0;


-- 1. Free practice result entries
ALTER TABLE free_practice_result_entries
DROP CONSTRAINT IF EXISTS free_practice_result_entries_free_practice_results_id_fkey;
ALTER TABLE free_practice_result_entries
ADD CONSTRAINT free_practice_result_entries_free_practice_results_id_fkey
FOREIGN KEY (free_practice_results_id)
REFERENCES gran_prix(id)
ON UPDATE CASCADE
ON DELETE CASCADE;

-- 2. Qualifying result entries
ALTER TABLE qualifying_result_entries
DROP CONSTRAINT IF EXISTS qualifying_result_entries_qualifying_results_id_fkey;
ALTER TABLE qualifying_result_entries
ADD CONSTRAINT qualifying_result_entries_qualifying_results_id_fkey
FOREIGN KEY (qualifying_results_id)
REFERENCES gran_prix(id)
ON UPDATE CASCADE
ON DELETE CASCADE;

-- 3. Race result entries
ALTER TABLE race_result_entries
DROP CONSTRAINT IF EXISTS race_result_entries_race_results_id_fkey;
ALTER TABLE race_result_entries
ADD CONSTRAINT race_result_entries_race_results_id_fkey
FOREIGN KEY (race_results_id)
REFERENCES gran_prix(id)
ON UPDATE CASCADE
ON DELETE CASCADE;

-- 4. Sprint result entries
ALTER TABLE sprint_result_entries
DROP CONSTRAINT IF EXISTS sprint_result_entries_sprint_results_id_fkey;
ALTER TABLE sprint_result_entries
ADD CONSTRAINT sprint_result_entries_sprint_results_id_fkey
FOREIGN KEY (sprint_results_id)
REFERENCES gran_prix(id)
ON UPDATE CASCADE
ON DELETE CASCADE;