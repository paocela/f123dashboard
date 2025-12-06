// Database types
export type DriverData = {
  driver_id: number;
  driver_username: string;
  driver_name: string;
  driver_surname: string;
  driver_description: string;
  driver_license_pt: number;
  driver_consistency_pt: number;
  driver_fast_lap_pt: number;
  drivers_dangerous_pt: number;
  driver_ingenuity_pt: number;
  driver_strategy_pt: number;
  driver_color: string;
  car_name: string;
  car_overall_score: number;
  total_sprint_points: number;
  total_free_practice_points: number;
  total_qualifying_points: number;
  total_full_race_points: number;
  total_race_points: number;
  total_points: number;
};

export type Driver = {
  id: number;
  username: string;
  first_name: string;
  surname: string;
}

export type SessionResult = {
  position: number;
  driver_username: string;
  fast_lap: boolean | null;
}

export type ChampionshipData = {
  gran_prix_id: number;
  track_name: string;
  gran_prix_date: Date;
  gran_prix_has_sprint: number;
  gran_prix_has_x2: number;
  track_country: string;
  sessions: {
    free_practice?: SessionResult[];
    qualifying?: SessionResult[];
    race?: SessionResult[];
    sprint?: SessionResult[];
    full_race?: SessionResult[];
  };
  fastLapDrivers: {
    race?: string;
    sprint?: string;
    full_race?: string;
  };
}

export type Season = {
  id: number;
  description: string;
  startDate?: Date;
  endDate?: Date;
}

export type CumulativePointsData = {
  date: string;
  track_name: string;
  driver_id: number;
  driver_username: string;
  driver_color: string;
  cumulative_points: number;
}

export type TrackData = {
  track_id: number;
  name: string;
  date: string;
  has_sprint: number;
  has_x2: number;
  country: string;
  besttime_driver_time: string;
  username: string;
}

export type RaceResult = {
  id: number;
  track_id: number;
  id_1_place: number;
  id_2_place: number;
  id_3_place: number;
  id_4_place: number;
  id_5_place: number;
  id_6_place: number;
  id_7_place: number;
  id_8_place: number;
  id_fast_lap: number;
  list_dnf: string;
}

export type Constructor = {
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

export type ConstructorGrandPrixPoints = {
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
