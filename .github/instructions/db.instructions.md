---
applyTo: '**'
---
# Database Structure Overview

This document describes the project database schema.

---

## 1. Championship

- **id**: Primary key
- **gran_prix_id**: Reference to the `gran_prix` table

---

## 2. Cars

- **id**: Primary key
- **name**: Car name
- **overall_score**: Aggregate score for the car

---

## 3. Pilots

- **id**: Primary key
- **name**: Pilot's first name
- **surname**: Pilot's surname
- **car_id**: Reference to the `cars` table

---

## 4. Seasons

- **id**: Primary key
- **description**: Textual description of the season
- **start_date**: Season start date
- **end_date**: Season end date

---

## 5. Fanta Player

- **id**: Primary key
- **username**: Username of the fantasy player
- **name**: Name of the player
- **surname**: Surname of the player
- **password**: Player's password
- **image**: Profile image
- **created_at**: Timestamp of account creation (default: NOW())
- **last_login**: Timestamp of last login
- **password_updated_at**: Timestamp of last password update (default: NOW())
- **is_active**: Boolean indicating if account is active (default: TRUE)

---

## 6. Tracks

- **id**: Primary key
- **name**: Track name
- **country**: Track location country
- **length**: Track length
- **besttime_driver_time**: Best lap time 
- **besttime_driver_id**: Reference to the best time's driver

---

## 7. Gran Prix

- **id**: Primary key
- **date**: Date of the event
- **track_id**: Reference to `tracks`
- **race_results_id**: Reference to `race_results`
- **sprint_results_id**: Reference to `sprint_results`
- **qualifying_results_id**: Reference to `qualifying_results`
- **free_practice_results_id**: Reference to `free_practice_results`
- **has_sprint**: Boolean, indicates if sprint exists
- **has_x2**: Boolean, indicates if double points or other multiplier
- **full_race_results_id**: Reference to `full_race_results`

---

## 8. Race Results

- **id**: Primary key
- **1_place_id** to **6_place_id**: References to `drivers` (the positions for top 6)
- **session_type_id**: Reference to `session_type`
- **dnf**: Did not finish (driver id)
- **fast_lap_id**: Fastest lap (driver id)

---

## 9. Sprint Results

- **id**: Primary key
- **1_place_id** to **6_place_id**: References to `drivers` (top 6)
- **session_type_id**: Reference to `session_type`
- **dnf**: Did not finish (driver id)
- **fast_lap_id**: Fastest lap (driver id)

---

## 10. Full Race Results

- **id**: Primary key
- **1_place_id** to **6_place_id**: References to `drivers`
- **session_type_id**: Reference to `session_type`
- **dnf**: Did not finish (driver id)
- **fast_lap_id**: Fastest lap (driver id)
- **season**: Reference to `seasons`

---

## 11. Fanta

- **id**: Primary key
- **fanta_player_id**: Reference to `fanta_player`
- **race_id**: Reference to a race event
- **1_place_id** to **6_place_id**: Fantasy team positions (drivers)
- **fast_lap_id**: Fastest lap (driver id)
- **dnf_id**: Did not finish (driver id)
- **season**: Reference to `seasons`

---

## 12. Drivers

- **id**: Primary key
- **username**: Unique username
- **name**: Driver's first name
- **surname**: Driver's surname
- **free_practice_points**: Points from free practice
- **qualifying_points**: Points from qualifying
- **race_points**: Points from races
- **pilot_id**: Reference to `pilots`
- **description**: Text description
- **consistency_pt**: Consistency points
- **fast_lap_pt**: Fastest lap points
- **dangerous_pt**: Dangerous driving points
- **ingenuity_pt**: Ingenuity points
- **strategy_pt**: Strategy points
- **color**: Color or team color
- **license_pt**: License points

---

## 13. Qualifying Results

- **id**: Primary key
- **1_place_id** to **6_place_id**: References to `drivers`
- **session_type_id**: Reference to `session_type`

---

## 14. Free Practice Results

- **id**: Primary key
- **1_place_id** to **6_place_id**: References to `drivers`
- **session_type_id**: Reference to `session_type`
- **season**: Reference to `seasons`

---

## 15. Session Type

- **id**: Primary key
- **1_points** to **6_points**: Points assigned for each placement
- **name**: Name of the session type (Race, Qualifying, etc.)
- **fast_lap_points**: Points for fastest lap

---

## 16. User Sessions

- **id**: Primary key
- **user_id**: Reference to `fanta_player` (with CASCADE delete)
- **session_token**: Unique session token (VARCHAR 255)
- **created_at**: Session creation timestamp (default: NOW())
- **last_activity**: Last activity timestamp (default: NOW())
- **expires_at**: Session expiration timestamp
- **ip_address**: Client IP address (INET type)
- **user_agent**: Client user agent string
- **is_active**: Boolean indicating if session is active (default: TRUE)

---

## Relationships & Notes

- Most result tables (race, sprint, qualifying, free practice, full race) store positions as references to the `drivers` table.
- `gran_prix` acts as a central event, linking to results and tracks.
- The schema supports F1-style events, with additional tables to support fantasy game logic (`fanta`, `fanta_player`).
- Points and session type logic is centralized in `session_type`, supporting flexible point assignment per session.
- The design enables tracking performance and statistics for both real and fantasy drivers and users.
- **Authentication**: The `fanta_player` table includes authentication fields for user management, and `user_sessions` table provides secure session management.
- **Session Management**: Sessions are automatically cleaned up through the `clean_expired_sessions()` function.
- **Indexes**: Performance indexes are created on username, session tokens, user IDs, and expiration times.

---

