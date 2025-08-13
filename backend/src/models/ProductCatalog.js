const mongoose = require('mongoose');

const productCatalogSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, enum: ['B2C', 'B2B'], required: true },
  imageUrl: { type: String },
  features: [{ type: String }],
  specifications: { type: Object, default: {} },
  brochureUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

productCatalogSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('ProductCatalog', productCatalogSchema);