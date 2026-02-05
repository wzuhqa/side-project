/**
 * GraphQL Schema Definition
 */

const { gql } = require('apollo-server-express');

const typeDefs = gql`
  scalar Date
  scalar JSON

  # Enums
  enum UserRole {
    USER
    ADMIN
    MODERATOR
  }

  enum OrderStatus {
    PENDING
    CONFIRMED
    PROCESSING
    SHIPPED
    DELIVERED
    CANCELLED
    REFUNDED
  }

  enum ProductStatus {
    ACTIVE
    INACTIVE
    OUT_OF_STOCK
    DISCONTINUED
  }

  enum Tier {
    BRONZE
    SILVER
    GOLD
    PLATINUM
    DIAMOND
  }

  # Input Types
  input RegisterInput {
    email: String!
    password: String!
    firstName: String!
    lastName: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input ProductFilterInput {
    category: String
    minPrice: Float
    maxPrice: Float
    brand: [String]
    rating: Float
    inStock: Boolean
    tags: [String]
  }

  input CartItemInput {
    productId: ID!
    quantity: Int!
  }

  input AddressInput {
    firstName: String!
    lastName: String!
    street: String!
    city: String!
    state: String!
    zipCode: String!
    country: String!
    phone: String
  }

  input OrderInput {
    items: [CartItemInput!]!
    shippingAddress: AddressInput!
    billingAddress: AddressInput
    paymentMethod: String!
    couponCode: String
  }

  # Types
  type User {
    id: ID!
    email: String!
    firstName: String!
    lastName: String!
    fullName: String!
    role: UserRole!
    phone: String
    avatar: String
    addresses: [Address!]
    wishlist: [Product!]
    loyaltyPoints: LoyaltyPoints
    createdAt: Date!
    updatedAt: Date!
  }

  type AuthPayload {
    token: String!
    refreshToken: String!
    user: User!
  }

  type Address {
    id: ID!
    firstName: String!
    lastName: String!
    street: String!
    city: String!
    state: String!
    zipCode: String!
    country: String!
    phone: String
    isDefault: Boolean!
  }

  type Product {
    id: ID!
    name: String!
    slug: String!
    description: String
    shortDescription: String
    price: Float!
    compareAtPrice: Float
    images: [ProductImage!]!
    category: Category
    brand: String
    sku: String
    stock: Int!
    inStock: Boolean!
    rating: Float
    reviewCount: Int
    reviews: [Review!]
    attributes: JSON
    tags: [String]
    status: ProductStatus!
    createdAt: Date!
    updatedAt: Date!
  }

  type ProductImage {
    url: String!
    alt: String
    isPrimary: Boolean
  }

  type Category {
    id: ID!
    name: String!
    slug: String!
    description: String
    image: String
    parent: Category
    children: [Category!]
    productCount: Int
  }

  type Review {
    id: ID!
    user: User!
    product: Product!
    rating: Int!
    title: String
    content: String!
    images: [String!]
    verifiedPurchase: Boolean!
    helpfulCount: Int
    createdAt: Date!
  }

  type Cart {
    items: [CartItem!]!
    subtotal: Float!
    tax: Float!
    shipping: Float!
    total: Float!
    itemCount: Int!
  }

  type CartItem {
    product: Product!
    quantity: Int!
    price: Float!
    total: Float!
  }

  type Order {
    id: ID!
    orderNumber: String!
    user: User!
    items: [OrderItem!]!
    subtotal: Float!
    tax: Float!
    shipping: Float!
    discount: Float!
    total: Float!
    status: OrderStatus!
    shippingAddress: Address!
    billingAddress: Address
    paymentMethod: String
    trackingNumber: String
    timeline: [OrderTimelineEvent!]
    createdAt: Date!
    updatedAt: Date!
  }

  type OrderItem {
    product: Product!
    quantity: Int!
    price: Float!
    total: Float!
  }

  type OrderTimelineEvent {
    status: OrderStatus!
    message: String!
    timestamp: Date!
  }

  type LoyaltyPoints {
    totalPoints: Int!
    availablePoints: Int!
    lifetimePoints: Int!
    tier: Tier!
    tierProgress: Int!
    nextTier: Tier
  }

  type Bundle {
    id: ID!
    name: String!
    slug: String!
    description: String
    products: [BundleProduct!]!
    originalPrice: Float!
    bundlePrice: Float!
    savingsAmount: Float!
    savingsPercentage: Int!
    images: [ProductImage!]
    status: String!
  }

  type BundleProduct {
    product: Product!
    quantity: Int!
    discountValue: Float!
  }

  type FlashSale {
    id: ID!
    name: String!
    slug: String!
    description: String
    products: [FlashSaleProduct!]!
    startDate: Date!
    endDate: Date!
    status: String!
    timeRemaining: TimeRemaining
  }

  type FlashSaleProduct {
    product: Product!
    flashPrice: Float!
    originalPrice: Float!
    discountPercentage: Int!
    stock: Int!
    soldCount: Int!
    stockPercentage: Int!
  }

  type TimeRemaining {
    type: String!
    milliseconds: Int!
    days: Int
    hours: Int
    minutes: Int
    seconds: Int
  }

  type Recommendation {
    personalized: [Product!]
    frequentlyBoughtTogether: [Product!]
    similarProducts: [Product!]
    trending: [Product!]
    recentlyViewed: [Product!]
  }

  type SearchResult {
    products: [Product!]!
    totalCount: Int!
    facets: SearchFacets
    suggestions: [String!]
  }

  type SearchFacets {
    categories: [FacetCount!]
    brands: [FacetCount!]
    priceRanges: [FacetCount!]
    ratings: [FacetCount!]
  }

  type FacetCount {
    value: String!
    count: Int!
  }

  # Queries
  type Query {
    # User
    me: User
    user(id: ID!): User
    
    # Products
    products(
      page: Int
      limit: Int
      filter: ProductFilterInput
      sortBy: String
      sortOrder: String
    ): ProductConnection!
    product(id: ID): Product
    productBySlug(slug: String!): Product
    searchProducts(query: String!, page: Int, limit: Int): SearchResult!
    
    # Categories
    categories: [Category!]!
    category(id: ID!): Category
    categoryBySlug(slug: String!): Category
    
    # Cart
    cart: Cart
    
    # Orders
    orders(page: Int, limit: Int): [Order!]!
    order(id: ID!): Order
    orderByNumber(orderNumber: String!): Order
    
    # Bundles
    bundles(category: String): [Bundle!]!
    bundle(id: ID!): Bundle
    bundleBySlug(slug: String!): Bundle
    
    # Flash Sales
    flashSales: [FlashSale!]!
    flashSale(id: ID!): FlashSale
    
    # Recommendations
    recommendations(limit: Int): Recommendation
    
    # Loyalty
    loyaltyStatus: LoyaltyPoints
    availableRewards: [Reward!]
  }

  type ProductConnection {
    products: [Product!]!
    totalCount: Int!
    pageInfo: PageInfo!
  }

  type PageInfo {
    currentPage: Int!
    totalPages: Int!
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
  }

  type Reward {
    id: ID!
    name: String!
    description: String
    type: String!
    value: Float!
    minimumPoints: Int!
  }

  # Mutations
  type Mutation {
    # Auth
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    refreshToken(refreshToken: String!): AuthPayload!
    
    # User
    updateProfile(firstName: String, lastName: String, phone: String, avatar: String): User!
    addAddress(input: AddressInput!): User!
    removeAddress(id: ID!): User!
    setDefaultAddress(id: ID!): User!
    
    # Wishlist
    addToWishlist(productId: ID!): User!
    removeFromWishlist(productId: ID!): User!
    clearWishlist: User!
    
    # Cart
    addToCart(productId: ID!, quantity: Int!): Cart!
    updateCartItem(productId: ID!, quantity: Int!): Cart!
    removeFromCart(productId: ID!): Cart!
    clearCart: Cart!
    
    # Orders
    createOrder(input: OrderInput!): Order!
    cancelOrder(id: ID!, reason: String): Order!
    reorderOrder(id: ID!): Order!
    
    # Reviews
    createReview(
      productId: ID!
      rating: Int!
      title: String
      content: String!
      images: [String!]
    ): Review!
    updateReview(id: ID!, rating: Int, title: String, content: String): Review!
    deleteReview(id: ID!): Boolean!
    markReviewHelpful(id: ID!): Review!
    
    # Loyalty
    applyPointsDiscount(points: Int!): Cart!
    redeemReward(rewardId: ID!): RedemptionResult!
    
    # Price Alerts
    createPriceAlert(productId: ID!, targetPrice: Float!): Boolean!
  }

  type RedemptionResult {
    success: Boolean!
    code: String
    discount: Float
    message: String
  }

  # Subscriptions
  type Subscription {
    orderStatusChanged(orderId: ID!): Order!
    priceAlertTriggered: PriceAlertPayload!
    flashSaleStarting: FlashSale!
    newNotification: Notification!
  }

  type PriceAlertPayload {
    productId: ID!
    productName: String!
    currentPrice: Float!
    targetPrice: Float!
  }

  type Notification {
    id: ID!
    type: String!
    title: String!
    message: String!
    read: Boolean!
    createdAt: Date!
  }
`;

module.exports = typeDefs;
