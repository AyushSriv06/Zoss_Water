const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    maxlength: 200
  },
  summary: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 500
  },
  placeholderImage: { 
    type: String,
    default: '/lovable-uploads/2564214d-1d06-4966-bb14-ae684ab3e3f5.png'
  },
  subtopic: { 
    type: String, 
    required: true,
    enum: ['ayurvedic', 'science', 'sustainability', 'case-studies', 'wellness', 'technology'],
    trim: true
  },
  content: { 
    type: String, 
    required: true,
    minlength: 100
  },
  readTime: {
    type: String,
    default: '5 min read'
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update the updatedAt field before saving
blogSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create text index for search functionality
blogSchema.index({ title: 'text', summary: 'text', content: 'text' });

module.exports = mongoose.model('Blog', blogSchema);