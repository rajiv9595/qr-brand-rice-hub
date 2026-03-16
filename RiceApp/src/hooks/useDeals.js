// hooks/useDeals.js
// Fetches real rice listings + market prices from the LIVE backend.
// No more mock data — directly hits the same API as qrbrands.in website.

import { useState, useEffect, useCallback } from 'react';
import client from '../api/client';

export const useDeals = (location) => {
  const [deals,        setDeals]        = useState([]);
  const [marketPrices, setMarketPrices] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // ── 1. Fetch Best Deals ──
      // Try /rice/best-deals first (returns budget-friendly listings).
      // If empty, fallback to /rice (all public active approved listings).
      const [dealsRes, pricesRes] = await Promise.allSettled([
        client.get('/rice/best-deals', {
          params: location?.lat ? { lat: location.lat, lng: location.lng, radius: 50 } : {},
        }),
        client.get('/market-updates/summary'),
      ]);

      // ── Process Deals ──
      let rawDeals = [];
      if (dealsRes.status === 'fulfilled' && dealsRes.value.data?.data?.length) {
        rawDeals = dealsRes.value.data.data;
      } else {
        // Fallback: fetch ALL public listings (same as website homepage)
        try {
          const fallbackRes = await client.get('/rice');
          if (fallbackRes.data?.data?.length) {
            rawDeals = fallbackRes.data.data;
          }
        } catch (e) {
          console.warn('[useDeals] fallback /rice also failed:', e.message);
        }
      }

      // ── Map backend RiceListing schema → DealCard props ──
      // Backend fields: brandName, riceVariety, riceType, pricePerBag, bagWeightKg,
      //                 bagImageUrl, supplierId.millName, supplierId.district
      const mappedDeals = rawDeals.map((listing) => ({
        _id:            listing._id,
        productName:    listing.riceType ? `${listing.brandName} (${listing.riceType})` : listing.brandName,
        riceVariety:    listing.riceVariety,
        riceType:       listing.riceType,
        packWeight:     listing.bagWeightKg || 26,
        price:          listing.pricePerBag,
        originalPrice:  null, // Backend doesn't store original price
        shopName:       listing.supplierId?.millName || 'Rice Shop',
        shopDistrict:   listing.supplierId?.district || '',
        distanceKm:     null, // Would use geo if available
        isLowestInArea: false,
        bagImageUrl:    listing.bagImageUrl || null,
        averageRating:  listing.averageRating || 0,
        stockAvailable: listing.stockAvailable,
        usageCategory:  listing.usageCategory,
        priceCategory:  listing.priceCategory,
      }));

      setDeals(mappedDeals);

      // ── Process Market Prices ──
      // Backend returns: { _id, variety, avgPrice, minPrice, maxPrice, trend }
      if (pricesRes.status === 'fulfilled' && pricesRes.value.data?.data?.length) {
        const mapped = pricesRes.value.data.data.map((item) => ({
          variety:    item.variety || item._id,
          avgPrice:   Math.round(item.avgPrice || 0),
          minPrice:   item.minPrice,
          maxPrice:   item.maxPrice,
          trend:      item.trend || 'stable',
          count:      item.count,
        }));
        setMarketPrices(mapped);
      }

    } catch (err) {
      setError(err.message || 'Failed to load data from server');
      console.warn('[useDeals] fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  }, [location?.lat, location?.lng]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { deals, marketPrices, loading, error, refetch: fetchData };
};
