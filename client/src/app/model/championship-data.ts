// Championship data interface based on the new query structure
export interface SessionResult {
  position: number;
  driver_username: string;
  fast_lap: boolean | null;
}

export interface ChampionshipData {
  gran_prix_id: string;
  track_name: string;
  gran_prix_date: string;
  gran_prix_has_sprint: string;
  gran_prix_has_x2: string;
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
