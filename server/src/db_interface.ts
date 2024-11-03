import express, { Application, Request, Response } from 'express';
import { GenezioDeploy } from "@genezio/types";
import pg from "pg";
const { Pool } = pg;

//const app: Application = express();
//const port: number = 3000;
//
//app.get('/', (req: Request, res: Response) => {
//  res.send('Hello, World!');
//  const server: PostgresService = new PostgresService();
//  server.insertUser("test");
//});
//
//app.listen(port, () => {
//  console.log(`Server is running on http://localhost:${port}`);
//});




@GenezioDeploy()
export class PostgresService {
  pool = new Pool({
    connectionString: "postgresql://admin:V7DcRKrlmZ0X@ep-silent-sunset-a2kwh1f2-pooler.eu-central-1.aws.neon.tech/raceforfederica-db?sslmode=require",
    ssl: true,
  });

  async insertUser(name: string): Promise<string> {
    const result = await this.pool.query("SELECT * FROM tracks");

    console.log(JSON.stringify(result.rows));

    return JSON.stringify(result.rows);
  }
}