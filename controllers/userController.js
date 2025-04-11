const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.SECRET_KEY;

// User Signup
const signupUser = async (req, res) => {
  const { username, email, password } = req.body;

  // Check if the username or email already exists
db.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email], async (err, results) => {
  if (err) return res.status(500).json({ message: 'Database error' });

  console.log('Results:', results);  // Log results to see what is being returned

  if (results.length > 0) {
    const existingUser = results[0];
    if (existingUser.username === username) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    if (existingUser.email === email) {
      return res.status(400).json({ message: 'Email already exists' });
    }
  }
  

    // Hash the password before inserting it into the database
    const hashedPassword = await bcrypt.hash(password, 10);
  
    // Insert the new user into the database
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

      const token = jwt.sign(
        { userId: user.user_id, email: user.email }, 
        SECRET_KEY, 
        { expiresIn: '1h' }
      );

      res.json({
        message: 'Login successful', 
        token, 
        user: {
          userId: user.user_id,    
          username: user.username
        } 
      });
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




//PURCHASE
const purchases = async (req, res) => {
  const { userId, totalCost, cartItems } = req.body;

  console.log("➡️ Received purchase request:", { userId, totalCost, cartItems });

  if (!userId || !totalCost || !Array.isArray(cartItems)) {
    console.error("❌ Missing data in request body");
    return res.status(400).json({ message: "Missing required purchase data" });
  }

  // Step 1: Insert into `purchases` table
  const insertPurchaseQuery = "INSERT INTO purchases (user_id, total) VALUES (?, ?)";

  db.query(insertPurchaseQuery, [userId, totalCost], (err, result) => {
    if (err) {
      console.error("❌ Failed to insert purchase:", err);
      return res.status(500).json({ message: "Failed to create purchase", error: err });
    }

    const purchaseId = result.insertId;
    console.log("✅ Purchase record inserted with ID:", purchaseId);

    // Step 2: Insert cart items into `purchase_items` table
    const insertItemsQuery = "INSERT INTO purchase_items (purchase_id, name, price) VALUES ?";
    const values = cartItems.map(item => [purchaseId, item.name, item.price]);

    db.query(insertItemsQuery, [values], (err2) => {
      if (err2) {
        console.error("❌ Failed to insert purchase items:", err2);
        return res.status(500).json({ message: "Failed to save cart items", error: err2 });
      }

      console.log("✅ Cart items inserted for purchase ID:", purchaseId);
      res.status(200).json({ message: "Purchase successful", purchaseId });
    });
  });
};

// GET /purchases/:userId
// GET /purchases/:userId
const getPurchasesByUser = (req, res) => {
  const userId = req.params.userId;

  const query = `
    SELECT 
      p.purchase_id,
      p.total,
      p.date,
      pi.name AS item_name,
      pi.price AS item_price
    FROM purchases p
    LEFT JOIN purchase_items pi ON p.purchase_id = pi.purchase_id
    WHERE p.user_id = ?
    ORDER BY p.date DESC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("❌ Error fetching purchases:", err);
      return res.status(500).json({ message: "Failed to fetch purchases", error: err });
    }

    const grouped = {};
    results.forEach(row => {
      if (!grouped[row.purchase_id]) {
        grouped[row.purchase_id] = {
          purchase_id: row.purchase_id,
          total: Number(row.total),
          date: row.date,
          items: [],
        };
      }

      // Solo pusheá si hay item (por si hay compra sin items)
      if (row.item_name && row.item_price !== null) {
        grouped[row.purchase_id].items.push({
          name: row.item_name,
          price: Number(row.item_price)
        });
      }
    });

    const purchases = Object.values(grouped);
    res.json(purchases);
  });
};



module.exports = { signupUser, loginUser, getUsers, purchases, getPurchasesByUser };

