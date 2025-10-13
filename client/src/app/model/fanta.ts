
export interface Fanta {
    fanta_player_id: number,
    username: string,
    track_id: number,
    id_1_place: number,
    id_2_place: number,
    id_3_place: number,
    id_4_place: number,
    id_5_place: number,
    id_6_place: number,
    id_7_place: number,
    id_8_place: number,
    id_fast_lap: number,
    id_dnf: number,
    season_id?: number,
    constructor_id: number
}

export interface RaceResult {
    id: number,
    track_id: number,
    id_1_place: number,
    id_2_place: number,
    id_3_place: number,
    id_4_place: number,
    id_5_place: number,
    id_6_place: number,
    id_7_place: number,
    id_8_place: number,
    id_fast_lap: number,
    list_dnf: string
}

export interface FantaPlayer {
    username: string,
    name: string,
    surname: string,
    password: string,
    image: File
}

/**
 * Represents the visual status of a vote (correct, partial, incorrect).
 */
export interface VoteStatus {
    icon: string[];
    color: string;
}
/**
 * Vote index constants for accessing vote array positions.
 * Maps human-readable names to array indices (0-based).
 */
export const VOTE_INDEX = {
  PLACE_1: 0,
  PLACE_2: 1,
  PLACE_3: 2,
  PLACE_4: 3,
  PLACE_5: 4,
  PLACE_6: 5,
  PLACE_7: 6,
  PLACE_8: 7,
  FAST_LAP: 8,
  DNF: 9,
  CONSTRUCTOR: 10
} as const;

/**
 * Form status constants for vote submission state.
 */
export const FORM_STATUS = {
  SUCCESS: 1,
  VALIDATION_ERROR: 2,
  SAVE_ERROR: 3
} as const;

/**
 * Number of driver positions in a vote.
 */
export const DRIVER_POSITIONS_COUNT = 8;

/**
 * Total number of vote fields.
 */
export const TOTAL_VOTE_FIELDS = 11;

/**
 * Helper class to convert between Fanta interface and vote array format.
 */
export class FantaVoteHelper {
    /**
     * Converts a Fanta object to a vote array.
     */
    static toArray(fanta: Fanta): readonly number[] {
        return [
            fanta.id_1_place,
            fanta.id_2_place,
            fanta.id_3_place,
            fanta.id_4_place,
            fanta.id_5_place,
            fanta.id_6_place,
            fanta.id_7_place,
            fanta.id_8_place,
            fanta.id_fast_lap,
            fanta.id_dnf,
            fanta.constructor_id
        ] as const;
    }

    /**
     * Converts a vote array to a partial Fanta object (without user/track info).
     */
    static fromArray(votes: number[]): Pick<Fanta, 
        'id_1_place' | 'id_2_place' | 'id_3_place' | 'id_4_place' | 
        'id_5_place' | 'id_6_place' | 'id_7_place' | 'id_8_place' | 
        'id_fast_lap' | 'id_dnf' | 'constructor_id'> {
        return {
            id_1_place: votes[VOTE_INDEX.PLACE_1] || 0,
            id_2_place: votes[VOTE_INDEX.PLACE_2] || 0,
            id_3_place: votes[VOTE_INDEX.PLACE_3] || 0,
            id_4_place: votes[VOTE_INDEX.PLACE_4] || 0,
            id_5_place: votes[VOTE_INDEX.PLACE_5] || 0,
            id_6_place: votes[VOTE_INDEX.PLACE_6] || 0,
            id_7_place: votes[VOTE_INDEX.PLACE_7] || 0,
            id_8_place: votes[VOTE_INDEX.PLACE_8] || 0,
            id_fast_lap: votes[VOTE_INDEX.FAST_LAP] || 0,
            id_dnf: votes[VOTE_INDEX.DNF] || 0,
            constructor_id: votes[VOTE_INDEX.CONSTRUCTOR] || 0
        };
    }

    /**
     * Safely converts any value to a number, returning 0 for invalid inputs.
     */
    static toNumber(value: any): number {
        return isNaN(+value) ? 0 : +value;
    }
}