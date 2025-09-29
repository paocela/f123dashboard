// Track interface
export interface TrackData {
  track_id: number;
  name: string;
  date: string;
  has_sprint: number;
  has_x2: number;
  country: string;
  besttime_driver_time: string;
  username: string;
}

// Cumulative points interface
export interface CumulativePointsData {
  date: string;
  track_name: string;
  driver_id: number;
  driver_username: string;
  driver_color: string;
  cumulative_points: number;
}
