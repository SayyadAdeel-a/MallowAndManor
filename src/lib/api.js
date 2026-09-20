const API_URL = import.meta.env.VITE_API_URL || '/api';

let accessToken = localStorage.getItem('accessToken');

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const request = async (path, options = {}, retries = 1) => {
  const headers = { ...options.headers };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  let res;
  for (let attempt = 0; attempt <= retries; attempt++) {
    res = await fetch(`${API_URL}${path}`, { ...options, headers, credentials: 'include' });
    if (res.ok || res.status === 401 || res.status === 404) break;
    if (res.status >= 500 && attempt < retries) await sleep(1000 * (attempt + 1));
  }

  if (res.status === 401 && !path.includes('/auth')) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${accessToken}`;
      res = await fetch(`${API_URL}${path}`, { ...options, headers, credentials: 'include' });
    }
  }

  return res;
};

const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return false;

    const res = await fetch(`${API_URL}/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
      credentials: 'include',
    });
    if (!res.ok) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      return false;
    }
    const data = await res.json();
    accessToken = data.accessToken;
    localStorage.setItem('accessToken', data.accessToken);
    if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
    return true;
  } catch {
    return false;
  }
};

const safeJson = async (res) => {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    if (res.ok) throw new Error(`Invalid JSON: ${text.slice(0, 200)}`);
    throw new Error(`Server ${res.status}: ${text.slice(0, 200)}`);
  }
};

// Public API
export const fetchProducts = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.page) query.set('page', params.page);
  if (params.limit) query.set('limit', params.limit);
  if (params.category && params.category !== 'all') query.set('category', params.category);
  if (params.search) query.set('search', params.search);
  if (params.sort) query.set('sort', params.sort);
  const qs = query.toString();
  const res = await request(`/products${qs ? '?' + qs : ''}`);
  return safeJson(res);
};

export const fetchProductById = async (id) => {
  const res = await request(`/products?id=${id}`);
  return safeJson(res);
};

export const fetchCategories = async () => {
  const res = await request('/products?categories=true');
  return safeJson(res);
};

export const trackEvent = async (eventType, eventData = {}) => {
  try {
    await request('/analytics', {
      method: 'POST',
      body: { eventType, eventData, userAgent: navigator.userAgent, referrer: document.referrer || null },
    });
  } catch (err) {
    console.error('Analytics error:', err);
  }
};

export const fetchProductStats = async (days = 0) => {
  const res = await request(`/analytics?days=${days}`);
  return safeJson(res);
};

export const fetchAnalytics = async (days = 0) => {
  const res = await request(`/analytics?admin=true&days=${days}`);
  return safeJson(res);
};

// Auth API
export const login = async (email, password) => {
  const res = await request('/auth', {
    method: 'POST',
    body: { email, password },
  });
  const data = await safeJson(res);
  if (res.ok && data.accessToken) {
    accessToken = data.accessToken;
    localStorage.setItem('accessToken', data.accessToken);
    if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
  }
  return data;
};

export const logout = async () => {
  await request('/auth', { method: 'POST', body: { logout: true } });
  accessToken = null;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

export const getCurrentUser = async () => {
  const res = await request('/auth');
  return safeJson(res);
};

// Admin API - Products
export const createProduct = async (productData) => {
  const res = await request('/products?admin=true', { method: 'POST', body: productData });
  return safeJson(res);
};

export const updateProduct = async (id, productData) => {
  const res = await request('/products?admin=true', { method: 'PUT', body: { id, ...productData } });
  return safeJson(res);
};

export const deleteProduct = async (id) => {
  const res = await request('/products?admin=true', { method: 'DELETE', body: { id } });
  return safeJson(res);
};

// Admin API - Categories
export const createCategory = async (categoryData) => {
  const res = await request('/products?categories=true&admin=true', { method: 'POST', body: categoryData });
  return safeJson(res);
};

export const updateCategory = async (id, categoryData) => {
  const res = await request('/products?categories=true&admin=true', { method: 'PUT', body: { id, ...categoryData } });
  return safeJson(res);
};

export const deleteCategory = async (id) => {
  const res = await request('/products?categories=true&admin=true', { method: 'DELETE', body: { id } });
  return safeJson(res);
};

export const uploadImage = async (file) => {
  const signRes = await request('/upload/sign');
  if (!signRes.ok) {
    const err = await safeJson(signRes);
    throw new Error(err.error || 'Failed to get upload signature');
  }
  const { cloudName, apiKey, signature, timestamp, folder } = await signRes.json();

  const formData = new FormData();
  formData.append('file', file);
  formData.append('cloud_name', cloudName);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp);
  formData.append('signature', signature);
  formData.append('folder', folder);

  const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!uploadRes.ok) {
    const text = await uploadRes.text();
    throw new Error('Cloudinary upload failed: ' + text.slice(0, 200));
  }

  const data = await uploadRes.json();
  return { url: data.secure_url };
};

// Blog Posts
export const fetchPosts = async () => {
  const res = await request('/posts');
  return safeJson(res);
};

export const fetchPostBySlug = async (slug) => {
  const res = await request(`/posts?slug=${slug}`);
  return safeJson(res);
};

export const fetchAdminPosts = async () => {
  const res = await request('/posts?admin=true');
  return safeJson(res);
};

export const createPost = async (postData) => {
  const res = await request('/posts', { method: 'POST', body: postData });
  return safeJson(res);
};

export const updatePost = async (id, postData) => {
  const res = await request('/posts', { method: 'PUT', body: { id, ...postData } });
  return safeJson(res);
};

export const deletePost = async (id) => {
  const res = await request('/posts', { method: 'DELETE', body: { id } });
  return safeJson(res);
};

// Site Settings
export const fetchSettings = async () => {
  const res = await request('/settings');
  return safeJson(res);
};

export const updateSettings = async (settingsData) => {
  const res = await request('/settings', { method: 'PUT', body: settingsData });
  return safeJson(res);
};