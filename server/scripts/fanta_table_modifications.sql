-- Fanta Table Modifications
-- This script adds new columns and foreign key constraints to the fanta table

-- 1. Add new columns 7_place_id and 8_place_id
ALTER TABLE fanta 
ADD COLUMN "7_place_id" int8 NOT NULL DEFAULT 0,
ADD COLUMN "8_place_id" int8 NOT NULL DEFAULT 0;

-- 2. Add foreign key constraints for all place positions (1-8) referencing drivers.id
ALTER TABLE fanta 
ADD CONSTRAINT fk_fanta_1_place_id 
FOREIGN KEY ("1_place_id") REFERENCES drivers(id);

ALTER TABLE fanta 
ADD CONSTRAINT fk_fanta_2_place_id 
FOREIGN KEY ("2_place_id") REFERENCES drivers(id);

ALTER TABLE fanta 
ADD CONSTRAINT fk_fanta_3_place_id 
FOREIGN KEY ("3_place_id") REFERENCES drivers(id);

ALTER TABLE fanta 
ADD CONSTRAINT fk_fanta_4_place_id 
FOREIGN KEY ("4_place_id") REFERENCES drivers(id);

ALTER TABLE fanta 
ADD CONSTRAINT fk_fanta_5_place_id 
FOREIGN KEY ("5_place_id") REFERENCES drivers(id);

ALTER TABLE fanta 
ADD CONSTRAINT fk_fanta_6_place_id 
FOREIGN KEY ("6_place_id") REFERENCES drivers(id);

ALTER TABLE fanta 
ADD CONSTRAINT fk_fanta_7_place_id 
FOREIGN KEY ("7_place_id") REFERENCES drivers(id);

ALTER TABLE fanta 
ADD CONSTRAINT fk_fanta_8_place_id 
FOREIGN KEY ("8_place_id") REFERENCES drivers(id);

-- 3. Add foreign key constraint for fast_lap_id referencing drivers.id
ALTER TABLE fanta 
ADD CONSTRAINT fk_fanta_fast_lap_id 
FOREIGN KEY (fast_lap_id) REFERENCES drivers(id);

-- 4. Add foreign key constraint for dnf_id referencing drivers.id
ALTER TABLE fanta 
ADD CONSTRAINT fk_fanta_dnf_id 
FOREIGN KEY (dnf_id) REFERENCES drivers(id);

-- 5. Add foreign key constraint for fanta_player_id referencing users.id
ALTER TABLE fanta 
ADD CONSTRAINT fk_fanta_player_id 
FOREIGN KEY (fanta_player_id) REFERENCES users(id);

-- 6. Add foreign key constraint for season_id referencing seasons.id
ALTER TABLE fanta 
ADD CONSTRAINT fk_fanta_season_id 
FOREIGN KEY (season_id) REFERENCES seasons(id);

-- Optional: Add comments to document the new columns
COMMENT ON COLUMN fanta."7_place_id" IS 'Driver ID for 7th place fantasy team position';
COMMENT ON COLUMN fanta."8_place_id" IS 'Driver ID for 8th place fantasy team position';

-- Optional: Create indexes for better query performance on foreign key columns
CREATE INDEX IF NOT EXISTS idx_fanta_1_place_id ON fanta("1_place_id");
CREATE INDEX IF NOT EXISTS idx_fanta_2_place_id ON fanta("2_place_id");
CREATE INDEX IF NOT EXISTS idx_fanta_3_place_id ON fanta("3_place_id");
CREATE INDEX IF NOT EXISTS idx_fanta_4_place_id ON fanta("4_place_id");
CREATE INDEX IF NOT EXISTS idx_fanta_5_place_id ON fanta("5_place_id");
CREATE INDEX IF NOT EXISTS idx_fanta_6_place_id ON fanta("6_place_id");
CREATE INDEX IF NOT EXISTS idx_fanta_7_place_id ON fanta("7_place_id");
CREATE INDEX IF NOT EXISTS idx_fanta_8_place_id ON fanta("8_place_id");
CREATE INDEX IF NOT EXISTS idx_fanta_fast_lap_id ON fanta(fast_lap_id);
CREATE INDEX IF NOT EXISTS idx_fanta_dnf_id ON fanta(dnf_id);
CREATE INDEX IF NOT EXISTS idx_fanta_player_id ON fanta(fanta_player_id);
CREATE INDEX IF NOT EXISTS idx_fanta_season_id ON fanta(season_id);
CREATE INDEX IF NOT EXISTS idx_fanta_race_id ON fanta(race_id);
