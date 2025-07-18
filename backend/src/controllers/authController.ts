import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { collections, firestoreHelpers } from '../services/firebase';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, name, password } = req.body;

    if (!email || !name || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email, name, and password are required'
      });
    }

    // Check if user already exists
    const existingUserQuery = await collections.users().where('email', '==', email.toLowerCase()).get();
    if (!existingUserQuery.empty) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user document
    const userRef = collections.users().doc();
    const userData = {
      email: email.toLowerCase(),
      name: name.trim(),
      password: hashedPassword,
      role: 'user',
      createdAt: firestoreHelpers.now()
    };

    await userRef.set(userData);

    // Generate JWT token
    const token = jwt.sign(
      { userId: userRef.id },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    // Prepare user response (without password)
    const user = {
      id: userRef.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      createdAt: firestoreHelpers.timestampToDate(userData.createdAt)
    };

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { user, token }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const userQuery = await collections.users().where('email', '==', email.toLowerCase()).get();
    if (userQuery.empty) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const userDoc = userQuery.docs[0];
    const userData = userDoc.data();

    // Check password
    const isPasswordValid = await bcrypt.compare(password, userData.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: userDoc.id },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    // Prepare user response (without password)
    const user = {
      id: userDoc.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      createdAt: firestoreHelpers.timestampToDate(userData.createdAt)
    };

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { user, token }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const userDoc = await collections.users().doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userData = userDoc.data();
    const user = {
      id: userDoc.id,
      email: userData?.email,
      name: userData?.name,
      role: userData?.role,
      createdAt: userData?.createdAt ? firestoreHelpers.timestampToDate(userData.createdAt) : new Date()
    };

    return res.status(200).json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
