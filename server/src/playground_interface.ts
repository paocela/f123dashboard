import { GenezioDeploy } from "@genezio/types";
import pg from "pg";
const { Pool } = pg;


  type PlaygroundBestScore =  {
    user_id: number,
    username: string,
    image: string,
    best_score: number,
    best_date: Date,
  };
@GenezioDeploy()
export class PlaygroundInterface {
  private pool: pg.Pool;

  constructor() {
    this.pool = new Pool({
        connectionString: process.env.RACEFORFEDERICA_DB_DATABASE_URL,
        ssl: true,
    });
  }



  /* Playground leaderboard */
  async getPlaygroundLeaderboard(): Promise<PlaygroundBestScore[]> {
    const result = await this.pool.query (`
      SELECT user_id, username, encode(image, \'escape\') as image, best_score, best_date
      FROM playground_leaderboard
      `);
    return result.rows as PlaygroundBestScore[];
  }

  /* Playground leaderboard */
  async setUserBestScore(score: PlaygroundBestScore): Promise<void> {
    const result = await this.pool.query (`
      INSERT INTO playground (id, user_id, best_score, best_date)
      VALUES ($1, $1, $2, $3)
      ON CONFLICT (id) 
      DO UPDATE SET 
        best_score = EXCLUDED.best_score,
        best_date = EXCLUDED.best_date;
      `,
      [score.user_id, score.best_score, score.best_date]);
    return;
  }




}
