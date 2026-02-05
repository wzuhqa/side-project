// Image helper utilities

// Placeholder image URL for products without images
export const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"%3E%3Crect fill="%23e0e0e0" width="400" height="400"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';

// Category placeholder images
export const categoryImages = {
  electronics: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600',
  fashion: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600',
  'home-garden': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600',
  'sports-outdoors': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600',
  'beauty-personal-care': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600',
  'books-media': 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600',
  'toys-games': 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600',
  automotive: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600',
  'health-wellness': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600',
  'food-beverages': 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=600'
};

// Product image URLs map (for consistent placeholder images)
export const productImageMap = {
  // Electronics
  'apple-iphone-15-pro-max': 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600',
  'samsung-galaxy-s24-ultra': 'https://images.unsplash.com/photo-1610945265078-3858a0054826?w=600',
  'apple-macbook-pro-16-m3-max': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?w=600',
  'sony-wh-1000xm5': 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600',
  'apple-airpods-pro-2': 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600',
  'nintendo-switch-oled': 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=600',
  'dyson-v15-detect-absolute': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600',
  'ipad-pro-12-9-m2': 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600',
  'gopro-hero12-black': 'https://images.unsplash.com/photo-1564466021188-936924ed3d47?w=600',
  'samsung-65-qled-4k-tv': 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600',
  
  // Fashion
  'nike-air-force-1-07': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
  'levis-501-original-fit': 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600',
  'adidas-originals-hoodie': 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600',
  'ray-ban-aviator-classic': 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600',
  'north-face-puffer-jacket': 'https://images.unsplash.com/photo-1544022613-e07affc2071c?w=600',
  'casio-g-shock-dw5600': 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600',
  'ugg-classic-mini': 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=600',
  'calvin-klein-boxer-briefs': 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600',
  
  // Home & Garden
  'dyson-airwrap-complete': 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=600',
  'instant-pot-duo-7-in-1': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600',
  'philips-hue-smart-bulb-kit': 'https://images.unsplash.com/photo-1558002038-1091a166111c?w=600',
  'weber-genesis-ii-gas-grill': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600',
  'nest-learning-thermostat': 'https://images.unsplash.com/photo-1558002038-1091a166111c?w=600',
  'casper-original-mattress': 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600',
  
  // Sports & Outdoors
  'yeti-rambler-26oz-bottle': 'https://images.unsplash.com/photo-1602143407151-11115cd6e954?w=600',
  'hydro-flask-32oz-wide': 'https://images.unsplash.com/photo-1602143407151-11115cd6e954?w=600',
  'garmin-fenix-7-pro': 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600',
  'lululemon-align-25': 'https://images.unsplash.com/photo-1506619216599-9d16d47fa7d7?w=600',
  'yeti-tundra-45-cooler': 'https://images.unsplash.com/photo-1625723044792-440e11c4d165?w=600',
  
  // Beauty & Personal Care
  'dyson-supersonic-hair-dryer': 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=600',
  'the-ordinary-niacinamide-10-zinc': 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600',
  'olaplex-no-3-hair-perfector': 'https://images.unsplash.com/photo-1567721913486-6585f069b332?w=600',
  'philips-sonicare-diamondclean': 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=600',
  'cerave-moisturizing-cream': 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600',
  
  // Books & Media
  'kindle-paperwhite-signature': 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600',
  'sony-turntable-bluetooth': 'https://images.unsplash.com/photo-1603048588665-791ca8aea616?w=600',
  'lego-harry-potter-hogwarts': 'https://images.unsplash.com/photo-1587654780291-39c940483713?w=600',
  'zelda-tears-kingdom-switch': 'https://images.unsplash.com/photo-1612287230217-969b698c8d13?w=600',
  
  // Toys & Games
  'playstation-5-console': 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600',
  'mario-kart-8-deluxe': 'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=600',
  'funko-pop-grogu': 'https://images.unsplash.com/photo-1630626906795-b0e47271d9f2?w=600',
  'uno-card-game': 'https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=600',
  
  // Automotive
  'garmin-dash-cam-67w': 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600',
  'vocolinc-smart-car-charger': 'https://images.unsplash.com/photo-1503376763036-066120622c74?w=600',
  'chemical-guys-car-wash-kit': 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=600',
  
  // Health & Wellness
  'whoop-4-0-strap': 'https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=600',
  'theragun-pro-bundle': 'https://images.unsplash.com/photo-1591343395082-e120087004b4?w=600',
  'philips-smartsleep-wake-up': 'https://images.unsplash.com/photo-1499750310159-5a6f0528ef36?w=600',
  
  // Food & Beverages
  'nespresso-vertuo-plus': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600',
  'vitamix-5200-blender': 'https://images.unsplash.com/photo-1570222094114-28a9d8893971?w=600'
};

// Get product image URL
export const getProductImage = (product, index = 0) => {
  if (!product) return PLACEHOLDER_IMAGE;
  
  // Check if product has images array
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    const img = product.images[index] || product.images[0];
    if (img && img.url) {
      return img.url;
    }
  }
  
  // Check if product has single image
  if (product.image) {
    return product.image;
  }
  
  // Check product image map
  if (productImageMap[product.slug]) {
    return productImageMap[product.slug];
  }
  
  // Use category image as fallback
  if (product.category && categoryImages[product.category]) {
    return categoryImages[product.category];
  }
  
  return PLACEHOLDER_IMAGE;
};

// Get category image URL
export const getCategoryImage = (categorySlug) => {
  return categoryImages[categorySlug] || categoryImages.electronics;
};

// Preload images for better performance
export const preloadImages = (urls) => {
  urls.forEach(url => {
    const img = new Image();
    img.src = url;
  });
};

export default {
  PLACEHOLDER_IMAGE,
  categoryImages,
  productImageMap,
  getProductImage,
  getCategoryImage,
  preloadImages
};
