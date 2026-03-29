import type { FantaVote } from '@f123dashboard/shared';

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
 * Form status constants for vote submission state.
 */
export const FORM_STATUS = {
  SUCCESS: 1,
  VALIDATION_ERROR: 2,
  SAVE_ERROR: 3
} as const;

/**
 * Returns the total number of vote fields for a given driver count.
 * Formula: driver positions + fast_lap + dnf + constructor = N + 3
 */
export function totalVoteFields(driverCount: number): number {
  return driverCount + 3;
}

/**
 * Helper class to convert between FantaVote and the flat vote-array format
 * used internally by the fanta/vote-history components.
 *
 * Vote array layout: [pos1, pos2, ..., posN, fastLapId, dnfId, constructorId]
 */
export class FantaVoteHelper {
    /**
     * Converts a FantaVote to a flat vote array.
     */
    static toArray(fanta: FantaVote): readonly number[] {
        return [...fanta.positions, fanta.id_fast_lap, fanta.id_dnf, fanta.constructor_id] as const;
    }

    /**
     * Converts a flat vote array back to a partial FantaVote (without user/track info).
     * @param votes The flat array built by toArray()
     * @param driverCount Number of driver-position slots at the start of the array
     */
    static fromArray(votes: number[], driverCount: number): Pick<FantaVote,
        'positions' | 'id_fast_lap' | 'id_dnf' | 'constructor_id'> {
        return {
            positions: votes.slice(0, driverCount),
            id_fast_lap: votes[driverCount] || 0,
            id_dnf: votes[driverCount + 1] || 0,
            constructor_id: votes[driverCount + 2] || 0,
        };
    }

    /**
     * Safely converts any value to a number, returning 0 for invalid inputs.
     */
    static toNumber(value: unknown): number {
        return isNaN(+(value as number)) ? 0 : +(value as number);
    }
}