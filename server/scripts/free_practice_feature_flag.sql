-- Free practice is enabled by default when this property is absent.
-- Replace 2 with the season ID to disable free practice for that season.
INSERT INTO property (name, description, value)
VALUES (
  'free_practice_enabled_season_2',
  'Enables free practice results and points for a season',
  '0'
)
ON CONFLICT (name) DO UPDATE
SET value = EXCLUDED.value, updated_at = NOW();

-- Set value to '1' to enable free practice again.