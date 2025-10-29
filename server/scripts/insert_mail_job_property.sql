-- Insert property to enable/disable the sendIncomingRaceMail cron job
-- Value: '1' = enabled, '0' = disabled

INSERT INTO property (name, description, value) 
VALUES (
    'send_incoming_race_mail_enabled',
    'Controls whether the automated email notification for upcoming races is sent. Set to 1 to enable, 0 to disable.',
    '1'
)
ON CONFLICT (name) 
DO UPDATE SET 
    description = EXCLUDED.description,
    value = EXCLUDED.value,
    updated_at = NOW();

-- Display the inserted/updated property
SELECT * FROM property WHERE name = 'send_incoming_race_mail_enabled';

UPDATE property SET value = '0' WHERE name = 'send_incoming_race_mail_enabled';