import { useState, useEffect } from 'react';
import { storeInfo as defaultStoreInfo } from '../data/store';
import { categories as defaultCategories } from '../data/categories';
import { products as defaultProducts } from '../data/products';
import { getApiUrl } from '../utils/api';

export function useStoreData() {
  const [categories, setCategories] = useState(defaultCategories || []);
  const [products, setProducts] = useState(defaultProducts || []);
  const [settings, setSettings] = useState(defaultStoreInfo);
  
  // CMS collections
  const [navigation, setNavigation] = useState([]);
  const [heroTags, setHeroTags] = useState([]);
  const [commitments, setCommitments] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [footerLinks, setFooterLinks] = useState([]);
  const [socialLinks, setSocialLinks] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      let publicDataSuccess = false;

      // 1. Primary: Fetch aggregated public storefront data
      try {
        const res = await fetch(getApiUrl('/api/public-data'));
        if (res.ok) {
          const data = await res.json();
          
          if (Array.isArray(data.categories) && data.categories.length > 0) {
            setCategories(data.categories);
          }
          if (Array.isArray(data.products) && data.products.length > 0) {
            setProducts(data.products);
            publicDataSuccess = true;
          }
          if (data.settings && typeof data.settings === 'object') {
            setSettings(prev => ({ ...prev, ...data.settings }));
          }
          
          if (data.navigation_items) setNavigation(data.navigation_items);
          if (data.hero_value_tags) setHeroTags(data.hero_value_tags);
          if (data.commitments) setCommitments(data.commitments);
          if (data.gallery_items) setGallery(data.gallery_items);
          if (data.footer_links) setFooterLinks(data.footer_links);
          if (data.social_links) setSocialLinks(data.social_links);
        }
      } catch (err) {
        console.warn("Public-data aggregate fetch notice, falling back to direct endpoints:", err.message);
      }

      // 2. Fallback / Redundancy: If products were not populated via public-data, fetch direct endpoints (matching admin dashboard)
      if (!publicDataSuccess) {
        try {
          const [prodRes, catRes] = await Promise.allSettled([
            fetch(getApiUrl('/api/products')),
            fetch(getApiUrl('/api/categories'))
          ]);

          if (prodRes.status === 'fulfilled' && prodRes.value.ok) {
            const fetchedProducts = await prodRes.value.json();
            if (Array.isArray(fetchedProducts) && fetchedProducts.length > 0) {
              setProducts(fetchedProducts);
            }
          }

          if (catRes.status === 'fulfilled' && catRes.value.ok) {
            const fetchedCategories = await catRes.value.json();
            if (Array.isArray(fetchedCategories) && fetchedCategories.length > 0) {
              setCategories(fetchedCategories);
            }
          }
        } catch (directErr) {
          console.error("Direct product/category fetch failed:", directErr);
        }
      }

      setLoading(false);
    }
    
    fetchData();
  }, []);

  return { 
    categories, 
    products, 
    settings, 
    navigation, 
    heroTags, 
    commitments, 
    gallery, 
    footerLinks, 
    socialLinks, 
    loading 
  };
}
