/**
 * @swagger
 * openapi: 3.0.0
 * info:
 *   title: ShopNow E-commerce API
 *   description: Comprehensive RESTful API for the ShopNow e-commerce platform
 *   version: 2.0.0
 *   contact:
 *     name: API Support
 *     email: support@shopnow.com
 *   license:
 *     name: MIT
 *     url: https://opensource.org/licenses/MIT
 * servers:
 *   - url: http://localhost:5000/api
 *     description: Development server
 *   - url: https://api.shopnow.com/api
 *     description: Production server
 * 
 * tags:
 *   - name: Authentication
 *     description: User registration and login endpoints
 *   - name: Products
 *     description: Product catalog and management
 *   - name: Orders
 *     description: Order management and tracking
 *   - name: Cart
 *     description: Shopping cart operations
 *   - name: Payments
 *     description: Payment processing with Stripe
 *   - name: Users
 *     description: User profile and account management
 *   - name: Reviews
 *     description: Product reviews and ratings
 *   - name: Support
 *     description: Customer support tickets
 *   - name: Admin
 *     description: Admin-only endpoints
 * 
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: token
 * 
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         role:
 *           type: string
 *           enum: [user, admin]
 *         avatar:
 *           type: object
 *           properties:
 *             url:
 *               type: string
 *         addresses:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Address'
 *         createdAt:
 *           type: string
 *           format: date-time
 * 
 *     Address:
 *       type: object
 *       properties:
 *         label:
 *           type: string
 *         street:
 *           type: string
 *         city:
 *           type: string
 *         state:
 *           type: string
 *         zipCode:
 *           type: string
 *         country:
 *           type: string
 *         isDefault:
 *           type: boolean
 * 
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         slug:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: number
 *         compareAtPrice:
 *           type: number
 *         images:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *               alt:
 *                 type: string
 *         category:
 *           $ref: '#/components/schemas/Category'
 *         brand:
 *           type: string
 *         rating:
 *           type: number
 *         reviewCount:
 *           type: integer
 *         inStock:
 *           type: boolean
 *         quantity:
 *           type: integer
 * 
 *     Category:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         slug:
 *           type: string
 *         image:
 *           type: string
 * 
 *     Order:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         orderNumber:
 *           type: string
 *         status:
 *           type: string
 *           enum: [pending, confirmed, processing, shipped, delivered, cancelled]
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *         pricing:
 *           $ref: '#/components/schemas/Pricing'
 *         shippingAddress:
 *           $ref: '#/components/schemas/Address'
 *         timeline:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *               message:
 *                 type: string
 *               timestamp:
 *                 type: string
 *                 format: date-time
 * 
 *     OrderItem:
 *       type: object
 *       properties:
 *         product:
 *           type: string
 *         name:
 *           type: string
 *         price:
 *           type: number
 *         quantity:
 *           type: integer
 *         image:
 *           type: string
 * 
 *     Pricing:
 *       type: object
 *       properties:
 *         subtotal:
 *           type: number
 *         shipping:
 *           type: number
 *         tax:
 *           type: number
 *         discount:
 *           type: number
 *         total:
 *           type: number
 *         currency:
 *           type: string
 * 
 *     Cart:
 *       type: object
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               product:
 *                 $ref: '#/components/schemas/Product'
 *               quantity:
 *                 type: integer
 *               price:
 *                 type: number
 *         subtotal:
 *           type: number
 *         total:
 *           type: number
 *         itemCount:
 *           type: integer
 * 
 *     Review:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         user:
 *           $ref: '#/components/schemas/User'
 *         createdAt:
 *           type: string
 *           format: date-time
 * 
 *     SupportTicket:
 *       type: object
 *       properties:
 *         ticketNumber:
 *           type: string
 *         subject:
 *           type: string
 *         category:
 *           type: string
 *           enum: [order_issue, product_question, return_refund, payment, shipping, technical, other]
 *         priority:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         status:
 *           type: string
 *           enum: [open, pending, in_progress, resolved, closed]
 *         description:
 *           type: string
 *         messages:
 *           type: array
 *           items:
 *             type: object
 * 
 *     Error:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           default: false
 *         message:
 *           type: string
 *         errors:
 *           type: array
 *           items:
 *             type: object
 * 
 *     PaginatedResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *         pagination:
 *           type: object
 *           properties:
 *             page:
 *               type: integer
 *             limit:
 *               type: integer
 *             total:
 *               type: integer
 *             pages:
 *               type: integer
 * 
 * security:
 *   - bearerAuth: []
 * 
 */

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ShopNow E-commerce API',
      description: 'Comprehensive RESTful API for the ShopNow e-commerce platform. Provides endpoints for user authentication, product catalog, shopping cart, orders, payments, and more.',
      version: '2.0.0',
      contact: {
        name: 'API Support',
        email: 'support@shopnow.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development server'
      },
      {
        url: 'https://api.shopnow.com/api',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['user', 'admin'] },
            avatar: { type: 'object', properties: { url: { type: 'string' } } },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', default: false },
            message: { type: 'string' },
            errors: { type: 'array', items: { type: 'object' } }
          }
        }
      }
    },
    tags: [
      { name: 'Authentication', description: 'User registration and login endpoints' },
      { name: 'Products', description: 'Product catalog and management' },
      { name: 'Orders', description: 'Order management and tracking' },
      { name: 'Cart', description: 'Shopping cart operations' },
      { name: 'Payments', description: 'Payment processing' },
      { name: 'Users', description: 'User profile management' },
      { name: 'Reviews', description: 'Product reviews' },
      { name: 'Support', description: 'Customer support tickets' },
      { name: 'Admin', description: 'Admin-only endpoints' }
    ]
  },
  apis: ['./routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
