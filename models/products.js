// models/products.js

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  category: String,
  price: String,
  description: String,
  image: String,
});

const Product = mongoose.model('products', productSchema);

module.exports = Product;
