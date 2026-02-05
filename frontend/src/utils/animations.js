import { motion } from 'framer-motion';

// Spring configurations for physics-based animations
export const springConfig = {
  gentle: { type: "spring", stiffness: 100, damping: 15 },
  bouncy: { type: "spring", stiffness: 300, damping: 15 },
  elastic: { type: "spring", stiffness: 400, damping: 10 },
  smooth: { type: "spring", stiffness: 120, damping: 20 },
  slow: { type: "spring", stiffness: 50, damping: 20 },
};

// Easing configurations
export const easing = {
  easeOut: [0.4, 0, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],
  easeInOut: [0.4, 0, 0.2, 1],
};

// Page transition animations
export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.4, ease: easing.easeOut }
};

// Stagger container for lists
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Stagger children animations
export const staggerItem = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: easing.easeOut }
};

// Scroll reveal animation
export const scrollReveal = {
  initial: { opacity: 0, y: 50 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: easing.easeOut }
};

// Hover scale animation
export const hoverScale = {
  scale: 1.05,
  transition: { type: "spring", stiffness: 300, damping: 15 }
};

// Button press animation
export const tapScale = {
  scale: 0.95,
  transition: { type: "spring", stiffness: 400, damping: 15 }
};

// Floating animation
export const floating = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Pulse animation
export const pulse = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Shimmer loading effect
export const shimmer = {
  animate: {
    backgroundPosition: ["0% 0%", "100% 100%"],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

// Text reveal character animation
export const textReveal = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: easing.easeOut }
};

// Word reveal animation
export const wordReveal = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.3 }
};

// Zoom image on hover
export const imageZoom = {
  scale: 1.1,
  transition: { duration: 0.4, ease: easing.easeOut }
};

// Cart badge bounce
export const cartBounce = {
  animate: {
    scale: [1, 1.2, 1],
    transition: { duration: 0.3 }
  }
};

// Loading skeleton
export const skeletonStyle = {
  background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
  backgroundSize: "200% 100%",
};

// Animation variants for reduced motion
export const reducedMotionVariants = {
  pageTransition: { opacity: 1, transition: { duration: 0.1 } },
  staggerContainer: { animate: { transition: { staggerChildren: 0.05 } } },
  staggerItem: { opacity: 1, y: 0, transition: { duration: 0.1 } },
  scrollReveal: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  hoverScale: { scale: 1.02, transition: { duration: 0.1 } },
  floating: { animate: { y: 0 } },
  pulse: { animate: { scale: 1 } },
  shimmer: { animate: { backgroundPosition: ["0% 0%", "100% 100%"], transition: { duration: 0.5, repeat: Infinity } } },
  textReveal: { opacity: 1, y: 0, transition: { duration: 0.1 } },
  wordReveal: { opacity: 1, transition: { duration: 0.05 } },
  imageZoom: { scale: 1, transition: { duration: 0.1 } },
  cartBounce: { animate: { scale: 1 } },
};

// Export motion components
export { motion };
