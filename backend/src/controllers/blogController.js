const Blog = require('../models/Blog');

// Create a new blog post (Admin only)
const createBlog = async (req, res, next) => {
  try {
    const { title, summary, placeholderImage, subtopic, content, readTime } = req.body;

    // Check if blog with same title already exists
    const existingBlog = await Blog.findOne({ title });
    if (existingBlog) {
      return res.status(400).json({
        success: false,
        message: 'Blog with this title already exists'
      });
    }

    const blog = await Blog.create({
      title,
      summary,
      placeholderImage,
      subtopic,
      content,
      readTime: readTime || '5 min read'
    });

    res.status(201).json({
      success: true,
      message: 'Blog post created successfully',
      data: { blog }
    });
  } catch (error) {
    next(error);
  }
};

// Get all blog posts (Public)
const getAllBlogs = async (req, res, next) => {
  try {
    const { subtopic, search, page = 1, limit = 10 } = req.query;
    
    let query = { isPublished: true };
    
    if (subtopic && subtopic !== 'all') {
      query.subtopic = subtopic;
    }
    
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Blog.countDocuments(query);

    res.json({
      success: true,
      data: {
        blogs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get blog by ID (Public)
const getBlogById = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog || !blog.isPublished) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    res.json({
      success: true,
      data: { blog }
    });
  } catch (error) {
    next(error);
  }
};

// Update blog post (Admin only)
const updateBlog = async (req, res, next) => {
  try {
    const { title, summary, placeholderImage, subtopic, content, readTime, isPublished } = req.body;

    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      {
        title,
        summary,
        placeholderImage,
        subtopic,
        content,
        readTime,
        isPublished
      },
      { new: true, runValidators: true }
    );

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    res.json({
      success: true,
      message: 'Blog post updated successfully',
      data: { blog }
    });
  } catch (error) {
    next(error);
  }
};

// Delete blog post (Admin only)
const deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    res.json({
      success: true,
      message: 'Blog post deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get all blogs for admin (includes unpublished)
const getAllBlogsAdmin = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const blogs = await Blog.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Blog.countDocuments();

    res.json({
      success: true,
      data: {
        blogs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  getAllBlogsAdmin
};