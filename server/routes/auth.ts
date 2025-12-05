// server/routes/auth.ts
import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Database from 'better-sqlite3';

const router = Router();
const db = new Database('./ndc.db');
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-super-secret-key-2025';

// REGISTER ROUTE — FULLY FIXED
router.post('/register', async (req, res) => {
  const { fullName, email, organisation, phoneNumber, position, password } = req.body;

  // Validation
  if (!fullName || !email || !password) {
    return res.status(400).json({ message: 'Full name, email and password are required' });
  }

  try {
    // CHECK IF USER ALREADY EXISTS — this was broken!
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(409).json({ message: 'User with that email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // INSERT USER — fixed syntax + proper .run()
    const stmt = db.prepare(`
      INSERT INTO users (fullName, email, organisation, phoneNumber, position, password, role)
      VALUES (?, ?, ?, ?, ?, ?, 'user')
    `);

    const result = stmt.run(
      fullName,
      email.toLowerCase().trim(),
      organisation || null,
      phoneNumber || null,
      position || null,
      hashedPassword
    );

    const userId = result.lastInsertRowid;

    // Generate token
    const token = jwt.sign(
      { id: userId, email: email.toLowerCase().trim(), role: 'user' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'Account created successfully',
      token,
      user: { id: userId, fullName, email }
    });

  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// LOGIN ROUTE — also fixed
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  try {
    const user: any = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role || 'user' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
