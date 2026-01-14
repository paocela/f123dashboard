import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthService } from '../services/auth.service.js';
import { createHash } from 'crypto';

describe('AuthService', () => {
  let authService: AuthService;
  let mockPool: any;
  const TEST_JWT_SECRET = 'test-secret';

  beforeEach(() => {
    vi.stubEnv('JWT_SECRET', TEST_JWT_SECRET);
    
    mockPool = {
      query: vi.fn(),
    };
    
    authService = new AuthService(mockPool);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('constructor', () => {
    it('should throw error if JWT_SECRET is not set', () => {
      vi.stubEnv('JWT_SECRET', '');
      expect(() => new AuthService(mockPool)).toThrow('JWT_SECRET environment variable is required');
    });
  });

  describe('login', () => {
    const validLoginData = {
      username: 'testuser',
      password: 'Password123!',
      userAgent: 'Mozilla/5.0'
    };

    const hashedPassword = createHash('sha256').update(validLoginData.password).digest('hex');
    
    const mockDbUser = {
      id: 1,
      username: 'testuser',
      name: 'Test',
      surname: 'User',
      password: hashedPassword,
      mail: 'test@example.com',
      image: 'base64image',
      is_active: true,
      is_admin: false
    };

    it('should login successfully with valid credentials', async () => {
      // Mock user fetch
      mockPool.query.mockResolvedValueOnce({ rows: [mockDbUser], rowCount: 1 });
      // Mock session creation (user fetch inside createSession)
      mockPool.query.mockResolvedValueOnce({ rows: [{ username: 'testuser', is_admin: false }] });
      // Mock session insert
      mockPool.query.mockResolvedValueOnce({ rowCount: 1 });
      // Mock last login update
      mockPool.query.mockResolvedValueOnce({ rowCount: 1 });

      const result = await authService.login(validLoginData);

      expect(result.success).toBe(true);
      expect(result.token).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user?.username).toBe(validLoginData.username);
    });

    it('should fail if user does not exist', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

      const result = await authService.login(validLoginData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Nome utente o password non validi');
    });

    it('should fail if user is inactive', async () => {
      mockPool.query.mockResolvedValueOnce({ 
        rows: [{ ...mockDbUser, is_active: false }], 
        rowCount: 1 
      });

      const result = await authService.login(validLoginData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Account disabilitato');
    });

    it('should fail with incorrect password', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [mockDbUser], rowCount: 1 });

      const result = await authService.login({ ...validLoginData, password: 'WrongPassword123!' });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Nome utente o password non validi');
    });
  });

  describe('register', () => {
    const validRegisterData = {
      username: 'newuser',
      password: 'Password123!',
      name: 'New',
      surname: 'User',
      mail: 'new@example.com',
      image: 'base64data'
    };

    it('should register successfully', async () => {
      // Check existing user (username)
      mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      // Check existing user (email)
      mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      
      const newUser = {
          id: 2,
          username: validRegisterData.username,
          name: validRegisterData.name,
          surname: validRegisterData.surname,
          mail: validRegisterData.mail,
          image: validRegisterData.image,
          is_active: true,
          is_admin: false
      };

      // Insert user
      mockPool.query.mockResolvedValueOnce({ rows: [newUser] });

      // createSession > select user info
      mockPool.query.mockResolvedValueOnce({ rows: [{ username: 'newuser', is_admin: false }] });
      // createSession > insert session
      mockPool.query.mockResolvedValueOnce({ rowCount: 1 });

      const result = await authService.register(validRegisterData);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Registrazione completata con successo');
      expect(result.user).toBeDefined();
      expect(result.user?.username).toBe(validRegisterData.username);
    });

    it('should fail if username already exists', async () => {
      // Username exists
      mockPool.query.mockResolvedValueOnce({ rows: [{ id: 1 }], rowCount: 1 });

      const result = await authService.register(validRegisterData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Nome utente già esistente');
    });

    it('should fail validation for weak password', async () => {
      const result = await authService.register({ ...validRegisterData, password: 'weak' });
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('La password deve contenere almeno 8 caratteri');
    });

    it('should fail validation for invalid email', async () => {
      const result = await authService.register({ ...validRegisterData, mail: 'invalid-email' });
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('Inserire un indirizzo email valido');
    });
  });

  describe('validateToken', () => {
    it('should validate a valid token', async () => {
      // Create a real token using the mock service's secret (from stubEnv)
      const token = require('jsonwebtoken').sign(
        { userId: 1, username: 'user', isAdmin: false }, 
        TEST_JWT_SECRET
      );

      const mockDbUser = {
          id: 1, 
          username: 'user', 
          is_active: true, 
          name: 'User', 
          surname: 'Test', 
          mail: 'user@test.com', 
          image: 'img', 
          is_admin: false
      };

      // 1. Select user
      mockPool.query.mockResolvedValueOnce({ rows: [mockDbUser], rowCount: 1 });
      
      // 2. Select active session
      mockPool.query.mockResolvedValueOnce({ 
          rows: [{ 
              session_token: 'abc', 
              expires_at: new Date(Date.now() + 100000).toISOString(), 
              is_active: true 
          }], 
          rowCount: 1 
      });

      // 3. Update last activity
      mockPool.query.mockResolvedValueOnce({ rowCount: 1 });

      const result = await authService.validateToken(token);
      
      expect(result.valid).toBe(true);
      // validateToken returns flat structure, not nested user object
      expect((result as any).username).toBe('user');
    });

    it('should reject invalid token', async () => {
      const result = await authService.validateToken('invalid.token.here');
      expect(result.valid).toBe(false);
    });
  });
  
  describe('cleanupExpiredSessions', () => {
      it('should return success after queries', async () => {
          mockPool.query.mockResolvedValue({});
          
          const result = await authService.cleanupExpiredSessions();
          
          expect(result.success).toBe(true);
          expect(mockPool.query).toHaveBeenCalledTimes(2); // Update active=false, Delete older than 30 days
      });
  });
});
