import { GenezioDeploy, GenezioMethod, GenezioHttpRequest, GenezioHttpResponse } from "@genezio/types";
import pg from "pg";
import { createHash, randomBytes } from "crypto";
import jwt from "jsonwebtoken";
const { Pool } = pg;

type User = {
  id: number;
  username: string;
  name: string;
  surname: string;
  mail?: string;
  image?: string;
  isAdmin?: boolean;
}

type LoginRequest = {
  username: string;
  password: string;
  userAgent?: string;
}

type AuthResponse = {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
  jwtToken: string;
}

type ChangePasswordResponse = {
  success: boolean;
  message: string;
}

type UserSession = {
  sessionToken: string;
  createdAt: string;
  lastActivity: string;
  expiresAt: string;
  isActive: boolean;
  isCurrent: boolean;
}

type SessionsResponse = {
  success: boolean;
  message?: string;
  sessions?: UserSession[];
}



type TokenValidationResponse = {
  valid: boolean;
  userId?: number;
  username?: string;
  name?: string;
  surname?: string;
  mail?: string;
  image?: string;
  isAdmin?: boolean;
}

type RefreshTokenResponse = {
  success: boolean;
  token?: string;
  message: string;
}

type LogoutResponse = {
  success: boolean;
  message: string;
}
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

  async getUsers(): Promise<User[]> {
    const result = await this.pool.query (`
  SELECT id, username, name, surname, password, mail, encode(image, 'escape') as image
  FROM users;
    `);
      return result.rows as User[];
  }

  async cleanupExpiredSessions(): Promise<LogoutResponse> {
    try {
      await this.cleanExpiredSessions();
      
      return {
        success: true,
        message: 'Expired sessions cleaned up successfully'
      };

    } catch (error) {
      console.error('Cleanup expired sessions error:', error);
      return {
        success: false,
        message: 'An error occurred while cleaning up expired sessions'
      };
    }
  }

  async login(loginData: LoginRequest): Promise<AuthResponse> {
    try {
      this.validateLoginInput(loginData.username, loginData.password);

      // Get user from database
      const result = await this.pool.query(
        'SELECT id, username, name, surname, password, mail, encode(image, \'escape\') as image, is_active, is_admin FROM users WHERE username = $1',
        [loginData.username]
      );

      if (result.rows.length === 0) {
        return {
          success: false,
          message: 'Invalid username or password'
        };
      }

      const user = result.rows[0];

      // Check if user account is active
      if (!user.is_active) {
        return {
          success: false,
          message: 'Account is disabled'
        };
      }
      
      // Verify password
      const isPasswordValid = this.comparePassword(loginData.password, user.password);
      
      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Invalid username or password'
        };
      }

      // Create session and get JWT token
      const jwtToken = await this.createSession(user.id, loginData.userAgent);

      // Update last login
      await this.pool.query(
        'UPDATE users SET last_login = NOW() WHERE id = $1',
        [user.id]
      );

      return {
        success: true,
        message: 'Login successful',
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

    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'An error occurred during login'
      };
    }
  }

  @GenezioMethod({ type: "http" })
  async register(request: GenezioHttpRequest): Promise<GenezioHttpResponse> {
    try {   
      const { username, name, surname, password, mail, image } = request.body;
      const userAgent = request.headers['user-agent'];

      // Validate input
      this.validateRegisterInput(username, name, surname, password, mail, image);

      // Check if username already exists
      const existingUser = await this.pool.query(
        'SELECT username FROM users WHERE username = $1',
        [username]
      );

      if (existingUser.rows.length > 0) {
        return {
          statusCode: "409",
          body: JSON.stringify({
            success: false,
            message: 'Username already exists'
          }),
          headers: { 'Content-Type': 'application/json' }
        };
      }

      // Check if email already exists
      const existingEmail = await this.pool.query(
        'SELECT mail FROM users WHERE mail = $1',
        [mail]
      );

      if (existingEmail.rows.length > 0) {
        return {
          statusCode: "409",
          body: JSON.stringify({
            success: false,
            message: 'Email already exists'
          }),
          headers: { 'Content-Type': 'application/json' }
        };
      }

      // Hash password
      const hashedPassword = this.hashPassword(password);

      // Insert new user
      const result = await this.pool.query(
        'INSERT INTO users (username, name, surname, password, mail, image, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING id, username, name, surname, mail, image',
        [username, name, surname, hashedPassword, mail, image || null]
      );

      const newUser = result.rows[0];

      // Create session and get JWT token
      const jwtToken = await this.createSession(newUser.id, userAgent);

      return {
        statusCode: "201",
        body: JSON.stringify({
          success: true,
          message: 'Registration successful',
          user: {
            id: newUser.id,
            username: newUser.username,
            name: newUser.name,
            surname: newUser.surname,
            mail: newUser.mail,
            image: newUser.image
          },
          token: jwtToken
        }),
        headers: { 'Content-Type': 'application/json' }
      };

    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle validation errors with specific status codes
      if (error instanceof Error) {
        if (error.message.includes('required') || 
            error.message.includes('must be') || 
            error.message.includes('characters') ||
            error.message.includes('valid email') ||
            error.message.includes('contain')) {
          return {
            statusCode: "400",
            body: JSON.stringify({
              success: false,
              message: error.message
            }),
            headers: { 'Content-Type': 'application/json' }
          };
        }
      }

      return {
        statusCode: "500",
        body: JSON.stringify({
          success: false,
          message: 'An error occurred during registration'
        }),
        headers: { 'Content-Type': 'application/json' }
      };
    }
  }

  async validateToken(jwtToken: string): Promise<TokenValidationResponse> {
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

    } catch (error) {
      console.error('Token validation error:', error);
      return { valid: false };
    }
  }

  async changePassword(changeData: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    try {
      this.validateChangePasswordInput(changeData.currentPassword, changeData.newPassword);

      // Validate JWT token
      const sessionData = await this.validateSession(changeData.jwtToken);
      
      if (!sessionData.valid) {
        return {
          success: false,
          message: 'Invalid session'
        };
      }

      // Get current user
      const result = await this.pool.query(
        'SELECT password FROM users WHERE id = $1',
        [sessionData.userId]
      );

      if (result.rows.length === 0) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      // Verify current password
      const isCurrentPasswordValid = this.comparePassword(
        changeData.currentPassword, 
        result.rows[0].password
      );

      if (!isCurrentPasswordValid) {
        return {
          success: false,
          message: 'Current password is incorrect'
        };
      }

      // Hash new password
      const hashedNewPassword = this.hashPassword(changeData.newPassword);

      // Update password
      await this.pool.query(
        'UPDATE users SET password = $1, password_updated_at = NOW() WHERE id = $2',
        [hashedNewPassword, sessionData.userId]
      );

      // Invalidate all sessions for this user (force re-login)
      await this.pool.query(
        'UPDATE user_sessions SET is_active = FALSE WHERE user_id = $1',
        [sessionData.userId]
      );

      return {
        success: true,
        message: 'Password changed successfully'
      };

    } catch (error) {
      console.error('Change password error:', error);
      return {
        success: false,
        message: 'An error occurred while changing password'
      };
    }
  }

  async refreshToken(oldJwtToken: string, userAgent?: string): Promise<RefreshTokenResponse> {
    try {
      const sessionData = await this.validateSession(oldJwtToken);
      
      if (!sessionData.valid) {
        return {
          success: false,
          message: 'Invalid session'
        };
      }

      // Generate new JWT token
      const newJwtToken = this.generateJWTToken(sessionData.userId!, sessionData.username!);

      // Update session in database with new activity
      await this.pool.query(
        'UPDATE user_sessions SET last_activity = NOW() WHERE user_id = $1 AND is_active = TRUE',
        [sessionData.userId]
      );

      return {
        success: true,
        token: newJwtToken,
        message: 'Token refreshed successfully'
      };

    } catch (error) {
      console.error('Refresh token error:', error);
      return {
        success: false,
        message: 'An error occurred while refreshing token'
      };
    }
  }

  async logout(jwtToken: string): Promise<LogoutResponse> {
    try {
      await this.invalidateSession(jwtToken);
      
      return {
        success: true,
        message: 'Logged out successfully'
      };

    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        message: 'An error occurred during logout'
      };
    }
  }

  async logoutAllSessions(jwtToken: string): Promise<LogoutResponse> {
    try {
      const sessionData = await this.validateSession(jwtToken);
      
      if (!sessionData.valid) {
        return {
          success: false,
          message: 'Invalid session'
        };
      }

      // Invalidate all sessions for this user
      await this.pool.query(
        'UPDATE user_sessions SET is_active = FALSE WHERE user_id = $1',
        [sessionData.userId]
      );

      return {
        success: true,
        message: 'All sessions logged out successfully'
      };

    } catch (error) {
      console.error('Logout all sessions error:', error);
      return {
        success: false,
        message: 'An error occurred while logging out all sessions'
      };
    }
  }

  async getUserSessions(jwtToken: string): Promise<SessionsResponse> {
    try {
      const sessionData = await this.validateSession(jwtToken);
      
      if (!sessionData.valid) {
        return {
          success: false,
          message: 'Invalid session'
        };
      }

      const result = await this.pool.query(
        `SELECT session_token, created_at, last_activity, expires_at, is_active
         FROM user_sessions 
         WHERE user_id = $1 AND is_active = TRUE
         ORDER BY last_activity DESC`,
        [sessionData.userId]
      );

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

    } catch (error) {
      console.error('Get user sessions error:', error);
      return {
        success: false,
        message: 'An error occurred while fetching sessions'
      };
    }
  }

  @GenezioMethod({ type: "http" })
  async updateUserInfo(request: GenezioHttpRequest): Promise<GenezioHttpResponse> {
    try {
      const { jwtToken, updates } = request.body;

      if (!jwtToken || !updates) {
        return {
          statusCode: "400",
          body: JSON.stringify({
            success: false,
            message: 'JWT token and updates are required'
          }),
          headers: { 'Content-Type': 'application/json' }
        };
      }

      // Validate JWT token
      const sessionData = await this.validateSession(jwtToken);
      
      if (!sessionData.valid) {
        return {
          statusCode: "401",
          body: JSON.stringify({
            success: false,
            message: 'Invalid session'
          }),
          headers: { 'Content-Type': 'application/json' }
        };
      }

      // Validate updates
      this.validateUpdateUserInfoInput(updates);

      // If email is being updated, check if it already exists
      if (updates.mail) {
        const existingEmail = await this.pool.query(
          'SELECT id FROM users WHERE mail = $1 AND id != $2',
          [updates.mail, sessionData.userId]
        );

        if (existingEmail.rows.length > 0) {
          return {
            statusCode: "409",
            body: JSON.stringify({
              success: false,
              message: 'Email already exists'
            }),
            headers: { 'Content-Type': 'application/json' }
          };
        }
      }

      // Build dynamic query
      const updateFields: string[] = [];
      const values: any[] = [];
      let parameterIndex = 1;

      if (updates.name !== undefined) {
        updateFields.push(`name = $${parameterIndex}`);
        values.push(updates.name);
        parameterIndex++;
      }

      if (updates.surname !== undefined) {
        updateFields.push(`surname = $${parameterIndex}`);
        values.push(updates.surname);
        parameterIndex++;
      }

      if (updates.mail !== undefined) {
        updateFields.push(`mail = $${parameterIndex}`);
        values.push(updates.mail);
        parameterIndex++;
      }

      if (updates.image !== undefined) {
        updateFields.push(`image = $${parameterIndex}`);
        values.push(updates.image);
        parameterIndex++;
      }

      // If no fields to update
      if (updateFields.length === 0) {
        return {
          statusCode: "400",
          body: JSON.stringify({
            success: false,
            message: 'No valid fields to update'
          }),
          headers: { 'Content-Type': 'application/json' }
        };
      }

      // Add user ID to values
      values.push(sessionData.userId);

      // Execute update query
      const query = `
        UPDATE users 
        SET ${updateFields.join(', ')} 
        WHERE id = $${parameterIndex} 
        RETURNING id, username, name, surname, mail, encode(image, 'escape') as image
      `;

      const result = await this.pool.query(query, values);

      if (result.rows.length === 0) {
        return {
          statusCode: "404",
          body: JSON.stringify({
            success: false,
            message: 'User not found'
          }),
          headers: { 'Content-Type': 'application/json' }
        };
      }

      const updatedUser = result.rows[0];

      return {
        statusCode: "200",
        body: JSON.stringify({
          success: true,
          message: 'User information updated successfully',
          user: {
            id: updatedUser.id,
            username: updatedUser.username,
            name: updatedUser.name,
            surname: updatedUser.surname,
            mail: updatedUser.mail,
            image: updatedUser.image
          }
        }),
        headers: { 'Content-Type': 'application/json' }
      };

    } catch (error) {
      console.error('Update user info error:', error);
      
      // Handle validation errors with specific status codes
      if (error instanceof Error) {
        if (error.message.includes('required') || 
            error.message.includes('must be') || 
            error.message.includes('characters') ||
            error.message.includes('valid email') ||
            error.message.includes('contain')) {
          return {
            statusCode: "400",
            body: JSON.stringify({
              success: false,
              message: error.message
            }),
            headers: { 'Content-Type': 'application/json' }
          };
        }
      }

      return {
        statusCode: "500",
        body: JSON.stringify({
          success: false,
          message: 'An error occurred while updating user information'
        }),
        headers: { 'Content-Type': 'application/json' }
      };
    }
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
      'SELECT username FROM users WHERE id = $1',
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

  private async validateSession(jwtToken: string): Promise<{ valid: boolean; userId?: number; username?: string; name?: string; surname?: string; mail?: string; image?: string; isAdmin?: boolean }> {
    try {
      // Verify JWT token
      const decoded = jwt.verify(jwtToken, this.jwtSecret) as any;
      
      // Check if user still exists and is active
      const result = await this.pool.query(
        'SELECT id, username, is_active, name, surname, mail, encode(image, \'escape\') as image, is_admin FROM users WHERE id = $1',
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
        userId: user.id,
        username: user.username,
        name: user.name,
        surname: user.surname,
        mail: user.mail,
        image: user.image,
        isAdmin: user.is_admin
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

  private validateLoginInput(username: string, password: string): void {
    if (!username || !password) {
      throw new Error('Username and password are required');
    }
    
    if (typeof username !== 'string' || typeof password !== 'string') {
      throw new Error('Username and password must be strings');
    }
  }

  private validateRegisterInput(username: string, name: string, surname: string, password: string, mail: string, image: string): void {
    if (!username || !name || !surname || !password || !mail || !image) {
      throw new Error('All fields are required including profile image');
    }

    if (username.length < 3 || username.length > 30) {
      throw new Error('Username must be between 3 and 30 characters');
    }

    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(mail)) {
      throw new Error('Please enter a valid email address');
    }

    // Image validation
    if (image.length > 5000000) { // 5MB limit
      throw new Error('Image size is too large (max 5MB)');
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
      throw new Error('Invalid image format. Please provide a valid base64 encoded image');
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

  private validateUpdateUserInfoInput(updates: {
    name?: string;
    surname?: string;
    mail?: string;
    image?: string;
  }): void {
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
}
