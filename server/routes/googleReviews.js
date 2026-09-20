import express from 'express';

const router = express.Router();

// In-memory cache — protects Google API quota (reviews change rarely)
let cache = { data: null, ts: 0 };
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

const normalizeReviews = (place) => {
  const reviews = (place.reviews || []).map((r) => ({
    author: r.authorAttribution?.displayName || 'Google User',
    photo: r.authorAttribution?.photoUri || '',
    profileUrl: r.authorAttribution?.uri || '',
    rating: Math.round(r.rating || 5),
    text: r.text?.text || r.originalText?.text || '',
    date: r.relativePublishTimeDescription || r.publishTime || '',
    verified: true,
  }));

  return {
    reviews,
    rating: place.rating || null,
    totalRatings: place.userRatingCount || 0,
    placeName: place.displayName?.text || '',
    mapsUrl: place.googleMapsUri || null,
  };
};

// GET /api/google-reviews — public
router.get('/', async (req, res) => {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!apiKey || !placeId) {
    return res.status(501).json({
      error: 'Google reviews not configured. Set GOOGLE_PLACES_API_KEY and GOOGLE_PLACE_ID environment variables.',
      reviews: [],
    });
  }

  try {
    if (cache.data && Date.now() - cache.ts < CACHE_TTL) {
      return res.json(cache.data);
    }

    const response = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'id,displayName,rating,userRatingCount,googleMapsUri,reviews',
        },
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('Google Places API error:', response.status, errText.slice(0, 300));
      if (cache.data) return res.json(cache.data);
      return res.status(502).json({ error: 'Failed to fetch Google reviews', reviews: [] });
    }

    const place = await response.json();
    const data = normalizeReviews(place);

    cache = { data, ts: Date.now() };
    return res.json(data);
  } catch (err) {
    if (cache.data) return res.json(cache.data);
    return res.status(500).json({ error: err.message, reviews: [] });
  }
});

export default router;
