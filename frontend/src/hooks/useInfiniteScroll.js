import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../utils/api';

export function useInfiniteScroll(initialParams = {}, options = {}) {
  const {
    limit = 12,
    initialLoad = true,
    useIntersectionObserver = true
  } = options;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);
  
  const observerRef = useRef(null);
  const loadingRef = useRef(false);
  const paramsRef = useRef(initialParams);

  const fetchMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    
    loadingRef.current = true;
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/products', {
        params: {
          ...paramsRef.current,
          page,
          limit
        }
      });
      
      const newItems = response.data.data || [];
      const pagination = response.data.pagination || {};
      
      setItems(prev => [...prev, ...newItems]);
      setHasMore(pagination.pages > pagination.page);
      setPage(prev => prev + 1);
      
      return newItems;
    } catch (err) {
      setError(err);
      console.error('Failed to fetch items:', err);
      return [];
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [page, hasMore, limit]);

  // Reset when params change
  useEffect(() => {
    const paramsChanged = JSON.stringify(paramsRef.current) !== JSON.stringify(initialParams);
    if (paramsChanged) {
      paramsRef.current = initialParams;
      setItems([]);
      setPage(1);
      setHasMore(true);
      setLoading(false);
      loadingRef.current = false;
    }
  }, [initialParams]);

  // Initial fetch
  useEffect(() => {
    if (initialLoad && items.length === 0) {
      fetchMore();
    }
  }, [initialLoad, fetchMore]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!useIntersectionObserver) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !loadingRef.current) {
          fetchMore();
        }
      },
      {
        rootMargin: '200px',
        threshold: 0
      }
    );

    const sentinel = document.getElementById('infinite-scroll-sentinel');
    if (sentinel) {
      observer.observe(sentinel);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [fetchMore, hasMore, useIntersectionObserver]);

  // Manual load more function
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchMore();
    }
  }, [loading, hasMore, fetchMore]);

  // Reset function
  const reset = useCallback(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
    setLoading(false);
    setError(null);
    loadingRef.current = false;
  }, []);

  return {
    items,
    loading,
    hasMore,
    error,
    page,
    loadMore,
    reset,
    fetchMore,
    hasItems: items.length > 0
  };
}

// Product-specific infinite scroll hook
export function useInfiniteProducts(filters = {}, options = {}) {
  const params = {
    category: filters.category || '',
    brand: filters.brand || '',
    minPrice: filters.minPrice || '',
    maxPrice: filters.maxPrice || '',
    minRating: filters.minRating || '',
    sort: filters.sort || '-createdAt',
    search: filters.search || ''
  };

  return useInfiniteScroll(params, {
    limit: options.limit || 12,
    initialLoad: options.initialLoad !== false,
    useIntersectionObserver: options.useIntersectionObserver !== false
  });
}

export default useInfiniteScroll;
