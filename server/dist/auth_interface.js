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
import { createHash, randomBytes } from "crypto";
import jwt from "jsonwebtoken";
import { EmailService } from "./mail_interfaces";
import { getPasswordResetEmailTemplate } from "./email_templates";
const { Pool } = pg;
let AuthService = (() => {
    let _classDecorators = [GenezioDeploy()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AuthService = _classThis = class {
        constructor() {
            this.pool = new Pool({
                connectionString: process.env.RACEFORFEDERICA_DB_DATABASE_URL,
                ssl: true,
            });
            if (!process.env.JWT_SECRET) {
                throw new Error('JWT_SECRET environment variable is required');
            }
            this.jwtSecret = process.env.JWT_SECRET;
        }
        async getUsers() {
            const result = await this.pool.query(`
  SELECT id, username, name, surname, password, mail, encode(image, 'escape') as image
  FROM users;
    `);
            return result.rows;
        }
        async cleanupExpiredSessions() {
            try {
                await this.cleanExpiredSessions();
                return {
                    success: true,
                    message: 'Sessioni scadute pulite con successo'
                };
            }
            catch (error) {
                console.error('Cleanup expired sessions error:', error);
                return {
                    success: false,
                    message: 'Si è verificato un errore durante la pulizia delle sessioni scadute'
                };
            }
        }
        async login(loginData) {
            try {
                this.validateLoginInput(loginData.username, loginData.password);
                // Get user from database
                const result = await this.pool.query('SELECT id, username, name, surname, password, mail, encode(image, \'escape\') as image, is_active, is_admin FROM users WHERE username = $1', [loginData.username]);
                if (result.rows.length === 0) {
                    return {
                        success: false,
                        message: 'Nome utente o password non validi'
                    };
                }
                const user = result.rows[0];
                // Check if user account is active
                if (!user.is_active) {
                    return {
                        success: false,
                        message: 'Account disabilitato'
                    };
                }
                // Verify password
                const isPasswordValid = this.comparePassword(loginData.password, user.password);
                if (!isPasswordValid) {
                    return {
                        success: false,
                        message: 'Nome utente o password non validi'
                    };
                }
                // Create session and get JWT token
                const jwtToken = await this.createSession(user.id, loginData.userAgent);
                // Update last login
                await this.pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);
                return {
                    success: true,
                    message: 'Login effettuato con successo',
                    user: {
                        id: user.id,
                        username: user.username,
                        name: user.name,
                        surname: user.surname,
                        mail: user.mail,
                        image: user.image,
                        isAdmin: user.is_admin
                    },
                    token: jwtToken
                };
            }
            catch (error) {
                console.error('Login error:', error);
                return {
                    success: false,
                    message: 'Si è verificato un errore durante il login'
                };
            }
        }
        async register(request) {
            try {
                const { username, name, surname, password, mail, image } = request;
                //onst userAgent = request.headers['user-agent'];
                // Validate input
                this.validateRegisterInput(request);
                // Check if username already exists
                const existingUser = await this.pool.query('SELECT username FROM users WHERE username = $1', [username]);
                if (existingUser.rows.length > 0) {
                    return {
                        success: false,
                        message: 'Nome utente già esistente'
                    };
                }
                // Check if email already exists
                const existingEmail = await this.pool.query('SELECT mail FROM users WHERE mail = $1', [mail]);
                if (existingEmail.rows.length > 0) {
                    return {
                        success: false,
                        message: 'Email già esistente'
                    };
                }
                // Hash password
                const hashedPassword = this.hashPassword(password);
                // Insert new user
                const result = await this.pool.query('INSERT INTO users (username, name, surname, password, mail, image, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING id, username, name, surname, mail, image', [username, name, surname, hashedPassword, mail, image || null]);
                const newUser = result.rows[0];
                // Create session and get JWT token
                const jwtToken = await this.createSession(newUser.id, undefined);
                return {
                    success: true,
                    message: 'Registrazione completata con successo',
                    user: {
                        id: newUser.id,
                        username: newUser.username,
                        name: newUser.name,
                        surname: newUser.surname,
                        mail: newUser.mail,
                        image: image
                    },
                    token: jwtToken
                };
            }
            catch (error) {
                console.error('Registration error:', error);
                // Handle validation errors with specific status codes
                if (error instanceof Error) {
                    if (error.message.includes('obbligatori') ||
                        error.message.includes('deve') ||
                        error.message.includes('caratteri') ||
                        error.message.includes('email valido') ||
                        error.message.includes('contenere')) {
                        return {
                            success: false,
                            message: error.message
                        };
                    }
                }
                return {
                    success: false,
                    message: 'Si è verificato un errore durante la registrazione'
                };
            }
        }
        async validateToken(jwtToken) {
            try {
                const sessionData = await this.validateSession(jwtToken);
                if (!sessionData.valid) {
                    return { valid: false };
                }
                return {
                    valid: true,
                    userId: sessionData.userId,
                    username: sessionData.username,
                    name: sessionData.name,
                    surname: sessionData.surname,
                    mail: sessionData.mail,
                    image: sessionData.image,
                    isAdmin: sessionData.isAdmin
                };
            }
            catch (error) {
                console.error('Token validation error:', error);
                return { valid: false };
            }
        }
        async changePassword(changeData) {
            try {
                this.validateChangePasswordInput(changeData.currentPassword, changeData.newPassword);
                // Validate JWT token
                const sessionData = await this.validateSession(changeData.jwtToken);
                if (!sessionData.valid) {
                    return {
                        success: false,
                        message: 'Sessione non valida'
                    };
                }
                // Get current user
                const result = await this.pool.query('SELECT password FROM users WHERE id = $1', [sessionData.userId]);
                if (result.rows.length === 0) {
                    return {
                        success: false,
                        message: 'Utente non trovato'
                    };
                }
                // Verify current password
                const isCurrentPasswordValid = this.comparePassword(changeData.currentPassword, result.rows[0].password);
                if (!isCurrentPasswordValid) {
                    return {
                        success: false,
                        message: 'Password corrente errata'
                    };
                }
                // Hash new password
                const hashedNewPassword = this.hashPassword(changeData.newPassword);
                // Update password
                await this.pool.query('UPDATE users SET password = $1, password_updated_at = NOW() WHERE id = $2', [hashedNewPassword, sessionData.userId]);
                // Invalidate all sessions for this user (force re-login)
                await this.pool.query('UPDATE user_sessions SET is_active = FALSE WHERE user_id = $1', [sessionData.userId]);
                return {
                    success: true,
                    message: 'Password modificata con successo'
                };
            }
            catch (error) {
                console.error('Change password error:', error);
                return {
                    success: false,
                    message: 'Si è verificato un errore durante la modifica della password'
                };
            }
        }
        async adminChangePassword(changeData) {
            try {
                // Validate JWT token and check if user is admin
                const sessionData = await this.validateSession(changeData.jwtToken);
                if (!sessionData.valid) {
                    console.error('Admin change password: Invalid session');
                    return false;
                }
                // Check if user is admin
                if (!sessionData.isAdmin) {
                    console.error('Admin change password: User is not admin');
                    return false;
                }
                // Validate new password
                this.validateNewPassword(changeData.newPassword);
                // Check if target user exists and get their ID and email
                const userResult = await this.pool.query('SELECT id, username, name, surname, mail FROM users WHERE username = $1', [changeData.userName]);
                if (userResult.rows.length === 0) {
                    console.error('Admin change password: Target user not found');
                    return false;
                }
                const targetUser = userResult.rows[0];
                const targetUserId = targetUser.id;
                // Hash new password
                const hashedNewPassword = this.hashPassword(changeData.newPassword);
                // Update password
                await this.pool.query('UPDATE users SET password = $1, password_updated_at = NOW() WHERE id = $2', [hashedNewPassword, targetUserId]);
                // Invalidate all sessions for the target user (force re-login)
                await this.pool.query('UPDATE user_sessions SET is_active = FALSE WHERE user_id = $1', [targetUserId]);
                // Send email notification if user has email
                if (targetUser.mail && targetUser.mail.trim() !== '') {
                    try {
                        const emailService = new EmailService();
                        // Generate email template using the email templates module
                        const { html, text } = getPasswordResetEmailTemplate({
                            username: targetUser.username,
                            name: targetUser.name,
                            surname: targetUser.surname
                        }, changeData.newPassword);
                        await emailService.sendGmailEmail(targetUser.mail, 'Password Modificata - Race for Federica', html, text);
                        console.log(`Password reset email sent to ${targetUser.username} (${targetUser.mail})`);
                    }
                    catch (emailError) {
                        console.error('Failed to send password reset email:', emailError);
                        // Don't fail the password change if email fails
                    }
                }
                return true;
            }
            catch (error) {
                console.error('Admin change password error:', error);
                return false;
            }
        }
        async refreshToken(oldJwtToken, userAgent) {
            try {
                const sessionData = await this.validateSession(oldJwtToken);
                if (!sessionData.valid) {
                    return {
                        success: false,
                        message: 'Sessione non valida'
                    };
                }
                // Generate new JWT token
                const newJwtToken = this.generateJWTToken(sessionData.userId, sessionData.username);
                // Update session in database with new activity
                await this.pool.query('UPDATE user_sessions SET last_activity = NOW() WHERE user_id = $1 AND is_active = TRUE', [sessionData.userId]);
                return {
                    success: true,
                    token: newJwtToken,
                    message: 'Token aggiornato con successo'
                };
            }
            catch (error) {
                console.error('Refresh token error:', error);
                return {
                    success: false,
                    message: 'Si è verificato un errore durante l\'aggiornamento del token'
                };
            }
        }
        async logout(jwtToken) {
            try {
                await this.invalidateSession(jwtToken);
                return {
                    success: true,
                    message: 'Disconnessione effettuata con successo'
                };
            }
            catch (error) {
                console.error('Logout error:', error);
                return {
                    success: false,
                    message: 'Si è verificato un errore durante la disconnessione'
                };
            }
        }
        async logoutAllSessions(jwtToken) {
            try {
                const sessionData = await this.validateSession(jwtToken);
                if (!sessionData.valid) {
                    return {
                        success: false,
                        message: 'Sessione non valida'
                    };
                }
                // Invalidate all sessions for this user
                await this.pool.query('UPDATE user_sessions SET is_active = FALSE WHERE user_id = $1', [sessionData.userId]);
                return {
                    success: true,
                    message: 'Tutte le sessioni sono state disconnesse con successo'
                };
            }
            catch (error) {
                console.error('Logout all sessions error:', error);
                return {
                    success: false,
                    message: 'Si è verificato un errore durante la disconnessione di tutte le sessioni'
                };
            }
        }
        async getUserSessions(jwtToken) {
            try {
                const sessionData = await this.validateSession(jwtToken);
                if (!sessionData.valid) {
                    return {
                        success: false,
                        message: 'Sessione non valida'
                    };
                }
                const result = await this.pool.query(`SELECT session_token, created_at, last_activity, expires_at, is_active
         FROM user_sessions 
         WHERE user_id = $1 AND is_active = TRUE
         ORDER BY last_activity DESC`, [sessionData.userId]);
                return {
                    success: true,
                    sessions: result.rows.map(session => ({
                        sessionToken: session.session_token,
                        createdAt: session.created_at,
                        lastActivity: session.last_activity,
                        expiresAt: session.expires_at,
                        isActive: session.is_active,
                        isCurrent: true // Since we're using JWT, we can't easily identify the current session
                    }))
                };
            }
            catch (error) {
                console.error('Get user sessions error:', error);
                return {
                    success: false,
                    message: 'Si è verificato un errore durante il recupero delle sessioni'
                };
            }
        }
        async updateUserInfo(request) {
            try {
                const { jwt, name, surname, mail, image } = request;
                if (!jwt) {
                    return {
                        success: false,
                        message: 'Token JWT è obbligatorio'
                    };
                }
                // Validate JWT token
                const sessionData = await this.validateSession(jwt);
                if (!sessionData.valid) {
                    return {
                        success: false,
                        message: 'Sessione non valida'
                    };
                }
                // Build updates object from provided fields
                const updates = {
                    name,
                    surname,
                    mail,
                    image
                };
                // Validate updates
                this.validateUpdateUserInfoInput(updates);
                // If email is being updated, check if it already exists
                if (mail) {
                    const existingEmail = await this.pool.query('SELECT id FROM users WHERE mail = $1 AND id != $2', [mail, sessionData.userId]);
                    if (existingEmail.rows.length > 0) {
                        return {
                            success: false,
                            message: 'Email già esistente'
                        };
                    }
                }
                // Build dynamic query
                const updateFields = [];
                const values = [];
                let parameterIndex = 1;
                if (name !== undefined) {
                    updateFields.push(`name = $${parameterIndex}`);
                    values.push(name);
                    parameterIndex++;
                }
                if (surname !== undefined) {
                    updateFields.push(`surname = $${parameterIndex}`);
                    values.push(surname);
                    parameterIndex++;
                }
                if (mail !== undefined) {
                    updateFields.push(`mail = $${parameterIndex}`);
                    values.push(mail);
                    parameterIndex++;
                }
                if (image !== undefined) {
                    updateFields.push(`image = $${parameterIndex}`);
                    values.push(image);
                    parameterIndex++;
                }
                // If no fields to update
                if (updateFields.length === 0) {
                    return {
                        success: false,
                        message: 'Nessun campo valido da aggiornare'
                    };
                }
                // Add user ID to values
                values.push(sessionData.userId);
                // Execute update query
                const query = `
        UPDATE users 
        SET ${updateFields.join(', ')} 
        WHERE id = $${parameterIndex} 
        RETURNING id, username, name, surname, mail, encode(image, 'escape') as image, is_admin
      `;
                const result = await this.pool.query(query, values);
                if (result.rows.length === 0) {
                    return {
                        success: false,
                        message: 'Utente non trovato'
                    };
                }
                const updatedUser = result.rows[0];
                return {
                    success: true,
                    message: 'Informazioni utente aggiornate con successo',
                    user: {
                        id: updatedUser.id,
                        username: updatedUser.username,
                        name: updatedUser.name,
                        surname: updatedUser.surname,
                        mail: updatedUser.mail,
                        image: updatedUser.image,
                        isAdmin: updatedUser.is_admin
                    }
                };
            }
            catch (error) {
                console.error('Update user info error:', error);
                // Handle validation errors
                if (error instanceof Error) {
                    if (error.message.includes('obbligatori') ||
                        error.message.includes('deve') ||
                        error.message.includes('caratteri') ||
                        error.message.includes('email valido') ||
                        error.message.includes('contenere')) {
                        return {
                            success: false,
                            message: error.message
                        };
                    }
                }
                return {
                    success: false,
                    message: 'Si è verificato un errore durante l\'aggiornamento delle informazioni utente'
                };
            }
        }
        hashPassword(password) {
            return createHash('sha256').update(password).digest('hex');
        }
        comparePassword(password, hashedPassword) {
            return this.hashPassword(password) === hashedPassword;
        }
        sanitizeUserAgent(userAgent) {
            if (!userAgent)
                return undefined;
            // Limit user agent length to prevent database issues
            const maxLength = 500;
            return userAgent.length > maxLength ? userAgent.substring(0, maxLength) : userAgent;
        }
        generateSessionToken() {
            return randomBytes(32).toString('hex');
        }
        generateJWTToken(userId, username) {
            return jwt.sign({
                userId: userId,
                username: username
            }, this.jwtSecret, { expiresIn: AuthService.TOKEN_EXPIRY_JWT });
        }
        async createSession(userId, userAgent) {
            const sessionToken = this.generateSessionToken();
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + AuthService.TOKEN_EXPIRY_DAYS); // 7 days from now
            // Generate JWT token
            const user = await this.pool.query('SELECT username FROM users WHERE id = $1', [userId]);
            const jwtToken = this.generateJWTToken(userId, user.rows[0].username);
            // Sanitize user agent for database storage
            const sanitizedUserAgent = this.sanitizeUserAgent(userAgent);
            await this.pool.query(`INSERT INTO user_sessions (user_id, session_token, expires_at, ip_address, user_agent) 
       VALUES ($1, $2, $3, $4, $5)`, [userId, sessionToken, expiresAt, null, sanitizedUserAgent || null]);
            return jwtToken;
        }
        async validateSession(jwtToken) {
            try {
                // Verify JWT token
                const decoded = jwt.verify(jwtToken, this.jwtSecret);
                // Check if user still exists and is active
                const result = await this.pool.query('SELECT id, username, is_active, name, surname, mail, encode(image, \'escape\') as image, is_admin FROM users WHERE id = $1', [decoded.userId]);
                if (result.rows.length === 0) {
                    return { valid: false };
                }
                const user = result.rows[0];
                // Check if user account is active
                if (!user.is_active) {
                    return { valid: false };
                }
                // Check if there's an active session for this user
                const sessionResult = await this.pool.query(`SELECT session_token, expires_at, is_active 
         FROM user_sessions 
         WHERE user_id = $1 AND is_active = TRUE 
         ORDER BY last_activity DESC 
         LIMIT 1`, [decoded.userId]);
                if (sessionResult.rows.length === 0) {
                    return { valid: false };
                }
                const session = sessionResult.rows[0];
                // Check if session is expired
                if (new Date() > new Date(session.expires_at)) {
                    // Clean up expired session
                    await this.pool.query('UPDATE user_sessions SET is_active = FALSE WHERE user_id = $1', [decoded.userId]);
                    return { valid: false };
                }
                // Update last activity for the most recent session
                await this.pool.query('UPDATE user_sessions SET last_activity = NOW() WHERE session_token = $1', [session.session_token]);
                return {
                    valid: true,
                    userId: user.id,
                    username: user.username,
                    name: user.name,
                    surname: user.surname,
                    mail: user.mail,
                    image: user.image,
                    isAdmin: user.is_admin
                };
            }
            catch (error) {
                console.error('Token validation error:', error);
                return { valid: false };
            }
        }
        async invalidateSession(jwtToken) {
            try {
                // Decode JWT to get user ID
                const decoded = jwt.verify(jwtToken, this.jwtSecret);
                // Invalidate all sessions for this user
                await this.pool.query('UPDATE user_sessions SET is_active = FALSE WHERE user_id = $1', [decoded.userId]);
            }
            catch (error) {
                console.error('Error invalidating session:', error);
            }
        }
        async cleanExpiredSessions() {
            // Mark expired sessions as inactive
            await this.pool.query('UPDATE user_sessions SET is_active = FALSE WHERE expires_at < NOW() AND is_active = TRUE');
            // Delete very old sessions (older than 30 days) to prevent database bloat
            await this.pool.query('DELETE FROM user_sessions WHERE created_at < NOW() - INTERVAL \'30 days\'');
        }
        validateLoginInput(username, password) {
            if (!username || !password) {
                throw new Error('Nome utente e password sono obbligatori');
            }
            if (typeof username !== 'string' || typeof password !== 'string') {
                throw new Error('Nome utente e password devono essere stringhe');
            }
        }
        validateRegisterInput(registerData) {
            const { username, name, surname, password, mail, image } = registerData;
            if (!username || !name || !surname || !password || !mail || !image) {
                throw new Error('Tutti i campi sono obbligatori inclusa l\'immagine del profilo');
            }
            if (username.length < 3 || username.length > 30) {
                throw new Error('Il nome utente deve contenere tra 3 e 30 caratteri');
            }
            if (password.length < 8) {
                throw new Error('La password deve contenere almeno 8 caratteri');
            }
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(mail)) {
                throw new Error('Inserire un indirizzo email valido');
            }
            // Image validation
            if (image.length > 5000000) { // 5MB limit
                throw new Error('Dimensione immagine troppo grande (massimo 5MB)');
            }
            // Check if image is a valid base64 string
            const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
            let cleanImage = image;
            // Remove data URL prefix if present
            if (image.startsWith('data:')) {
                const commaIndex = image.indexOf(',');
                if (commaIndex !== -1) {
                    cleanImage = image.substring(commaIndex + 1);
                }
            }
            if (!base64Regex.test(cleanImage)) {
                throw new Error('Formato immagine non valido. Fornire un\'immagine codificata in base64 valida');
            }
            // Password strength validation
            const hasUpperCase = /[A-Z]/.test(password);
            const hasLowerCase = /[a-z]/.test(password);
            const hasNumbers = /\d/.test(password);
            if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
                throw new Error('La password deve contenere almeno una lettera maiuscola, una lettera minuscola e un numero');
            }
            // Username format validation
            const usernameRegex = /^[a-zA-Z0-9_]+$/;
            if (!usernameRegex.test(username)) {
                throw new Error('Il nome utente può contenere solo lettere, numeri e underscore');
            }
        }
        validateChangePasswordInput(currentPassword, newPassword) {
            if (!currentPassword || !newPassword) {
                throw new Error('Password corrente e nuova password sono obbligatorie');
            }
            if (newPassword.length < 8) {
                throw new Error('La nuova password deve contenere almeno 8 caratteri');
            }
            if (currentPassword === newPassword) {
                throw new Error('La nuova password deve essere diversa dalla password corrente');
            }
            // Password strength validation for new password
            const hasUpperCase = /[A-Z]/.test(newPassword);
            const hasLowerCase = /[a-z]/.test(newPassword);
            const hasNumbers = /\d/.test(newPassword);
            if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
                throw new Error('La nuova password deve contenere almeno una lettera maiuscola, una lettera minuscola e un numero');
            }
        }
        validateNewPassword(newPassword) {
            if (!newPassword) {
                throw new Error('La nuova password è obbligatoria');
            }
            if (newPassword.length < 8) {
                throw new Error('La nuova password deve contenere almeno 8 caratteri');
            }
        }
        validateUpdateUserInfoInput(updates) {
            // Check if at least one field is provided
            if (!updates || Object.keys(updates).length === 0) {
                throw new Error('At least one field must be provided for update');
            }
            // Validate name if provided
            if (updates.name !== undefined) {
                if (typeof updates.name !== 'string') {
                    throw new Error('Name must be a string');
                }
                if (updates.name.trim().length === 0) {
                    throw new Error('Name cannot be empty');
                }
                if (updates.name.length > 50) {
                    throw new Error('Name must be 50 characters or less');
                }
            }
            // Validate surname if provided
            if (updates.surname !== undefined) {
                if (typeof updates.surname !== 'string') {
                    throw new Error('Surname must be a string');
                }
                if (updates.surname.trim().length === 0) {
                    throw new Error('Surname cannot be empty');
                }
                if (updates.surname.length > 50) {
                    throw new Error('Surname must be 50 characters or less');
                }
            }
            // Validate email if provided
            if (updates.mail !== undefined) {
                if (typeof updates.mail !== 'string') {
                    throw new Error('Email must be a string');
                }
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(updates.mail)) {
                    throw new Error('Please enter a valid email address');
                }
            }
            // Validate image if provided
            if (updates.image !== undefined) {
                if (typeof updates.image !== 'string') {
                    throw new Error('Image must be a string');
                }
                if (updates.image.length > 5000000) { // 5MB limit
                    throw new Error('Image size is too large (max 5MB)');
                }
                // Check if image is a valid base64 string
                const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
                let cleanImage = updates.image;
                // Remove data URL prefix if present
                if (updates.image.startsWith('data:')) {
                    const commaIndex = updates.image.indexOf(',');
                    if (commaIndex !== -1) {
                        cleanImage = updates.image.substring(commaIndex + 1);
                    }
                }
                if (!base64Regex.test(cleanImage)) {
                    throw new Error('Invalid image format. Please provide a valid base64 encoded image');
                }
            }
        }
    };
    __setFunctionName(_classThis, "AuthService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AuthService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
    })();
    _classThis.TOKEN_EXPIRY_DAYS = 7;
    _classThis.TOKEN_EXPIRY_JWT = '7d';
    (() => {
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AuthService = _classThis;
})();
export { AuthService };
