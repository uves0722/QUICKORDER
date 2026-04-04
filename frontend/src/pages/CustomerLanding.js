import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Plus, Minus, X, ChefHat, Clock, Star } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL =`https://quickorder-backend.onrender.com`;

export default function CustomerLanding() {
  const [settings, setSettings] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
    fetchMenuItems();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/settings`);
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Use default settings
      setSettings({
        restaurantName: 'Quick Order',
        logo: null,
        primaryColor: '#E8C547',
        tagline: 'Delicious Food, Quick Service'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const response = await axios.get(`https://quickorder-backend.onrender.com/api/menu`);
      setMenuItems(response.data);
    } catch (error) {
      console.error('Error fetching menu:', error);
    }
  };

  const addToCart = (item) => {
    const existing = cart.find(i => i.id === item.id);
    if (existing) {
      setCart(cart.map(i => 
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
    toast.success(`${item.name} added to cart`);
  };

  const updateQuantity = (itemId, change) => {
    setCart(cart.map(item => {
      if (item.id === itemId) {
        const newQuantity = item.quantity + change;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handlePlaceOrder = async () => {
    if (!tableNumber) {
      toast.error('Please enter table number');
      return;
    }

    try {
      await axios.post(`https://quickorder-backend.onrender.com/api/orders`, {
        items: cart,
        tableNumber,
        total: calculateTotal(),
        timestamp: new Date().toISOString()
      });
      
      toast.success('Order placed successfully!');
      setCart([]);
      setTableNumber('');
      setIsCheckoutOpen(false);
      setIsCartOpen(false);
    } catch (error) {
      toast.error('Failed to place order. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ChefHat className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1744776411214-46adedda38c9')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-hero" />
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-4">
              {settings?.restaurantName || 'Quick Order'}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              {settings?.tagline || 'Delicious Food, Quick Service'}
            </p>
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-6 text-lg shadow-glow"
              onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })}
            >
              View Menu
            </Button>
          </motion.div>
        </div>

        {/* Floating Cart Button */}
        <motion.button
          className="fixed bottom-90 right-6 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-4 shadow-glow"
          style={{ zIndex: 99999 }}
          onClick={() => setIsCartOpen(true)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <ShoppingCart className="w-6 h-6" />
          {cart.length > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground">
              {cart.length}
            </Badge>
          )}
        </motion.button>
      </section>

      {/* Menu Section */}
      <section id="menu" className="py-16 px-4 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Menu</h2>
          <p className="text-muted-foreground text-lg">Crafted with passion, served with excellence</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden hover-lift bg-card border-border group">
                {item.image && (
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {item.popular && (
                      <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground">
                        <Star className="w-3 h-3 mr-1" /> Popular
                      </Badge>
                    )}
                  </div>
                )}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold">{item.name}</h3>
                    <span className="text-primary font-bold text-lg">₹{item.price}</span>
                  </div>
                  <p className="text-muted-foreground text-sm mb-4">{item.description}</p>
                  {item.prepTime && (
                    <div className="flex items-center text-xs text-muted-foreground mb-4">
                      <Clock className="w-3 h-3 mr-1" />
                      {item.prepTime} mins
                    </div>
                  )}
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={() => addToCart(item)}
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add to Cart
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
              onClick={() => setIsCartOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-card border-l border-border z-50 flex flex-col"
            >
              <div className="p-6 border-b border-border">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Your Cart</h2>
                  <Button variant="ghost" size="icon" onClick={() => setIsCartOpen(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.id} className="flex gap-4 p-4 bg-muted/30 rounded-lg">
                        {item.image && (
                          <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded" />
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{item.name}</h3>
                          <p className="text-primary font-bold">₹{item.price}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Button 
                              size="icon" 
                              variant="outline" 
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, -1)}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-8 text-center font-semibold">{item.quantity}</span>
                            <Button 
                              size="icon" 
                              variant="outline" 
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 ml-auto text-destructive"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 border-t border-border space-y-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-primary">₹{calculateTotal()}</span>
                  </div>
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6"
                    onClick={() => {
                      setIsCartOpen(false);
                      setIsCheckoutOpen(true);
                    }}
                  >
                    Proceed to Checkout
                  </Button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Checkout Dialog */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Complete Your Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="table" className="text-base mb-2 block">Table Number</Label>
              <Input
                id="table"
                type="number"
                placeholder="Enter your table number"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="text-lg"
              />
            </div>
            <div className="bg-muted/30 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Items:</span>
                <span className="font-semibold">{cart.length}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-primary">₹{calculateTotal()}</span>
              </div>
            </div>
            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6"
              onClick={handlePlaceOrder}
            >
              Place Order
            </Button>
          </div>
        </DialogContent>
      </Dialog>
     <div className="fixed bottom-4 left-4 z-50">

<a
href="https://wa.me/917776884945"
target="_blank"
rel="noopener noreferrer"
>

<div className="bg-black inline-flex items-center px-8 py-1 rounded-full shadow-2xl hover:scale-105 transition-all duration-200">

<img
src="/ServeX.svg"
alt="Made with ServeX"
className="h-8 w-auto scale-125 relative top-[2px] animate-pulse"
/>

</div>

</a>

</div>
    </div>
  );
}