INSERT INTO property (name, description, value)
VALUES ('fanta_enabled', 'Controls Fanta visibility and voting (1=enabled, 0=disabled)', '0')
ON CONFLICT (name) DO UPDATE
SET description = EXCLUDED.description,
    value = EXCLUDED.value,
    updated_at = NOW();

-- Re-enable Fanta when needed:
-- UPDATE property SET value = '1', updated_at = NOW() WHERE name = 'fanta_enabled';