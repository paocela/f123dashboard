BEGIN;

LOCK TABLE constructors IN EXCLUSIVE MODE;

ALTER TABLE constructors
    ADD COLUMN IF NOT EXISTS season INTEGER;

UPDATE constructors
SET season = 2
WHERE season IS NULL;


INSERT INTO public.constructors
(id, "name", driver_id_1, driver_id_2, color, season)
VALUES(5, 'TURKX Racing Team', 18, 19, '#8A0508', 3);
INSERT INTO public.constructors
(id, "name", driver_id_1, driver_id_2, color, season)
VALUES(6, 'ParkSide Racing Team', 23, 21, '#016534', 3);
INSERT INTO public.constructors
(id, "name", driver_id_1, driver_id_2, color, season)
VALUES(7, 'Panda Racing Team', 22, 24, '#7BAFBA', 3);

CREATE OR REPLACE VIEW public.constructor_grand_prix_points
AS SELECT c.id AS constructor_id,
        c.name AS constructor_name,
        dgp.grand_prix_id,
        dgp.track_id,
        dgp.grand_prix_date,
        dgp.track_name,
        dgp.season_id,
        dgp.season_description,
        c.driver_id_1,
        c.driver_id_2,
        COALESCE(d1_points.total_points, 0::bigint) AS driver_1_points,
        COALESCE(d2_points.total_points, 0::bigint) AS driver_2_points,
        COALESCE(d1_points.total_points, 0::bigint) + COALESCE(d2_points.total_points, 0::bigint) AS constructor_points
     FROM constructors c
         CROSS JOIN ( SELECT DISTINCT driver_grand_prix_points.grand_prix_id,
                        driver_grand_prix_points.grand_prix_date,
                        driver_grand_prix_points.track_name,
                        driver_grand_prix_points.track_id,
                        driver_grand_prix_points.season_id,
                        driver_grand_prix_points.season_description
                     FROM driver_grand_prix_points) dgp
         LEFT JOIN driver_grand_prix_points d1_points ON c.driver_id_1 = d1_points.pilot_id AND dgp.grand_prix_id = d1_points.grand_prix_id
         LEFT JOIN driver_grand_prix_points d2_points ON c.driver_id_2 = d2_points.pilot_id AND dgp.grand_prix_id = d2_points.grand_prix_id
    WHERE c.season = dgp.season_id
        AND c.driver_id_1 IS NOT NULL
        AND c.driver_id_2 IS NOT NULL
    ORDER BY dgp.grand_prix_date DESC, (COALESCE(d1_points.total_points, 0::bigint) + COALESCE(d2_points.total_points, 0::bigint)) DESC;

CREATE OR REPLACE VIEW public.season_constructor_leaderboard
AS SELECT c.id AS constructor_id,
        c.name AS constructor_name,
        c.color AS constructor_color,
        driver_1.id AS driver_1_id,
        driver_1.username AS driver_1_username,
        COALESCE(d1_points.total_points, 0::bigint) AS driver_1_tot_points,
        driver_2.id AS driver_2_id,
        driver_2.username AS driver_2_username,
        COALESCE(d2_points.total_points, 0::bigint) AS driver_2_tot_points,
        COALESCE(d1_points.total_points, 0::bigint) + COALESCE(d2_points.total_points, 0::bigint) AS constructor_tot_points,
        c.season AS season_id
     FROM constructors c
         LEFT JOIN drivers driver_1 ON c.driver_id_1 = driver_1.id AND c.season = driver_1.season
         LEFT JOIN drivers driver_2 ON c.driver_id_2 = driver_2.id AND c.season = driver_2.season
         LEFT JOIN season_driver_leaderboard d1_points ON driver_1.id = d1_points.pilot_id AND c.season = d1_points.season_id
         LEFT JOIN season_driver_leaderboard d2_points ON driver_2.id = d2_points.pilot_id AND c.season = d2_points.season_id
    ORDER BY (COALESCE(d1_points.total_points, 0::bigint) + COALESCE(d2_points.total_points, 0::bigint)) DESC;

COMMIT;

-- Verify the migration:
-- SELECT id, name, season FROM constructors ORDER BY id;
