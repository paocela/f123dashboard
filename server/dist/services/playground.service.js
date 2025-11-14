export class PlaygroundService {
    constructor(pool) {
        this.pool = pool;
    }
    async getPlaygroundLeaderboard() {
        const result = await this.pool.query(`
      SELECT user_id, username, encode(image, 'escape') as image, best_score, best_date
      FROM playground_leaderboard
    `);
        return result.rows;
    }
    async setUserBestScore(score) {
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
