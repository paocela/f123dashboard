# PostgresService Documentation

## Overview

The `PostgresService` class provides data access functionality for the F123 Dashboard application. It handles database queries for drivers, championships, tracks, race results, and user management through PostgreSQL database interactions.

## Features

- Driver statistics and leaderboard data
- Championship standings and race results
- Track information with best times
- Cumulative points tracking for trend analysis
- Race result management
- User data retrieval
- Season information

## Database Connection

The service uses a PostgreSQL connection pool configured with:

- Connection string from `RACEFORFEDERICA_DB_DATABASE_URL` environment variable
- SSL enabled for secure connections

## Methods

### Constructor

```typescript
constructor()
```

Initializes the PostgreSQL connection pool with SSL enabled.

### Public Methods

#### `getAllDrivers(): Promise<string>`

Retrieves comprehensive driver information including statistics and points.

**Returns:**
- JSON string containing driver data from the `all_race_points` view

**Response Fields:**
- `driver_id` - Unique driver identifier
- `driver_username` - Driver's username
- `driver_name` - Driver's first name
- `driver_surname` - Driver's last name
- `driver_description` - Driver description
- `driver_license_pt` - License points
- `driver_consistency_pt` - Consistency points
- `driver_fast_lap_pt` - Fast lap points
- `drivers_dangerous_pt` - Dangerous driving points
- `driver_ingenuity_pt` - Ingenuity points
- `driver_strategy_pt` - Strategy points
- `driver_color` - Driver's color/theme
- `pilot_name` - Associated pilot's name
- `pilot_surname` - Associated pilot's surname
- `car_name` - Car name
- `car_overall_score` - Car's overall score
- `total_sprint_points` - Total sprint points
- `total_free_practice_points` - Total free practice points
- `total_qualifying_points` - Total qualifying points
- `total_full_race_points` - Total full race points
- `total_race_points` - Total race points
- `total_points` - Grand total points

**Example Usage:**
```typescript
const driversData = await postgresService.getAllDrivers();
const drivers = JSON.parse(driversData);
```

#### `getChampionship(): Promise<string>`

Retrieves comprehensive championship data including all race results across different sessions.

**Returns:**
- JSON string containing championship data with race results

**Response Fields:**
- `track_name` - Name of the track
- `gran_prix_date` - Date of the Grand Prix
- `gran_prix_has_sprint` - Boolean indicating if sprint race exists
- `gran_prix_has_x2` - Boolean indicating double points
- `track_country` - Track's country location

**Race Results (for each session type):**
- `driver_[session]_[position]_place` - Driver username for each position (1-6)
- `driver_[session]_fast_lap` - Driver with fastest lap
- `[session]_dnf` - Did Not Finish drivers (comma-separated)

**Session Types:**
- `race` - Main race results
- `full_race` - Full race results
- `sprint` - Sprint race results
- `qualifying` - Qualifying results
- `free_practice` - Free practice results

**Example Usage:**
```typescript
const championshipData = await postgresService.getChampionship();
const championship = JSON.parse(championshipData);
```

#### `getCumulativePoints(): Promise<string>`

Retrieves cumulative points data for trend analysis and championship progression.

**Returns:**
- JSON string containing cumulative points data

**Response Fields:**
- `date` - Grand Prix date
- `track_name` - Track name
- `driver_id` - Driver identifier
- `driver_username` - Driver username
- `driver_color` - Driver's color for visualization
- `cumulative_points` - Running total of points up to this race

**Usage:**
Perfect for creating championship trend graphs showing how drivers' positions change over the season.

**Example Usage:**
```typescript
const cumulativeData = await postgresService.getCumulativePoints();
const trendData = JSON.parse(cumulativeData);
```

#### `getAllTracks(): Promise<string>`

Retrieves information about all tracks in the championship.

**Returns:**
- JSON string containing track information

**Response Fields:**
- `track_id` - Unique track identifier
- `name` - Track name
- `date` - Race date
- `has_sprint` - Boolean indicating sprint race
- `has_x2` - Boolean indicating double points
- `country` - Track country
- `besttime_driver_time` - Best lap time on the track
- `username` - Username of driver with best time

**Ordering:**
Results are ordered by date in ascending order.

**Example Usage:**
```typescript
const tracksData = await postgresService.getAllTracks();
const tracks = JSON.parse(tracksData);
```

#### `getRaceResoult(): Promise<string>`

*Note: This method appears to be incomplete in the source code.*

Retrieves race result information.

**Returns:**
- JSON string containing race results

#### `getUsers(): Promise<string>`

*Note: This method appears to be incomplete in the source code.*

Retrieves user information.

**Returns:**
- JSON string containing user data

#### `getAllSeasons(): Promise<string>`

*Note: This method appears to be incomplete in the source code.*

Retrieves season information.

**Returns:**
- JSON string containing season data

## Database Views and Tables Used

### Primary View: `all_race_points`

This view consolidates driver information with their performance statistics and is used by `getAllDrivers()`.

### Tables Used by `getChampionship()`:
- `gran_prix` - Grand Prix events
- `tracks` - Track information
- `race_result_entries` - Race results
- `full_race_result_entries` - Full race results
- `sprint_result_entries` - Sprint results
- `qualifying_result_entries` - Qualifying results
- `free_practice_result_entries` - Free practice results
- `drivers` - Driver information

### Tables Used by `getCumulativePoints()`:
- `driver_grand_prix_points` - Points per Grand Prix per driver
- `drivers` - Driver information for colors

## Error Handling

The service does not implement explicit error handling in the provided methods. Database errors will propagate as exceptions. Consider implementing try-catch blocks and returning error responses in JSON format for production use.

## Performance Considerations

- Uses connection pooling for efficient database connections
- Complex JOIN operations in `getChampionship()` may be slow with large datasets
- Consider adding indexes on frequently queried columns
- The `all_race_points` view should be optimized for performance

## Security

- Uses parameterized queries to prevent SQL injection
- SSL connection enabled for secure database communication
- Environment variable for database connection string

## Usage Example

```typescript
const postgresService = new PostgresService();

// Get all drivers with their statistics
const driversData = await postgresService.getAllDrivers();
const drivers = JSON.parse(driversData);

// Get championship standings
const championshipData = await postgresService.getChampionship();
const championship = JSON.parse(championshipData);

// Get cumulative points for trend analysis
const cumulativeData = await postgresService.getCumulativePoints();
const trendData = JSON.parse(cumulativeData);

// Get all tracks
const tracksData = await postgresService.getAllTracks();
const tracks = JSON.parse(tracksData);
```

## Database Schema Requirements

The service expects the following database structure:

### Core Tables:
- `drivers` - Driver information and statistics
- `tracks` - Track information
- `gran_prix` - Grand Prix events
- `[session]_result_entries` - Results for each session type

### Views:
- `all_race_points` - Consolidated driver statistics
- `driver_grand_prix_points` - Points per Grand Prix per driver

## Deployment

The service is deployed using the `@GenezioDeploy()` decorator and can be called from the client application through the Genezio SDK.

## Future Improvements

1. Add comprehensive error handling
2. Implement input validation for future methods
3. Add logging for debugging
4. Optimize complex queries for better performance
5. Complete implementation of incomplete methods
6. Add pagination for large datasets
7. Implement caching for frequently accessed data
