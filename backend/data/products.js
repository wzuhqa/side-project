/**
 * Comprehensive Product Database - 50+ Products Across 10 Categories
 */

const products = [
  // ELECTRONICS (10 products)
  {
    name: "Apple iPhone 15 Pro Max",
    slug: "apple-iphone-15-pro-max",
    description: "Experience the future with iPhone 15 Pro Max. Featuring A17 Pro chip, titanium design, and the most advanced camera system ever on an iPhone.",
    shortDescription: "A17 Pro chip, titanium design, 48MP camera",
    price: 1199.99,
    compareAtPrice: 1299.99,
    images: [
      { url: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600", alt: "iPhone 15 Pro Max Front", isPrimary: true },
      { url: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600", alt: "iPhone 15 Pro Max Back" }
    ],
    category: "electronics",
    brand: "Apple",
    sku: "IPH15PM001",
    stock: 50,
    rating: 4.8,
    reviewCount: 245,
    tags: ["smartphone", "flagship", "5G", "premium"],
    specifications: {
      "Display": "6.7-inch Super Retina XDR OLED",
      "Processor": "A17 Pro chip",
      "Storage": "256GB / 512GB / 1TB",
      "Camera": "48MP main + 12MP ultra-wide + 12MP telephoto",
      "Battery": "4852mAh",
      "Connectivity": "5G, Wi-Fi 6E, Bluetooth 5.3"
    },
    features: ["Titanium design", "Action button", "USB-C", "Dynamic Island"],
    reviews: [
      { user: "John D.", rating: 5, title: "Best iPhone ever!", content: "The camera quality is incredible and the titanium feel is premium.", helpful: 45 },
      { user: "Sarah M.", rating: 5, title: "Worth every penny", content: "Battery life is amazing. Easily lasts a full day.", helpful: 32 }
    ]
  },
  {
    name: "Samsung Galaxy S24 Ultra",
    slug: "samsung-galaxy-s24-ultra",
    description: "The Samsung Galaxy S24 Ultra redefines what's possible with AI-powered features, S Pen integration, and a stunning 200MP camera system.",
    shortDescription: "200MP camera, S Pen, Galaxy AI",
    price: 1299.99,
    compareAtPrice: 1399.99,
    images: [
      { url: "https://images.unsplash.com/photo-1610945265078-3858a0054826?w=600", alt: "Samsung Galaxy S24 Ultra", isPrimary: true }
    ],
    category: "electronics",
    brand: "Samsung",
    sku: "SSGS24U001",
    stock: 35,
    rating: 4.7,
    reviewCount: 189,
    tags: ["smartphone", "flagship", "5G", "android"],
    specifications: {
      "Display": "6.8-inch QHD+ Dynamic AMOLED 2X",
      "Processor": "Snapdragon 8 Gen 3",
      "Storage": "256GB / 512GB / 1TB",
      "Camera": "200MP main + 50MP + 12MP telephoto",
      "Battery": "5000mAh",
      "S Pen": "Built-in S Pen"
    },
    features: ["Circle to Search", "Live Translate", "Note Assist"]
  },
  {
    name: "Apple MacBook Pro 16-inch M3 Max",
    slug: "apple-macbook-pro-16-m3-max",
    description: "Unleash your creativity with the most powerful MacBook Pro ever. Featuring M3 Max chip, stunning Liquid Retina XDR display, and exceptional battery life.",
    shortDescription: "M3 Max chip, 16-inch Liquid Retina XDR, up to 128GB RAM",
    price: 3499.99,
    compareAtPrice: 3799.99,
    images: [
      { url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca4?w=600", alt: "MacBook Pro 16-inch", isPrimary: true }
    ],
    category: "electronics",
    brand: "Apple",
    sku: "MBP16M3001",
    stock: 20,
    rating: 4.9,
    reviewCount: 156,
    tags: ["laptop", "pro", "macbook", "creative"],
    specifications: {
      "Display": "16.2-inch Liquid Retina XDR",
      "Processor": "Apple M3 Max",
      "RAM": "Up to 128GB",
      "Storage": "Up to 8TB SSD",
      "Battery": "100Wh (up to 22 hours)",
      "Ports": "HDMI, SD card, 3x Thunderbolt 4"
    }
  },
  {
    name: "Sony WH-1000XM5 Wireless Headphones",
    slug: "sony-wh-1000xm5",
    description: "Industry-leading noise cancellation meets exceptional sound quality. The WH-1000XM5 headphones deliver an unparalleled listening experience.",
    shortDescription: "Industry-leading ANC, 30-hour battery, crystal clear calls",
    price: 399.99,
    compareAtPrice: 449.99,
    images: [
      { url: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600", alt: "Sony WH-1000XM5", isPrimary: true }
    ],
    category: "electronics",
    brand: "Sony",
    sku: "SWH1000XM5",
    stock: 75,
    rating: 4.6,
    reviewCount: 421,
    tags: ["headphones", "wireless", "noise-cancelling", "audio"],
    specifications: {
      "Driver": "30mm",
      "Noise Cancellation": "Industry-leading",
      "Battery Life": "30 hours (NC on)",
      "Charging": "USB-C, 3 hours play in 10 min charge",
      "Weight": "250g",
      "Codecs": "LDAC, AAC, SBC"
    }
  },
  {
    name: "Apple AirPods Pro 2nd Gen",
    slug: "apple-airpods-pro-2",
    description: "Active noise cancellation, spatial audio, and adaptive transparency. AirPods Pro deliver an immersive sound experience.",
    shortDescription: "ANC, Spatial Audio, H2 chip, MagSafe case",
    price: 249.99,
    compareAtPrice: 279.99,
    images: [
      { url: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600", alt: "AirPods Pro 2", isPrimary: true }
    ],
    category: "electronics",
    brand: "Apple",
    sku: "AP2PRO001",
    stock: 100,
    rating: 4.5,
    reviewCount: 892,
    tags: ["earbuds", "wireless", "noise-cancelling", "apple"],
    specifications: {
      "Chip": "H2",
      "ANC": "Active Noise Cancellation",
      "Battery": "6 hours (ANC on)",
      "Case": "MagSafe with 30 hours total",
      "Water Resistance": "IPX4",
      "Audio": "Spatial Audio with dynamic head tracking"
    }
  },
  {
    name: "Samsung 65-inch QLED 4K Smart TV",
    slug: "samsung-65-qled-4k-tv",
    description: "Experience stunning 4K picture quality with quantum dot technology. The Samsung QLED delivers breathtaking colors and incredible detail.",
    shortDescription: "65-inch 4K QLED, Quantum Processor, Smart TV",
    price: 1299.99,
    compareAtPrice: 1599.99,
    images: [
      { url: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600", alt: "Samsung QLED TV", isPrimary: true }
    ],
    category: "electronics",
    brand: "Samsung",
    sku: "SSQ65QLED",
    stock: 15,
    rating: 4.4,
    reviewCount: 78,
    tags: ["tv", "4k", "qled", "smart-tv"],
    specifications: {
      "Display": "65-inch 4K QLED",
      "Resolution": "3840 x 2160",
      "Processor": "Quantum Processor 4K",
      "HDR": "Quantum HDR",
      "Smart TV": "Tizen OS",
      "Gaming": "120Hz, Game Mode"
    }
  },
  {
    name: "iPad Pro 12.9-inch M2 Chip",
    slug: "ipad-pro-12-9-m2",
    description: "The ultimate iPad experience. Powered by M2 chip, featuring ProMotion display, and Apple Pencil hover for creative professionals.",
    shortDescription: "12.9-inch Liquid Retina XDR, M2 chip, 5G capable",
    price: 1099.99,
    compareAtPrice: 1199.99,
    images: [
      { url: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600", alt: "iPad Pro 12.9", isPrimary: true }
    ],
    category: "electronics",
    brand: "Apple",
    sku: "IPP12M2001",
    stock: 30,
    rating: 4.7,
    reviewCount: 312,
    tags: ["tablet", "ipad", "pro", "creative"],
    specifications: {
      "Display": "12.9-inch Liquid Retina XDR",
      "Processor": "Apple M2",
      "Storage": "128GB / 256GB / 512GB / 1TB / 2TB",
      "Cameras": "12MP wide + 10MP ultra-wide",
      "Connectivity": "Wi-Fi 6E, 5G (cellular)",
      "Apple Pencil": "Hover support"
    }
  },
  {
    name: "Nintendo Switch OLED Model",
    slug: "nintendo-switch-oled",
    description: "Enhance your gaming experience with the Nintendo Switch OLED model featuring a vibrant 7-inch OLED screen, wide adjustable stand, and enhanced audio.",
    shortDescription: "7-inch OLED screen, enhanced audio, 64GB internal storage",
    price: 349.99,
    compareAtPrice: null,
    images: [
      { url: "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=600", alt: "Nintendo Switch OLED", isPrimary: true }
    ],
    category: "electronics",
    brand: "Nintendo",
    sku: "NSWOLED001",
    stock: 45,
    rating: 4.6,
    reviewCount: 567,
    tags: ["gaming", "console", "handheld", "portable"],
    specifications: {
      "Screen": "7-inch OLED",
      "Storage": "64GB internal",
      "Battery": "4.5-9 hours",
      "Output": "Up to 1080p via TV dock",
      "Weight": "320g",
      "Audio": "Enhanced stereo speakers"
    }
  },
  {
    name: "Dyson V15 Detect Absolute",
    slug: "dyson-v15-detect-absolute",
    description: "The most intelligent cordless vacuum with laser dust detection and piezoelectric sensor for scientific proof of a deep clean.",
    shortDescription: "Laser dust detection, LCD screen, 60 min runtime",
    price: 749.99,
    compareAtPrice: 849.99,
    images: [
      { url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600", alt: "Dyson V15", isPrimary: true }
    ],
    category: "electronics",
    brand: "Dyson",
    sku: "DYV15D001",
    stock: 25,
    rating: 4.5,
    reviewCount: 234,
    tags: ["vacuum", "cordless", "smart", "home"],
    specifications: {
      "Runtime": "Up to 60 minutes",
      "Bin Capacity": "0.76L",
      "Filtration": "HEPA",
      "Suction": "230AW",
      "Screen": "LCD real-time performance",
      "Weight": "6.8 lbs"
    }
  },
  {
    name: "GoPro HERO12 Black",
    slug: "gopro-hero12-black",
    description: "The most powerful GoPro ever. Capture stunning 5.3K60 video with HDR and improved battery life for extended adventures.",
    shortDescription: "5.3K60 video, HDR, improved battery, HyperSmooth 6.0",
    price: 399.99,
    compareAtPrice: 449.99,
    images: [
      { url: "https://images.unsplash.com/photo-1564466021188-936924ed3d47?w=600", alt: "GoPro HERO12", isPrimary: true }
    ],
    category: "electronics",
    brand: "GoPro",
    sku: "GPHR12B001",
    stock: 40,
    rating: 4.4,
    reviewCount: 156,
    tags: ["camera", "action-camera", "gopro", "adventure"],
    specifications: {
      "Video": "5.3K60 / 4K120 / 2.7K240",
      "Photo": "27MP",
      "Stabilization": "HyperSmooth 6.0",
      "Waterproof": "33ft (10m)",
      "Battery": "Enduro battery included",
      "HDR": "Video and photo HDR"
    }
  },

  // FASHION (8 products)
  {
    name: "Nike Air Force 1 07",
    slug: "nike-air-force-1-07",
    description: "The legend lives on. Nike Air Force 1 07 delivers classic basketball style with premium comfort for everyday wear.",
    shortDescription: "Classic low-top, premium leather, Air-Sole unit",
    price: 110.00,
    compareAtPrice: null,
    images: [
      { url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600", alt: "Nike Air Force 1", isPrimary: true }
    ],
    category: "fashion",
    brand: "Nike",
    sku: "NKAF1070",
    stock: 120,
    rating: 4.6,
    reviewCount: 1245,
    tags: ["sneakers", "casual", "classic", "athletic"],
    specifications: {
      "Upper": "Premium leather",
      "Sole": "Rubber",
      "Cushioning": "Air-Sole unit",
      "Closure": "Lace-up",
      "Style": "Low-top",
      "Origin": "Original since 1982"
    }
  },
  {
    name: "Levis 501 Original Fit Jeans",
    slug: "levis-501-original-fit",
    description: "The original straight leg jean. Levis 501 features authentic vintage styling with a comfortable mid-rise waist.",
    shortDescription: "Straight leg, button fly, vintage styling",
    price: 79.50,
    compareAtPrice: null,
    images: [
      { url: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600", alt: "Levis 501 Jeans", isPrimary: true }
    ],
    category: "fashion",
    brand: "Levis",
    sku: "LV501ORG",
    stock: 200,
    rating: 4.5,
    reviewCount: 892,
    tags: ["jeans", "casual", "denim", "classic"],
    specifications: {
      "Fit": "Original straight",
      "Rise": "Mid",
      "Leg": "Straight",
      "Closure": "Button fly",
      "Wash": "Various available",
      "Material": "100% cotton denim"
    }
  },
  {
    name: "Adidas Originals Hoodie",
    slug: "adidas-originals-hoodie",
    description: "Classic adidas Originals hoodie featuring the iconic trefoil logo. Perfect for casual wear with iconic sport heritage style.",
    shortDescription: "Cotton blend, kangaroo pocket, iconic logo",
    price: 65.00,
    compareAtPrice: 80.00,
    images: [
      { url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600", alt: "Adidas Hoodie", isPrimary: true }
    ],
    category: "fashion",
    brand: "Adidas",
    sku: "ADHOOD001",
    stock: 85,
    rating: 4.4,
    reviewCount: 456,
    tags: ["hoodie", "casual", "athletic", "streetwear"],
    specifications: {
      "Material": "70% cotton / 30% polyester",
      "Fit": "Regular",
      "Features": "Kangaroo pocket, Drawcord hood",
      "Logo": "Adidas trefoil",
      "Care": "Machine washable",
      "Origin": "Imported"
    }
  },
  {
    name: "Ray-Ban Aviator Classic",
    slug: "ray-ban-aviator-classic",
    description: "Timeless aviator design that started it all. Ray-Ban Aviator features ultra-lightweight metal frames with G-15 lens technology.",
    shortDescription: "Teardrop shape, G-15 green lens, metal frame",
    price: 183.00,
    compareAtPrice: null,
    images: [
      { url: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600", alt: "Ray-Ban Aviators", isPrimary: true }
    ],
    category: "fashion",
    brand: "Ray-Ban",
    sku: "RBAVI001",
    stock: 60,
    rating: 4.7,
    reviewCount: 678,
    tags: ["sunglasses", "aviator", "classic", "polarized"],
    specifications: {
      "Frame": "Metal",
      "Lens": "G-15 green",
      "UV Protection": "100% UV",
      "Bridge": "Adjustable nose pads",
      "Temples": "Cranial hinges",
      "Case": "Includes leather case"
    }
  },
  {
    name: "The North Face Puffer Jacket",
    slug: "north-face-puffer-jacket",
    description: "Stay warm in extreme conditions with The North Face Thermoball Eco puffer. Waterproof, packable, and incredibly warm.",
    shortDescription: "Thermoball insulation, water-resistant, packable",
    price: 279.00,
    compareAtPrice: 329.00,
    images: [
      { url: "https://images.unsplash.com/photo-1544022613-e07affc2071c?w=600", alt: "North Face Puffer", isPrimary: true }
    ],
    category: "fashion",
    brand: "The North Face",
    sku: "NTFPUF001",
    stock: 45,
    rating: 4.6,
    reviewCount: 234,
    tags: ["jacket", "winter", "insulated", "outdoor"],
    specifications: {
      "Insulation": "ThermoBall Eco",
      "Waterproof": "Yes, DWR finish",
      "Fill Power": "600-fill",
      "Weight": "17.5 oz",
      "Pockets": "Zippered hand pockets",
      "Packable": "Stuffs into pocket"
    }
  },
  {
    name: "Casio G-Shock DW5600",
    slug: "casio-g-shock-dw5600",
    description: "The iconic G-Shock that started it all. DW5600 offers legendary shock resistance with a classic digital display.",
    shortDescription: "Shock resistant, 200m water resistant, EL backlight",
    price: 99.99,
    compareAtPrice: null,
    images: [
      { url: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600", alt: "Casio G-Shock", isPrimary: true }
    ],
    category: "fashion",
    brand: "Casio",
    sku: "CSGSHOCK1",
    stock: 150,
    rating: 4.8,
    reviewCount: 1567,
    tags: ["watch", "digital", "g-shock", "rugged"],
    specifications: {
      "Movement": "Quartz digital",
      "Water Resistance": "200m",
      "Shock Resistance": "Yes",
      "Functions": "Stopwatch, alarm, timer, EL backlight",
      "Battery": "2-year life",
      "Weight": "53g"
    }
  },
  {
    name: "UGG Classic Mini Boots",
    slug: "ugg-classic-mini",
    description: "The Iconic UGG look in a shorter silhouette. Classic Mini features plush sheepskin lining for ultimate comfort.",
    shortDescription: "Sheepskin upper, UGGplush lining, pretreated",
    price: 159.95,
    compareAtPrice: null,
    images: [
      { url: "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=600", alt: "UGG Classic Mini", isPrimary: true }
    ],
    category: "fashion",
    brand: "UGG",
    sku: "UGGCLSMIN",
    stock: 55,
    rating: 4.5,
    reviewCount: 445,
    tags: ["boots", "winter", "comfort", "sheepskin"],
    specifications: {
      "Upper": "Twinface sheepskin",
      "Lining": "UGGplush (80% wool, 20% lyocell)",
      "Sole": "Treadlite by UGG",
      "Height": "6 inches",
      "Water-resistant": "Pretreated",
      "Care": "Clean with conditioner"
    }
  },
  {
    name: "Calvin Klein Modern Cotton Boxer Briefs",
    slug: "calvin-klein-boxer-briefs",
    description: "Essential everyday comfort. Calvin Klein boxer briefs feature a modern fit with signature logo waistband.",
    shortDescription: "Cotton blend, iconic waistband, no-ride up",
    price: 54.00,
    compareAtPrice: null,
    images: [
      { url: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600", alt: "Calvin Klein Boxers", isPrimary: true }
    ],
    category: "fashion",
    brand: "Calvin Klein",
    sku: "CKBOX3PK",
    stock: 300,
    rating: 4.3,
    reviewCount: 892,
    tags: ["underwear", "basics", "cotton", "comfort"],
    specifications: {
      "Material": "95% cotton / 5% elastane",
      "Fit": "Modern",
      "Waistband": "Signature Calvin Klein logo",
      "Fly": "No-ride up",
      "Care": "Machine washable",
      "Pack": "3-pack"
    }
  },

  // HOME & GARDEN (6 products)
  {
    name: "Dyson Airwrap Complete",
    slug: "dyson-airwrap-complete",
    description: "Style and dry simultaneously with Dysons Airwrap. Coanda airflow technology for salon-quality results without extreme heat.",
    shortDescription: "Complete set, Coanda airflow, no extreme heat",
    price: 599.99,
    compareAtPrice: 699.99,
    images: [
      { url: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=600", alt: "Dyson Airwrap", isPrimary: true }
    ],
    category: "home-garden",
    brand: "Dyson",
    sku: "DYAIR001",
    stock: 20,
    rating: 4.4,
    reviewCount: 345,
    tags: ["hair-styler", "hairdryer", "premium", "beauty"],
    specifications: {
      "Attachments": "6 included",
      "Motor": "V9 digital motor",
      "Heat Control": "Intelligent heat",
      "Airflow": "Coanda effect",
      "Storage": "Ceramic vanity case",
      "Cord Length": "8ft"
    }
  },
  {
    name: "Instant Pot Duo 7-in-1",
    slug: "instant-pot-duo-7-in-1",
    description: "The best-selling multi-use programmable pressure cooker. 7 functions in one pot for faster, easier meals.",
    shortDescription: "6QT, pressure cooker, slow cooker, rice cooker",
    price: 99.99,
    compareAtPrice: 129.99,
    images: [
      { url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600", alt: "Instant Pot Duo", isPrimary: true }
    ],
    category: "home-garden",
    brand: "Instant Pot",
    sku: "IPDUO7IN1",
    stock: 80,
    rating: 4.7,
    reviewCount: 2456,
    tags: ["cooker", "kitchen", "multi-cooker", "pressure"],
    specifications: {
      "Capacity": "6 quarts",
      "Functions": "7 (pressure cook, slow cook, rice, yogurt, steam, saute, warm)",
      "Programmable": "Yes, 13 smart programs",
      "Safety": "10+ built-in safety features",
      "Power": "1000W",
      "Cleaning": "Dishwasher safe pot"
    }
  },
  {
    name: "Philips Hue Smart Bulb Starter Kit",
    slug: "philips-hue-smart-bulb-kit",
    description: "Transform your home with smart lighting. Philips Hue offers millions of colors and white tones with voice control.",
    shortDescription: "4 E26 bulbs, Hue Bridge, voice control, app",
    price: 199.99,
    compareAtPrice: 249.99,
    images: [
      { url: "https://images.unsplash.com/photo-1558002038-1091a166111c?w=600", alt: "Philips Hue Kit", isPrimary: true }
    ],
    category: "home-garden",
    brand: "Philips",
    sku: "PHHUEKIT",
    stock: 45,
    rating: 4.5,
    reviewCount: 567,
    tags: ["smart-home", "lighting", "wifi", "automation"],
    specifications: {
      "Bulbs": "4 E26 Hue White and Color Ambiance",
      "Bridge": "Hue Bridge included",
      "Compatibility": "Alexa, Google, Apple HomeKit",
      "Features": "16 million colors, schedules, scenes",
      "Lifespan": "25,000 hours",
      "Wattage": "9W (60W equivalent)"
    }
  },
  {
    name: "Weber Genesis II Gas Grill",
    slug: "weber-genesis-ii-gas-grill",
    description: "Professional-grade gas grill with GS4 grilling system. Features infinite burner control and open cart design.",
    shortDescription: "3-burner, GS4 system, side burner, 669 sq in",
    price: 999.99,
    compareAtPrice: 1199.99,
    images: [
      { url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600", alt: "Weber Genesis Grill", isPrimary: true }
    ],
    category: "home-garden",
    brand: "Weber",
    sku: "WBGRENII",
    stock: 12,
    rating: 4.6,
    reviewCount: 189,
    tags: ["grill", "outdoor", "gas", "bbq"],
    specifications: {
      "Burners": "3 stainless steel main",
      "Cooking Area": "669 sq in",
      "Side Burner": "10,000 BTU",
      "GS4 System": "Infinity ignition, porcelain-enameled",
      "Fuel": "Propane (LP)",
      "Weight": "185 lbs"
    }
  },
  {
    name: "Nest Learning Thermostat",
    slug: "nest-learning-thermostat",
    description: "The smart thermostat that learns your schedule. Saves energy automatically and can be controlled from anywhere.",
    shortDescription: "Learning, remote control, energy saving, voice",
    price: 249.00,
    compareAtPrice: null,
    images: [
      { url: "https://images.unsplash.com/photo-1558002038-1091a166111c?w=600", alt: "Nest Thermostat", isPrimary: true }
    ],
    category: "home-garden",
    brand: "Google",
    sku: "NSTLEARN",
    stock: 35,
    rating: 4.4,
    reviewCount: 1234,
    tags: ["smart-home", "thermostat", "energy", "hvac"],
    specifications: {
      "Display": "2.08-inch LCD, 24-bit color",
      "Sensors": "Temperature, humidity, occupancy",
      "Compatibility": "24V systems, heat pump, 95% systems",
      "Connectivity": "Wi-Fi 802.11ac, Bluetooth",
      "Features": "Learning, Farsight, Energy History",
      "Remote": "Nest app, voice control"
    }
  },
  {
    name: "Casper Original Mattress",
    slug: "casper-original-mattress",
    description: "The mattress that started it all. Casper Original offers balanced softness and support with premium foams.",
    shortDescription: "Hybrid, 12-inch, pressure relief, breathable",
    price: 995.00,
    compareAtPrice: 1195.00,
    images: [
      { url: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600", alt: "Casper Mattress", isPrimary: true }
    ],
    category: "home-garden",
    brand: "Casper",
    sku: "CSPORIG",
    stock: 25,
    rating: 4.5,
    reviewCount: 456,
    tags: ["mattress", "sleep", "hybrid", "comfort"],
    specifications: {
      "Height": "12 inches",
      "Layers": "4 premium foams",
      "Firmness": "Medium-firm",
      "Feel": "Balanced with pressure relief",
      "Cover": "Soft, breathable polyester",
      "Trial": "100 nights",
      "Warranty": "10 years"
    }
  },

  // SPORTS & OUTDOORS (5 products)
  {
    name: "Yeti Rambler 26oz Bottle",
    slug: "yeti-rambler-26oz-bottle",
    description: "Double-wall vacuum insulation keeps drinks cold or hot for hours. Yetis Rambler is built for any adventure.",
    shortDescription: "26oz, double-wall vacuum, dishwasher safe",
    price: 40.00,
    compareAtPrice: null,
    images: [
      { url: "https://images.unsplash.com/photo-1602143407151-11115cd6e954?w=600", alt: "Yeti Rambler", isPrimary: true }
    ],
    category: "sports-outdoors",
    brand: "Yeti",
    sku: "YETRAM26",
    stock: 200,
    rating: 4.8,
    reviewCount: 678,
    tags: ["water-bottle", "insulated", "outdoor", "adventure"],
    specifications: {
      "Capacity": "26 oz",
      "Insulation": "Double-wall vacuum",
      "Cold": "Up to 24 hours",
      "Hot": "Up to 12 hours",
      "Material": "18/8 stainless steel",
      "Dishwasher": "Safe"
    }
  },
  {
    name: "Hydro Flask 32oz Wide Mouth",
    slug: "hydro-flask-32oz-wide",
    description: "The award-winning Hydro Flask keeps beverages cold up to 24 hours or hot up to 12 hours with TempShield protection.",
    shortDescription: "32oz, Wide Mouth, TempShield, flex cap",
    price: 44.95,
    compareAtPrice: null,
    images: [
      { url: "https://images.unsplash.com/photo-1602143407151-11115cd6e954?w=600", alt: "Hydro Flask", isPrimary: true }
    ],
    category: "sports-outdoors",
    brand: "Hydro Flask",
    sku: "HF32WM001",
    stock: 150,
    rating: 4.7,
    reviewCount: 892,
    tags: ["water-bottle", "insulated", "outdoor", "eco"],
    specifications: {
      "Capacity": "32 oz",
      "Mouth": "Wide",
      "Insulation": "TempShield",
      "Cold": "24 hours",
      "Hot": "12 hours",
      "Material": "18/8 pro-grade stainless",
      "Cap": "Flex Cap leakproof"
    }
  },
  {
    name: "Garmin Fenix 7 Pro",
    slug: "garmin-fenix-7-pro",
    description: "The ultimate multisport GPS watch. Fenix 7 Pro offers advanced training features, mapping, and up to 22 days battery life.",
    shortDescription: "GPS, multisport, mapping, 22-day battery",
    price: 899.99,
    compareAtPrice: 999.99,
    images: [
      { url: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600", alt: "Garmin Fenix 7", isPrimary: true }
    ],
    category: "sports-outdoors",
    brand: "Garmin",
    sku: "GMFEN7PRO",
    stock: 30,
    rating: 4.7,
    reviewCount: 234,
    tags: ["smartwatch", "gps", "fitness", "outdoor"],
    specifications: {
      "Display": "1.4-inch MIP solar",
      "Battery": "22 days (solar)",
      "Water Rating": "10 ATM",
      "Sensors": "GPS, GLONASS, GALILEO, HR, Pulse Ox",
      "Sports": "100+",
      "Maps": "TopoActive, ski maps, golf courses"
    }
  },
  {
    name: "Lululemon Align High-Rise 25 inch",
    slug: "lululemon-align-25",
    description: "Buttery-soft Nulu fabric for yoga and low-impact activities. The Align leggings are Lululemons most popular style.",
    shortDescription: "Nulu fabric, high-rise, 25 inch pants, sweat-wicking",
    price: 98.00,
    compareAtPrice: null,
    images: [
      { url: "https://images.unsplash.com/photo-1506619216599-9d16d47fa7d7?w=600", alt: "Lululemon Align", isPrimary: true }
    ],
    category: "sports-outdoors",
    brand: "Lululemon",
    sku: "LLALIGN25",
    stock: 180,
    rating: 4.6,
    reviewCount: 1567,
    tags: ["leggings", "yoga", "workout", "athletic"],
    specifications: {
      "Fabric": "Nulu (82% nylon, 18% elastane)",
      "Rise": "High-rise",
      "Inseam": "25 inch",
      "Features": "Sweat-wicking, four-way stretch",
      "Rise": "Above ankle",
      "Care": "Machine wash cold"
    }
  },
  {
    name: "Yeti Tundra 45 Cooler",
    slug: "yeti-tundra-45-cooler",
    description: "Premium rotomolded cooler with superior ice retention. The Tundra 45 keeps ice for days even in extreme heat.",
    shortDescription: "45QT, rotomolded, 3-day ice retention",
    price: 325.00,
    compareAtPrice: null,
    images: [
      { url: "https://images.unsplash.com/photo-1625723044792-440e11c4d165?w=600", alt: "Yeti Tundra Cooler", isPrimary: true }
    ],
    category: "sports-outdoors",
    brand: "Yeti",
    sku: "YETURD45",
    stock: 25,
    rating: 4.8,
    reviewCount: 345,
    tags: ["cooler", "outdoor", "camping", "adventure"],
    specifications: {
      "Capacity": "45 quarts",
      "Ice Retention": "Up to 3 days",
      "Construction": "Rotomolded",
      "Bear Resistant": "Certified",
      "Interior": "Easy-clean drainage",
      "Weight": "25 lbs empty"
    }
  },

  // BEAUTY & PERSONAL CARE (5 products)
  {
    name: "Dyson Supersonic Hair Dryer",
    slug: "dyson-supersonic-hair-dryer",
    description: "Fast drying with no extreme heat damage. Dysons intelligent heat control protects natural shine.",
    shortDescription: "Fast drying, intelligent heat control, 4 attachments",
    price: 429.99,
    compareAtPrice: 479.99,
    images: [
      { url: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=600", alt: "Dyson Supersonic", isPrimary: true }
    ],
    category: "beauty-personal-care",
    brand: "Dyson",
    sku: "DYSSUP001",
    stock: 40,
    rating: 4.5,
    reviewCount: 567,
    tags: ["hair-dryer", "premium", "styling", "salon"],
    specifications: {
      "Motor": "V9 digital motor",
      "Airflow": "3x faster than other dryers",
      "Heat Control": "Intelligent (measure 40x/sec)",
      "Attachments": "4 included",
      "Weight": "1.8 lbs",
      "Cable": "9ft"
    }
  },
  {
    name: "The Ordinary Niacinamide 10 percent + Zinc 1 percent",
    slug: "the-ordinary-niacinamide-10-zinc",
    description: "High-strength vitamin B3 formulation for oily skin. Reduces blemishes and controls sebum production.",
    shortDescription: "30ml, oil control, blemish reduction",
    price: 5.90,
    compareAtPrice: null,
    images: [
      { url: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600", alt: "The Ordinary Niacinamide", isPrimary: true }
    ],
    category: "beauty-personal-care",
    brand: "The Ordinary",
    sku: "TONIA10",
    stock: 500,
    rating: 4.4,
    reviewCount: 2345,
    tags: ["serum", "skincare", "acne", "affordable"],
    specifications: {
      "Volume": "30ml",
      "Concentration": "10% Niacinamide, 1% Zinc",
      "Skin Type": "Oily, acne-prone",
      "Usage": "Morning and evening",
      "Vegan": "Yes",
      "Cruelty-Free": "Yes"
    }
  },
  {
    name: "Olaplex No.3 Hair Perfector",
    slug: "olaplex-no-3-hair-perfector",
    description: "At-home hair repair treatment. Olaplex No.3 rebuilds broken disulfide bonds for stronger, healthier hair.",
    shortDescription: "100ml, repairs bonds, strengthens hair",
    price: 30.00,
    compareAtPrice: null,
    images: [
      { url: "https://images.unsplash.com/photo-1567721913486-6585f069b332?w=600", alt: "Olaplex No.3", isPrimary: true }
    ],
    category: "beauty-personal-care",
    brand: "Olaplex",
    sku: "OLAPX3",
    stock: 120,
    rating: 4.6,
    reviewCount: 1234,
    tags: ["hair-treatment", "repair", "salon-quality", "bond-building"],
    specifications: {
      "Size": "3.3 oz / 100ml",
      "Use": "Weekly at-home treatment",
      "Process": "Leave on 10 min, shampoo out",
      "Benefits": "Repairs disulfide bonds",
      "Safe": "Color-safe",
      "Vegan": "Yes"
    }
  },
  {
    name: "Philips Sonicare DiamondClean",
    slug: "philips-sonicare-diamondclean",
    description: "Advanced sonic technology for 10x better plaque removal. Features pressure sensor and multiple cleaning modes.",
    shortDescription: "Smart pressure sensor, 5 modes, 2-week battery",
    price: 229.99,
    compareAtPrice: 279.99,
    images: [
      { url: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=600", alt: "Philips Sonicare", isPrimary: true }
    ],
    category: "beauty-personal-care",
    brand: "Philips",
    sku: "PHSCN001",
    stock: 55,
    rating: 4.5,
    reviewCount: 678,
    tags: ["electric-toothbrush", "dental", "sonic", "smart"],
    specifications: {
      "Technology": "Sonic (31,000 brush strokes/min)",
      "Modes": "5 (Clean, White, Polish, Gum Health, Deep Clean+)",
      "SmartSensor": "Pressure sensor, location detection",
      "Battery": "2 weeks (USB travel case)",
      "Timer": "2-min timer with 30-sec intervals",
      "Includes": "Glass charger, travel case"
    }
  },
  {
    name: "CeraVe Moisturizing Cream",
    slug: "cerave-moisturizing-cream",
    description: "Hyaluronic acid moisturizer for dry to very dry skin. Developed with dermatologists for 24-hour hydration.",
    shortDescription: "19oz, hyaluronic acid, ceramides, fragrance-free",
    price: 16.99,
    compareAtPrice: null,
    images: [
      { url: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600", alt: "CeraVe Moisturizer", isPrimary: true }
    ],
    category: "beauty-personal-care",
    brand: "CeraVe",
    sku: "CRVMOIST",
    stock: 200,
    rating: 4.7,
    reviewCount: 3456,
    tags: ["moisturizer", "skincare", "dry-skin", "dermatologist"],
    specifications: {
      "Size": "19 oz",
      "Skin Type": "Dry to very dry",
      "Key Ingredients": "Hyaluronic acid, 3 essential ceramides",
      "Fragrance": "Fragrance-free",
      "Uses": "Face, body, hands",
      "NIAPOA": "Accepted"
    }
  },

  // BOOKS & MEDIA (4 products)
  {
    name: "Amazon Kindle Paperwhite Signature",
    slug: "kindle-paperwhite-signature",
    description: "Premium Kindle with wireless charging and auto-adjusting light. 6.8-inch display with 300 PPI for crisp text.",
    shortDescription: "6.8 inch 300 PPI, wireless charging, warm light",
    price: 189.99,
    compareAtPrice: 209.99,
    images: [
      { url: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600", alt: "Kindle Paperwhite", isPrimary: true }
    ],
    category: "books-media",
    brand: "Amazon",
    sku: "KDPWS001",
    stock: 50,
    rating: 4.6,
    reviewCount: 456,
    tags: ["ereader", "kindle", "amazon", "portable"],
    specifications: {
      "Display": "6.8-inch Paperwhite, 300 PPI",
      "Storage": "32GB",
      "Light": "Warm, auto-adjusting",
      "Charging": "Wireless + USB-C",
      "Waterproof": "IPX8",
      "Battery": "Weeks on single charge"
    }
  },
  {
    name: "Sony Turntable with Bluetooth",
    slug: "sony-turntable-bluetooth",
    description: "High-fidelity vinyl record player with integrated Bluetooth and phono stage. Experience your vinyl collection with modern convenience.",
    shortDescription: "Direct drive, Bluetooth, phono preamp, USB",
    price: 799.99,
    compareAtPrice: 899.99,
    images: [
      { url: "https://images.unsplash.com/photo-1603048588665-791ca8aea616?w=600", alt: "Vinyl Player", isPrimary: true }
    ],
    category: "books-media",
    brand: "Sony",
    sku: "SNYVLP001",
    stock: 15,
    rating: 4.5,
    reviewCount: 123,
    tags: ["record-player", "vinyl", "turntable", "audio"],
    specifications: {
      "Drive": "Direct drive",
      "Speed": "33 1/3, 45, 78 RPM",
      "Cartridge": "Pre-mounted AT-VM95E",
      "Connectivity": "Bluetooth, RCA, USB",
      "Preamp": "Built-in phono stage",
      "Platter": "Aluminum die-cast"
    }
  },
  {
    name: "LEGO Harry Potter Hogwarts Castle",
    slug: "lego-harry-potter-hogwarts",
    description: "Build the iconic Hogwarts Castle with over 6,000 pieces. Features movable turrets, boats, and secret chambers.",
    shortDescription: "Over 6000 pieces, iconic castle, collectible",
    price: 469.99,
    compareAtPrice: 549.99,
    images: [
      { url: "https://images.unsplash.com/photo-1587654780291-39c940483713?w=600", alt: "LEGO Hogwarts", isPrimary: true }
    ],
    category: "books-media",
    brand: "LEGO",
    sku: "LEGOHP001",
    stock: 20,
    rating: 4.9,
    reviewCount: 567,
    tags: ["lego", "harry-potter", "building-kit", "collectible"],
    specifications: {
      "Pieces": "6,023",
      "Minifigures": "4 (Harry, Hermione, Ron, Argus)",
      "Features": "Great Hall, towers, boat, chambers",
      "Age": "16+",
      "Dimensions": "Over 22 inches high",
      "Display": "Includes lights"
    }
  },
  {
    name: "Nintendo Switch Game: Tears of the Kingdom",
    slug: "zelda-tears-kingdom-switch",
    description: "Embark on an epic adventure across the lands of Hyrule and the skies above in the sequel to Breath of the Wild.",
    shortDescription: "Open-world adventure, explore Hyrule, action RPG",
    price: 69.99,
    compareAtPrice: null,
    images: [
      { url: "https://images.unsplash.com/photo-1612287230217-969b698c8d13?w=600", alt: "Zelda TOTK", isPrimary: true }
    ],
    category: "books-media",
    brand: "Nintendo",
    sku: "NSWTOTK",
    stock: 80,
    rating: 4.9,
    reviewCount: 892,
    tags: ["video-game", "switch", "zelda", "adventure"],
    specifications: {
      "Platform": "Nintendo Switch",
      "Genre": "Action-adventure",
      "Players": "1 player",
      "Features": "Open world, climbing, paragliding",
      "Age": "10+",
      "Gameplay": "100+ hours"
    }
  },

  // TOYS & GAMES (4 products)
  {
    name: "PlayStation 5 Console",
    slug: "playstation-5-console",
    description: "Experience lightning-fast loading and deeper immersion with haptic feedback and adaptive triggers on the DualSense controller.",
    shortDescription: "Ray tracing, 4K-TV gaming, 825GB SSD",
    price: 499.99,
    compareAtPrice: 549.99,
    images: [
      { url: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600", alt: "PS5 Console", isPrimary: true }
    ],
    category: "toys-games",
    brand: "Sony",
    sku: "PS5CON001",
    stock: 25,
    rating: 4.7,
    reviewCount: 1234,
    tags: ["gaming", "console", "ps5", "next-gen"],
    specifications: {
      "CPU": "8-core Zen 2, 3.5GHz",
      "GPU": "10.28 TFLOPs, RDNA 2",
      "Memory": "16GB GDDR6",
      "Storage": "825GB custom SSD",
      "Resolution": "Up to 4K 120Hz",
      "Ray Tracing": "Yes"
    }
  },
  {
    name: "Mario Kart 8 Deluxe",
    slug: "mario-kart-8-deluxe",
    description: "The definitive Mario Kart experience on Nintendo Switch. Race with friends locally or online with 48 tracks and 40+ characters.",
    shortDescription: "48 tracks, 40+ characters, local multiplayer",
    price: 59.99,
    compareAtPrice: null,
    images: [
      { url: "https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=600", alt: "Mario Kart 8", isPrimary: true }
    ],
    category: "toys-games",
    brand: "Nintendo",
    sku: "NSWMK8D",
    stock: 60,
    rating: 4.8,
    reviewCount: 1567,
    tags: ["racing", "switch", "mario", "multiplayer"],
    specifications: {
      "Platform": "Nintendo Switch",
      "Players": "Up to 4 locally, 12 online",
      "Characters": "42",
      "Tracks": "48",
      "Modes": "Grand Prix, Time Trial, Battle",
      "VR Support": "Nintendo Labo VR Kit"
    }
  },
  {
    name: "Funko Pop Star Wars: Grogu",
    slug: "funko-pop-grogu",
    description: "Collectible vinyl figure of Grogu (Baby Yoda) from The Mandalorian. Perfect for Star Wars fans and collectors.",
    shortDescription: "3.75 inch tall, vinyl, The Mandalorian",
    price: 14.99,
    compareAtPrice: null,
    images: [
      { url: "https://images.unsplash.com/photo-1630626906795-b0e47271d9f2?w=600", alt: "Grogu Funko Pop", isPrimary: true }
    ],
    category: "toys-games",
    brand: "Funko",
    sku: "FNKGRGU01",
    stock: 150,
    rating: 4.6,
    reviewCount: 345,
    tags: ["funko-pop", "star-wars", "collectible", "figure"],
    specifications: {
      "Height": "3.75 inches",
      "Material": "Vinyl",
      "Character": "Grogu / Baby Yoda",
      "Series": "Star Wars: The Mandalorian",
      "Brand": "Funko",
      "Box": "Window box packaging"
    }
  },
  {
    name: "UNO Card Game",
    slug: "uno-card-game",
    description: "The classic family game of matching colors and numbers. Fun for 2-10 players, ages 7 and up.",
    shortDescription: "2-10 players, ages 7+, 20+ minutes",
    price: 5.99,
    compareAtPrice: null,
    images: [
      { url: "https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=600", alt: "UNO Cards", isPrimary: true }
    ],
    category: "toys-games",
    brand: "Mattel",
    sku: "UNO0001",
    stock: 300,
    rating: 4.7,
    reviewCount: 2345,
    tags: ["card-game", "family", "party", "classic"],
    specifications: {
      "Players": "2-10",
      "Age": "7+",
      "Play Time": "20+ minutes",
      "Cards": "112 cards",
      "Includes": "Action cards, Wild cards",
      "Skills": "Matching, strategic thinking"
    }
  },

  // AUTOMOTIVE (3 products)
  {
    name: "Garmin Dash Cam 67W",
    slug: "garmin-dash-cam-67w",
    description: "Compact dash camera with 180-degree field of view. Records in 1440p with GPS and travelapse features.",
    shortDescription: "1440p, 180 degree FOV, GPS, voice control",
    price: 249.99,
    compareAtPrice: 279.99,
    images: [
      { url: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600", alt: "Garmin Dash Cam", isPrimary: true }
    ],
    category: "automotive",
    brand: "Garmin",
    sku: "GMDCAM67",
    stock: 40,
    rating: 4.5,
    reviewCount: 234,
    tags: ["dash-cam", "car", "camera", "safety"],
    specifications: {
      "Resolution": "1440p (2560 x 1440)",
      "Field of View": "180 degrees",
      "GPS": "Built-in",
      "Audio": "Voice control,bluetooth audio",
      "Storage": "MicroSD (up to 512GB)",
      "Features": "Travelapse, incident detection"
    }
  },
  {
    name: "Vocolinc Smart Car Charger",
    slug: "vocolinc-smart-car-charger",
    description: "WiFi-enabled car charger with USB ports and LED ambient light. Control with voice or app for smart charging.",
    shortDescription: "USB-C PD, WiFi, ambient light, voice control",
    price: 49.99,
    compareAtPrice: 64.99,
    images: [
      { url: "https://images.unsplash.com/photo-1503376763036-066120622c74?w=600", alt: "Smart Car Charger", isPrimary: true }
    ],
    category: "automotive",
    brand: "Vocolinc",
    sku: "VOCCHG001",
    stock: 60,
    rating: 4.2,
    reviewCount: 89,
    tags: ["car-charger", "smart-home", "usb", "charging"],
    specifications: {
      "Ports": "USB-C PD + USB-A",
      "Power": "36W total",
      "Connectivity": "WiFi (2.4GHz)",
      "Features": "LED ambient light, scheduling",
      "Compatibility": "Apple HomeKit, Alexa, Google",
      "Safety": "Over-current protection"
    }
  },
  {
    name: "Chemical Guys Car Wash Kit",
    slug: "chemical-guys-car-wash-kit",
    description: "Complete car wash kit with premium soap, microfiber towels, and wash mitt. PH-balanced for maximum shine.",
    shortDescription: "16oz soap, 3 microfiber towels, wash mitt",
    price: 54.99,
    compareAtPrice: 69.99,
    images: [
      { url: "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=600", alt: "Car Wash Kit", isPrimary: true }
    ],
    category: "automotive",
    brand: "Chemical Guys",
    sku: "CHGKWASH",
    stock: 70,
    rating: 4.6,
    reviewCount: 456,
    tags: ["car-care", "wash", "detailing", "cleaning"],
    specifications: {
      "Soap": "16oz Honeydew Snow Foam",
      "Towels": "3 premium microfiber",
      "Wash Mitt": "Chenille microfiber",
      "Bucket": "5-gallon with filter",
      "Foam": "Produces thick lather",
      "Finish": "Swirl-free, high gloss"
    }
  },

  // HEALTH & WELLNESS (3 products)
  {
    name: "Whoop 4.0 Strap",
    slug: "whoop-4-0-strap",
    description: "Fitness tracker focused on recovery, sleep, and strain monitoring. 24/7 tracking without a screen for distraction-free use.",
    shortDescription: "Recovery score, sleep tracking, strain monitoring",
    price: 239.00,
    compareAtPrice: 299.00,
    images: [
      { url: "https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=600", alt: "Whoop 4.0", isPrimary: true }
    ],
    category: "health-wellness",
    brand: "Whoop",
    sku: "WHOOP4P0",
    stock: 50,
    rating: 4.3,
    reviewCount: 567,
    tags: ["fitness-tracker", "recovery", "sleep", "athlete"],
    specifications: {
      "Tracking": "24/7 HR, HRV, skin temp, SPO2",
      "Battery": "5 days",
      "Waterproof": "IP68",
      "Subscription": "Required ($239/year after)",
      "Features": "Recovery score, strain, sleep coach",
      "Size": "Various band sizes"
    }
  },
  {
    name: "Theragun PRO Bundle",
    slug: "theragun-pro-bundle",
    description: "Professional-grade percussion therapy device for muscle recovery. Features 4 speeds and adjustable arm for hard-to-reach areas.",
    shortDescription: "4 speeds, 16mm amplitude, 6 attachments",
    price: 599.00,
    compareAtPrice: 749.00,
    images: [
      { url: "https://images.unsplash.com/photo-1591343395082-e120087004b4?w=600", alt: "Theragun PRO", isPrimary: true }
    ],
    category: "health-wellness",
    brand: "Theragun",
    sku: "THGPRO01",
    stock: 25,
    rating: 4.6,
    reviewCount: 234,
    tags: ["massage-gun", "recovery", "muscle", "therapy"],
    specifications: {
      "Speed": "4 speeds (1750-2400 RPM)",
      "Amplitude": "16mm",
      "Force": "60 lbs",
      "Attachments": "6 (Standard, Large, Cone, etc.)",
      "Battery": "2 removable, 150 min each",
      "Quiet": "SmartTamp technology"
    }
  },
  {
    name: "Philips SmartSleep Wake-Up Light",
    slug: "philips-smartsleep-wake-up",
    description: "Wake-up light that simulates sunrise and sunset. Proven to improve energy levels, mood, and wake-up experience.",
    shortDescription: "Sunrise/sunset simulation, 10 brightness, FM radio",
    price: 199.99,
    compareAtPrice: 229.99,
    images: [
      { url: "https://images.unsplash.com/photo-1499750310159-5a6f0528ef36?w=600", alt: "Philips Wake-Up Light", isPrimary: true }
    ],
    category: "health-wellness",
    brand: "Philips",
    sku: "PHSLP001",
    stock: 35,
    rating: 4.5,
    reviewCount: 678,
    tags: ["wake-up-light", "sleep", "alarm", "wellness"],
    specifications: {
      "Sunrise": "20-40 min adjustable",
      "Sunset": "15 min",
      "Brightness": "10 levels (300 lux max)",
      "Sounds": "FM radio, 5 natural sounds",
      "Features": "Snooze, tap-to-dim",
      "Display": "Time, alarm status"
    }
  },

  // FOOD & BEVERAGES (2 products)
  {
    name: "Nespresso Vertuo Coffee Maker",
    slug: "nespresso-vertuo-plus",
    description: "Premium single-serve coffee maker with Centrifusion technology. Brew 5 cup sizes with barcode recognition for perfect extraction.",
    shortDescription: "5 cup sizes, barcode technology, milk frother",
    price: 249.99,
    compareAtPrice: 299.99,
    images: [
      { url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600", alt: "Nespresso Vertuo", isPrimary: true }
    ],
    category: "food-beverages",
    brand: "Nespresso",
    sku: "NESVRTU0",
    stock: 45,
    rating: 4.4,
    reviewCount: 567,
    tags: ["coffee-maker", "nespresso", "single-serve", "espresso"],
    specifications: {
      "Cup Sizes": "5 (Espresso to Alto)",
      "Technology": "Centrifusion + barcode",
      "Heat Up": "15 seconds",
      "Capacity": "17.7oz water tank",
      "Frother": "Aeroccino3 included",
      "Capsules": "Vertuo only"
    }
  },
  {
    name: "Vitamix 5200 Blender",
    slug: "vitamix-5200-blender",
    description: "The legendary high-performance blender. Vitamix 5200 delivers professional-grade blending for smoothies, hot soups, and more.",
    shortDescription: "2.0HP motor, variable speed, 64oz container",
    price: 449.99,
    compareAtPrice: 549.99,
    images: [
      { url: "https://images.unsplash.com/photo-1570222094114-28a9d8893971?w=600", alt: "Vitamix 5200", isPrimary: true }
    ],
    category: "food-beverages",
    brand: "Vitamix",
    sku: "VTX5200",
    stock: 30,
    rating: 4.8,
    reviewCount: 1234,
    tags: ["blender", "kitchen", "smoothies", "professional"],
    specifications: {
      "Motor": "2.0 HP (1380 watt)",
      "Container": "64 oz low-profile",
      "Speeds": "10 variable speeds + High",
      "Blades": "Laser-sharp stainless",
      "Warranty": "7 years full",
      "Use": "Hot soups, frozen desserts, smoothies"
    }
  }
];

// Categories with metadata
const categories = [
  { id: "electronics", name: "Electronics", slug: "electronics", icon: "📱", description: "Latest gadgets and devices", productCount: 10 },
  { id: "fashion", name: "Fashion", slug: "fashion", icon: "👗", description: "Clothing, shoes, and accessories", productCount: 8 },
  { id: "home-garden", name: "Home & Garden", slug: "home-garden", icon: "🏠", description: "Everything for your home", productCount: 6 },
  { id: "sports-outdoors", name: "Sports & Outdoors", slug: "sports-outdoors", icon: "⚽", description: "Gear for active lifestyles", productCount: 5 },
  { id: "beauty-personal-care", name: "Beauty & Personal Care", slug: "beauty-personal-care", icon: "💄", description: "Skincare, makeup, and wellness", productCount: 5 },
  { id: "books-media", name: "Books & Media", slug: "books-media", icon: "📚", description: "Books, games, and entertainment", productCount: 4 },
  { id: "toys-games", name: "Toys & Games", slug: "toys-games", icon: "🎮", description: "Fun for all ages", productCount: 4 },
  { id: "automotive", name: "Automotive", slug: "automotive", icon: "🚗", description: "Car accessories and gear", productCount: 3 },
  { id: "health-wellness", name: "Health & Wellness", slug: "health-wellness", icon: "💪", description: "Fitness and wellbeing", productCount: 3 },
  { id: "food-beverages", name: "Food & Beverages", slug: "food-beverages", icon: "🍕", description: "Kitchen and dining", productCount: 2 }
];

module.exports = { products, categories };
