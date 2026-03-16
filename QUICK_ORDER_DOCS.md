# Quick Order - Premium Restaurant Management System

A beautiful, full-featured restaurant ordering and management system with a premium dark gold theme.

## 🌟 Features

### Customer Features (Landing Page)
- **Beautiful Hero Section** - Elegant restaurant showcase with premium imagery
- **Interactive Menu** - Browse menu items with images, descriptions, prices, and prep times
- **Shopping Cart** - Add items, adjust quantities, and manage your order
- **Table-Based Ordering** - Enter table number for accurate order delivery
- **Real-time Updates** - Instant cart updates and order confirmations
- **Responsive Design** - Works perfectly on all devices

### Admin Features (Admin Panel)
- **Secure Authentication** - Login/Register system (max 3 admin accounts)
- **Dashboard Overview** - View order stats, pending orders, and metrics
- **Order Management** - Real-time order notifications and status updates
- **Menu Management** - Add, edit, delete menu items with full details
- **QR Code Generation** - Generate and download QR codes for customers
- **Theme Customization** - Customize restaurant name, tagline, colors, and logo
- **Share Links** - Copy and share customer ordering page URL

## 🎨 Design System

### Color Palette
- **Primary**: Luxurious Gold (#E8C547) - Premium accent color
- **Background**: Deep Charcoal (#14110F) - Sophisticated dark theme
- **Foreground**: Warm Ivory (#F5F3EE) - Elegant text color
- **Secondary**: Rich Burgundy - Complementary accent

### Typography
- **Headings**: Playfair Display (Serif) - Elegant and premium
- **Body**: Inter (Sans-serif) - Clean and readable

### Features
- Premium gradient effects
- Elegant shadow and glow effects
- Smooth animations and transitions
- Glassmorphism effects on cards
- Hover and interaction animations

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Python 3.11+
- MongoDB
- Yarn package manager

### Installation

1. **Install Backend Dependencies**
```bash
cd /app/backend
pip install -r requirements.txt
```

2. **Install Frontend Dependencies**
```bash
cd /app/frontend
yarn install
```

3. **Seed Sample Data** (Optional)
```bash
cd /app/backend
python seed_data.py
```

4. **Start Services**
```bash
# Using supervisor (recommended)
sudo supervisorctl restart all

# Or manually:
# Backend
cd /app/backend
uvicorn server:app --host 0.0.0.0 --port 8001

# Frontend
cd /app/frontend
yarn start
```

## 📱 Application URLs

- **Customer Landing Page**: `https://your-domain.com/`
- **Admin Login**: `https://your-domain.com/admin/login`
- **Admin Dashboard**: `https://your-domain.com/admin/dashboard`

## 🔌 API Endpoints

### Admin APIs
- `POST /api/admin/register` - Register new admin (max 3)
- `POST /api/admin/login` - Admin login

### Menu APIs
- `GET /api/menu` - Get all menu items
- `POST /api/menu` - Create menu item
- `PUT /api/menu/{id}` - Update menu item
- `DELETE /api/menu/{id}` - Delete menu item

### Settings APIs
- `GET /api/settings` - Get restaurant settings
- `PUT /api/settings` - Update settings

### Order APIs
- `POST /api/orders` - Place new order
- `GET /api/orders` - Get all orders
- `PUT /api/orders/{id}` - Update order status

## 🎯 User Flows

### Customer Flow
1. Visit landing page at `/`
2. Browse menu items
3. Add items to cart
4. Click cart icon to review order
5. Click "Proceed to Checkout"
6. Enter table number
7. Click "Place Order"
8. Receive order confirmation

### Admin Flow
1. Visit `/admin/login`
2. Register/Login to admin panel
3. View dashboard with order statistics
4. Manage menu items (Add/Edit/Delete)
5. View and manage orders
6. Generate QR code for customers
7. Customize restaurant settings

## 🔐 Security Features
- Bcrypt password hashing
- JWT token authentication
- Maximum 3 admin accounts limit
- Secure session management

## 🌐 Deployment

### Environment Variables

**Backend (.env)**
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=quick_order_db
CORS_ORIGINS=*
JWT_SECRET=your-secret-key-here
```

**Frontend (.env)**
```env
REACT_APP_BACKEND_URL=https://your-backend-domain.com
```

### Deployment Platforms
The app is designed to work seamlessly on:
- **Vercel** (Frontend)
- **Railway/Render** (Backend)
- **MongoDB Atlas** (Database)
- **Netlify** (Frontend)
- **Heroku** (Backend)

### Quick Deploy Steps
1. Update environment variables
2. Build frontend: `yarn build`
3. Deploy backend to your chosen platform
4. Deploy frontend build to Vercel/Netlify
5. Update REACT_APP_BACKEND_URL to point to deployed backend
6. Done! 🎉

## 📦 Database Schema

### Collections

**admins**
```javascript
{
  id: string,
  username: string,
  email: string,
  password: string (hashed),
  created_at: datetime
}
```

**menu_items**
```javascript
{
  id: string,
  name: string,
  description: string,
  price: number,
  image: string,
  category: string,
  prepTime: number,
  popular: boolean
}
```

**orders**
```javascript
{
  id: string,
  items: [{
    id: string,
    name: string,
    price: number,
    quantity: number
  }],
  tableNumber: string,
  total: number,
  status: string,
  timestamp: string
}
```

**settings**
```javascript
{
  restaurantName: string,
  tagline: string,
  primaryColor: string,
  logo: string
}
```

## 📝 Important Notes

- **Admin Limit**: Maximum 3 admin accounts can be registered
- **Real-time Notifications**: Browser notifications require user permission
- **QR Code**: Download QR code from admin dashboard to print and display
- **Sample Data**: Run `python seed_data.py` to populate with sample menu items
- **Order Polling**: Admin dashboard polls for new orders every 5 seconds

## 🙏 Credits

- **Design**: Premium dark gold restaurant theme
- **UI Components**: Shadcn/ui
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Images**: Unsplash & Pexels

---

Made with ❤️ using React, FastAPI, and MongoDB
