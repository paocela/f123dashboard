export interface GPEditItem {
    id: number;
    date: Date;
  track_id: number | null;
    track_name: string;
    has_sprint: boolean;
    has_x2: boolean;
  }
  
  export interface CreateGpData {
    track_id: number | null;
    date: string;
    has_sprint: boolean;
    has_x2: boolean;
  }
  
  export interface UpdateGpData {
    track_id?: number | null;
    date?: string;
    has_sprint?: boolean;
    has_x2?: boolean;
  }

  export interface EligibleTrack {
    id: number;
    name: string;
    country: string;
  }
