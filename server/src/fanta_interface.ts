import { GenezioDeploy } from "@genezio/types";
import pg from "pg";
const { Pool } = pg;

@GenezioDeploy()
export class FantaService {
  private pool: pg.Pool;

  constructor() {
    this.pool = new Pool({
        connectionString: process.env.RACEFORFEDERICA_DB_DATABASE_URL,
        ssl: true,
    });
  }

  /* All fanta vote */
  async getFantaVote(seasonId?: number): Promise<string> {
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
        f_table."dnf_id" AS "id_dnf"
      FROM users fp_table
      JOIN fanta f_table ON fp_table.id = f_table.fanta_player_id
      CROSS JOIN latest_season ls
      WHERE f_table.season_id = COALESCE($1, ls.id)
      ORDER BY fp_table.id, f_table.race_id;
    `, [seasonId]);
    return JSON.stringify(result.rows);
  }

  async setFantaVoto(
    fanta_player_id: number,
    track_id: number,
    id_1_place: number,
    id_2_place: number,
    id_3_place: number,
    id_4_place: number,
    id_5_place: number,
    id_6_place: number,
    id_7_place: number,
    id_8_place: number,
    id_fast_lap: number,
    id_dnf: number,
    seasonId?: number
  ): Promise<string> {
    try {
      // Validate input
      this.validateFantaVoto(fanta_player_id, track_id, id_1_place, id_2_place, id_3_place, id_4_place, id_5_place, id_6_place, id_7_place, id_8_place, id_fast_lap, id_dnf);

      // Get the season_id (use provided or get latest)
      let season_id = seasonId;
      if (!season_id) {
        const seasonResult = await this.pool.query('SELECT id FROM seasons ORDER BY start_date DESC LIMIT 1');
        season_id = seasonResult.rows[0]?.id;
      }

      const query = `
        INSERT INTO "fanta" (
          "fanta_player_id", "race_id", "1_place_id", "2_place_id", "3_place_id", 
          "4_place_id", "5_place_id", "6_place_id", "7_place_id", "8_place_id", 
          "fast_lap_id", "dnf_id", "season_id"
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
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
          "season_id" = EXCLUDED."season_id"
      `;

      const values = [
        fanta_player_id,
        track_id,
        id_1_place,
        id_2_place,
        id_3_place,
        id_4_place,
        id_5_place,
        id_6_place,
        id_7_place,
        id_8_place,
        id_fast_lap,
        id_dnf,
        season_id
      ];

      await this.pool.query(query, values);
      
      console.log(`Successfully saved fanta vote for player ${fanta_player_id} on race ${track_id} for season ${season_id}`);
      
      return JSON.stringify({
        success: true,
        message: 'Fanta vote saved successfully'
      });
    } catch (error) {
      console.error('Error saving fanta vote:', error);
      throw new Error(`Failed to save fanta vote: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // async setFantaPlayer(username: string, name: string, surname: string, password: string): Promise<string> {
  //   try {
  //     // Validate input
  //     this.validateFantaPlayer(username, name, surname, password);

  //     const query = `
  //       INSERT INTO "fanta_player" ("username", "name", "surname", "password")
  //       VALUES ($1, $2, $3, $4)
  //     `;

  //     const values = [username, name, surname, password];

  //     await this.pool.query(query, values);
      
  //     console.log(`Successfully created fanta player: ${username}`);
      
  //     return JSON.stringify({
  //       success: true,
  //       message: 'Fanta player created successfully'
  //     });
  //   } catch (error) {
  //     console.error('Error creating fanta player:', error);
  //     return JSON.stringify({
  //       success: false,
  //       message: `Failed to create fanta player: ${error instanceof Error ? error.message : 'Unknown error'}`
  //     });
  //   }
  // }

  private validateFantaVoto(
    fanta_player_id: number,
    track_id: number,
    id_1_place: number | null,
    id_2_place: number | null,
    id_3_place: number | null,
    id_4_place: number | null,
    id_5_place: number | null,
    id_6_place: number | null,
    id_7_place: number | null,
    id_8_place: number | null,
    id_fast_lap: number | null,
    id_dnf: number | null
  ): void {
    // Validate required fields
    if (!fanta_player_id || !track_id) {
      throw new Error('Fanta player ID and track ID are required');
    }

    if (!id_fast_lap) {
      throw new Error('Fast lap driver ID is required');
    }

    if (!id_dnf) {
      throw new Error('DNF driver ID is required');
    }

    // Validate that all 8 places are different (if provided)
    const places = [id_1_place, id_2_place, id_3_place, id_4_place, id_5_place, id_6_place, id_7_place, id_8_place]
      .filter(place => place !== null && place !== undefined);

    const uniquePlaces = new Set(places);
    if (places.length !== uniquePlaces.size) {
      throw new Error('All driver positions must be unique');
    }
  }

  private validateFantaPlayer(username: string, name: string, surname: string, password: string): void {
    // Validate required fields
    if (!username || !name || !surname || !password) {
      throw new Error('Username, name, surname, and password are required');
    }

    // Validate field types
    if (typeof username !== 'string' || typeof name !== 'string' || 
        typeof surname !== 'string' || typeof password !== 'string') {
      throw new Error('All player fields must be strings');
    }

    // Validate field lengths
    if (username.length < 3 || username.length > 50) {
      throw new Error('Username must be between 3 and 50 characters');
    }

    if (name.length < 1 || name.length > 50) {
      throw new Error('Name must be between 1 and 50 characters');
    }

    if (surname.length < 1 || surname.length > 50) {
      throw new Error('Surname must be between 1 and 50 characters');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    // Validate username format (alphanumeric and underscore only)
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      throw new Error('Username can only contain letters, numbers, and underscores');
    }
  }
}
