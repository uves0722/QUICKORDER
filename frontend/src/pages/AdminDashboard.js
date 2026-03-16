import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Settings as SettingsIcon, 
  Bell, 
  LogOut,
  Plus,
  Edit,
  Trash2,
  QrCode,
  Share2,
  Upload,
  X
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function AdminDashboard() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [settings, setSettings] = useState({
    restaurantName: 'Quick Order',
    tagline: 'Delicious Food, Quick Service',
    primaryColor: '#E8C547',
    logo: null
  });
  const [isMenuDialogOpen, setIsMenuDialogOpen] = useState(false);
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: '',
    prepTime: '',
    popular: false
  });

  const customerUrl = window.location.origin;

  useEffect(() => {
    fetchOrders();
    fetchMenuItems();
    fetchSettings();
    
    // Poll for new orders every 5 seconds
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/orders`);
      const newOrders = response.data;
      
      // Check for new orders
      if (newOrders.length > orders.length) {
        const latestOrder = newOrders[0];
        toast.success(`New order from Table ${latestOrder.tableNumber}!`, {
          duration: 5000,
        });
        
        // Browser notification
        if (Notification.permission === 'granted') {
          new Notification('New Order Received!', {
            body: `Table ${latestOrder.tableNumber} - ₹${latestOrder.total}`,
            icon: '/logo192.png'
          });
        }
      }
      
      setOrders(newOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/menu`);
      setMenuItems(response.data);
    } catch (error) {
      console.error('Error fetching menu:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/settings`);
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast.success('Notifications enabled!');
      }
    }
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
    toast.success('Logged out successfully');
  };

  const handleSaveMenuItem = async () => {
    try {
      if (editingItem) {
        await axios.put(`${API_URL}/api/menu/${editingItem.id}`, newItem);
        toast.success('Menu item updated!');
      } else {
        await axios.post(`${API_URL}/api/menu`, newItem);
        toast.success('Menu item added!');
      }
      
      fetchMenuItems();
      setIsMenuDialogOpen(false);
      setEditingItem(null);
      setNewItem({
        name: '',
        description: '',
        price: '',
        image: '',
        category: '',
        prepTime: '',
        popular: false
      });
    } catch (error) {
      toast.error('Failed to save menu item');
    }
  };

  const handleDeleteMenuItem = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/menu/${id}`);
      toast.success('Menu item deleted');
      fetchMenuItems();
    } catch (error) {
      toast.error('Failed to delete menu item');
    }
  };

  const handleUpdateSettings = async () => {
    try {
      await axios.put(`${API_URL}/api/settings`, settings);
      toast.success('Settings updated!');
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setNewItem(item);
    setIsMenuDialogOpen(true);
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(`${API_URL}/api/orders/${orderId}`, { status });
      toast.success('Order status updated');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const downloadQRCode = () => {
    const svg = document.getElementById('qr-code');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = 'quick-order-qr.png';
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(customerUrl);
    toast.success('Link copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Quick Order Admin</h1>
                <p className="text-sm text-muted-foreground">Welcome, {admin?.username}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="border-border hover:bg-muted"
            >
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="dashboard" className="gap-2">
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="menu" className="gap-2">
              <ShoppingBag className="w-4 h-4" /> Menu
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <SettingsIcon className="w-4 h-4" /> Settings
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 bg-gradient-card border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Orders</p>
                    <p className="text-3xl font-bold">{orders.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </Card>
              
              <Card className="p-6 bg-gradient-card border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Menu Items</p>
                    <p className="text-3xl font-bold">{menuItems.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-card border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Pending Orders</p>
                    <p className="text-3xl font-bold">
                      {orders.filter(o => o.status === 'pending').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Bell className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </Card>
            </div>

            {/* QR Code Card */}
            <Card className="p-6 bg-gradient-card border-border">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">Share Your Menu</h3>
                  <p className="text-muted-foreground mb-4">
                    Share the link or QR code with your customers to let them order directly.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      onClick={() => setIsQRDialogOpen(true)}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      <QrCode className="w-4 h-4 mr-2" /> View QR Code
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={copyLink}
                      className="border-border hover:bg-muted"
                    >
                      <Share2 className="w-4 h-4 mr-2" /> Copy Link
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Recent Orders */}
            <Card className="p-6 bg-gradient-card border-border">
              <h3 className="text-xl font-bold mb-4">Recent Orders</h3>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {orders.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No orders yet</p>
                    </div>
                  ) : (
                    orders.map((order) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-4 bg-muted/30 rounded-lg border border-border"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold">Table {order.tableNumber}</span>
                              <Badge variant={order.status === 'pending' ? 'default' : 'secondary'}>
                                {order.status || 'pending'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-primary">₹{order.total}</p>
                          </div>
                        </div>
                        <div className="space-y-1 mb-3">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="text-sm flex justify-between">
                              <span>{item.name} x{item.quantity}</span>
                              <span className="text-muted-foreground">₹{item.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>
                        {order.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button 
                              size="sm"
                              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                              onClick={() => handleUpdateOrderStatus(order.id, 'preparing')}
                            >
                              Accept
                            </Button>
                            <Button 
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                            >
                              Complete
                            </Button>
                          </div>
                        )}
                      </motion.div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </Card>
          </TabsContent>

          {/* Menu Tab */}
          <TabsContent value="menu" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Menu Management</h2>
              <Button 
                onClick={() => {
                  setEditingItem(null);
                  setNewItem({
                    name: '',
                    description: '',
                    price: '',
                    image: '',
                    category: '',
                    prepTime: '',
                    popular: false
                  });
                  setIsMenuDialogOpen(true);
                }}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Item
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems.map((item) => (
                <Card key={item.id} className="overflow-hidden bg-card border-border">
                  {item.image && (
                    <img src={item.image} alt={item.name} className="w-full h-48 object-cover" />
                  )}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <span className="text-primary font-bold">₹{item.price}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEditItem(item)}
                        className="flex-1"
                      >
                        <Edit className="w-3 h-3 mr-1" /> Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDeleteMenuItem(item.id)}
                        className="flex-1 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="p-6 bg-gradient-card border-border">
              <h3 className="text-xl font-bold mb-6">Restaurant Settings</h3>
              <div className="space-y-4 max-w-2xl">
                <div>
                  <Label htmlFor="restaurant-name" className="mb-2 block">Restaurant Name</Label>
                  <Input
                    id="restaurant-name"
                    value={settings.restaurantName}
                    onChange={(e) => setSettings({ ...settings, restaurantName: e.target.value })}
                    placeholder="Enter restaurant name"
                  />
                </div>
                <div>
                  <Label htmlFor="tagline" className="mb-2 block">Tagline</Label>
                  <Input
                    id="tagline"
                    value={settings.tagline}
                    onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                    placeholder="Enter tagline"
                  />
                </div>
                <div>
                  <Label htmlFor="primary-color" className="mb-2 block">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primary-color"
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                      className="w-20 h-10"
                    />
                    <Input
                      value={settings.primaryColor}
                      onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                      placeholder="#E8C547"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="logo" className="mb-2 block">Logo URL</Label>
                  <Input
                    id="logo"
                    value={settings.logo || ''}
                    onChange={(e) => setSettings({ ...settings, logo: e.target.value })}
                    placeholder="Enter logo image URL"
                  />
                </div>
                <Button 
                  onClick={handleUpdateSettings}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Save Settings
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Menu Item Dialog */}
      <Dialog open={isMenuDialogOpen} onOpenChange={setIsMenuDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="item-name" className="mb-2 block">Name</Label>
              <Input
                id="item-name"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                placeholder="Item name"
              />
            </div>
            <div>
              <Label htmlFor="item-description" className="mb-2 block">Description</Label>
              <Textarea
                id="item-description"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                placeholder="Item description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="item-price" className="mb-2 block">Price (₹)</Label>
                <Input
                  id="item-price"
                  type="number"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="item-preptime" className="mb-2 block">Prep Time (mins)</Label>
                <Input
                  id="item-preptime"
                  type="number"
                  value={newItem.prepTime}
                  onChange={(e) => setNewItem({ ...newItem, prepTime: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="item-category" className="mb-2 block">Category</Label>
              <Input
                id="item-category"
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                placeholder="e.g., Starters, Main Course"
              />
            </div>
            <div>
              <Label htmlFor="item-image" className="mb-2 block">Image URL</Label>
              <Input
                id="item-image"
                value={newItem.image}
                onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="item-popular"
                checked={newItem.popular}
                onChange={(e) => setNewItem({ ...newItem, popular: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="item-popular" className="cursor-pointer">Mark as Popular</Label>
            </div>
            <Button 
              onClick={handleSaveMenuItem}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {editingItem ? 'Update Item' : 'Add Item'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={isQRDialogOpen} onOpenChange={setIsQRDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Share Your Menu</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="flex justify-center">
              <div className="p-4 bg-white rounded-lg">
                <QRCodeSVG 
                  id="qr-code"
                  value={customerUrl} 
                  size={256}
                  level="H"
                  includeMargin
                />
              </div>
            </div>
            <div>
              <Label className="mb-2 block">Customer URL</Label>
              <div className="flex gap-2">
                <Input value={customerUrl} readOnly className="flex-1" />
                <Button variant="outline" onClick={copyLink}>
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={downloadQRCode}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Download QR Code
              </Button>
              <Button 
                variant="outline"
                onClick={copyLink}
                className="flex-1"
              >
                Copy Link
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}