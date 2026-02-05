import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// English translations
const en = {
  common: {
    loading: 'Loading...',
    error: 'An error occurred',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    search: 'Search',
    filter: 'Filter',
    clear: 'Clear',
    submit: 'Submit',
    back: 'Back',
    next: 'Next',
    close: 'Close',
    yes: 'Yes',
    no: 'No',
    success: 'Success!',
    failed: 'Failed',
    retry: 'Retry',
    showMore: 'Show more',
    showLess: 'Show less'
  },
  nav: {
    home: 'Home',
    shop: 'Shop',
    cart: 'Cart',
    account: 'My Account',
    orders: 'Orders',
    wishlist: 'Wishlist',
    login: 'Login',
    logout: 'Logout',
    register: 'Register',
    admin: 'Admin Dashboard',
    support: 'Support'
  },
  product: {
    addToCart: 'Add to Cart',
    addedToCart: 'Added to cart',
    outOfStock: 'Out of Stock',
    inStock: 'In Stock',
    lowStock: 'Only {{count}} left',
    price: 'Price',
    quantity: 'Quantity',
    total: 'Total',
    rating: 'Rating',
    reviews: 'Reviews',
    writeReview: 'Write a Review',
    relatedProducts: 'Related Products',
    recentlyViewed: 'Recently Viewed'
  },
  cart: {
    title: 'Shopping Cart',
    empty: 'Your cart is empty',
    subtotal: 'Subtotal',
    shipping: 'Shipping',
    tax: 'Tax',
    total: 'Total',
    checkout: 'Proceed to Checkout',
    continueShopping: 'Continue Shopping',
    remove: 'Remove',
    saveForLater: 'Save for Later',
    moveToCart: 'Move to Cart'
  },
  checkout: {
    title: 'Checkout',
    shipping: 'Shipping Address',
    payment: 'Payment Method',
    review: 'Review Order',
    placeOrder: 'Place Order',
    orderSummary: 'Order Summary',
    shippingMethod: 'Shipping Method',
    paymentMethod: 'Payment Method',
    promoCode: 'Promo Code',
    apply: 'Apply'
  },
  account: {
    profile: 'Profile',
    settings: 'Settings',
    orderHistory: 'Order History',
    addresses: 'Addresses',
    password: 'Password',
    notifications: 'Notifications',
    preferences: 'Preferences'
  },
  orders: {
    title: 'My Orders',
    empty: 'No orders yet',
    orderNumber: 'Order #',
    date: 'Date',
    status: 'Status',
    total: 'Total',
    trackOrder: 'Track Order',
    viewDetails: 'View Details',
    reorder: 'Order Again',
    cancelled: 'Cancelled',
    delivered: 'Delivered',
    shipped: 'Shipped',
    processing: 'Processing',
    confirmed: 'Confirmed',
    pending: 'Pending'
  },
  support: {
    title: 'Help & Support',
    createTicket: 'Create Ticket',
    myTickets: 'My Tickets',
    noTickets: 'No support tickets',
    subject: 'Subject',
    message: 'Message',
    category: 'Category',
    priority: 'Priority',
    status: 'Status',
    submit: 'Submit Ticket',
    reply: 'Reply',
    open: 'Open',
    closed: 'Closed'
  },
  errors: {
    required: '{{field}} is required',
    invalidEmail: 'Please enter a valid email',
    invalidPhone: 'Please enter a valid phone number',
    passwordMismatch: 'Passwords do not match',
    minLength: '{{field}} must be at least {{min}} characters',
    maxLength: '{{field}} must be less than {{max}} characters'
  }
};

// Spanish translations
const es = {
  common: {
    loading: 'Cargando...',
    error: 'Ocurrió un error',
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    view: 'Ver',
    search: 'Buscar',
    filter: 'Filtrar',
    clear: 'Limpiar',
    submit: 'Enviar',
    back: 'Volver',
    next: 'Siguiente',
    close: 'Cerrar',
    yes: 'Sí',
    no: 'No',
    success: '¡Éxito!',
    failed: 'Fallido',
    retry: 'Reintentar'
  },
  nav: {
    home: 'Inicio',
    shop: 'Tienda',
    cart: 'Carrito',
    account: 'Mi Cuenta',
    orders: 'Pedidos',
    wishlist: 'Favoritos',
    login: 'Iniciar Sesión',
    logout: 'Cerrar Sesión',
    register: 'Registrarse'
  },
  product: {
    addToCart: 'Añadir al Carrito',
    addedToCart: 'Añadido al carrito',
    outOfStock: 'Agotado',
    inStock: 'En Stock',
    lowStock: 'Solo quedan {{count}}',
    price: 'Precio',
    quantity: 'Cantidad',
    total: 'Total',
    rating: 'Calificación',
    reviews: 'Reseñas'
  },
  cart: {
    title: 'Carrito de Compras',
    empty: 'Tu carrito está vacío',
    subtotal: 'Subtotal',
    shipping: 'Envío',
    tax: 'Impuesto',
    total: 'Total',
    checkout: 'Proceder al Pago',
    continueShopping: 'Seguir Comprando'
  },
  checkout: {
    title: 'Pago',
    shipping: 'Dirección de Envío',
    payment: 'Método de Pago',
    placeOrder: 'Realizar Pedido'
  },
  orders: {
    title: 'Mis Pedidos',
    empty: 'Sin pedidos aún',
    orderNumber: 'Pedido #',
    date: 'Fecha',
    status: 'Estado',
    total: 'Total',
    trackOrder: 'Rastrear Pedido'
  },
  support: {
    title: 'Ayuda y Soporte',
    createTicket: 'Crear Ticket',
    myTickets: 'Mis Tickets',
    subject: 'Asunto',
    message: 'Mensaje'
  }
};

// French translations
const fr = {
  common: {
    loading: 'Chargement...',
    error: 'Une erreur est survenue',
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    view: 'Voir',
    search: 'Rechercher',
    filter: 'Filtrer',
    submit: 'Soumettre',
    success: 'Succès!',
    failed: 'Échoué'
  },
  nav: {
    home: 'Accueil',
    shop: 'Boutique',
    cart: 'Panier',
    account: 'Mon Compte',
    orders: 'Commandes',
    wishlist: 'Favoris',
    login: 'Connexion',
    register: "S'inscrire"
  },
  product: {
    addToCart: 'Ajouter au Panier',
    addedToCart: 'Ajouté au panier',
    outOfStock: 'Rupture de Stock',
    inStock: 'En Stock',
    price: 'Prix',
    quantity: 'Quantité',
    total: 'Total'
  },
  cart: {
    title: 'Panier',
    empty: 'Votre panier est vide',
    subtotal: 'Sous-total',
    shipping: 'Livraison',
    total: 'Total',
    checkout: 'Passer à la Caisse'
  },
  orders: {
    title: 'Mes Commandes',
    empty: 'Aucune commande',
    orderNumber: 'Commande #',
    date: 'Date',
    status: 'Statut',
    total: 'Total'
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
      fr: { translation: fr }
    },
    lng: localStorage.getItem('language') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    }
  });

export default i18n;

// Currency formatter
export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat(i18n.language, {
    style: 'currency',
    currency
  }).format(amount);
}

// Date formatter
export function formatDate(date, options = {}) {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  return new Date(date).toLocaleDateString(i18n.language, {
    ...defaultOptions,
    ...options
  });
}

// Number formatter
export function formatNumber(num) {
  return new Intl.NumberFormat(i18n.language).format(num);
}
