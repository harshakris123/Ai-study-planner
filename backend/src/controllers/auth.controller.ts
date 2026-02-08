import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { RegisterRequest, LoginRequest } from '../types/auth.types';

export class AuthController {
  // Register new user
  static async register(req: Request, res: Response) {
    try {
      const { email, password, fullName }: RegisterRequest = req.body;

      // Validation
      if (!email || !password || !fullName) {
        return res.status(400).json({
          error: 'All fields are required',
        });
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({
          error: 'User with this email already exists',
        });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          fullName,
        },
      });

      // Create default  user preferences
      await prisma.userPreferences.create({
        data: {
          userId: user.id,
        },
      });

      // Generate token
      const token = generateToken({
        userId: user.id,
        email: user.email,
      });

      // Return response
      return res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
        },
        token,
      });
    } catch (error) {
      console.error('Register error:', error);
      return res.status(500).json({
        error: 'Internal server error',
      });
    }
  }

  // Login user 
  static async login(req: Request, res: Response) {
    try {
      const { email, password }: LoginRequest = req.body;

      // Validation
      if (!email || !password) {
        return res.status(400).json({
          error: 'Email and password are required',
        });
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(401).json({
          error: 'Invalid credentials',
        });
      }

      // Check password
      const isPasswordValid = await comparePassword(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({
          error: 'Invalid credentials',
        });
      }

      // Generate token
      const token = generateToken({
        userId: user.id,
        email: user.email,
      });

      // Return response
      return res.status(200).json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
        },
        token,
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({
        error: 'Internal server error',
      });
    }
  }

  // Get current user
  static async getMe(req: Request, res: Response) {
    try {
      // @ts-ignore - we'll add this via middleware
      const userId = req.user.userId;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          fullName: true,
          createdAt: true,
        },
      });

      if (!user) {
        return res.status(404).json({
          error: 'User not found',
        });
      }

      return res.status(200).json({
        user,
      });
    } catch (error) {
      console.error('Get me error:', error);
      return res.status(500).json({
        error: 'Internal server error',
      });
    }
  }
}