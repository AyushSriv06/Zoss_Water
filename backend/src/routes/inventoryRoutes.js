const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all inventory items
router.get('/', inventoryController.getAllInventory);

// Get inventory by category
router.get('/category/:category', inventoryController.getInventoryByCategory);

// Get low stock items
router.get('/low-stock', inventoryController.getLowStockItems);

// Get inventory statistics
router.get('/stats', inventoryController.getInventoryStats);

// Add new inventory item
router.post('/', inventoryController.addInventoryItem);

// Update inventory quantity
router.patch('/:id/quantity', inventoryController.updateInventoryQuantity);

// Update inventory item
router.put('/:id', inventoryController.updateInventoryItem);

// Delete inventory item
router.delete('/:id', inventoryController.deleteInventoryItem);

module.exports = router; 