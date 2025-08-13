const ProductCatalog = require('../models/ProductCatalog');

// Create a new product (Admin only)
const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, imageUrl, features, specifications, brochureUrl } = req.body;
    const product = await ProductCatalog.create({ name, description, price, category, imageUrl, features, specifications, brochureUrl });
    res.status(201).json({ success: true, data: { product } });
  } catch (error) {
    next(error);
  }
};

// Get all products (public)
const getAllProducts = async (req, res, next) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const products = await ProductCatalog.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: { products } });
  } catch (error) {
    next(error);
  }
};

// Get product by ID (public)
const getProductById = async (req, res, next) => {
  try {
    const product = await ProductCatalog.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: { product } });
  } catch (error) {
    next(error);
  }
};

// Update product (Admin only)
const updateProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, imageUrl, features, specifications, brochureUrl } = req.body;
    const product = await ProductCatalog.findByIdAndUpdate(
      req.params.id,
      { name, description, price, category, imageUrl, features, specifications, brochureUrl },
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: { product } });
  } catch (error) {
    next(error);
  }
};

// Delete product (Admin only)
const deleteProduct = async (req, res, next) => {
  try {
    const product = await ProductCatalog.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct
};