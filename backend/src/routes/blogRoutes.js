const express = require('express');
const router = express.Router();
const {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  getAllBlogsAdmin
} = require('../controllers/blogController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Public routes
router.get('/', getAllBlogs);
router.get('/:id', getBlogById);

// Admin routes
router.post('/', authenticateToken, requireAdmin, createBlog);
router.put('/:id', authenticateToken, requireAdmin, updateBlog);
router.delete('/:id', authenticateToken, requireAdmin, deleteBlog);
router.get('/admin/all', authenticateToken, requireAdmin, getAllBlogsAdmin);

module.exports = router;