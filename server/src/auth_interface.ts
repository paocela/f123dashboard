import { GenezioDeploy } from "@genezio/types";
import pg from "pg";
import { createHash, randomBytes } from "crypto";
import jwt from "jsonwebtoken";
const { Pool } = pg;

@GenezioDeploy()
export class AuthService {
  private pool: pg.Pool;
  private jwtSecret: string;
  private static readonly TOKEN_EXPIRY_DAYS = 7;
  private static readonly TOKEN_EXPIRY_JWT = '7d';

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

  private hashPassword(password: string): string {
    return createHash('sha256').update(password).digest('hex');
  }

  private comparePassword(password: string, hashedPassword: string): boolean {
    return this.hashPassword(password) === hashedPassword;
  }

  private sanitizeUserAgent(userAgent?: string): string | undefined {
    if (!userAgent) return undefined;
    
    // Limit user agent length to prevent database issues
    const maxLength = 500;
    return userAgent.length > maxLength ? userAgent.substring(0, maxLength) : userAgent;
  }

  private generateSessionToken(): string {
    return randomBytes(32).toString('hex');
  }

  private generateJWTToken(userId: number, username: string): string {
    return jwt.sign(
      { 
        userId: userId, 
        username: username 
      },
      this.jwtSecret,
      { expiresIn: AuthService.TOKEN_EXPIRY_JWT }
    );
  }

  private async createSession(userId: number, userAgent?: string): Promise<string> {
    const sessionToken = this.generateSessionToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + AuthService.TOKEN_EXPIRY_DAYS); // 7 days from now

    // Generate JWT token
    const user = await this.pool.query(
      'SELECT username FROM fanta_player WHERE id = $1',
      [userId]
    );
    
    const jwtToken = this.generateJWTToken(userId, user.rows[0].username);

    // Sanitize user agent for database storage
    const sanitizedUserAgent = this.sanitizeUserAgent(userAgent);

    await this.pool.query(
      `INSERT INTO user_sessions (user_id, session_token, expires_at, ip_address, user_agent) 
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, sessionToken, expiresAt, null, sanitizedUserAgent || null]
    );

    return jwtToken;
  }

  private async validateSession(jwtToken: string): Promise<{ valid: boolean; userId?: number; username?: string }> {
    try {
      // Verify JWT token
      const decoded = jwt.verify(jwtToken, this.jwtSecret) as any;
      
      // Check if user still exists and is active
      const result = await this.pool.query(
        'SELECT id, username, is_active FROM fanta_player WHERE id = $1',
        [decoded.userId]
      );

      if (result.rows.length === 0) {
        return { valid: false };
      }

      const user = result.rows[0];

      // Check if user account is active
      if (!user.is_active) {
        return { valid: false };
      }

      // Check if there's an active session for this user
      const sessionResult = await this.pool.query(
        `SELECT session_token, expires_at, is_active 
         FROM user_sessions 
         WHERE user_id = $1 AND is_active = TRUE 
         ORDER BY last_activity DESC 
         LIMIT 1`,
        [decoded.userId]
      );

      if (sessionResult.rows.length === 0) {
        return { valid: false };
      }

      const session = sessionResult.rows[0];

      // Check if session is expired
      if (new Date() > new Date(session.expires_at)) {
        // Clean up expired session
        await this.pool.query(
          'UPDATE user_sessions SET is_active = FALSE WHERE user_id = $1',
          [decoded.userId]
        );
        return { valid: false };
      }

      // Update last activity for the most recent session
      await this.pool.query(
        'UPDATE user_sessions SET last_activity = NOW() WHERE session_token = $1',
        [session.session_token]
      );

      return {
        valid: true,
        userId: decoded.userId,
        username: decoded.username
      };

    } catch (error) {
      console.error('Token validation error:', error);
      return { valid: false };
    }
  }

  private async invalidateSession(jwtToken: string): Promise<void> {
    try {
      // Decode JWT to get user ID
      const decoded = jwt.verify(jwtToken, this.jwtSecret) as any;
      
      // Invalidate all sessions for this user
      await this.pool.query(
        'UPDATE user_sessions SET is_active = FALSE WHERE user_id = $1',
        [decoded.userId]
      );
    } catch (error) {
      console.error('Error invalidating session:', error);
    }
  }

  private async cleanExpiredSessions(): Promise<void> {
    // Mark expired sessions as inactive
    await this.pool.query(
      'UPDATE user_sessions SET is_active = FALSE WHERE expires_at < NOW() AND is_active = TRUE'
    );
    
    // Delete very old sessions (older than 30 days) to prevent database bloat
    await this.pool.query(
      'DELETE FROM user_sessions WHERE created_at < NOW() - INTERVAL \'30 days\''
    );
  }

  async cleanupExpiredSessions(): Promise<string> {
    try {
      await this.cleanExpiredSessions();
      
      return JSON.stringify({
        success: true,
        message: 'Expired sessions cleaned up successfully'
      });

    } catch (error) {
      console.error('Cleanup expired sessions error:', error);
      return JSON.stringify({
        success: false,
        message: 'An error occurred while cleaning up expired sessions'
      });
    }
  }

  async login(username: string, password: string, userAgent?: string): Promise<string> {
    try {
      this.validateLoginInput(username, password);

      // Get user from database
      const result = await this.pool.query(
        'SELECT id, username, name, surname, password, is_active FROM fanta_player WHERE username = $1',
        [username]
      );

      if (result.rows.length === 0) {
        return JSON.stringify({
          success: false,
          message: 'Invalid username or password'
        });
      }

      const user = result.rows[0];

      // Check if user account is active
      if (!user.is_active) {
        return JSON.stringify({
          success: false,
          message: 'Account is disabled'
        });
      }
      
      // Verify password
      const isPasswordValid = this.comparePassword(password, user.password);
      
      if (!isPasswordValid) {
        return JSON.stringify({
          success: false,
          message: 'Invalid username or password'
        });
      }

      // Create session and get JWT token
      const jwtToken = await this.createSession(user.id, userAgent);

      // Update last login
      await this.pool.query(
        'UPDATE fanta_player SET last_login = NOW() WHERE id = $1',
        [user.id]
      );

      return JSON.stringify({
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          surname: user.surname
        },
        token: jwtToken
      });

    } catch (error) {
      console.error('Login error:', error);
      return JSON.stringify({
        success: false,
        message: 'An error occurred during login'
      });
    }
  }

  async register(username: string, name: string, surname: string, password: string, userAgent?: string): Promise<string> {
    try {
      this.validateRegisterInput(username, name, surname, password);

      // Check if username already exists
      const existingUser = await this.pool.query(
        'SELECT username FROM fanta_player WHERE username = $1',
        [username]
      );

      if (existingUser.rows.length > 0) {
        return JSON.stringify({
          success: false,
          message: 'Username already exists'
        });
      }

      // Hash password
      const hashedPassword = this.hashPassword(password);

      // Insert new user
      const result = await this.pool.query(
        'INSERT INTO fanta_player (username, name, surname, password, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id, username, name, surname',
        [username, name, surname, hashedPassword]
      );

      const newUser = result.rows[0];

      // Create session and get JWT token
      const jwtToken = await this.createSession(newUser.id, userAgent);

      return JSON.stringify({
        success: true,
        message: 'Registration successful',
        user: {
          id: newUser.id,
          username: newUser.username,
          name: newUser.name,
          surname: newUser.surname
        },
        token: jwtToken
      });

    } catch (error) {
      console.error('Registration error:', error);
      return JSON.stringify({
        success: false,
        message: 'An error occurred during registration'
      });
    }
  }

  async validateToken(jwtToken: string): Promise<string> {
    try {
      const sessionData = await this.validateSession(jwtToken);
      
      if (!sessionData.valid) {
        return JSON.stringify({ valid: false });
      }

      return JSON.stringify({
        valid: true,
        userId: sessionData.userId,
        username: sessionData.username
      });

    } catch (error) {
      console.error('Token validation error:', error);
      return JSON.stringify({ valid: false });
    }
  }

  async changePassword(jwtToken: string, currentPassword: string, newPassword: string): Promise<string> {
    try {
      this.validateChangePasswordInput(currentPassword, newPassword);

      // Validate JWT token
      const sessionData = await this.validateSession(jwtToken);
      
      if (!sessionData.valid) {
        return JSON.stringify({
          success: false,
          message: 'Invalid session'
        });
      }

      // Get current user
      const result = await this.pool.query(
        'SELECT password FROM fanta_player WHERE id = $1',
        [sessionData.userId]
      );

      if (result.rows.length === 0) {
        return JSON.stringify({
          success: false,
          message: 'User not found'
        });
      }

      // Verify current password
      const isCurrentPasswordValid = this.comparePassword(
        currentPassword, 
        result.rows[0].password
      );

      if (!isCurrentPasswordValid) {
        return JSON.stringify({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Hash new password
      const hashedNewPassword = this.hashPassword(newPassword);

      // Update password
      await this.pool.query(
        'UPDATE fanta_player SET password = $1, password_updated_at = NOW() WHERE id = $2',
        [hashedNewPassword, sessionData.userId]
      );

      // Invalidate all sessions for this user (force re-login)
      await this.pool.query(
        'UPDATE user_sessions SET is_active = FALSE WHERE user_id = $1',
        [sessionData.userId]
      );

      return JSON.stringify({
        success: true,
        message: 'Password changed successfully'
      });

    } catch (error) {
      console.error('Change password error:', error);
      return JSON.stringify({
        success: false,
        message: 'An error occurred while changing password'
      });
    }
  }

  async refreshToken(oldJwtToken: string, userAgent?: string): Promise<string> {
    try {
      const sessionData = await this.validateSession(oldJwtToken);
      
      if (!sessionData.valid) {
        return JSON.stringify({
          success: false,
          message: 'Invalid session'
        });
      }

      // Generate new JWT token
      const newJwtToken = this.generateJWTToken(sessionData.userId!, sessionData.username!);

      // Update session in database with new activity
      await this.pool.query(
        'UPDATE user_sessions SET last_activity = NOW() WHERE user_id = $1 AND is_active = TRUE',
        [sessionData.userId]
      );

      return JSON.stringify({
        success: true,
        token: newJwtToken,
        message: 'Token refreshed successfully'
      });

    } catch (error) {
      console.error('Refresh token error:', error);
      return JSON.stringify({
        success: false,
        message: 'An error occurred while refreshing token'
      });
    }
  }

  async logout(jwtToken: string): Promise<string> {
    try {
      await this.invalidateSession(jwtToken);
      
      return JSON.stringify({
        success: true,
        message: 'Logged out successfully'
      });

    } catch (error) {
      console.error('Logout error:', error);
      return JSON.stringify({
        success: false,
        message: 'An error occurred during logout'
      });
    }
  }

  async logoutAllSessions(jwtToken: string): Promise<string> {
    try {
      const sessionData = await this.validateSession(jwtToken);
      
      if (!sessionData.valid) {
        return JSON.stringify({
          success: false,
          message: 'Invalid session'
        });
      }

      // Invalidate all sessions for this user
      await this.pool.query(
        'UPDATE user_sessions SET is_active = FALSE WHERE user_id = $1',
        [sessionData.userId]
      );

      return JSON.stringify({
        success: true,
        message: 'All sessions logged out successfully'
      });

    } catch (error) {
      console.error('Logout all sessions error:', error);
      return JSON.stringify({
        success: false,
        message: 'An error occurred while logging out all sessions'
      });
    }
  }

  async getUserSessions(jwtToken: string): Promise<string> {
    try {
      const sessionData = await this.validateSession(jwtToken);
      
      if (!sessionData.valid) {
        return JSON.stringify({
          success: false,
          message: 'Invalid session'
        });
      }

      const result = await this.pool.query(
        `SELECT session_token, created_at, last_activity, expires_at, is_active
         FROM user_sessions 
         WHERE user_id = $1 AND is_active = TRUE
         ORDER BY last_activity DESC`,
        [sessionData.userId]
      );

      return JSON.stringify({
        success: true,
        sessions: result.rows.map(session => ({
          sessionToken: session.session_token,
          createdAt: session.created_at,
          lastActivity: session.last_activity,
          expiresAt: session.expires_at,
          isActive: session.is_active,
          isCurrent: true // Since we're using JWT, we can't easily identify the current session
        }))
      });

    } catch (error) {
      console.error('Get user sessions error:', error);
      return JSON.stringify({
        success: false,
        message: 'An error occurred while fetching sessions'
      });
    }
  }

  private validateLoginInput(username: string, password: string): void {
    if (!username || !password) {
      throw new Error('Username and password are required');
    }
    
    if (typeof username !== 'string' || typeof password !== 'string') {
      throw new Error('Username and password must be strings');
    }
  }

  private validateRegisterInput(username: string, name: string, surname: string, password: string): void {
    if (!username || !name || !surname || !password) {
      throw new Error('All fields are required');
    }

    if (username.length < 3 || username.length > 30) {
      throw new Error('Username must be between 3 and 30 characters');
    }

    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Password strength validation
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      throw new Error('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
    }

    // Username format validation
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      throw new Error('Username can only contain letters, numbers, and underscores');
    }
  }

  private validateChangePasswordInput(currentPassword: string, newPassword: string): void {
    if (!currentPassword || !newPassword) {
      throw new Error('Current password and new password are required');
    }

    if (newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters long');
    }

    if (currentPassword === newPassword) {
      throw new Error('New password must be different from current password');
    }

    // Password strength validation for new password
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumbers = /\d/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      throw new Error('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
    }
  }
}
