import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { blogsAPI } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, FileText, Image, Tag, Clock } from 'lucide-react';

interface Blog {
  _id?: string;
  title: string;
  summary: string;
  placeholderImage: string;
  subtopic: string;
  content: string;
  readTime: string;
  isPublished: boolean;
}

interface BlogFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editBlog?: Blog | null;
}

const BlogForm: React.FC<BlogFormProps> = ({ isOpen, onClose, onSuccess, editBlog }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Blog>({
    title: '',
    summary: '',
    placeholderImage: '/lovable-uploads/2564214d-1d06-4966-bb14-ae684ab3e3f5.png',
    subtopic: 'ayurvedic',
    content: '',
    readTime: '5 min read',
    isPublished: true
  });

  const subtopicOptions = [
    { value: 'ayurvedic', label: 'Ayurvedic Insights' },
    { value: 'science', label: 'Hydration Science' },
    { value: 'sustainability', label: 'Sustainability' },
    { value: 'case-studies', label: 'Case Studies' },
    { value: 'wellness', label: 'Wellness' },
    { value: 'technology', label: 'Technology' }
  ];

  useEffect(() => {
    if (editBlog) {
      setFormData({
        title: editBlog.title,
        summary: editBlog.summary,
        placeholderImage: editBlog.placeholderImage,
        subtopic: editBlog.subtopic,
        content: editBlog.content,
        readTime: editBlog.readTime,
        isPublished: editBlog.isPublished
      });
    } else {
      setFormData({
        title: '',
        summary: '',
        placeholderImage: '/lovable-uploads/2564214d-1d06-4966-bb14-ae684ab3e3f5.png',
        subtopic: 'ayurvedic',
        content: '',
        readTime: '5 min read',
        isPublished: true
      });
    }
  }, [editBlog, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.summary.trim() || !formData.content.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      if (editBlog?._id) {
        await blogsAPI.updateBlog(editBlog._id, formData);
        toast.success('Blog post updated successfully!');
      } else {
        await blogsAPI.createBlog(formData);
        toast.success('Blog post created successfully!');
      }
      
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save blog post');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof Blog, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-zoss-green" />
            <span>{editBlog ? 'Edit Blog Post' : 'Create New Blog Post'}</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="md:col-span-2">
              <Label htmlFor="title" className="flex items-center space-x-1">
                <FileText className="h-4 w-4" />
                <span>Title *</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter blog post title"
                className="mt-2"
                required
              />
            </div>

            {/* Summary */}
            <div className="md:col-span-2">
              <Label htmlFor="summary">Summary *</Label>
              <Textarea
                id="summary"
                value={formData.summary}
                onChange={(e) => handleInputChange('summary', e.target.value)}
                placeholder="Brief summary of the blog post (max 500 characters)"
                className="mt-2 min-h-[80px]"
                maxLength={500}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.summary.length}/500 characters
              </p>
            </div>

            {/* Placeholder Image */}
            <div>
              <Label htmlFor="image" className="flex items-center space-x-1">
                <Image className="h-4 w-4" />
                <span>Image URL</span>
              </Label>
              <Input
                id="image"
                value={formData.placeholderImage}
                onChange={(e) => handleInputChange('placeholderImage', e.target.value)}
                placeholder="Enter image URL"
                className="mt-2"
              />
            </div>

            {/* Subtopic */}
            <div>
              <Label className="flex items-center space-x-1">
                <Tag className="h-4 w-4" />
                <span>Subtopic *</span>
              </Label>
              <Select value={formData.subtopic} onValueChange={(value) => handleInputChange('subtopic', value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select subtopic" />
                </SelectTrigger>
                <SelectContent>
                  {subtopicOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Read Time */}
            <div>
              <Label htmlFor="readTime" className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>Read Time</span>
              </Label>
              <Input
                id="readTime"
                value={formData.readTime}
                onChange={(e) => handleInputChange('readTime', e.target.value)}
                placeholder="e.g., 5 min read"
                className="mt-2"
              />
            </div>

            {/* Published Status */}
            <div className="flex items-center space-x-2">
              <Switch
                id="published"
                checked={formData.isPublished}
                onCheckedChange={(checked) => handleInputChange('isPublished', checked)}
              />
              <Label htmlFor="published">Publish immediately</Label>
            </div>
          </div>

          {/* Content */}
          <div>
            <Label htmlFor="content">Content * (Supports Markdown)</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="Write your blog content here. You can use Markdown formatting:
# Main Heading
## Sub Heading
### Section Heading
**Bold text**
*Italic text*
- Bullet points
1. Numbered lists
`code snippets`"
              className="mt-2 min-h-[400px] font-mono text-sm"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Use Markdown syntax for formatting. Content will be automatically styled on the frontend.
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.title.trim() || !formData.summary.trim() || !formData.content.trim()}
              className="flex-1 bg-zoss-green hover:bg-zoss-green/90"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editBlog ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                editBlog ? 'Update Blog Post' : 'Create Blog Post'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BlogForm;