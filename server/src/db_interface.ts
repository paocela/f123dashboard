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

  async getAllPilots(): Promise<string> {
    const result = await this.pool.query("SELECT * FROM pilots");
    return JSON.stringify(result.rows);
  }

  async getAllTracks(): Promise<string> {
    const result = await this.pool.query("SELECT * FROM tracks");
    return JSON.stringify(result.rows);
  }

  async getAllDrivers(): Promise<string> {
    const result = await this.pool.query("SELECT * FROM drivers");
    return JSON.stringify(result.rows);
  }

  async getAllCars(): Promise<string> {
    const result = await this.pool.query("SELECT * FROM cars");
    return JSON.stringify(result.rows);
  }

  async insertUser(name: string): Promise<string> {
    const result = await this.pool.query("SELECT * FROM tracks");
    return JSON.stringify(result.rows);
  }

}