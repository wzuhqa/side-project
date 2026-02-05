# ShopNext E-commerce Deployment Guide

## Deploy to Render.com (Recommended)

### Prerequisites
- GitHub account
- Render.com account (free tier available)
- MongoDB database (Render provides free MongoDB)

### Option 1: Deploy via render.yaml (One-click)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Connect to Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" and select "Web Service" or "Blueprint"
   - Connect your GitHub repository
   - Render will auto-detect the `render.yaml` file

3. **Configure Environment Variables**
   Render will auto-create the MongoDB database. You need to add these manually:
   
   | Variable | Description |
   |----------|-------------|
   | `STRIPE_SECRET_KEY` | Your Stripe secret key from [Stripe Dashboard](https://dashboard.stripe.com/apikeys) |
   | `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret (for local testing) |
   | `EMAIL_USER` | SMTP email username |
   | `EMAIL_PASS` | SMTP email password |

4. **Deploy**
   - Click "Create Web Service"
   - Render will install dependencies, build the frontend, and start the server
   - Wait for deployment to complete (5-10 minutes)

### Option 2: Manual Deployment

1. **Create Web Service on Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Select your repository
   - Configure:
     - **Name**: `shopnext-ecommerce`
     - **Environment**: `Node`
     - **Build Command**: `npm install && cd ../frontend && npm install && npm run build`
     - **Start Command**: `npm start`
     - **Plan**: `Free`

2. **Create MongoDB Database**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "PostgreSQL" (or use MongoDB Atlas)
   - Note the connection string

3. **Add Environment Variables**
   In your web service settings, add:
   ```
   NODE_ENV=production
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_generated_jwt_secret
   STRIPE_SECRET_KEY=sk_test_...
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build and deployment to complete

### After Deployment

1. **Visit your site**
   - URL will be: `https://shopnext-ecommerce.onrender.com`

2. **Test the API**
   - `https://shopnext-ecommerce.onrender.com/api/health`

### Stripe Setup (Production)

1. **Configure Stripe Webhooks**
   - Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
   - Add endpoint: `https://your-domain.com/api/payments/webhook`
   - Select events: `checkout.session.completed`, `payment_intent.succeeded`

2. **Update Environment Variables**
   - Add `STRIPE_PUBLISHABLE_KEY` (for frontend)
   - Add `STRIPE_WEBHOOK_SECRET`

### Troubleshooting

**Build fails?**
- Check that all dependencies are listed in `package.json`
- Ensure Node version is compatible (v18+ recommended)

**Database connection fails?**
- Verify `MONGODB_URI` is correct
- Check IP whitelist in MongoDB Atlas

**Frontend not loading?**
- Check that `NODE_ENV=production` is set
- Verify frontend was built successfully in logs

### Local Development

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (separate terminal)
cd frontend
npm install
npm start
```

### Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | `development` | Set to `production` for deployment |
| `PORT` | No | `5000` | Server port |
| `MONGODB_URI` | Yes | - | MongoDB connection string |
| `JWT_SECRET` | Yes | - | Secret for JWT tokens |
| `STRIPE_SECRET_KEY` | Yes | - | Stripe secret API key |
| `STRIPE_WEBHOOK_SECRET` | No | - | Stripe webhook signing secret |
| `EMAIL_USER` | No | - | SMTP email username |
| `EMAIL_PASS` | No | - | SMTP email password |
