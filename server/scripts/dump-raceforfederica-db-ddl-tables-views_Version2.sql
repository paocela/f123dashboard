--
-- DDL for Tables and Views extracted from dump-raceforfederica-db-202507131045.sql
--

-- TABLES

CREATE TABLE public."Championship" (
    id integer NOT NULL,
    gran_prix_id integer NOT NULL
);

CREATE TABLE public.cars (
    name text NOT NULL,
    overall_score integer NOT NULL,
    id bigint NOT NULL
);

CREATE TABLE public.drivers (
    username text NOT NULL,
    name text,
    surname text,
    id bigint NOT NULL,
    free_practice_points integer DEFAULT 0 NOT NULL,
    qualifying_points integer DEFAULT 0 NOT NULL,
    race_points integer DEFAULT 0 NOT NULL,
    pilot_id bigint,
    description text,
    consistency_pt integer,
    fast_lap_pt integer,
    dangerous_pt integer,
    ingenuity_pt integer,
    strategy_pt integer,
    color text,
    license_pt bigint DEFAULT 3
);

CREATE TABLE public.free_practice_result_entries (
    free_practice_results_id integer NOT NULL,
    pilot_id integer NOT NULL,
    "position" integer NOT NULL
);

CREATE TABLE public.full_race_result_entries (
    race_results_id integer NOT NULL,
    pilot_id integer NOT NULL,
    "position" integer NOT NULL,
    fast_lap boolean DEFAULT false
);

CREATE TABLE public.gran_prix (
    id bigint NOT NULL,
    date timestamp without time zone NOT NULL,
    track_id bigint NOT NULL,
    race_results_id bigint,
    sprint_results_id bigint,
    qualifying_results_id bigint,
    free_practice_results_id bigint,
    has_sprint bigint,
    has_x2 bigint DEFAULT 0,
    full_race_results_id bigint,
    season_id integer NOT NULL
);

CREATE TABLE public.qualifying_result_entries (
    qualifying_results_id integer NOT NULL,
    pilot_id integer NOT NULL,
    "position" integer NOT NULL
);

CREATE TABLE public.race_result_entries (
    race_results_id integer NOT NULL,
    pilot_id integer NOT NULL,
    "position" integer NOT NULL,
    fast_lap boolean DEFAULT false
);

CREATE TABLE public.seasons (
    id integer NOT NULL,
    description text,
    start_date timestamp without time zone NOT NULL,
    end_date timestamp without time zone
);

CREATE TABLE public.session_type (
    "1_points" integer NOT NULL,
    "2_points" integer NOT NULL,
    "3_points" integer NOT NULL,
    "4_points" integer NOT NULL,
    "5_points" integer NOT NULL,
    id bigint NOT NULL,
    name text NOT NULL,
    fast_lap_points integer,
    "6_points" integer
);

CREATE TABLE public.sprint_result_entries (
    sprint_results_id integer NOT NULL,
    pilot_id integer NOT NULL,
    "position" integer NOT NULL,
    fast_lap boolean DEFAULT false
);

CREATE TABLE public.tracks (
    name text,
    country text,
    id bigint NOT NULL,
    length double precision NOT NULL,
    besttime_driver_time text NOT NULL,
    besttime_driver_id bigint
);

CREATE TABLE public.fanta (
    id integer NOT NULL,
    fanta_player_id bigint NOT NULL,
    race_id bigint NOT NULL,
    "1_place_id" bigint NOT NULL,
    "2_place_id" bigint NOT NULL,
    "3_place_id" bigint NOT NULL,
    "4_place_id" bigint NOT NULL,
    "5_place_id" bigint NOT NULL,
    "6_place_id" bigint NOT NULL,
    fast_lap_id bigint NOT NULL,
    dnf_id bigint DEFAULT 0,
    seasion integer
);

CREATE TABLE public.fanta_player (
    id integer NOT NULL,
    username text,
    name text,
    surname text,
    password text,
    image bytea,
    created_at timestamp without time zone DEFAULT now(),
    last_login timestamp without time zone,
    password_updated_at timestamp without time zone DEFAULT now(),
    is_active boolean DEFAULT true
);


CREATE TABLE public.user_sessions (
    id integer NOT NULL,
    user_id integer,
    session_token character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    last_activity timestamp without time zone DEFAULT now(),
    expires_at timestamp without time zone NOT NULL,
    ip_address inet,
    user_agent text,
    is_active boolean DEFAULT true
);

CREATE TABLE public.pilots (
    name text,
    surname text,
    id bigint NOT NULL,
    car_id bigint NOT NULL
);
