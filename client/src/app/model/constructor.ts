export interface Constructor {
  constructor_id: number;
  constructor_name: string;
  constructor_color: string;
  driver_1_id: number;
  driver_1_username: string;
  driver_1_tot_points: number;
  driver_2_id: number;
  driver_2_username: string;
  driver_2_tot_points: number;
  constructor_tot_points: number;
  constructor_race_points?: number;
  constructor_full_race_points?: number;
  constructor_sprint_points?: number;
  constructor_qualifying_points?: number;
  constructor_free_practice_points?: number;
}

export interface ConstructorGrandPrixPoints {
  constructor_id: number;
  constructor_name: string;
  grand_prix_id: number;
  grand_prix_date: string;
  track_name: string;
  track_id: number;
  season_id: number;
  season_description: string;
  driver_id_1: number;
  driver_id_2: number;
  driver_1_points: number;
  driver_2_points: number;
  constructor_points: number;
}