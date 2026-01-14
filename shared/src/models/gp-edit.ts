export interface GPEditItem {
    id: number;
    date: Date;
    track_id: number;
    track_name: string;
    has_sprint: boolean;
    has_x2: boolean;
  }
  
  export interface CreateGpData {
    track_id: number;
    date: string;
    has_sprint: boolean;
    has_x2: boolean;
  }
  
  export interface UpdateGpData {
    date?: string;
    has_sprint?: boolean;
    has_x2?: boolean;
  }
