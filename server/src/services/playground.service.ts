import pg from "pg";
import type { PlaygroundBestScore } from '@f123dashboard/shared';

export class PlaygroundService {
  constructor(private pool: pg.Pool) {}

  async getPlaygroundLeaderboard(): Promise<PlaygroundBestScore[]> {
    const result = await this.pool.query(`
      SELECT user_id, username, encode(image, 'escape') as image, best_score, best_date
      FROM playground_leaderboard
    `);
    return result.rows as PlaygroundBestScore[];
  }

  async setUserBestScore(score: PlaygroundBestScore): Promise<void> {
    await this.pool.query(`
      INSERT INTO playground (id, user_id, best_score, best_date)
      VALUES ($1, $1, $2, $3)
      ON CONFLICT (id) 
      DO UPDATE SET 
        best_score = EXCLUDED.best_score,
        best_date = EXCLUDED.best_date;
    `, [score.user_id, score.best_score, score.best_date]);
  }
}
