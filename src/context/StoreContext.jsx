// Centralized Real-Time Store Context for Sri Manikanta Sai General Store
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { products as initialProducts } from '../data/products';
import { categories as initialCategories } from '../data/categories';
import { storeInfo as initialStoreInfo } from '../data/store';
import { realtimeService } from '../services/realtime';

const StoreContext = createContext(null);

const FEATURED_IDS = [
  "snk-bingo",
  "choc-dairy-milk",
  "bisc-goodday",
  "tea-3roses",
  "dal-kandi",
  "bev-thumsup",
  "soap-santoor",
  "clean-rin-surf"
];

const DEFAULT_PROD_API = 'https://grocery-k0jb.onrender.com';

function getApiUrl(path) {
  const cleanPath = path.startsWith('/') ? path : '/' + path;
  const customUrl = (import.meta.env.VITE_API_URL || '').trim();
  if (customUrl) {
    const cleanCustom = customUrl.replace(/\/+$/, '');
    if (cleanCustom.endsWith('/api') && cleanPath.startsWith('/api/')) {
      return cleanCustom + cleanPath.slice(4);
    }
    return cleanCustom + cleanPath;
  }
  if (typeof window !== 'undefined' && 
      window.location.hostname && 
      !window.location.hostname.includes('localhost') && 
      !window.location.hostname.includes('127.0.0.1')) {
    const cleanDefault = DEFAULT_PROD_API.replace(/\/+$/, '');
    return cleanDefault + cleanPath;
  }
  return cleanPath;
}

export function StoreProvider({ children }) {
  const [products, setProducts] = useState(initialProducts);
  const [categories, setCategories] = useState(initialCategories);
  const [storeInfo, setStoreInfo] = useState(initialStoreInfo);
  const [coupons, setCoupons] = useState([]);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);

  // Initial load from backend database to ensure single source of truth
  const fetchLatestData = useCallback(async () => {
    try {
      const [prodRes, catRes, setRes, coupRes] = await Promise.allSettled([
        fetch(getApiUrl('/api/products')),
        fetch(getApiUrl('/api/categories')),
        fetch(getApiUrl('/api/settings')),
        fetch(getApiUrl('/api/coupons'))
      ]);

      if (prodRes.status === 'fulfilled' && prodRes.value.ok) {
        const prodData = await prodRes.value.json().catch(() => null);
        if (Array.isArray(prodData) && prodData.length > 0) {
          setProducts(prodData);
        }
      }

      if (catRes.status === 'fulfilled' && catRes.value.ok) {
        const catData = await catRes.value.json().catch(() => null);
        if (Array.isArray(catData) && catData.length > 0) {
          setCategories(catData);
        }
      }

      if (setRes.status === 'fulfilled' && setRes.value.ok) {
        const setData = await setRes.value.json().catch(() => null);
        if (setData && typeof setData === 'object' && setData.name) {
          setStoreInfo(prev => ({ ...prev, ...setData }));
        }
      }

      if (coupRes.status === 'fulfilled' && coupRes.value.ok) {
        const coupData = await coupRes.value.json().catch(() => null);
        if (Array.isArray(coupData)) {
          setCoupons(coupData);
        }
      }
    } catch (err) {
      console.warn('Initial background sync note:', err.message);
    }
  }, []);

  // Connect to SSE stream and subscribe to targeted delta events
  useEffect(() => {
    fetchLatestData();

    // 1. Connection status tracking
    const unsubConn = realtimeService.subscribe('connection:change', ({ connected }) => {
      setIsRealtimeConnected(connected);
      if (connected) {
        // Upon reconnect, refresh data to capture any missed events while disconnected
        fetchLatestData();
      }
    });

    // 2. Real-time Product Created
    const unsubProdCreate = realtimeService.subscribe('product:created', (newProduct) => {
      setProducts(prev => {
        if (prev.some(p => p.id === newProduct.id)) return prev;
        return [newProduct, ...prev];
      });
    });

    // 3. Real-time Product Updated (price, image, name, stock, availability, etc.)
    const unsubProdUpdate = realtimeService.subscribe('product:updated', (updatedProduct) => {
      setProducts(prev => prev.map(p => {
        if (p.id === updatedProduct.id) {
          return { ...p, ...updatedProduct };
        }
        return p;
      }));
    });

    // 4. Real-time Product Deleted
    const unsubProdDelete = realtimeService.subscribe('product:deleted', ({ id }) => {
      setProducts(prev => prev.filter(p => p.id !== id));
    });

    // 5. Real-time Bulk Product Updates
    const unsubProdBulk = realtimeService.subscribe('products:bulk', ({ action, productIds, payload }) => {
      if (!Array.isArray(productIds)) return;
      setProducts(prev => prev.map(p => {
        if (!productIds.includes(p.id)) return p;
        if (action === 'setInStock') return { ...p, inStock: Boolean(payload.inStock) };
        if (action === 'setCategory') return { ...p, categoryId: payload.categoryId };
        if (action === 'setPriceVerified') return { ...p, priceNote: 'verified' };
        if (action === 'setStock') return { ...p, stock: Number(payload.stock), inStock: Number(payload.stock) > 0 };
        return p;
      }));
    });

    // 6. Real-time Inventory & Stock Adjustment
    const unsubInventory = realtimeService.subscribe('inventory:adjusted', ({ productId, stock, inStock }) => {
      setProducts(prev => prev.map(p => {
        if (p.id === productId) {
          return { ...p, stock, inStock };
        }
        return p;
      }));
    });

    // 7. Real-time Category Created
    const unsubCatCreate = realtimeService.subscribe('category:created', (newCategory) => {
      setCategories(prev => {
        if (prev.some(c => c.id === newCategory.id)) return prev;
        return [...prev, newCategory];
      });
    });

    // 8. Real-time Category Updated
    const unsubCatUpdate = realtimeService.subscribe('category:updated', (updatedCategory) => {
      setCategories(prev => prev.map(c => {
        if (c.id === updatedCategory.id) {
          return { ...c, ...updatedCategory };
        }
        return c;
      }));
    });

    // 9. Real-time Category Deleted
    const unsubCatDelete = realtimeService.subscribe('category:deleted', ({ id }) => {
      setCategories(prev => prev.filter(c => c.id !== id));
    });

    // 10. Real-time Store Settings Updated
    const unsubSettings = realtimeService.subscribe('settings:updated', (updatedSettings) => {
      setStoreInfo(prev => ({ ...prev, ...updatedSettings }));
    });

    // 11. Real-time Coupon Created
    const unsubCouponCreate = realtimeService.subscribe('coupon:created', (newCoupon) => {
      setCoupons(prev => {
        if (prev.some(c => c.id === newCoupon.id || c.code === newCoupon.code)) return prev;
        return [newCoupon, ...prev];
      });
    });

    // 12. Real-time Coupon Deleted
    const unsubCouponDelete = realtimeService.subscribe('coupon:deleted', ({ id }) => {
      setCoupons(prev => prev.filter(c => c.id !== id));
    });

    return () => {
      unsubConn();
      unsubProdCreate();
      unsubProdUpdate();
      unsubProdDelete();
      unsubProdBulk();
      unsubInventory();
      unsubCatCreate();
      unsubCatUpdate();
      unsubCatDelete();
      unsubSettings();
      unsubCouponCreate();
      unsubCouponDelete();
      realtimeService.disconnect();
    };
  }, [fetchLatestData]);

  // Derived featured products list (always synchronized with latest live products)
  const featuredProducts = useMemo(() => {
    return products.filter(p => FEATURED_IDS.includes(p.id));
  }, [products]);

  const value = useMemo(() => ({
    products,
    categories,
    storeInfo,
    coupons,
    featuredProducts,
    isRealtimeConnected,
    refreshData: fetchLatestData
  }), [products, categories, storeInfo, coupons, featuredProducts, isRealtimeConnected, fetchLatestData]);

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    // Graceful fallback if rendered outside provider
    return {
      products: initialProducts,
      categories: initialCategories,
      storeInfo: initialStoreInfo,
      coupons: [],
      featuredProducts: initialProducts.filter(p => FEATURED_IDS.includes(p.id)),
      isRealtimeConnected: false,
      refreshData: () => {}
    };
  }
  return context;
}
