// Driver interface based on all_race_points view
export interface DriverData {
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
  pilot_name: string;
  pilot_surname: string;
  car_name: string;
  car_overall_score: number;
  total_sprint_points: number;
  total_free_practice_points: number;
  total_qualifying_points: number;
  total_full_race_points: number;
  total_race_points: number;
  total_points: number;
}
