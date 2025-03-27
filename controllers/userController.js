const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.SECRET_KEY;

// User Signup
const signupUser = async (req, res) => {
  const { username, email, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });

    if (results.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword],
      (err, result) => {
        if (err) return res.status(500).json({ message: 'Error inserting user' });
        res.status(201).json({ message: 'User registered successfully' });
      }
    );
  });
};

// User Login
const loginUser = (req, res) => {
  const { identifier, password } = req.body; // Can be username or email

  db.query(
    'SELECT * FROM users WHERE email = ? OR username = ?', 
    [identifier, identifier], 
    async (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error' });

      if (results.length === 0) {
        return res.status(400).json({ message: 'User not found' });
      }

      const user = results[0];
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign({ userId: user.user_id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });

      res.json({ message: 'Login successful', token, username: user.username });
    }
  );
};

// Get Users
const getUsers = (req, res) => {
  db.query('SELECT * FROM users', (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).send('Error retrieving users');
    } else {
      res.json(results);
    }
  });
};

module.exports = { signupUser, loginUser, getUsers };
