const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  category: { 
    type: String, 
    required: true, 
    enum: ['machines', 'materials'] 
  },
  description: { type: String },
  quantity: { type: Number, required: true, default: 0 },
  unit: { type: String, required: true, default: 'pieces' }, // pieces, kg, liters, etc.
  minStockLevel: { type: Number, default: 10 }, // minimum stock level for alerts
  price: { type: Number }, // optional price per unit
  supplier: { type: String }, // optional supplier information
  location: { type: String }, // optional storage location
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
inventorySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient searching
inventorySchema.index({ itemName: 'text', category: 1 });

module.exports = mongoose.model('Inventory', inventorySchema); 