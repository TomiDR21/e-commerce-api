const express = require('express');
const cors = require('cors');
require('dotenv').config();
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const db = require('./config/db');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use(userRoutes);
app.use(productRoutes);

// Start Server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
