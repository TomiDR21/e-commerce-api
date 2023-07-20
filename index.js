const express = require('express');
const mysql = require('mysql2');
const cors = require('cors')


const app = express();
const port = 5000;

// Middleware
app.use(express.json());
app.use(cors());


// MySQL Connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '6743',
  database: 'ecommerce',
  port: 3306
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});




//--------------- ROUTES-----------------

// GET

app.get('/products', (req, res) => {
  const query = 'SELECT * FROM product';

  connection.query(query, (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).send('Error retrieving products');
    } else {
      res.json(results);
    }
  });
});

// POST

app.post('/products', (req, res) => {
  const { name, description, price, quantity } = req.body;
  const query = 'INSERT INTO product (name, description, price, quantity) VALUES (?, ?, ?, ?)';
  const values = [name, description, price, quantity];

  connection.query(query, values, (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).send('Error creating product');
    } else {
      res.status(201).send('Product created successfully');
    }
  });
});
