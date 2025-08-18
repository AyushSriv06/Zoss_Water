import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { blogsAPI } from '@/lib/api';
import { toast } from 'sonner';
import { ArrowLeft, Calendar, Clock, User, Share2, BookOpen } from 'lucide-react';
import { format } from 'date-fns';

interface Blog {
  _id: string;
  title: string;
  summary: string;
  placeholderImage: string;
  subtopic: string;
  content: string;
  readTime: string;
  createdAt: string;
  updatedAt: string;
}

const BlogDetail = () => {
  const { blogId } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);

  useEffect(() => {
    if (blogId) {
      fetchBlog();
    }
  }, [blogId]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const response = await blogsAPI.getBlogById(blogId!);
      const blogData = response.data.data.blog;
      setBlog(blogData);
      
      // Fetch related blogs from same subtopic
      const relatedResponse = await blogsAPI.getAllBlogs({ 
        subtopic: blogData.subtopic, 
        limit: 3 
      });
      const filteredRelated = relatedResponse.data.data.blogs.filter(
        (relatedBlog: Blog) => relatedBlog._id !== blogData._id
      );
      setRelatedBlogs(filteredRelated);
    } catch (error: any) {
      toast.error('Failed to load blog post');
      navigate('/blogs');
    } finally {
      setLoading(false);
    }
  };

  const getSubtopicLabel = (subtopic: string) => {
    const labels = {
      'ayurvedic': 'Ayurvedic Insights',
      'science': 'Hydration Science',
      'sustainability': 'Sustainability',
      'case-studies': 'Case Studies',
      'wellness': 'Wellness',
      'technology': 'Technology'
    };
    return labels[subtopic as keyof typeof labels] || subtopic;
  };

  const formatContent = (content: string) => {
    // Convert markdown-like content to HTML
    return content
      .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold text-zoss-blue mb-6 mt-8">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-semibold text-zoss-blue mb-4 mt-6">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-xl font-medium text-zoss-blue mb-3 mt-4">$1</h3>')
      .replace(/^\*\*(.*?)\*\*/gm, '<strong class="font-semibold text-zoss-blue">$1</strong>')
      .replace(/^\*(.*?)\*/gm, '<em class="italic">$1</em>')
      .replace(/^- (.*$)/gm, '<li class="ml-4 mb-2">• $1</li>')
      .replace(/^(\d+)\. (.*$)/gm, '<li class="ml-4 mb-2">$1. $2</li>')
      .replace(/\n\n/g, '</p><p class="mb-4 text-zoss-gray leading-relaxed">')
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 p-4 rounded-lg my-4 overflow-x-auto"><code class="text-sm">$1</code></pre>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono">$1</code>')
      .replace(/\|(.*?)\|/g, '<div class="overflow-x-auto my-4"><table class="min-w-full border border-gray-200">$1</table></div>');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zoss-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-zoss-green"></div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-zoss-cream flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-zoss-blue mb-4">Blog Post Not Found</h1>
          <Link to="/blogs">
            <Button className="bg-zoss-green hover:bg-zoss-green/90">
              Back to Blogs
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zoss-cream">
      {/* Breadcrumb */}
      <section className="py-6 bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link 
            to="/blogs" 
            className="inline-flex items-center text-zoss-green hover:text-zoss-green/80 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Knowledge Hub
          </Link>
        </div>
      </section>

      {/* Blog Header */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <Badge className="bg-zoss-green/10 text-zoss-green border-zoss-green mb-4">
              {getSubtopicLabel(blog.subtopic)}
            </Badge>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-zoss-blue mb-6 leading-tight">
              {blog.title}
            </h1>
            <p className="text-xl text-zoss-gray mb-6 leading-relaxed max-w-3xl mx-auto">
              {blog.summary}
            </p>
            
            <div className="flex items-center justify-center space-x-6 text-sm text-zoss-gray">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(blog.createdAt), 'MMM dd, yyyy')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>{blog.readTime}</span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Zoss Water Team</span>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="relative mb-12">
            <div className="w-full h-96 rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={blog.placeholderImage} 
                alt={blog.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
          </div>
        </div>
      </section>

      {/* Blog Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="shadow-xl border-0 bg-white">
            <CardContent className="p-12">
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: `<p class="mb-4 text-zoss-gray leading-relaxed">${formatContent(blog.content)}</p>` 
                }}
              />
              
              {/* Share Section */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-zoss-blue">Share this article:</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        toast.success('Link copied to clipboard!');
                      }}
                      className="border-zoss-green text-zoss-green hover:bg-zoss-green hover:text-white"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Copy Link
                    </Button>
                  </div>
                  <Badge variant="outline" className="text-zoss-green border-zoss-green">
                    <BookOpen className="h-3 w-3 mr-1" />
                    {blog.readTime}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Related Articles */}
      {relatedBlogs.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-heading text-3xl font-bold text-zoss-blue text-center mb-12">
              Related Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedBlogs.map((relatedBlog) => (
                <Card key={relatedBlog._id} className="hover:shadow-lg transition-shadow">
                  <div className="w-full h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                    <img 
                      src={relatedBlog.placeholderImage} 
                      alt={relatedBlog.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-6">
                    <Badge variant="outline" className="text-zoss-green border-zoss-green mb-3">
                      {getSubtopicLabel(relatedBlog.subtopic)}
                    </Badge>
                    <h3 className="font-heading text-lg font-semibold text-zoss-blue mb-3 leading-tight">
                      {relatedBlog.title}
                    </h3>
                    <p className="text-sm text-zoss-gray mb-4 line-clamp-3">
                      {relatedBlog.summary}
                    </p>
                    <Link to={`/blogs/${relatedBlog._id}`}>
                      <Button variant="outline" className="w-full border-zoss-green text-zoss-green hover:bg-zoss-green hover:text-white">
                        Read Article
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-zoss-blue to-zoss-green text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl font-bold mb-4">
            Ready to Experience Zoss Water?
          </h2>
          <p className="text-xl mb-8">
            Transform your hydration with our premium alkaline water solutions
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/commercial-b2b">
              <Button size="lg" className="bg-white text-zoss-blue hover:bg-gray-100">
                Explore B2B Solutions
              </Button>
            </Link>
            <Link to="/contact-us">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-zoss-blue">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlogDetail;