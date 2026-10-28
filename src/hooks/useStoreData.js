import { useState, useEffect } from 'react';
import { storeInfo as defaultStoreInfo } from '../data/store';
import { getApiUrl } from '../utils/api';

export function useStoreData() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState(defaultStoreInfo);
  
  // New CMS collections
  const [navigation, setNavigation] = useState([]);
  const [heroTags, setHeroTags] = useState([]);
  const [commitments, setCommitments] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [footerLinks, setFooterLinks] = useState([]);
  const [socialLinks, setSocialLinks] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(getApiUrl('/api/public-data'));
        if (res.ok) {
          const data = await res.json();
          
          if (data.categories) setCategories(data.categories);
          if (data.products) setProducts(data.products);
          if (data.settings) setSettings(prev => ({ ...prev, ...data.settings }));
          
          if (data.navigation_items) setNavigation(data.navigation_items);
          if (data.hero_value_tags) setHeroTags(data.hero_value_tags);
          if (data.commitments) setCommitments(data.commitments);
          if (data.gallery_items) setGallery(data.gallery_items);
          if (data.footer_links) setFooterLinks(data.footer_links);
          if (data.social_links) setSocialLinks(data.social_links);
        }
      } catch (err) {
        console.error("Failed to fetch store data:", err);
      } finally {
        setLoading(false);
      }
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
