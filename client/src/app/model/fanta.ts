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
    id_fast_lap: number
}

export interface RaceResult {
    track_id: number,
    id_1_place: number,
    id_2_place: number,
    id_3_place: number,
    id_4_place: number,
    id_5_place: number,
    id_6_place: number,
    id_fast_lap: number
}

export interface FantaPlayer {
    username: string,
    name: string,
    surname: string,
    password: string,
    image: File
}