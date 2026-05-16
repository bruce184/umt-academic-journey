import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import { AppError } from '../utils/app-error.js';

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

export const signup = async (userData) => {
  // 1. Check if email exists
  const existingUser = await User.findByEmail(userData.email);
  if (existingUser) {
    throw new AppError('Email already in use', 400);
  }

  // 2. Hash password
  const hashedPassword = await bcrypt.hash(userData.password, 12);

  // 3. Create user
  const newUser = await User.create({
    name: userData.name,
    email: userData.email,
    password: hashedPassword,
  });

  // 4. Generate token
  const token = signToken(newUser.id);

  // 5. Remove password from output
  delete newUser.password;

  return { user: newUser, token };
};

export const login = async (email, password) => {
  // 1. Check if email and password exist
  if (!email || !password) {
    throw new AppError('Please provide email and password', 400);
  }

  // 2. Check if user exists & password is correct
  const user = await User.findByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError('Incorrect email or password', 401);
  }

  // 3. Generate token
  const token = signToken(user.id);
  
  // 4. Remove password
  delete user.password;

  return { user, token };
};
