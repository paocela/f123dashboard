# FantaService Documentation

## Overview

The `FantaService` class manages fantasy game functionality for the F123 Dashboard application. It handles fantasy player management and fantasy race predictions (votes) where users can predict race outcomes for each Grand Prix.

## Features

- Retrieve fantasy votes for all players
- Submit/update fantasy race predictions
- Create new fantasy players
- Input validation for fantasy operations
- Database persistence for fantasy data

## Database Connection

The service uses a PostgreSQL connection pool configured with:

- Connection string from `RACEFORFEDERICA_DB_DATABASE_URL` environment variable
- SSL enabled for secure connections

## Database Tables Used

- `fanta_player` - Fantasy player accounts
- `fanta` - Fantasy race predictions/votes

## Methods

### Constructor

```typescript
constructor()
```

Initializes the PostgreSQL connection pool with SSL enabled.

### Public Methods

#### `getFantaVote(): Promise<string>`

Retrieves all fantasy votes from all players for all races.

**Returns:**
- JSON string containing fantasy vote data

**Response Fields:**
- `fanta_player_id` - Fantasy player identifier
- `track_id` - Race/track identifier
- `username` - Player's username
- `id_1_place` - Predicted 1st place driver ID
- `id_2_place` - Predicted 2nd place driver ID
- `id_3_place` - Predicted 3rd place driver ID
- `id_4_place` - Predicted 4th place driver ID
- `id_5_place` - Predicted 5th place driver ID
- `id_6_place` - Predicted 6th place driver ID
- `id_fast_lap` - Predicted fastest lap driver ID
- `id_dnf` - Predicted DNF (Did Not Finish) driver ID

**Data Source:**
- Joins `fanta_player` and `fanta` tables
- Ordered by player ID and race ID

**Example Usage:**
```typescript
const fantaService = new FantaService();
const votesData = await fantaService.getFantaVote();
const votes = JSON.parse(votesData);
```

#### `setFantaVoto(parameters): Promise<string>`

Creates or updates a fantasy vote for a specific player and race.

**Parameters:**
- `fanta_player_id: number` - Fantasy player identifier
- `track_id: number` - Race/track identifier
- `id_1_place: number | null` - Predicted 1st place driver ID
- `id_2_place: number | null` - Predicted 2nd place driver ID
- `id_3_place: number | null` - Predicted 3rd place driver ID
- `id_4_place: number | null` - Predicted 4th place driver ID
- `id_5_place: number | null` - Predicted 5th place driver ID
- `id_6_place: number | null` - Predicted 6th place driver ID
- `id_fast_lap: number | null` - Predicted fastest lap driver ID
- `id_dnf: number | null` - Predicted DNF driver ID

**Returns:**
- JSON string containing operation result

**Database Operation:**
- Uses `INSERT ... ON CONFLICT ... DO UPDATE` for upsert functionality
- Conflict resolution based on `(fanta_player_id, race_id)` composite key
- Updates existing vote if combination already exists

**Validation:**
- Validates required fields (fanta_player_id, track_id)
- Ensures all position predictions are unique (no driver in multiple positions)
- Allows null values for optional predictions

**Success Response:**
```json
{
  "success": true,
  "message": "Fanta vote saved successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Failed to save fanta vote: [error details]"
}
```

**Example Usage:**
```typescript
const result = await fantaService.setFantaVoto(
  1,           // fanta_player_id
  5,           // track_id
  12,          // id_1_place
  8,           // id_2_place
  3,           // id_3_place
  15,          // id_4_place
  7,           // id_5_place
  2,           // id_6_place
  12,          // id_fast_lap
  9            // id_dnf
);
```

#### `setFantaPlayer(username: string, name: string, surname: string, password: string): Promise<string>`

Creates a new fantasy player account.

**Parameters:**
- `username: string` - Unique username (3-50 characters, alphanumeric + underscore)
- `name: string` - Player's first name (1-50 characters)
- `surname: string` - Player's last name (1-50 characters)
- `password: string` - Password (minimum 6 characters)

**Returns:**
- JSON string containing operation result

**Validation:**
- All fields are required and must be strings
- Username: 3-50 characters, alphanumeric and underscore only
- Name/Surname: 1-50 characters each
- Password: minimum 6 characters
- Username format validation with regex

**Success Response:**
```json
{
  "success": true,
  "message": "Fanta player created successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Failed to create fanta player: [error details]"
}
```

**Example Usage:**
```typescript
const result = await fantaService.setFantaPlayer(
  'john_doe',
  'John',
  'Doe',
  'password123'
);
```

### Private Methods

#### `validateFantaVoto(parameters): void`

Validates fantasy vote input parameters.

**Parameters:**
- `fanta_player_id: number` - Fantasy player identifier
- `track_id: number` - Race/track identifier
- `id_1_place: number | null` - through `id_6_place: number | null` - Position predictions

**Validation Rules:**
- Validates required fields (fanta_player_id, track_id)
- Ensures all position predictions are unique (no duplicates)
- Filters out null/undefined values before uniqueness check

**Throws:**
- `Error` - If validation fails

#### `validateFantaPlayer(parameters): void`

Validates fantasy player creation input.

**Parameters:**
- `username: string` - Username
- `name: string` - First name
- `surname: string` - Last name
- `password: string` - Password

**Validation Rules:**
- All fields are required
- All fields must be strings
- Username: 3-50 characters, alphanumeric and underscore only
- Name/Surname: 1-50 characters each
- Password: minimum 6 characters
- Username format validation with regex: `/^[a-zA-Z0-9_]+$/`

**Throws:**
- `Error` - If validation fails

## Error Handling

The service implements comprehensive error handling:

- All public methods return JSON responses with success/failure status
- Validation errors are caught and returned as structured error messages
- Database errors are logged to console and returned as generic error messages
- Input validation prevents invalid data from reaching the database

## Database Schema Requirements

### fanta_player Table
```sql
CREATE TABLE fanta_player (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(50) NOT NULL,
    surname VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    image VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    password_updated_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);
```

### fanta Table
```sql
CREATE TABLE fanta (
    id SERIAL PRIMARY KEY,
    fanta_player_id INTEGER NOT NULL REFERENCES fanta_player(id),
    race_id INTEGER NOT NULL,
    "1_place_id" INTEGER,
    "2_place_id" INTEGER,
    "3_place_id" INTEGER,
    "4_place_id" INTEGER,
    "5_place_id" INTEGER,
    "6_place_id" INTEGER,
    fast_lap_id INTEGER,
    dnf_id INTEGER,
    season INTEGER,
    UNIQUE(fanta_player_id, race_id)
);
```

## Usage Example

```typescript
const fantaService = new FantaService();

// Create a new fantasy player
const playerResult = await fantaService.setFantaPlayer(
  'racing_fan',
  'John',
  'Smith',
  'mypassword123'
);

if (JSON.parse(playerResult).success) {
  console.log('Player created successfully');
}

// Submit a fantasy vote
const voteResult = await fantaService.setFantaVoto(
  1,    // player ID
  3,    // race ID
  5,    // 1st place prediction
  12,   // 2nd place prediction
  8,    // 3rd place prediction
  3,    // 4th place prediction
  15,   // 5th place prediction
  7,    // 6th place prediction
  5,    // fastest lap prediction
  9     // DNF prediction
);

// Get all fantasy votes
const allVotes = await fantaService.getFantaVote();
const votes = JSON.parse(allVotes);
```

## Security Considerations

- Password is stored as plain text (consider implementing hashing)
- Input validation prevents SQL injection through parameterized queries
- Username format validation prevents malicious usernames
- SSL connection for secure database communication

## Performance Considerations

- Uses connection pooling for efficient database connections
- Upsert operation for vote updates is efficient
- Consider adding indexes on frequently queried columns
- Fantasy vote retrieval joins two tables - may be slow with large datasets

## Future Improvements

1. Implement password hashing for security
2. Add authentication/authorization checks
3. Implement rate limiting for vote submissions
4. Add vote submission deadlines
5. Implement points calculation based on actual race results
6. Add leaderboard functionality
7. Implement user session management
8. Add email validation for players
9. Implement fantasy league functionality
10. Add audit logging for vote changes

## Deployment

The service is deployed using the `@GenezioDeploy()` decorator and can be called from the client application through the Genezio SDK.
