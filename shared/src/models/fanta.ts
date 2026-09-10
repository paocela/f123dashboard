// Fanta types
export type FantaVote = {
  fanta_player_id: number;
  track_id: number;
  /** Ordered list of driver IDs voted for positions 1..N (index 0 = 1st place). */
  positions: number[];
  id_fast_lap: number;
  id_dnf: number;
  season_id?: number;
  constructor_id: number;
};

/** Payload sent by the client when submitting a vote. Server resolves fanta_player_id from JWT. */
export type FantaVoteSubmission = Omit<FantaVote, 'fanta_player_id'>;
