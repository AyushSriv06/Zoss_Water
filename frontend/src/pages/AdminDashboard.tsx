import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { adminAPI, productsAPI, servicesAPI, blogsAPI } from '@/lib/api';
import { toast } from 'sonner';
import BlogForm from '@/components/BlogForm';
import { 
  Users, 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  Calendar,
  Plus,
  Edit,
  Trash2,
  Eye,
  FileText,
  BarChart3,
  Wrench,
  UserCheck,
  Clock,
  TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  pendingApprovals: number;
  overdueServices: number;
  recentUsers: number;
  lowStockItems: number;
}

interface Product {
  _id: string;
  productName: string;
  modelNumber: string;
  customerName?: string;
  customerEmail?: string;
  createdAt: string;
}

interface Service {
  _id: string;
  productId: {
    productName: string;
    modelNumber: string;
  };
  issueDescription: string;
  requestedDate: string;
  requestedTime: string;
  status: string;
  createdAt: string;
}

interface Blog {
  _id: string;
  title: string;
  summary: string;
  placeholderImage: string;
  subtopic: string;
  readTime: string;
  isPublished: boolean;
  createdAt: string;
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [productForm, setProductForm] = useState({
    customerEmail: '',
    productName: '',
    modelNumber: '',
    purchaseDate: '',
    imageUrl: '',
    customWarrantyMonths: '',
    customAmcMonths: '',
    customServiceFrequency: ''
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, productsRes, servicesRes, blogsRes] = await Promise.all([
        adminAPI.getDashboardStats(),
        productsAPI.getAllProducts(1, 10),
        servicesAPI.getPendingServiceRequests(),
        blogsAPI.getAllBlogsAdmin(1, 20),
      ]);

      setStats(statsRes.data.data);
      setProducts(productsRes.data.data.products);
      setServices(servicesRes.data.data.services);
      setBlogs(blogsRes.data.data.blogs);
    } catch (error: any) {
      toast.error('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productForm.customerEmail || !productForm.productName || !productForm.modelNumber || !productForm.purchaseDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await productsAPI.addProduct(productForm);
      toast.success('Product added successfully!');
      setShowProductForm(false);
      setProductForm({
        customerEmail: '',
        productName: '',
        modelNumber: '',
        purchaseDate: '',
        imageUrl: '',
        customWarrantyMonths: '',
        customAmcMonths: '',
        customServiceFrequency: ''
      });
      fetchDashboardData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add product');
    }
  };

  const handleEditBlog = (blog: Blog) => {
    setEditingBlog(blog);
    setShowBlogForm(true);
  };

  const handleDeleteBlog = async (blogId: string) => {
    try {
      await blogsAPI.deleteBlog(blogId);
      toast.success('Blog post deleted successfully!');
      fetchDashboardData();
    } catch (error: any) {
      toast.error('Failed to delete blog post');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-zoss-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-zoss-green"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zoss-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zoss-blue mb-2">
            Admin Dashboard
          </h1>
          <p className="text-zoss-gray">
            Welcome back, {user?.name}! Manage your Zoss Water system from here.
          </p>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-zoss-gray">Total Users</p>
                    <p className="text-2xl font-bold text-zoss-blue">{stats.totalUsers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Package className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-zoss-gray">Total Products</p>
                    <p className="text-2xl font-bold text-zoss-blue">{stats.totalProducts}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-zoss-gray">Pending Approvals</p>
                    <p className="text-2xl font-bold text-zoss-blue">{stats.pendingApprovals}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Wrench className="h-8 w-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-zoss-gray">Overdue Services</p>
                    <p className="text-2xl font-bold text-zoss-blue">{stats.overdueServices}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-zoss-gray">Recent Users</p>
                    <p className="text-2xl font-bold text-zoss-blue">{stats.recentUsers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-zoss-green" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-zoss-gray">Blog Posts</p>
                    <p className="text-2xl font-bold text-zoss-blue">{blogs.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="blogs">Blog Management</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-zoss-green" />
                    <span>Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                      <UserCheck className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">New user registrations</p>
                        <p className="text-xs text-blue-600">{stats?.recentUsers} in the last 30 days</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                      <Package className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-800">Products registered</p>
                        <p className="text-xs text-green-600">{stats?.totalProducts} total products</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                      <Clock className="h-5 w-5 text-yellow-600" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800">Pending approvals</p>
                        <p className="text-xs text-yellow-600">{stats?.pendingApprovals} awaiting review</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <span>Attention Required</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats?.pendingApprovals > 0 && (
                      <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <p className="text-sm font-medium text-orange-800">
                          {stats.pendingApprovals} products awaiting approval
                        </p>
                        <Button 
                          size="sm" 
                          className="mt-2 bg-orange-600 hover:bg-orange-700"
                          onClick={() => setActiveTab('products')}
                        >
                          Review Now
                        </Button>
                      </div>
                    )}
                    {stats?.overdueServices > 0 && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm font-medium text-red-800">
                          {stats.overdueServices} services are overdue
                        </p>
                        <Button 
                          size="sm" 
                          className="mt-2 bg-red-600 hover:bg-red-700"
                          onClick={() => setActiveTab('services')}
                        >
                          View Services
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-zoss-blue">Product Management</h2>
                <Button 
                  onClick={() => setShowProductForm(true)}
                  className="bg-zoss-green hover:bg-zoss-green/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {products.map((product) => (
                  <Card key={product._id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Package className="h-6 w-6 text-zoss-green" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-zoss-blue">{product.productName}</h3>
                            <p className="text-sm text-zoss-gray">Model: {product.modelNumber}</p>
                            <p className="text-sm text-zoss-gray">
                              Customer: {product.customerName} ({product.customerEmail})
                            </p>
                            <p className="text-xs text-zoss-gray">
                              Added: {format(new Date(product.createdAt), 'MMM dd, yyyy')}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-zoss-blue">Service Management</h2>
              
              <div className="grid grid-cols-1 gap-4">
                {services.map((service) => (
                  <Card key={service._id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Wrench className="h-6 w-6 text-zoss-green" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-zoss-blue">
                              {service.productId.productName}
                            </h3>
                            <p className="text-sm text-zoss-gray">
                              Model: {service.productId.modelNumber}
                            </p>
                            <p className="text-sm text-zoss-gray">
                              Issue: {service.issueDescription.substring(0, 50)}...
                            </p>
                            <p className="text-xs text-zoss-gray">
                              Requested: {format(new Date(service.requestedDate), 'MMM dd, yyyy')} at {service.requestedTime}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge className="bg-orange-100 text-orange-800">
                            {service.status}
                          </Badge>
                          <Button size="sm" className="bg-zoss-green hover:bg-zoss-green/90">
                            Schedule
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Blog Management Tab */}
          <TabsContent value="blogs">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-zoss-blue">Blog Management</h2>
                <Button 
                  onClick={() => {
                    setEditingBlog(null);
                    setShowBlogForm(true);
                  }}
                  className="bg-zoss-green hover:bg-zoss-green/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Blog
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {blogs.map((blog) => (
                  <Card key={blog._id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                            <img 
                              src={blog.placeholderImage} 
                              alt={blog.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge variant="outline" className="text-zoss-green border-zoss-green">
                                {getSubtopicLabel(blog.subtopic)}
                              </Badge>
                              <Badge 
                                variant={blog.isPublished ? "default" : "secondary"}
                                className={blog.isPublished ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                              >
                                {blog.isPublished ? "Published" : "Draft"}
                              </Badge>
                              <span className="text-xs text-zoss-gray">{blog.readTime}</span>
                            </div>
                            <h3 className="font-semibold text-zoss-blue text-lg mb-2 line-clamp-2">
                              {blog.title}
                            </h3>
                            <p className="text-sm text-zoss-gray mb-3 line-clamp-2">
                              {blog.summary}
                            </p>
                            <p className="text-xs text-zoss-gray">
                              Created: {format(new Date(blog.createdAt), 'MMM dd, yyyy')}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => window.open(`/blogs/${blog._id}`, '_blank')}
                            className="border-blue-500 text-blue-600 hover:bg-blue-50"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditBlog(blog)}
                            className="border-zoss-green text-zoss-green hover:bg-zoss-green/10"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="border-red-500 text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{blog.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteBlog(blog._id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Add Product Form */}
        <Dialog open={showProductForm} onOpenChange={setShowProductForm}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerEmail">Customer Email *</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={productForm.customerEmail}
                    onChange={(e) => setProductForm({...productForm, customerEmail: e.target.value})}
                    placeholder="customer@example.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="productName">Product Name *</Label>
                  <Input
                    id="productName"
                    value={productForm.productName}
                    onChange={(e) => setProductForm({...productForm, productName: e.target.value})}
                    placeholder="Zoss Countertop Ionizer"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="modelNumber">Model Number *</Label>
                  <Input
                    id="modelNumber"
                    value={productForm.modelNumber}
                    onChange={(e) => setProductForm({...productForm, modelNumber: e.target.value})}
                    placeholder="ZW-CT-001"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="purchaseDate">Purchase Date *</Label>
                  <Input
                    id="purchaseDate"
                    type="date"
                    value={productForm.purchaseDate}
                    onChange={(e) => setProductForm({...productForm, purchaseDate: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    value={productForm.imageUrl}
                    onChange={(e) => setProductForm({...productForm, imageUrl: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div>
                  <Label htmlFor="warrantyMonths">Warranty (Months)</Label>
                  <Input
                    id="warrantyMonths"
                    type="number"
                    value={productForm.customWarrantyMonths}
                    onChange={(e) => setProductForm({...productForm, customWarrantyMonths: e.target.value})}
                    placeholder="12"
                  />
                </div>
              </div>
              <div className="flex space-x-3">
                <Button type="button" variant="outline" onClick={() => setShowProductForm(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-zoss-green hover:bg-zoss-green/90">
                  Add Product
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Blog Form */}
        <BlogForm
          isOpen={showBlogForm}
          onClose={() => {
            setShowBlogForm(false);
            setEditingBlog(null);
          }}
          onSuccess={fetchDashboardData}
          editBlog={editingBlog}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;