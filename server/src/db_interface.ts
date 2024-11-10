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
    const result = await this.pool.query(`
      SELECT drivers.username AS driver_username, drivers.name AS driver_name, drivers.surname AS driver_surname, drivers.description as driver_description,
      drivers.consistency_pt AS driver_consistency_pt, drivers.fast_lap_pt AS driver_fast_lap_pt, drivers.dangerous_pt AS drivers_dangerous_pt, drivers.ingenuity_pt AS driver_ingenuity_pt,
      drivers.strategy_pt AS driver_strategy_pt, drivers.avatar AS driver_avatar, inner_table.pilot_name AS pilot_name, inner_table.pilot_surname AS pilot_surname, inner_table.car_name AS car_name,
      inner_table.car_overall_score AS car_overall_score, inner_table.car_logo AS car_logo
      FROM drivers
      INNER JOIN (
        SELECT pilots.id AS pilot_id, pilots.name AS pilot_name, pilots.surname AS pilot_surname, cars.name AS car_name, cars.overall_score AS car_overall_score, cars.logo AS car_logo
        FROM pilots
        INNER JOIN cars
        ON pilots.car_id = cars.id
      ) as inner_table
      ON drivers.pilot_id = inner_table.pilot_id
      `);
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