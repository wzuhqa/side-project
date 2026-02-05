# E-Commerce Platform - MERN Stack

A comprehensive, production-ready e-commerce website built with the MERN stack (MongoDB, Express.js, React, Node.js).

## 🚀 Features

### Customer Features
- **Product Catalog**: Browse products with advanced filtering by category, price range, brand, and ratings
- **User Authentication**: Secure registration and login with JWT tokens
- **Shopping Cart**: Real-time inventory tracking, save-for-later functionality
- **Checkout Process**: Multiple payment gateway integrations (Stripe, PayPal)
- **Order Management**: Order history, tracking, and automated confirmations
- **Wishlist**: Save products for later
- **Product Reviews**: Rate and review products with photo uploads

### Admin Features
- **Dashboard**: Real-time analytics and sales overview
- **Product Management**: CRUD operations for products with variants
- **Order Management**: Process orders, update status, track shipments
- **Customer Management**: View customer details and order history
- **Inventory Management**: Stock tracking and low-stock alerts

### Technical Features
- **RESTful API**: Complete backend API with all necessary endpoints
- **JWT Authentication**: Secure user authentication and authorization
- **Responsive Design**: Mobile-first design that works on all devices
- **SEO Optimized**: Meta tags, sitemaps, and structured data
- **Performance Optimized**: Lazy loading, image optimization


## 🛠 Installation

### Prerequisites
- Node.js 18+
- MongoDB 6+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure your `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d
STRIPE_SECRET_KEY=your_stripe_key
EMAIL_SERVICE=gmail
EMAIL_USERNAME=your_email
EMAIL_PASSWORD=your_app_password
FRONTEND_URL=http://localhost:3000
```

5. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/register` | Register new user |
| POST | `/api/users/login` | User login |
| GET | `/api/users/me` | Get current user |
| PUT | `/api/users/profile` | Update profile |
| PUT | `/api/users/password` | Change password |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products |
| GET | `/api/products/:idOrSlug` | Get single product |
| GET | `/api/products/featured` | Get featured products |
| GET | `/api/products/best-sellers` | Get best sellers |
| POST | `/api/products` | Create product (admin) |
| PUT | `/api/products/:id` | Update product (admin) |
| DELETE | `/api/products/:id` | Delete product (admin) |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | Get user orders |
| POST | `/api/orders` | Create order |
| GET | `/api/orders/:id` | Get single order |
| PUT | `/api/orders/:id/cancel` | Cancel order |
| PUT | `/api/orders/:id/status` | Update order status (admin) |

### Cart
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart` | Get cart |
| POST | `/api/cart/items` | Add item to cart |
| PUT | `/api/cart/items/:id` | Update quantity |
| DELETE | `/api/cart/items/:id` | Remove item |
| POST | `/api/cart/apply-coupon` | Apply coupon |

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for authentication:

1. User registers or logs in
2. Server generates a JWT token
3. Token is stored in localStorage
4. Subsequent requests include the token in the Authorization header
5. Protected routes verify the token before allowing access

## 💳 Payment Integration

### Stripe Setup
1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe Dashboard
3. Add keys to your `.env` file
4. Configure webhook for payment confirmations

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📦 Deployment

### Backend (e.g., Railway, Render)
1. Set environment variables in your hosting platform
2. Connect your GitHub repository
3. Deploy

### Frontend (e.g., Vercel, Netlify)
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `build`
4. Add environment variables

## 🔧 Configuration

### MongoDB Atlas Setup
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Create a database user
4. Whitelist your IP address
5. Get your connection string
6. Add to your `.env` file

### Stripe Webhooks
For local development, use Stripe CLI:
```bash
stripe listen --forward-to localhost:5000/api/payments/webhook
```

## 📱 Responsive Design

The frontend is built with a mobile-first approach:
- **Desktop**: Full navigation, multi-column layouts
- **Tablet**: Adaptive layouts, simplified navigation
- **Mobile**: Hamburger menu, single-column layouts

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration
- Rate limiting (production)
- HTTPS enforcement (production)

## 📈 Performance Optimizations

- Lazy loading for images
- Code splitting with React.lazy
- Optimized database queries
- CDN integration (production)
- Gzip compression (production)

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify IP whitelist in MongoDB Atlas

### JWT Token Issues
- Check token expiration
- Verify JWT_SECRET matches
- Clear localStorage and re-login

### Payment Issues
- Verify Stripe keys
- Check webhook configuration
- Ensure sufficient funds

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For questions or support, please open an issue in the repository.
