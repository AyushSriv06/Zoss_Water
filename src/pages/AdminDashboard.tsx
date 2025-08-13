import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { adminAPI, productsAPI, servicesAPI, inventoryAPI } from '@/lib/api';
import { toast } from 'sonner';
import { 
  Users, 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  TrendingUp,
  Clock,
  Wrench,
  Minus,
  Search,
  Warehouse
} from 'lucide-react';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  pendingApprovals: number;
  overdueServices: number;
  recentUsers: number;
  lowStockItems: number;
}

interface User {
  _id: string;
  userId: string;
  name: string;
  email: string;
  createdAt: string;
}

interface Product {
  _id: string;
  userId: string;
  customerName?: string;
  customerEmail?: string;
  productName: string;
  modelNumber: string;
  purchaseDate: string;
  imageUrl?: string;
  warranty: {
    start: string;
    end: string;
  };
  amcValidity: {
    start: string;
    end: string;
  };
  isApprovedByAdmin: boolean;
}

interface ProductTemplate {
  _id: string;
  modelNumber: string;
  productName: string;
  description?: string;
  defaultWarrantyMonths: number;
  defaultAmcMonths: number;
  serviceFrequencyDays: number;
}

interface Service {
  _id: string;
  userId: {
    _id: string;
    userId: string;
    name: string;
    email: string;
    address: string;
    phoneNumber: string;
  };
  productId:{
    _id: string;
    productName: string;
    modelNumber: string;
    imageUrl?: string;
  }
  issueDescription: string;
  requestedDate: string;
  requestedTime: string;
  status: 'Pending Approval' | 'Completed' | 'Approved & Scheduled';
  technicianName?: string;
  technicianContact?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  lastServiceDate?: string;
}

interface InventoryItem {
  _id: string;
  itemName: string;
  category: 'machines' | 'materials';
  description?: string;
  quantity: number;
  unit: string;
  minStockLevel: number;
  price?: number;
  supplier?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

// 1. Add ProductCatalog type
interface ProductCatalog {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: 'B2C' | 'B2B';
  imageUrl?: string;
  features: string[];
  specifications?: Record<string, string>;
  brochureUrl?: string;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [pendingProducts, setPendingProducts] = useState<Product[]>([]);
  const [productTemplates, setProductTemplates] = useState<ProductTemplate[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userProducts, setUserProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddProductDialog, setShowAddProductDialog] = useState(false);
  const [showAddTemplateDialog, setShowAddTemplateDialog] = useState(false);
  const [pendingServiceRequests, setPendingServiceRequests] = useState<Service[]>([]);
  const [pendingLoading, setPendingLoading] = useState(true);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [scheduleForm, setScheduleForm] = useState({
    technicianName: '',
    technicianContact: '',
    scheduledDate: '',
    scheduledTime: ''
  });
  const [userServices, setUserServices] = useState<Service[]>([]);
  const [userServicesLoading, setUserServicesLoading] = useState(false);

  // Inventory state
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'machines' | 'materials' | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddInventoryDialog, setShowAddInventoryDialog] = useState(false);
  const [newInventoryItem, setNewInventoryItem] = useState({
    itemName: '',
    category: 'machines' as 'machines' | 'materials',
    description: '',
    quantity: 0,
    unit: 'pieces',
    minStockLevel: 10,
    price: 0,
    supplier: '',
    location: ''
  });

  const [newProduct, setNewProduct] = useState({
    customerEmail: '',
    productName: '',
    modelNumber: '',
    purchaseDate: '',
    imageUrl: '',
    customWarrantyMonths: '',
    customAmcMonths: '',
    customServiceFrequency: ''
  });

  const [newTemplate, setNewTemplate] = useState({
    modelNumber: '',
    productName: '',
    description: '',
    defaultWarrantyMonths: 12,
    defaultAmcMonths: 12,
    serviceFrequencyDays: 90
  });

  // 2. Add state for catalog products
  const [catalogProducts, setCatalogProducts] = useState<ProductCatalog[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [showCatalogDialog, setShowCatalogDialog] = useState(false);
  const [editCatalogProduct, setEditCatalogProduct] = useState<ProductCatalog | null>(null);
  const [catalogForm, setCatalogForm] = useState({
    name: '',
    description: '',
    price: 0,
    category: 'B2C' as 'B2C' | 'B2B',
    imageUrl: '',
    features: '',
    specifications: '',
    brochureUrl: ''
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, productsRes, pendingRes, templatesRes] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getAllUsers(),
        productsAPI.getAllProducts(),
        adminAPI.getPendingApprovals(),
        adminAPI.getProductTemplates(),
      ]);

      setStats(statsRes.data.data);
      setUsers(usersRes.data.data.users);
      setProducts(productsRes.data.data.products);
      setPendingProducts(pendingRes.data.data.pendingProducts);
      setProductTemplates(templatesRes.data.data.adminUpdates);
    } catch (error: any) {
      toast.error('Failed to load dashboard data');
      console.error('Admin dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = async (user: User) => {
    try {
      setSelectedUser(user);
      setUserServicesLoading(true);
      const [productsResponse, servicesResponse] = await Promise.all([
        productsAPI.getProductsByUser(user.userId),
        servicesAPI.getServicesByUser(user.userId)
      ]);
      setUserProducts(productsResponse.data.data.products);
      setUserServices(servicesResponse.data.data.services);
    } catch (error) {
      toast.error('Failed to load user data');
    } finally {
      setUserServicesLoading(false);
    }
  };

  const handleApproveProduct = async (productId: string) => {
    try {
      await adminAPI.approveProduct(productId);
      toast.success('Product approved successfully');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to approve product');
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const productData = {
        ...newProduct,
        customerEmail: selectedUser?.email || ''
      };
      
      await productsAPI.addProduct(productData);
      toast.success('Product added successfully');
      setShowAddProductDialog(false);
      setNewProduct({
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
      if (selectedUser) {
        handleUserClick(selectedUser);
      }
    } catch (error) {
      toast.error('Failed to add product');
    }
  };

  const handleAddTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminAPI.createProductTemplate(newTemplate);
      toast.success('Product template created successfully');
      setShowAddTemplateDialog(false);
      setNewTemplate({
        modelNumber: '',
        productName: '',
        description: '',
        defaultWarrantyMonths: 12,
        defaultAmcMonths: 12,
        serviceFrequencyDays: 90
      });
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to create product template');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productsAPI.deleteProduct(productId);
        toast.success('Product deleted successfully');
        fetchDashboardData();
        if (selectedUser) {
          handleUserClick(selectedUser);
        }
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  // Fetch pending and scheduled service requests
  const fetchPendingServiceRequests = async () => {
    setPendingLoading(true);
    try {
      const res = await servicesAPI.getPendingServiceRequests();
      console.log('Service response:', res.data.data.services);
      setPendingServiceRequests(res.data.data.services);
    } catch (error) {
      console.error('Error fetching pending services:', error);
      toast.error('Failed to load pending service requests');
    } finally {
      setPendingLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingServiceRequests();
  }, []);

  const handleToggleServiceStatus = async (service: Service) => {
    if (service.status === 'Approved & Scheduled') {
      // Mark as completed and delete
      try {
        await servicesAPI.updateService(service._id, { status: 'Completed' });
        toast.success('Service marked as completed and removed from list');
        fetchPendingServiceRequests();
      } catch (error) {
        toast.error('Failed to mark service as completed');
      }
    } else {
      const newStatus = service.status === 'Completed' ? 'Pending Approval' : 'Completed';
      try {
        await servicesAPI.updateService(service._id, { status: newStatus });
        toast.success(`Service marked as ${newStatus}`);
        fetchPendingServiceRequests();
      } catch (error) {
        toast.error('Failed to update service status');
      }
    }
  };

  const handleScheduleService = (service: Service) => {
    setSelectedService(service);
    setScheduleForm({
      technicianName: '',
      technicianContact: '',
      scheduledDate: '',
      scheduledTime: ''
    });
    setShowScheduleDialog(true);
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    try {
      await servicesAPI.scheduleService(selectedService._id, scheduleForm);
      toast.success('Service scheduled successfully');
      setShowScheduleDialog(false);
      setSelectedService(null);
      fetchPendingServiceRequests();
    } catch (error) {
      toast.error('Failed to schedule service');
    }
  };

  // Inventory functions
  const fetchInventory = async () => {
    try {
      setInventoryLoading(true);
      const params: any = {};
      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }
      if (searchQuery) {
        params.search = searchQuery;
      }
      
      const response = await inventoryAPI.getAllInventory(params);
      setInventory(response.data.data.inventory);
    } catch (error) {
      toast.error('Failed to load inventory');
    } finally {
      setInventoryLoading(false);
    }
  };

  const handleAddInventoryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await inventoryAPI.addInventoryItem(newInventoryItem);
      toast.success('Inventory item added successfully');
      setShowAddInventoryDialog(false);
      setNewInventoryItem({
        itemName: '',
        category: 'machines',
        description: '',
        quantity: 0,
        unit: 'pieces',
        minStockLevel: 10,
        price: 0,
        supplier: '',
        location: ''
      });
      fetchInventory();
    } catch (error) {
      toast.error('Failed to add inventory item');
    }
  };

  const handleUpdateQuantity = async (itemId: string, action: 'add' | 'subtract', quantity: number) => {
    try {
      await inventoryAPI.updateInventoryQuantity(itemId, { action, quantity });
      toast.success(`Quantity ${action === 'add' ? 'added' : 'subtracted'} successfully`);
      fetchInventory();
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  const handleDeleteInventoryItem = async (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await inventoryAPI.deleteInventoryItem(itemId);
        toast.success('Item deleted successfully');
        fetchInventory();
      } catch (error) {
        toast.error('Failed to delete item');
      }
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [selectedCategory, searchQuery]);

  // 3. Fetch catalog products
  const fetchCatalogProducts = async () => {
    setCatalogLoading(true);
    try {
      const res = await fetch('/api/catalog');
      const data = await res.json();
      setCatalogProducts(data.data.products);
    } catch (e) {
      toast.error('Failed to load catalog products');
    } finally {
      setCatalogLoading(false);
    }
  };
  useEffect(() => { fetchCatalogProducts(); }, []);

  // 4. Add handlers for add/edit/delete
  const handleCatalogDialogOpen = (product?: ProductCatalog) => {
    if (product) {
      setEditCatalogProduct(product);
      setCatalogForm({
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        imageUrl: product.imageUrl || '',
        features: (product.features || []).join('\n'),
        specifications: product.specifications ? Object.entries(product.specifications).map(([k, v]) => `${k}: ${v}`).join('\n') : '',
        brochureUrl: product.brochureUrl || ''
      });
    } else {
      setEditCatalogProduct(null);
      setCatalogForm({ name: '', description: '', price: 0, category: 'B2C', imageUrl: '', features: '', specifications: '', brochureUrl: '' });
    }
    setShowCatalogDialog(true);
  };
  const handleCatalogFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setCatalogForm({ ...catalogForm, [e.target.name]: e.target.value });
  };
  const handleCatalogFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const featuresArr = catalogForm.features.split('\n').map(f => f.trim()).filter(Boolean);
    const specificationsObj: Record<string, string> = {};
    catalogForm.specifications.split('\n').forEach(line => {
      const [k, ...rest] = line.split(':');
      if (k && rest.length) specificationsObj[k.trim()] = rest.join(':').trim();
    });
    try {
      if (editCatalogProduct) {
        await fetch(`/api/catalog/${editCatalogProduct._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...catalogForm, features: featuresArr, specifications: specificationsObj })
        });
        toast.success('Product updated');
      } else {
        await fetch('/api/catalog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...catalogForm, features: featuresArr, specifications: specificationsObj })
        });
        toast.success('Product added');
      }
      setShowCatalogDialog(false);
      fetchCatalogProducts();
    } catch (e) {
      toast.error('Failed to save product');
    }
  };
  const handleDeleteCatalogProduct = async (id: string) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await fetch(`/api/catalog/${id}`, { method: 'DELETE' });
      toast.success('Product deleted');
      fetchCatalogProducts();
    } catch (e) {
      toast.error('Failed to delete product');
    }
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
          <h1 className="text-3xl font-bold text-zoss-blue mb-2">Admin Dashboard</h1>
          <p className="text-zoss-gray">Manage users, products, and services across the platform.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-zoss-gray">Total Users</p>
                  <p className="text-2xl font-bold text-zoss-blue">{stats?.totalUsers || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-zoss-green" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-zoss-gray">Total Products</p>
                  <p className="text-2xl font-bold text-zoss-blue">{stats?.totalProducts || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-zoss-gray">Low Stock Items</p>
                  <p className="text-2xl font-bold text-zoss-blue">{stats?.lowStockItems || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-zoss-gray">Overdue Services</p>
                  <p className="text-2xl font-bold text-zoss-blue">{stats?.overdueServices || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-zoss-gray">New Users (30d)</p>
                  <p className="text-2xl font-bold text-zoss-blue">{stats?.recentUsers || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="users">Users & Products</TabsTrigger>
            <TabsTrigger value="inventory">Inventory Management</TabsTrigger>
            <TabsTrigger value="templates">Product Templates</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="catalog">Product Catalog</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Users List */}
              <Card>
                <CardHeader>
                  <CardTitle>Registered Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {users.map((user) => (
                      <div 
                        key={user._id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedUser?._id === user._id 
                            ? 'bg-zoss-green/10 border-zoss-green' 
                            : 'bg-white hover:bg-gray-50'
                        }`}
                        onClick={() => handleUserClick(user)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-zoss-blue">{user.name}</p>
                            <p className="text-sm text-zoss-gray">{user.email}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-zoss-gray">
                              Joined {format(new Date(user.createdAt), 'MMM yyyy')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* User Products */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>
                      {selectedUser ? `${selectedUser.name}'s Products` : 'Select a user to view products'}
                    </CardTitle>
                    {selectedUser && (
                      <Dialog open={showAddProductDialog} onOpenChange={setShowAddProductDialog}>
                        <DialogTrigger asChild>
                          <Button size="sm" className="bg-zoss-green hover:bg-zoss-green/90">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Product
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Add Product for {selectedUser.name}</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleAddProduct} className="space-y-4">
                            <div>
                              <Label htmlFor="productName">Product Name</Label>
                              <Input
                                id="productName"
                                value={newProduct.productName}
                                onChange={(e) => setNewProduct({...newProduct, productName: e.target.value})}
                                required
                              />
                            </div>

                            <div>
                              <Label htmlFor="modelNumber">Model Number</Label>
                              <Select value={newProduct.modelNumber} onValueChange={(value) => setNewProduct({...newProduct, modelNumber: value})}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select model" />
                                </SelectTrigger>
                                <SelectContent>
                                  {productTemplates.map((template) => (
                                    <SelectItem key={template._id} value={template.modelNumber}>
                                      {template.modelNumber} - {template.productName}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label htmlFor="purchaseDate">Purchase Date</Label>
                              <Input
                                id="purchaseDate"
                                type="date"
                                value={newProduct.purchaseDate}
                                onChange={(e) => setNewProduct({...newProduct, purchaseDate: e.target.value})}
                                required
                              />
                            </div>

                            <div>
                              <Label htmlFor="imageUrl">Image URL (optional)</Label>
                              <Input
                                id="imageUrl"
                                value={newProduct.imageUrl}
                                onChange={(e) => setNewProduct({...newProduct, imageUrl: e.target.value})}
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="warrantyMonths">Warranty (months)</Label>
                                <Input
                                  id="warrantyMonths"
                                  type="number"
                                  value={newProduct.customWarrantyMonths}
                                  onChange={(e) => setNewProduct({...newProduct, customWarrantyMonths: e.target.value})}
                                  placeholder="12"
                                />
                              </div>
                              <div>
                                <Label htmlFor="amcMonths">AMC (months)</Label>
                                <Input
                                  id="amcMonths"
                                  type="number"
                                  value={newProduct.customAmcMonths}
                                  onChange={(e) => setNewProduct({...newProduct, customAmcMonths: e.target.value})}
                                  placeholder="12"
                                />
                              </div>
                            </div>

                            <Button type="submit" className="w-full bg-zoss-green hover:bg-zoss-green/90">
                              Add Product
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedUser ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {userProducts.length === 0 ? (
                        <p className="text-center text-zoss-gray py-8">No products found for this user.</p>
                      ) : (
                        userProducts.map((product) => (
                          <div key={product._id} className="p-3 bg-white rounded-lg border">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-zoss-blue">{product.productName}</p>
                                <p className="text-sm text-zoss-gray">Model: {product.modelNumber}</p>
                                <p className="text-xs text-zoss-gray">
                                  Purchased: {format(new Date(product.purchaseDate), 'MMM dd, yyyy')}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant={product.isApprovedByAdmin ? "default" : "secondary"}>
                                  {product.isApprovedByAdmin ? "Approved" : "Pending"}
                                </Badge>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteProduct(product._id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    <p className="text-center text-zoss-gray py-8">Select a user from the left to view their products.</p>
                  )}
                </CardContent>
              </Card>

              {/* User Services */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {selectedUser ? `${selectedUser.name}'s Services` : 'Select a user to view services'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedUser ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {userServicesLoading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zoss-green mx-auto"></div>
                          <p className="text-sm text-zoss-gray mt-2">Loading services...</p>
                        </div>
                      ) : userServices.length === 0 ? (
                        <p className="text-center text-zoss-gray py-8">No services found for this user.</p>
                      ) : (
                        userServices.map((service) => (
                          <div key={service._id} className="p-3 bg-white rounded-lg border">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-zoss-blue">{service.productId?.productName || 'N/A'}</p>
                                  <p className="text-sm text-zoss-gray">Model: {service.productId?.modelNumber || 'N/A'}</p>
                                </div>
                                <Badge className={
                                  service.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                  service.status === 'Approved & Scheduled' ? 'bg-purple-100 text-purple-800' :
                                  'bg-orange-100 text-orange-800'
                                }>
                                  {service.status}
                                </Badge>
                              </div>
                              {service.issueDescription && (
                                <p className="text-sm text-zoss-gray break-words whitespace-pre-line">
                                  {service.issueDescription}
                                </p>
                              )}
                              <div className="text-xs text-zoss-gray space-y-1">
                                {service.requestedDate && (
                                  <p>Requested: {format(new Date(service.requestedDate), 'MMM dd, yyyy')} at {service.requestedTime}</p>
                                )}
                                {service.scheduledDate && (
                                  <p>Scheduled: {format(new Date(service.scheduledDate), 'MMM dd, yyyy')} at {service.scheduledTime}</p>
                                )}
                                {service.technicianName && (
                                  <p>Technician: {service.technicianName}</p>
                                )}
                                {service.lastServiceDate && (
                                  <p>Last Service: {format(new Date(service.lastServiceDate), 'MMM dd, yyyy')}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    <p className="text-center text-zoss-gray py-8">Select a user from the left to view their services.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Warehouse className="h-5 w-5 text-zoss-green" />
                    <span>Inventory Management</span>
                  </CardTitle>
                  <Dialog open={showAddInventoryDialog} onOpenChange={setShowAddInventoryDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-zoss-green hover:bg-zoss-green/90">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Item
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add New Inventory Item</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAddInventoryItem} className="space-y-4">
                        <div>
                          <Label htmlFor="itemName">Item Name</Label>
                          <Input
                            id="itemName"
                            value={newInventoryItem.itemName}
                            onChange={(e) => setNewInventoryItem({...newInventoryItem, itemName: e.target.value})}
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="category">Category</Label>
                          <Select 
                            value={newInventoryItem.category} 
                            onValueChange={(value: 'machines' | 'materials') => 
                              setNewInventoryItem({...newInventoryItem, category: value})
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="machines">Machines</SelectItem>
                              <SelectItem value="materials">Materials</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="description">Description (optional)</Label>
                          <Input
                            id="description"
                            value={newInventoryItem.description}
                            onChange={(e) => setNewInventoryItem({...newInventoryItem, description: e.target.value})}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="quantity">Initial Quantity</Label>
                            <Input
                              id="quantity"
                              type="number"
                              value={newInventoryItem.quantity}
                              onChange={(e) => setNewInventoryItem({...newInventoryItem, quantity: parseInt(e.target.value)})}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="unit">Unit</Label>
                            <Input
                              id="unit"
                              value={newInventoryItem.unit}
                              onChange={(e) => setNewInventoryItem({...newInventoryItem, unit: e.target.value})}
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="minStockLevel">Min Stock Level</Label>
                            <Input
                              id="minStockLevel"
                              type="number"
                              value={newInventoryItem.minStockLevel}
                              onChange={(e) => setNewInventoryItem({...newInventoryItem, minStockLevel: parseInt(e.target.value)})}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="price">Price (optional)</Label>
                            <Input
                              id="price"
                              type="number"
                              value={newInventoryItem.price}
                              onChange={(e) => setNewInventoryItem({...newInventoryItem, price: parseFloat(e.target.value)})}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="supplier">Supplier (optional)</Label>
                            <Input
                              id="supplier"
                              value={newInventoryItem.supplier}
                              onChange={(e) => setNewInventoryItem({...newInventoryItem, supplier: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="location">Location (optional)</Label>
                            <Input
                              id="location"
                              value={newInventoryItem.location}
                              onChange={(e) => setNewInventoryItem({...newInventoryItem, location: e.target.value})}
                            />
                          </div>
                        </div>

                        <Button type="submit" className="w-full bg-zoss-green hover:bg-zoss-green/90">
                          Add Item
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <Label htmlFor="search">Search Items</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="search"
                        placeholder="Search by item name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="w-full sm:w-48">
                    <Label htmlFor="category">Category</Label>
                    <Select value={selectedCategory} onValueChange={(value: 'machines' | 'materials' | 'all') => setSelectedCategory(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="machines">Machines</SelectItem>
                        <SelectItem value="materials">Materials</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Inventory Table */}
                {inventoryLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zoss-green mx-auto"></div>
                    <p className="text-sm text-zoss-gray mt-2">Loading inventory...</p>
                  </div>
                ) : inventory.length === 0 ? (
                  <p className="text-center text-zoss-gray py-8">No inventory items found.</p>
                ) : (
                  <div className="space-y-4">
                    {inventory.map((item) => (
                      <div key={item._id} className="p-4 bg-white rounded-lg border">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <div>
                                <p className="font-medium text-zoss-blue">{item.itemName}</p>
                                <p className="text-sm text-zoss-gray">
                                  {item.description || 'No description'}
                                </p>
                                <div className="flex items-center space-x-4 mt-1">
                                  <Badge variant={item.category === 'machines' ? 'default' : 'secondary'}>
                                    {item.category}
                                  </Badge>
                                  <span className="text-sm text-zoss-gray">
                                    Quantity: <span className={`font-medium ${item.quantity < item.minStockLevel ? 'text-red-500' : 'text-green-600'}`}>
                                      {item.quantity} {item.unit}
                                    </span>
                                  </span>
                                  {item.price && (
                                    <span className="text-sm text-zoss-gray">
                                      Price: ₹{item.price}
                                    </span>
                                  )}
                                </div>
                                {(item.supplier || item.location) && (
                                  <div className="text-xs text-zoss-gray mt-1">
                                    {item.supplier && <span>Supplier: {item.supplier}</span>}
                                    {item.supplier && item.location && <span> • </span>}
                                    {item.location && <span>Location: {item.location}</span>}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateQuantity(item._id, 'subtract', 1)}
                                disabled={item.quantity <= 0}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="text-sm font-medium min-w-[2rem] text-center">
                                {item.quantity}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateQuantity(item._id, 'add', 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteInventoryItem(item._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Product Templates</CardTitle>
                  <Dialog open={showAddTemplateDialog} onOpenChange={setShowAddTemplateDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-zoss-green hover:bg-zoss-green/90">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Template
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create Product Template</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAddTemplate} className="space-y-4">
                        <div>
                          <Label htmlFor="templateModelNumber">Model Number</Label>
                          <Input
                            id="templateModelNumber"
                            value={newTemplate.modelNumber}
                            onChange={(e) => setNewTemplate({...newTemplate, modelNumber: e.target.value})}
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="templateProductName">Product Name</Label>
                          <Input
                            id="templateProductName"
                            value={newTemplate.productName}
                            onChange={(e) => setNewTemplate({...newTemplate, productName: e.target.value})}
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="templateDescription">Description</Label>
                          <Input
                            id="templateDescription"
                            value={newTemplate.description}
                            onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="templateWarranty">Warranty (months)</Label>
                            <Input
                              id="templateWarranty"
                              type="number"
                              value={newTemplate.defaultWarrantyMonths}
                              onChange={(e) => setNewTemplate({...newTemplate, defaultWarrantyMonths: parseInt(e.target.value)})}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="templateAmc">AMC (months)</Label>
                            <Input
                              id="templateAmc"
                              type="number"
                              value={newTemplate.defaultAmcMonths}
                              onChange={(e) => setNewTemplate({...newTemplate, defaultAmcMonths: parseInt(e.target.value)})}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="templateService">Service Frequency (days)</Label>
                            <Input
                              id="templateService"
                              type="number"
                              value={newTemplate.serviceFrequencyDays}
                              onChange={(e) => setNewTemplate({...newTemplate, serviceFrequencyDays: parseInt(e.target.value)})}
                              required
                            />
                          </div>
                        </div>

                        <Button type="submit" className="w-full bg-zoss-green hover:bg-zoss-green/90">
                          Create Template
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {productTemplates.map((template) => (
                    <Card key={template._id}>
                      <CardContent className="p-4">
                        <h3 className="font-medium text-zoss-blue">{template.productName}</h3>
                        <p className="text-sm text-zoss-gray mb-2">Model: {template.modelNumber}</p>
                        {template.description && (
                          <p className="text-xs text-zoss-gray mb-3">{template.description}</p>
                        )}
                        <div className="space-y-1 text-xs">
                          <p>Warranty: {template.defaultWarrantyMonths} months</p>
                          <p>AMC: {template.defaultAmcMonths} months</p>
                          <p>Service: Every {template.serviceFrequencyDays} days</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            {/* Pending Service Requests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  <span>Pending Service Requests</span>
                  <Badge variant="secondary">{pendingServiceRequests.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingLoading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : pendingServiceRequests.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No pending service requests</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Issue</TableHead>
                        <TableHead>Requested Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.isArray(pendingServiceRequests) && pendingServiceRequests.map((service) => {
                        console.log('Rendering service:', service);
                        return (
                        <TableRow key={service._id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{service.userId?.name || 'N/A'}</p>
                              <p className="text-sm text-gray-500">{service.userId?.email || 'N/A'}</p>
                              <p className="text-xs text-gray-400">{service.userId?.phoneNumber || 'N/A'}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                              <div>
                                <p className="font-medium">
                                  {service.productId && typeof service.productId === 'object' && 'productName' in service.productId
                                    ? service.productId.productName
                                    : 'N/A'}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {service.productId && typeof service.productId === 'object' && 'modelNumber' in service.productId
                                    ? service.productId.modelNumber
                                    : ''}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="max-w-sm">
                              <p className="whitespace-normal break-words text-sm text-zoss-gray">
                                {service.issueDescription}
                              </p>
                            </TableCell>
                          <TableCell>
                            {service.requestedDate && (
                              <div>
                                <p>{format(new Date(service.requestedDate), 'MMM dd, yyyy')}</p>
                                <p className="text-sm text-gray-500">{service.requestedTime}</p>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-orange-100 text-orange-800">
                              {service.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {service.status === 'Pending Approval' ? (
                              <Button
                                size="sm"
                                onClick={() => handleScheduleService(service)}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                <Wrench className="h-4 w-4 mr-1" />
                                Schedule Service
                              </Button>
                            ) : service.status === 'Approved & Scheduled' ? (
                              <div className="space-y-2">
                                <div className="space-y-1">
                                  <Badge className="bg-green-100 text-green-800">
                                    Scheduled
                                  </Badge>
                                  {service.technicianName && (
                                    <p className="text-xs text-gray-500">
                                      Tech: {service.technicianName}
                                    </p>
                                  )}
                                  {service.scheduledDate && (
                                    <p className="text-xs text-gray-500">
                                      {format(new Date(service.scheduledDate), 'MMM dd, yyyy')} at {service.scheduledTime}
                                    </p>
                                  )}
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => handleToggleServiceStatus(service)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Mark Completed
                                </Button>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => handleToggleServiceStatus(service)}
                                className={service.status === 'Completed' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-600 hover:bg-green-700'}
                              >
                                {service.status === 'Completed' ? 'Mark Pending' : 'Mark Completed'}
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
            {/* ... rest of the service management section ... */}
          </TabsContent>

          <TabsContent value="catalog" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Product Catalog Management</CardTitle>
                  <Button className="bg-zoss-green hover:bg-zoss-green/90" onClick={() => handleCatalogDialogOpen()}>
                    <Plus className="h-4 w-4 mr-2" /> Add Product
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {catalogLoading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : catalogProducts.length === 0 ? (
                  <p className="text-center text-zoss-gray py-8">No catalog products found.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {catalogProducts.map(product => (
                      <Card key={product._id} className="relative">
                        <CardContent className="p-4">
                          <img src={product.imageUrl} alt={product.name} className="w-full h-40 object-contain mb-2 bg-gray-50 rounded" />
                          <h3 className="font-medium text-zoss-blue text-lg">{product.name}</h3>
                          <p className="text-sm text-zoss-gray mb-2">{product.description}</p>
                          <div className="text-zoss-green font-bold text-xl mb-2">₹{product.price.toLocaleString()}</div>
                          <Badge>{product.category}</Badge>
                          <div className="mt-2 mb-2">
                            <strong>Features:</strong>
                            <ul className="list-disc ml-5 text-xs text-zoss-gray">
                              {product.features.map((f, i) => <li key={i}>{f}</li>)}
                            </ul>
                          </div>
                          {product.specifications && (
                            <div className="mb-2">
                              <strong>Specifications:</strong>
                              <ul className="list-disc ml-5 text-xs text-zoss-gray">
                                {Object.entries(product.specifications).map(([k, v], i) => <li key={i}><b>{k}:</b> {v}</li>)}
                              </ul>
                            </div>
                          )}
                          {product.brochureUrl && (
                            <div className="mb-2">
                              <a href={product.brochureUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-xs">Brochure</a>
                            </div>
                          )}
                          <div className="flex gap-2 mt-2">
                            <Button size="sm" variant="outline" onClick={() => handleCatalogDialogOpen(product)}><Edit className="h-4 w-4" /></Button>
                            <Button size="sm" variant="outline" onClick={() => handleDeleteCatalogProduct(product._id)}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            {/* Dialog for add/edit */}
            <Dialog open={showCatalogDialog} onOpenChange={setShowCatalogDialog}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editCatalogProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCatalogFormSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" value={catalogForm.name} onChange={handleCatalogFormChange} required />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input id="description" name="description" value={catalogForm.description} onChange={handleCatalogFormChange} required />
                  </div>
                  <div>
                    <Label htmlFor="price">Price</Label>
                    <Input id="price" name="price" type="number" value={catalogForm.price} onChange={handleCatalogFormChange} required />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <select id="category" name="category" value={catalogForm.category} onChange={handleCatalogFormChange} className="w-full border rounded p-2">
                      <option value="B2C">B2C</option>
                      <option value="B2B">B2B</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <Input id="imageUrl" name="imageUrl" value={catalogForm.imageUrl} onChange={handleCatalogFormChange} />
                  </div>
                  <div>
                    <Label htmlFor="features">Features (one per line)</Label>
                    <textarea id="features" name="features" value={catalogForm.features} onChange={handleCatalogFormChange} className="w-full border rounded p-2" rows={4} />
                  </div>
                  <div>
                    <Label htmlFor="specifications">Specifications (key: value per line)</Label>
                    <textarea id="specifications" name="specifications" value={catalogForm.specifications} onChange={handleCatalogFormChange} className="w-full border rounded p-2" rows={4} />
                  </div>
                  <div>
                    <Label htmlFor="brochureUrl">Brochure URL</Label>
                    <Input id="brochureUrl" name="brochureUrl" value={catalogForm.brochureUrl} onChange={handleCatalogFormChange} />
                  </div>
                  <Button type="submit" className="w-full bg-zoss-green hover:bg-zoss-green/90">{editCatalogProduct ? 'Update' : 'Add'} Product</Button>
                </form>
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>

        {/* Schedule Service Dialog */}
        <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Wrench className="h-5 w-5 text-blue-500" />
                <span>Schedule Service</span>
              </DialogTitle>
            </DialogHeader>
            
            {selectedService && (
              <form onSubmit={handleScheduleSubmit} className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-zoss-blue mb-2">Service Details</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Customer:</span> {selectedService.userId?.name}</p>
                    <p><span className="font-medium">Product:</span> {selectedService.productId?.productName}</p>
                    <p><span className="font-medium">Issue:</span> {selectedService.issueDescription}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="technicianName">Technician Name</Label>
                    <Input
                      id="technicianName"
                      value={scheduleForm.technicianName}
                      onChange={(e) => setScheduleForm({...scheduleForm, technicianName: e.target.value})}
                      placeholder="Enter technician name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="technicianContact">Technician Contact</Label>
                    <Input
                      id="technicianContact"
                      value={scheduleForm.technicianContact}
                      onChange={(e) => setScheduleForm({...scheduleForm, technicianContact: e.target.value})}
                      placeholder="Enter technician contact number"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="scheduledDate">Scheduled Date</Label>
                    <Input
                      id="scheduledDate"
                      type="date"
                      value={scheduleForm.scheduledDate}
                      onChange={(e) => setScheduleForm({...scheduleForm, scheduledDate: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="scheduledTime">Scheduled Time</Label>
                    <Input
                      id="scheduledTime"
                      type="time"
                      value={scheduleForm.scheduledTime}
                      onChange={(e) => setScheduleForm({...scheduleForm, scheduledTime: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowScheduleDialog(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Schedule Service
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminDashboard;