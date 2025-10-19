---
applyTo: '**'
---
# Database Structure Overview

This document describes the project database schema.

---

## Database Architecture Overview

### Core Concept
This database is designed to support a Formula 1 fantasy game where users can insert votes and compete based on real F1 race results. The schema follows a normalized approach that separates race results from the drivers and teams, allowing for flexible querying and reporting.

### Result Tables Structure
The database uses a modern **entry-based result system** instead of storing positions as separate columns. This design provides several advantages:

#### How Result Tables Work:
- **Entry Tables**: Instead of having columns like `1_place_id`, `2_place_id`, etc., we use entry tables that store each driver's result as a separate row
- **Position-Based**: Each entry contains a `position` field (1-6) and references the driver who achieved that position
- **Session Types**: Different session types (Race, Sprint, Qualifying, etc.) have their own entry tables

#### Result Entry Tables:
1. **`race_result_entries`** - Main race results
2. **`sprint_result_entries`** - Sprint race results  
3. **`qualifying_result_entries`** - Qualifying session results
4. **`free_practice_result_entries`** - Free practice session results
5. **`full_race_result_entries`** - Full race results (when `has_x2` flag is set)

#### Key Benefits:
- **Scalability**: Easy to add more positions or drivers
- **Normalization**: Eliminates redundancy and maintains data integrity
- **Flexibility**: Simple to query for specific positions or driver performance
- **Consistency**: Uniform structure across all session types

### How to Use Result Tables:

#### Adding Results:
```sql
-- Example: Adding race results for a Grand Prix
INSERT INTO race_result_entries (race_results_id, pilot_id, position, fast_lap) VALUES
(123, 1, 1, true),   -- Driver 1 finished 1st with fastest lap
(123, 2, 2, false),  -- Driver 2 finished 2nd
(123, 3, 3, false);  -- Driver 3 finished 3rd
```

#### Querying Results:
```sql
-- Get all drivers and their positions for a specific race
SELECT d.username, rre.position, rre.fast_lap 
FROM race_result_entries rre
JOIN drivers d ON rre.pilot_id = d.id
WHERE rre.race_results_id = 123
ORDER BY rre.position;
```

### Points System
Points are calculated using the `session_type` table which defines point values for each position (1st through 6th) and bonus points for fastest laps. The views automatically calculate total points by joining result entries with session types.

### Fantasy Game Integration
The `fanta` table stores fantasy team selections, while the result entry tables provide the actual performance data used to calculate fantasy points through the database views.

---

## Table Definitions

## 1. Cars

- **id**: Primary key (int8)
- **name**: Car name (text, NOT NULL)
- **overall_score**: Aggregate score for the car (int4, NOT NULL)

---

## 2. Championship

- **id**: Primary key (int4)
- **gran_prix_id**: Reference to the `gran_prix` table (int4, NOT NULL)

---

## 3. Pilots

- **id**: Primary key (int8)
- **name**: Pilot's first name
- **surname**: Pilot's surname
- **car_id**: Reference to the `cars` table (int8, NOT NULL)

---

## 4. Seasons

- **id**: Primary key (serial4)
- **description**: Textual description of the season
- **start_date**: Season start date (timestamp, NOT NULL)
- **end_date**: Season end date (timestamp, nullable)

---


## 5. Users

- **id**: Primary key (int4, auto-increment)
- **username**: Username of the user
- **name**: Name of the user
- **surname**: Surname of the user
- **password**: User's password
- **image**: Profile image (bytea)
- **created_at**: Timestamp of account creation (default: NOW())
- **last_login**: Timestamp of last login
- **password_updated_at**: Timestamp of last password update (default: NOW())
- **is_active**: Boolean indicating if account is active (default: TRUE)
- **is_admin**: Boolean indicating if user has admin privileges (default: FALSE)

---

## 6. Tracks

- **id**: Primary key (int8)
- **name**: Track name
- **country**: Track location country
- **length**: Track length (float8, NOT NULL)
- **besttime_driver_time**: Best lap time (text, NOT NULL)
- **besttime_driver_id**: Reference to the best time's driver (int8, nullable)

---

## 7. Gran Prix

- **id**: Primary key (int8)
- **date**: Date of the event (timestamp, NOT NULL)
- **track_id**: Reference to `tracks` (int8, NOT NULL)
- **race_results_id**: Reference to race result entries (int8, nullable)
- **sprint_results_id**: Reference to sprint result entries (int8, nullable)
- **qualifying_results_id**: Reference to qualifying result entries (int8, nullable)
- **free_practice_results_id**: Reference to free practice result entries (int8, nullable)
- **has_sprint**: Integer flag for sprint existence (int8, nullable)
- **has_x2**: Integer flag for double points or other multiplier (int8, default: 0)
- **full_race_results_id**: Reference to full race result entries (int8, nullable)
- **season_id**: Reference to `seasons` (int4, NOT NULL)

---

## 8. Race Result Entries

- **race_results_id**: Reference to gran_prix race results (int4, NOT NULL)
- **pilot_id**: Reference to `drivers` (int4, NOT NULL)
- **position**: Position in race (int4, NOT NULL)
- **fast_lap**: Boolean indicating fastest lap (default: false)
- **Primary Key**: Composite (race_results_id, pilot_id)

---

## 9. Sprint Result Entries

- **sprint_results_id**: Reference to gran_prix sprint results (int4, NOT NULL)
- **pilot_id**: Reference to `drivers` (int4, NOT NULL)
- **position**: Position in sprint (int4, NOT NULL)
- **fast_lap**: Boolean indicating fastest lap (default: false)
- **Unique Constraint**: (sprint_results_id, pilot_id)

---

## 10. Full Race Result Entries

- **race_results_id**: Reference to gran_prix full race results (int4, NOT NULL)
- **pilot_id**: Reference to `drivers` (int4, NOT NULL)
- **position**: Position in full race (int4, NOT NULL)
- **fast_lap**: Boolean indicating fastest lap (default: false)
- **Primary Key**: Composite (race_results_id, pilot_id)

---

## 11. Qualifying Result Entries

- **qualifying_results_id**: Reference to gran_prix qualifying results (int4, NOT NULL)
- **pilot_id**: Reference to `drivers` (int4, NOT NULL)
- **position**: Position in qualifying (int4, NOT NULL)
- **Primary Key**: Composite (qualifying_results_id, pilot_id)

---

## 12. Free Practice Result Entries

- **free_practice_results_id**: Reference to gran_prix free practice results (int4, NOT NULL)
- **pilot_id**: Reference to `drivers` (int4, NOT NULL)
- **position**: Position in free practice (int4, NOT NULL)
- **Primary Key**: Composite (free_practice_results_id, pilot_id)

---

## 13. Fanta

- **id**: Primary key (int4, auto-increment)
- **fanta_player_id**: Reference to `users` (int8, NOT NULL)
- **race_id**: Reference to a race event (int8, NOT NULL)
- **1_place_id** to **8_place_id**: Fantasy team positions (drivers, int8, NOT NULL)
- **fast_lap_id**: Fastest lap (driver id, int8, NOT NULL)
- **dnf_id**: Driver who did not finish (driver id, int8, NOT NULL)
- **season_id**: Reference to `seasons` (int4, NOT NULL)
- **team_id**: Reference to `teams` (int8, NOT NULL)

---

## 14. Drivers

- **id**: Primary key (int8)
- **username**: Unique username (text, NOT NULL)
- **name**: Driver's first name
- **surname**: Driver's surname
- **free_practice_points**: Points from free practice (int4, default: 0, NOT NULL)
- **qualifying_points**: Points from qualifying (int4, default: 0, NOT NULL)
- **race_points**: Points from races (int4, default: 0, NOT NULL)
- **pilot_id**: Reference to `pilots` (int8, nullable)
- **description**: Text description
- **consistency_pt**: Consistency points (int4)
- **fast_lap_pt**: Fastest lap points (int4)
- **dangerous_pt**: Dangerous driving points (int4)
- **ingenuity_pt**: Ingenuity points (int4)
- **strategy_pt**: Strategy points (int4)
- **color**: Color or team color
- **license_pt**: License points (int8, default: 3)
- **season**: Reference to `seasons` (int4, NOT NULL)

---

## 15. Constructors

- **id**: Primary key (int8)
- **name**: Constructor/team name (text, NOT NULL)
- **driver_id_1**: Reference to first driver in the constructor references `drivers(id)` (int8, nullable)
- **driver_id_2**: Reference to second driver in the constructor references `drivers(id)` (int8, nullable)
- **color**: Constructor team color (text, nullable)

---

## 16. Session Type

- **id**: Primary key (int8)
- **1_points** to **6_points**: Points assigned for each placement (int4, NOT NULL)
- **name**: Name of the session type (text, NOT NULL) - Race, Qualifying, etc.
- **fast_lap_points**: Points for fastest lap (int4, nullable)

---


## 17. User Sessions

- **id**: Primary key (serial4)
- **user_id**: Reference to `users (int4, nullable)
- **session_token**: Unique session token (VARCHAR 255, NOT NULL)
- **created_at**: Session creation timestamp (default: NOW())
- **last_activity**: Last activity timestamp (default: NOW())
- **expires_at**: Session expiration timestamp (NOT NULL)
- **ip_address**: Client IP address (INET type, nullable)
- **user_agent**: Client user agent string
- **is_active**: Boolean indicating if session is active (default: TRUE)

---

## Database Views

The database includes several important views for data analysis:

### 1. driver_grand_prix_points
Comprehensive view that aggregates points from all session types (Race, Sprint, Qualifying, Free Practice, Full Race) per driver per Grand Prix. Includes:
- Grand Prix details (ID, date, track name, season)
- Driver details (ID, name, username)
- Points breakdown by session type
- Total points calculation

### 2. driver_grand_prix_points_new
Extended version of driver_grand_prix_points with additional driver attributes:
- Driver statistics (license_pt, consistency_pt, fast_lap_pt, dangerous_pt, ingenuity_pt, strategy_pt)
- Car information (name, overall_score)
- Pilot information (name, surname)
- Session-specific point totals

### 3. season_driver_leaderboard
Season-wide leaderboard showing total points per driver:
- Season ID and driver information
- Total points across all Grand Prix in the season
- Ordered by season and total points

### 4. all_race_points
Comprehensive driver statistics view including:
- Driver and pilot information
- Car details
- Points from all session types
- Total points calculation across all sessions

### 5. all_race_points_v2
Simplified view showing race points by result type and driver.

---

## Relationships & Notes

- Result entry tables (race, sprint, qualifying, free practice, full race) store individual driver positions and results per session.
- `gran_prix` acts as a central event, linking to different result entry tables and tracks.
- The schema supports F1-style events with multiple session types per Grand Prix.
- Fantasy game logic is supported through `fanta` and `users` tables.
- Points logic is centralized in `session_type`, supporting flexible point assignment per session (1st through 6th place plus fast lap points).
- The design enables tracking performance and statistics for both real drivers and fantasy teams.
- **Constructor Teams**: The `constructors` table manages F1 team structures, linking two drivers per constructor with team branding (name and color).
- **Result Structure**: Instead of storing positions as separate columns, the new structure uses entry tables with position fields for better normalization.
- **Session Management**: Sessions are managed through the `user_sessions` table with automatic cleanup capabilities.
- **Data Integrity**: Foreign key constraints ensure data consistency across related tables.

---
