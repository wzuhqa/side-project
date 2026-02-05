import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShare2, FiFacebook, FiTwitter, FiLinkedin, FiMail, FiLink2, FiCheck } from 'react-icons/fi';

const SHARE_URLS = {
  facebook: (url, title) => 
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  
  twitter: (url, title) => 
    `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  
  linkedin: (url, title) => 
    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  
  email: (url, title) => 
    `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Check out this product: ${url}`)}`
};

function SocialShare({ url, title, description, image, variant = 'button' }) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${url}` 
    : url;

  const shareTitle = title || 'Check out this product!';
  const shareDescription = description || '';
  const shareImage = image || '';

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const shareOptions = [
    {
      name: 'Facebook',
      icon: FiFacebook,
      color: '#1877f2',
      onClick: () => window.open(SHARE_URLS.facebook(shareUrl, shareTitle), '_blank')
    },
    {
      name: 'Twitter',
      icon: FiTwitter,
      color: '#1da1f2',
      onClick: () => window.open(SHARE_URLS.twitter(shareUrl, shareTitle), '_blank')
    },
    {
      name: 'LinkedIn',
      icon: FiLinkedin,
      color: '#0077b5',
      onClick: () => window.open(SHARE_URLS.linkedin(shareUrl, shareTitle), '_blank')
    },
    {
      name: 'Email',
      icon: FiMail,
      color: '#ea4335',
      onClick: () => window.open(SHARE_URLS.email(shareUrl, shareTitle), '_blank')
    },
    {
      name: 'Copy Link',
      icon: copied ? FiCheck : FiLink2,
      color: copied ? '#10b981' : '#64748b',
      onClick: copyToClipboard
    }
  ];

  if (variant === 'icon') {
    return (
      <div className="social-share-container">
        <motion.button
          className="share-btn-icon"
          onClick={() => setShowMenu(!showMenu)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Share"
          aria-label="Share this product"
        >
          <FiShare2 size={18} />
        </motion.button>

        <AnimatePresence>
          {showMenu && (
            <>
              <motion.div
                className="share-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowMenu(false)}
              />
              
              <motion.div
                className="share-menu"
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                <h4>Share this product</h4>
                
                <div className="share-options">
                  {shareOptions.map((option) => (
                    <motion.button
                      key={option.name}
                      className="share-option"
                      onClick={() => {
                        option.onClick();
                        setShowMenu(false);
                      }}
                      whileHover={{ x: 4 }}
                    >
                      <div 
                        className="option-icon" 
                        style={{ backgroundColor: option.color }}
                      >
                        <option.icon size={16} />
                      </div>
                      <span>{option.name}</span>
                      {copied && option.name === 'Copy Link' && (
                        <span className="copied-badge">Copied!</span>
                      )}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="social-share-inline">
      <span className="share-label">Share:</span>
      
      <div className="share-buttons">
        {shareOptions.slice(0, 4).map((option) => (
          <motion.a
            key={option.name}
            className="share-button"
            href={option.name === 'Email' ? SHARE_URLS.email(shareUrl, shareTitle) : '#'}
            onClick={(e) => {
              e.preventDefault();
              option.onClick();
            }}
            target={option.name === 'Email' ? '_self' : '_blank'}
            rel="noopener noreferrer"
            style={{ '--share-color': option.color }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label={`Share on ${option.name}`}
          >
            <option.icon size={18} />
          </motion.a>
        ))}
        
        <motion.button
          className="share-button copy"
          onClick={copyToClipboard}
          style={{ '--share-color': copied ? '#10b981' : '#64748b' }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Copy link"
        >
          {copied ? <FiCheck size={18} /> : <FiLink2 size={18} />}
        </motion.button>
      </div>
      
      {copied && (
        <motion.span
          className="copy-feedback"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          Link copied!
        </motion.span>
      )}
    </div>
  );
}

// Product card share button
export function ProductShareButton({ product }) {
  return (
    <SocialShare
      url={`/product/${product.slug}`}
      title={product.name}
      description={product.shortDescription || product.description}
      image={product.images?.[0]?.url}
      variant="icon"
    />
  );
}

export default SocialShare;
