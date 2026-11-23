export interface GPEditItem {
    id: number;
    date: string;
  track_id: number | null;
    track_name: string | null;
    has_sprint: boolean;
    has_x2: boolean;
    has_results: boolean;
    is_past: boolean;
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

  export interface SprintDrawInfo {
    /** Sprints still to be drawn this season: the season total minus sprints already on GPs with a track. */
    remaining_sprints: number;
  }

export interface GpMutationResponse {
  success: boolean;
  message?: string;
}

export interface GpListResponse extends GpMutationResponse {
  data: GPEditItem[];
}

export interface GpCreateResponse extends GpMutationResponse {
  data: GPEditItem;
}

export interface GpTracksResponse extends GpMutationResponse {
  data: Pick<EligibleTrack, 'id' | 'name'>[];
}
