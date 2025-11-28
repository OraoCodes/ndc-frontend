
import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Database from 'better-sqlite3';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey'; // Replace with a strong, environment-variable-based key

// Utility function to get database instance
const db = new Database('./ndc.db');

// Register Route
router.post('/register', async (req, res) => {
    const { fullName, email, organisation, phoneNumber, position, password } = req.body;

    if (!fullName || !email || !password) {
        return res.status(400).json({ message: 'Please enter all required fields' });
    }

    try {
        

        // Check if user already exists
        const existingUser = db.prepare('SELECT * FROM users WHERE email = ?', email);
        if (existingUser) {
            return res.status(409).json({ message: 'User with that email already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10); // Salt rounds

        // Insert user into database
        const result = db.prepare(
            'INSERT INTO users (fullName, email, organisation, phoneNumber, position, password) VALUES (?, ?, ?, ?, ?, ?)',).run(
            fullName,
            email,
            organisation,
            phoneNumber,
            position,
            hashedPassword
        );

        const userId = result.lastID;

        // Generate JWT Token
        const token = jwt.sign({ id: userId, email, role: 'user' }, JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ message: 'User registered successfully', token, user: { id: userId, fullName, email } });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    try {
        

        // Check if user exists
        const user = await db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT Token
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ message: 'Logged in successfully', token, user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role } });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

export default router;
