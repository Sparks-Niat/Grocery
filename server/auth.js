import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'sri_manikanta_sai_secure_jwt_secret_key_2026_@9981';

export function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No authentication token provided.' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ error: 'Invalid or expired session token. Please log in again.' });
  }

  req.user = decoded;
  next();
}

export async function verifyAdminLogin(email, password) {
  if (!email || !password) return null;
  const admins = db.getAdmins();
  const admin = admins.find(a => a.email.toLowerCase() === email.trim().toLowerCase());
  if (!admin) return null;

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) return null;

  return {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role
  };
}
