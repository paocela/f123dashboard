export class FantaService {
    constructor(pool) {
        this.pool = pool;
    }
    async getFantaVote(seasonId) {
        const result = await this.pool.query(`
      WITH latest_season AS (
        SELECT id FROM seasons ORDER BY start_date DESC LIMIT 1
      )
      SELECT
        fp_table.id AS fanta_player_id,
        f_table.race_id AS track_id,
        fp_table.username AS username,
        f_table."1_place_id" AS "id_1_place",
        f_table."2_place_id" AS "id_2_place",
        f_table."3_place_id" AS "id_3_place",
        f_table."4_place_id" AS "id_4_place",
        f_table."5_place_id" AS "id_5_place",
        f_table."6_place_id" AS "id_6_place",
        f_table."7_place_id" AS "id_7_place",
        f_table."8_place_id" AS "id_8_place",
        f_table."fast_lap_id" AS "id_fast_lap",
        f_table."dnf_id" AS "id_dnf",
        f_table."team_id" AS "constructor_id"
      FROM users fp_table
      JOIN fanta f_table ON fp_table.id = f_table.fanta_player_id
      CROSS JOIN latest_season ls
      WHERE f_table.season_id = COALESCE($1, ls.id)
      ORDER BY fp_table.id, f_table.race_id;
    `, [seasonId]);
        return result.rows;
    }
    async setFantaVoto(fantaVote) {
        try {
            // Validate input
            this.validateFantaVoto(fantaVote);
            // Get the season_id (use provided or get latest)
            let season_id = fantaVote.season_id;
            if (season_id == null || season_id == undefined) {
                const seasonResult = await this.pool.query('SELECT id FROM seasons ORDER BY start_date DESC LIMIT 1');
                season_id = seasonResult.rows[0]?.id;
            }
            const query = `
        INSERT INTO "fanta" (
          "fanta_player_id", "race_id", "1_place_id", "2_place_id", "3_place_id", 
          "4_place_id", "5_place_id", "6_place_id", "7_place_id", "8_place_id", 
          "fast_lap_id", "dnf_id", "season_id", "team_id"
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT ("fanta_player_id", "race_id", "season_id")
        DO UPDATE SET
          "1_place_id" = EXCLUDED."1_place_id",
          "2_place_id" = EXCLUDED."2_place_id",
          "3_place_id" = EXCLUDED."3_place_id",
          "4_place_id" = EXCLUDED."4_place_id",
          "5_place_id" = EXCLUDED."5_place_id",
          "6_place_id" = EXCLUDED."6_place_id",
          "7_place_id" = EXCLUDED."7_place_id",
          "8_place_id" = EXCLUDED."8_place_id",
          "fast_lap_id" = EXCLUDED."fast_lap_id",
          "dnf_id" = EXCLUDED."dnf_id",
          "season_id" = EXCLUDED."season_id",
          "team_id" = EXCLUDED."team_id"
      `;
            const values = [
                fantaVote.fanta_player_id,
                fantaVote.track_id,
                fantaVote.id_1_place,
                fantaVote.id_2_place,
                fantaVote.id_3_place,
                fantaVote.id_4_place,
                fantaVote.id_5_place,
                fantaVote.id_6_place,
                fantaVote.id_7_place,
                fantaVote.id_8_place,
                fantaVote.id_fast_lap,
                fantaVote.id_dnf,
                season_id,
                fantaVote.constructor_id
            ];
            await this.pool.query(query, values);
            console.log(`Successfully saved fanta vote for player ${fantaVote.fanta_player_id} on race ${fantaVote.track_id} for season ${fantaVote.season_id}`);
            return {
                success: true,
                message: 'Fanta vote saved successfully'
            };
        }
        catch (error) {
            console.error('Error saving fanta vote:', error);
            throw new Error(`Failed to save fanta vote: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    validateFantaVoto(fantavote) {
        // Validate required fields
        if (!fantavote.fanta_player_id || !fantavote.track_id)
            throw new Error('Fanta player ID and track ID are required');
        if (!fantavote.id_fast_lap)
            throw new Error('Fast lap driver ID is required');
        if (!fantavote.id_dnf)
            throw new Error('DNF driver ID is required');
        if (!fantavote.constructor_id)
            throw new Error("Constructor ID is required");
        // Validate that all 8 places are different (if provided)
        const places = [
            fantavote.id_1_place, fantavote.id_2_place, fantavote.id_3_place, fantavote.id_4_place,
            fantavote.id_5_place, fantavote.id_6_place, fantavote.id_7_place, fantavote.id_8_place
        ].filter(place => place !== null && place !== undefined);
        const uniquePlaces = new Set(places);
        if (places.length !== uniquePlaces.size) {
            throw new Error('All driver positions must be unique');
        }
    }
}
