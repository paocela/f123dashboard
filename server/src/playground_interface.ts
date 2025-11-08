import { GenezioDeploy } from "@genezio/types";
import pg from "pg";
const { Pool } = pg;


  type PlaygroundBestScore =  {
    user_id: number,
    username: string,
    image: string,
    best_time: number,
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
      SELECT user_id, username, encode(image, \'escape\') as image, best_time, best_date
      FROM playground_leaderboard
      `);
    return result.rows as PlaygroundBestScore[];
  }


}
