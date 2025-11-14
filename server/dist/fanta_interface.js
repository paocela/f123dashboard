var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
import { GenezioDeploy } from "@genezio/types";
import pg from "pg";
const { Pool } = pg;
let FantaService = (() => {
    let _classDecorators = [GenezioDeploy()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var FantaService = _classThis = class {
        constructor() {
            this.pool = new Pool({
                connectionString: process.env.RACEFORFEDERICA_DB_DATABASE_URL,
                ssl: true,
            });
        }
        /* All fanta vote */
        async getFantaVote(seasonId) {
            const result = await this.pool.query(`
      WITH latest_season AS (
        SELECT id FROM seasons ORDER BY start_date DESC LIMIT 1
      )
      SELECT
        fp_table.id AS fanta_player_id,
        f_table.race_id AS track_id,
        fp_table.username AS username,
        f_table."1_place_id" AS "id_1_place",
        f_table."2_place_id" AS "id_2_place",
        f_table."3_place_id" AS "id_3_place",
        f_table."4_place_id" AS "id_4_place",
        f_table."5_place_id" AS "id_5_place",
        f_table."6_place_id" AS "id_6_place",
        f_table."7_place_id" AS "id_7_place",
        f_table."8_place_id" AS "id_8_place",
        f_table."fast_lap_id" AS "id_fast_lap",
        f_table."dnf_id" AS "id_dnf",
        f_table."team_id" AS "constructor_id"
      FROM users fp_table
      JOIN fanta f_table ON fp_table.id = f_table.fanta_player_id
      CROSS JOIN latest_season ls
      WHERE f_table.season_id = COALESCE($1, ls.id)
      ORDER BY fp_table.id, f_table.race_id;
    `, [seasonId]);
            return result.rows;
        }
        async setFantaVoto(fantaVote) {
            try {
                // Validate input
                this.validateFantaVoto(fantaVote);
                // Get the season_id (use provided or get latest)
                let season_id = fantaVote.season_id;
                if (season_id == null || season_id == undefined) {
                    const seasonResult = await this.pool.query('SELECT id FROM seasons ORDER BY start_date DESC LIMIT 1');
                    season_id = seasonResult.rows[0]?.id;
                }
                const query = `
        INSERT INTO "fanta" (
          "fanta_player_id", "race_id", "1_place_id", "2_place_id", "3_place_id", 
          "4_place_id", "5_place_id", "6_place_id", "7_place_id", "8_place_id", 
          "fast_lap_id", "dnf_id", "season_id", "team_id"
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT ("fanta_player_id", "race_id", "season_id")
        DO UPDATE SET
          "1_place_id" = EXCLUDED."1_place_id",
          "2_place_id" = EXCLUDED."2_place_id",
          "3_place_id" = EXCLUDED."3_place_id",
          "4_place_id" = EXCLUDED."4_place_id",
          "5_place_id" = EXCLUDED."5_place_id",
          "6_place_id" = EXCLUDED."6_place_id",
          "7_place_id" = EXCLUDED."7_place_id",
          "8_place_id" = EXCLUDED."8_place_id",
          "fast_lap_id" = EXCLUDED."fast_lap_id",
          "dnf_id" = EXCLUDED."dnf_id",
          "season_id" = EXCLUDED."season_id",
          "team_id" = EXCLUDED."team_id"
      `;
                const values = [
                    fantaVote.fanta_player_id,
                    fantaVote.track_id,
                    fantaVote.id_1_place,
                    fantaVote.id_2_place,
                    fantaVote.id_3_place,
                    fantaVote.id_4_place,
                    fantaVote.id_5_place,
                    fantaVote.id_6_place,
                    fantaVote.id_7_place,
                    fantaVote.id_8_place,
                    fantaVote.id_fast_lap,
                    fantaVote.id_dnf,
                    season_id,
                    fantaVote.constructor_id
                ];
                await this.pool.query(query, values);
                console.log(`Successfully saved fanta vote for player ${fantaVote.fanta_player_id} on race ${fantaVote.track_id} for season ${fantaVote.season_id}`);
                return JSON.stringify({
                    success: true,
                    message: 'Fanta vote saved successfully'
                });
            }
            catch (error) {
                console.error('Error saving fanta vote:', error);
                throw new Error(`Failed to save fanta vote: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
        validateFantaVoto(fantavote) {
            // Validate required fields
            if (!fantavote.fanta_player_id || !fantavote.track_id)
                throw new Error('Fanta player ID and track ID are required');
            if (!fantavote.id_fast_lap)
                throw new Error('Fast lap driver ID is required');
            if (!fantavote.id_dnf)
                throw new Error('DNF driver ID is required');
            if (!fantavote.constructor_id)
                throw new Error("Constructor ID is required");
            // Validate that all 8 places are different (if provided)
            const places = [fantavote.id_1_place, fantavote.id_2_place, fantavote.id_3_place, fantavote.id_4_place, fantavote.id_5_place, fantavote.id_6_place, fantavote.id_7_place, fantavote.id_8_place]
                .filter(place => place !== null && place !== undefined);
            const uniquePlaces = new Set(places);
            if (places.length !== uniquePlaces.size) {
                throw new Error('All driver positions must be unique');
            }
        }
        validateFantaPlayer(username, name, surname, password) {
            // Validate required fields
            if (!username || !name || !surname || !password) {
                throw new Error('Username, name, surname, and password are required');
            }
            // Validate field types
            if (typeof username !== 'string' || typeof name !== 'string' ||
                typeof surname !== 'string' || typeof password !== 'string') {
                throw new Error('All player fields must be strings');
            }
            // Validate field lengths
            if (username.length < 3 || username.length > 50) {
                throw new Error('Username must be between 3 and 50 characters');
            }
            if (name.length < 1 || name.length > 50) {
                throw new Error('Name must be between 1 and 50 characters');
            }
            if (surname.length < 1 || surname.length > 50) {
                throw new Error('Surname must be between 1 and 50 characters');
            }
            if (password.length < 6) {
                throw new Error('Password must be at least 6 characters long');
            }
            // Validate username format (alphanumeric and underscore only)
            const usernameRegex = /^[a-zA-Z0-9_]+$/;
            if (!usernameRegex.test(username)) {
                throw new Error('Username can only contain letters, numbers, and underscores');
            }
        }
    };
    __setFunctionName(_classThis, "FantaService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        FantaService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return FantaService = _classThis;
})();
export { FantaService };
