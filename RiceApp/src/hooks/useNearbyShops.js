// src/hooks/useNearbyShops.js
import { useState, useEffect, useCallback } from 'react';
import client from '../api/client';

export const useNearbyShops = (riceVariety, riceType, lat, lng, distance = 50) => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasNearby, setHasNearby] = useState(true);

  const fetchShops = useCallback(async (isGlobalSearch = false) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        riceVariety,
        riceType,
        lat: isGlobalSearch ? undefined : lat,
        lng: isGlobalSearch ? undefined : lng,
        distance: isGlobalSearch ? undefined : distance,
      };

      const res = await client.get('/rice/search', { params });
      
      if (res.data.success) {
        const results = res.data.results || res.data.data || [];
        setShops(results);
        
        if (!isGlobalSearch) {
          setHasNearby(results.length > 0);
        }
      }
    } catch (err) {
      console.error('Fetch shops error:', err);
      setError('Failed to load shops. Check your connection.');
    } finally {
      setLoading(false);
    }
  }, [riceVariety, riceType, lat, lng, distance]);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  return { shops, loading, error, hasNearby, fetchShops, refetch: fetchShops };
};
