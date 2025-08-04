const Inventory = require('../models/Inventory');

// Get all inventory items
const getAllInventory = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$text = { $search: search };
    }
    
    const inventory = await Inventory.find(query).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: {
        inventory,
        totalItems: inventory.length,
        lowStockItems: inventory.filter(item => item.quantity < item.minStockLevel).length
      }
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory items'
    });
  }
};

// Get inventory by category
const getInventoryByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const inventory = await Inventory.find({ category }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: {
        inventory,
        category,
        totalItems: inventory.length,
        lowStockItems: inventory.filter(item => item.quantity < item.minStockLevel).length
      }
    });
  } catch (error) {
    console.error('Error fetching inventory by category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory items'
    });
  }
};

// Add new inventory item
const addInventoryItem = async (req, res) => {
  try {
    const {
      itemName,
      category,
      description,
      quantity,
      unit,
      minStockLevel,
      price,
      supplier,
      location
    } = req.body;

    const newItem = new Inventory({
      itemName,
      category,
      description,
      quantity: quantity || 0,
      unit: unit || 'pieces',
      minStockLevel: minStockLevel || 10,
      price,
      supplier,
      location
    });

    await newItem.save();

    res.status(201).json({
      success: true,
      message: 'Inventory item added successfully',
      data: newItem
    });
  } catch (error) {
    console.error('Error adding inventory item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add inventory item'
    });
  }
};

// Update inventory quantity
const updateInventoryQuantity = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, quantity } = req.body; // action: 'add' or 'subtract'

    const item = await Inventory.findById(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    let newQuantity = item.quantity;
    if (action === 'add') {
      newQuantity += quantity;
    } else if (action === 'subtract') {
      newQuantity = Math.max(0, newQuantity - quantity);
    }

    item.quantity = newQuantity;
    await item.save();

    res.status(200).json({
      success: true,
      message: 'Inventory quantity updated successfully',
      data: item
    });
  } catch (error) {
    console.error('Error updating inventory quantity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update inventory quantity'
    });
  }
};

// Update inventory item
const updateInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const item = await Inventory.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Inventory item updated successfully',
      data: item
    });
  } catch (error) {
    console.error('Error updating inventory item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update inventory item'
    });
  }
};

// Delete inventory item
const deleteInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Inventory.findByIdAndDelete(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Inventory item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete inventory item'
    });
  }
};

// Get low stock items
const getLowStockItems = async (req, res) => {
  try {
    const lowStockItems = await Inventory.find({
      $expr: { $lt: ['$quantity', '$minStockLevel'] }
    }).sort({ quantity: 1 });

    res.status(200).json({
      success: true,
      data: {
        lowStockItems,
        count: lowStockItems.length
      }
    });
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch low stock items'
    });
  }
};

// Get inventory statistics
const getInventoryStats = async (req, res) => {
  try {
    const totalItems = await Inventory.countDocuments();
    const machinesCount = await Inventory.countDocuments({ category: 'machines' });
    const materialsCount = await Inventory.countDocuments({ category: 'materials' });
    const lowStockCount = await Inventory.countDocuments({
      $expr: { $lt: ['$quantity', '$minStockLevel'] }
    });

    res.status(200).json({
      success: true,
      data: {
        totalItems,
        machinesCount,
        materialsCount,
        lowStockCount
      }
    });
  } catch (error) {
    console.error('Error fetching inventory stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory statistics'
    });
  }
};

module.exports = {
  getAllInventory,
  getInventoryByCategory,
  addInventoryItem,
  updateInventoryQuantity,
  updateInventoryItem,
  deleteInventoryItem,
  getLowStockItems,
  getInventoryStats
}; 