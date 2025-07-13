   SELECT
          gp.id AS track_id,
          MAX(CASE WHEN rre.position = 1 THEN rre.pilot_id END) AS id_1_place,
          MAX(CASE WHEN rre.position = 2 THEN rre.pilot_id END) AS id_2_place,
          MAX(CASE WHEN rre.position = 3 THEN rre.pilot_id END) AS id_3_place,
          MAX(CASE WHEN rre.position = 4 THEN rre.pilot_id END) AS id_4_place,
          MAX(CASE WHEN rre.position = 5 THEN rre.pilot_id END) AS id_5_place,
          MAX(CASE WHEN rre.position = 6 THEN rre.pilot_id END) AS id_6_place,
          MAX(CASE WHEN rre.fast_lap THEN rre.pilot_id END) AS id_fast_lap,
          ARRAY_AGG(rre.pilot_id) FILTER (WHERE rre.position = 0) AS list_dnf
        FROM gran_prix gp
        LEFT JOIN race_result_entries rre ON gp.race_results_id = rre.race_results_id
        WHERE gp.race_results_id IS NOT NULL
        GROUP BY gp.id

        UNION ALL

        SELECT
          gp.id AS track_id,
          MAX(CASE WHEN frre.position = 1 THEN frre.pilot_id END) AS id_1_place,
          MAX(CASE WHEN frre.position = 2 THEN frre.pilot_id END) AS id_2_place,
          MAX(CASE WHEN frre.position = 3 THEN frre.pilot_id END) AS id_3_place,
          MAX(CASE WHEN frre.position = 4 THEN frre.pilot_id END) AS id_4_place,
          MAX(CASE WHEN frre.position = 5 THEN frre.pilot_id END) AS id_5_place,
          MAX(CASE WHEN frre.position = 6 THEN frre.pilot_id END) AS id_6_place,
          MAX(CASE WHEN frre.fast_lap THEN frre.pilot_id END) AS id_fast_lap,
          ARRAY_AGG(frre.pilot_id) FILTER (WHERE frre.position = 0) AS list_dnf
        FROM gran_prix gp
        LEFT JOIN full_race_result_entries frre ON gp.full_race_results_id = frre.race_results_id
        WHERE gp.full_race_results_id IS NOT NULL
        GROUP BY gp.id;