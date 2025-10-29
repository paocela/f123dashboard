-- Create property table for storing application configuration
-- This table allows dynamic configuration of application features
-- without requiring code changes or redeployment

CREATE TABLE IF NOT EXISTS property (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    value VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Add index on name for faster lookups
CREATE INDEX IF NOT EXISTS idx_property_name ON property(name);

-- Add comment to table
COMMENT ON TABLE property IS 'Stores application configuration properties and feature flags';
COMMENT ON COLUMN property.id IS 'Primary key';
COMMENT ON COLUMN property.name IS 'Unique property name identifier';
COMMENT ON COLUMN property.description IS 'Human-readable description of the property';
COMMENT ON COLUMN property.value IS 'Property value stored as string (can be parsed as needed)';
COMMENT ON COLUMN property.created_at IS 'Timestamp when property was created';
COMMENT ON COLUMN property.updated_at IS 'Timestamp when property was last updated';
