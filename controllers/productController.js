const db = require('../config/db');

// Get All Products
const getProducts = (req, res) => {
  const query = 'SELECT * FROM product';

  db.query(query, (error, data) => {
    if (error) {
      console.error(error);
      res.status(500).send('Error retrieving products');
    } else {
      res.json(data);
    }
  });
};

// Create New Product
const createProduct = (req, res) => {
  const { name, description, price, quantity } = req.body;
  const query = 'INSERT INTO product (name, description, price, quantity) VALUES (?, ?, ?, ?)';
  const values = [name, description, price, quantity];

  db.query(query, values, (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).send('Error creating product');
    } else {
      res.status(201).send('Product created successfully');
    }
  });
};

module.exports = { getProducts, createProduct };
