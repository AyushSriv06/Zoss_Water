
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { blogsAPI } from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Blog {
  _id: string;
  title: string;
  summary: string;
  placeholderImage: string;
  subtopic: string;
  readTime: string;
  createdAt: string;
}

const Blogs = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const categories = [
    { id: "all", name: "All Articles" },
    { id: "ayurvedic", name: "Ayurvedic Insights" },
    { id: "science", name: "Hydration Science" },
    { id: "sustainability", name: "Sustainability" },
    { id: "case-studies", name: "Case Studies" }
  ];

  useEffect(() => {
    fetchBlogs();
  }, [selectedCategory, searchTerm]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      if (selectedCategory !== "all") {
        params.subtopic = selectedCategory;
      }
      
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      
      const response = await blogsAPI.getAllBlogs(params);
      setBlogs(response.data.data.blogs);
    } catch (error: any) {
      toast.error('Failed to load blog posts');
      console.error('Error fetching blogs:', error);
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

  return (
    <div className="min-h-screen bg-zoss-cream">
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-zoss-blue to-zoss-green text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            Knowledge Hub
          </h1>
          <p className="text-xl max-w-3xl mx-auto">
            Explore insights on wellness, sustainability, and the science of alkaline water
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search Bar */}
            <div className="mb-6">
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-2 focus:border-zoss-green"
              />
            </div>

            {/* Category Filter */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category.id)}
                    className={selectedCategory === category.id 
                      ? "bg-zoss-green hover:bg-zoss-green/90" 
                      : "border-zoss-green text-zoss-green hover:bg-zoss-green hover:text-white"
                    }
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Blog Posts Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-zoss-green" />
                <span className="ml-2 text-zoss-gray">Loading articles...</span>
              </div>
            ) : blogs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-zoss-gray text-lg">No articles found matching your criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {blogs.map((blog) => (
                  <Card key={blog._id} className="hover:shadow-lg transition-shadow">
                    <div className="w-full h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                      <img 
                        src={blog.placeholderImage} 
                        alt={blog.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-2 mb-3">
                        <Badge variant="outline" className="text-zoss-green border-zoss-green">
                          {getSubtopicLabel(blog.subtopic)}
                        </Badge>
                        <span className="text-sm text-zoss-gray">{blog.readTime}</span>
                      </div>
                      <h3 className="font-heading text-lg font-semibold text-zoss-blue mb-3 leading-tight">
                        {blog.title}
                      </h3>
                      <p className="text-sm text-zoss-gray mb-4 line-clamp-3">
                        {blog.summary}
                      </p>
                      <Link to={`/blogs/${blog._id}`} className="text-zoss-green hover:text-zoss-green/80 text-sm font-medium">
                        Read More →
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Newsletter Signup */}
            <Card className="p-6">
              <h3 className="font-heading text-lg font-semibold text-zoss-blue mb-4">
                Subscribe to Newsletter
              </h3>
              <p className="text-sm text-zoss-gray mb-4">
                Get the latest insights on wellness and water technology delivered to your inbox.
              </p>
              <div className="space-y-3">
                <Input type="email" placeholder="Enter your email" />
                <Button className="w-full bg-zoss-green hover:bg-zoss-green/90">
                  Subscribe
                </Button>
              </div>
            </Card>

            {/* Popular Posts */}
            <Card className="p-6">
              <h3 className="font-heading text-lg font-semibold text-zoss-blue mb-4">
                Popular Posts
              </h3>
              <div className="space-y-4">
                {blogs.slice(0, 4).map((blog) => (
                  <div key={blog._id} className="border-b border-gray-200 last:border-b-0 pb-3 last:pb-0">
                    <Link to={`/blogs/${blog._id}`} className="block">
                      <h4 className="text-sm font-medium text-zoss-blue hover:text-zoss-green transition-colors line-clamp-2">
                        {blog.title}
                      </h4>
                      <p className="text-xs text-zoss-gray mt-1">{blog.readTime}</p>
                    </Link>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blogs;
