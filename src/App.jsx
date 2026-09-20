import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { fetchProducts, fetchCategories, fetchProductStats } from "./lib/api";
import { trackPageView, trackAddToCart, trackRemoveFromCart } from "./lib/analytics";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import Reports from "./pages/Reports";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import AdminPosts from "./pages/AdminPosts";
import Home from "./pages/Home";
import AllProducts from "./pages/AllProducts";
import ProductDetail from "./pages/ProductDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Favorites from "./pages/Favorites";
import Cart from "./pages/Cart";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import BackToTop from "./components/BackToTop";

function NotFound() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-32 text-center">
      <h1 className="text-6xl font-bold text-brand-burgundy mb-4">404</h1>
      <p className="text-brand-wine-dark/60 text-lg mb-8">Page not found</p>
      <a href="/" className="inline-block px-8 py-3 bg-brand-burgundy text-brand-cream text-sm font-semibold tracking-wider uppercase hover:bg-brand-wine-dark transition-colors">
        Back to Store
      </a>
    </div>
  );
}

function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productStats, setProductStats] = useState({});
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("honeybee_cart");
    return saved ? JSON.parse(saved) : [];
  });
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("honeybee_favorites");
    return saved ? JSON.parse(saved) : [];
  });

  // Track page views
  const location = useLocation();
  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  // Load products and categories from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Clear any stale/error cache from localStorage (incl. legacy mallow keys)
        try {
          const oldCatCache = JSON.parse(localStorage.getItem('honeybee_categories_cache'));
          const oldProdCache = JSON.parse(localStorage.getItem('honeybee_products_cache'));
          if (oldCatCache && !Array.isArray(oldCatCache.data)) localStorage.removeItem('honeybee_categories_cache');
          if (oldProdCache && !Array.isArray(oldProdCache.data)) localStorage.removeItem('honeybee_products_cache');
          // one-time cleanup of old brand keys
          localStorage.removeItem('mallow_categories_cache');
          localStorage.removeItem('mallow_products_cache');
        } catch { /* ignore parse errors */ }

        const cachedProducts = localStorage.getItem('honeybee_products_cache');
        const cachedCategories = localStorage.getItem('honeybee_categories_cache');

        if (cachedProducts && cachedCategories) {
          const prodCache = JSON.parse(cachedProducts);
          const catCache = JSON.parse(cachedCategories);
          const now = Date.now();

          if (now - prodCache.timestamp < 300000 && now - catCache.timestamp < 300000) {
            setProducts(prodCache.data);
            setCategories(catCache.data);
            return;
          }
        }

        const [categoriesData, productsData, stats] = await Promise.all([
          fetchCategories(),
          fetchProducts(),
          fetchProductStats().catch(() => ({})),
        ]);

        const validCategories = Array.isArray(categoriesData) ? categoriesData : [];
        setCategories(validCategories);
        localStorage.setItem('honeybee_categories_cache', JSON.stringify({
          data: validCategories,
          timestamp: Date.now()
        }));

        const rawProducts = Array.isArray(productsData) ? productsData : (productsData?.products || []);
        const mappedProducts = rawProducts.map(p => ({
          id: p._id,
          name: p.name,
          price: p.price,
          category: p.category,
          mainImage: p.mainImage,
          thumbnails: Array.isArray(p.thumbnails) ? p.thumbnails : [],
          description: p.description,
          createdAt: p.createdAt,
        }));
        setProducts(mappedProducts);
        setProductStats(typeof stats === 'object' && !Array.isArray(stats) ? stats : {});

        localStorage.setItem('honeybee_products_cache', JSON.stringify({
          data: mappedProducts,
          timestamp: Date.now()
        }));
      } catch (err) {
        console.error("Error loading data from API:", err);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    localStorage.setItem("honeybee_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("honeybee_favorites", JSON.stringify(favorites));
  }, [favorites]);

  const handleAddToCart = (product, quantity = 1) => {
    trackAddToCart(product.id, product.name, quantity);
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: (item.quantity || 1) + quantity }
            : item
        ),
      );
    } else {
      setCart([...cart, { ...product, quantity }]);
    }
  };

  const toggleFavorite = (product) => {
    const exists = favorites.find((f) => f.id === product.id);
    if (exists) {
      setFavorites(favorites.filter((f) => f.id !== product.id));
    } else {
      setFavorites([...favorites, product]);
    }
  };

  const removeFromCart = (productId) => {
    const item = cart.find(i => i.id === productId);
    if (item) trackRemoveFromCart(item.id, item.name);
    setCart(cart.filter((item) => item.id !== productId));
  };

  const updateCartQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setCart(
      cart.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item,
      ),
    );
  };

  return (
    <>
      <ScrollToTop />
      <div className="min-h-screen bg-brand-cream">
        <Navigation
          cartCount={cart.length}
          favCount={favorites.length}
        />

        <main>
          <Routes>
            <Route
              path="/"
              element={
                <Home
                  products={products}
                  categories={categories}
                  handleAddToCart={handleAddToCart}
                  productStats={productStats}
                  toggleFavorite={toggleFavorite}
                  favorites={favorites}
                />
              }
            />
            <Route
              path="/product/:id"
              element={
                <ProductDetail
                  products={products}
                  handleAddToCart={handleAddToCart}
                  toggleFavorite={toggleFavorite}
                  favorites={favorites}
                />
              }
            />
            <Route
              path="/products"
              element={
                <AllProducts
                  products={products}
                  categories={categories}
                  handleAddToCart={handleAddToCart}
                  productStats={productStats}
                  toggleFavorite={toggleFavorite}
                  favorites={favorites}
                />
              }
            />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route
              path="/favorites"
              element={
                <Favorites
                  favorites={favorites}
                  addToCart={handleAddToCart}
                  removeFromFavorites={(id) =>
                    setFavorites(favorites.filter((f) => f.id !== id))
                  }
                />
              }
            />
            <Route
              path="/cart"
              element={
                <Cart
                  cart={cart}
                  removeFromCart={removeFromCart}
                  updateQuantity={updateCartQuantity}
                />
              }
            />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/analytics" element={<AnalyticsDashboard />} />
            <Route path="/admin/reports" element={<Reports />} />
            <Route path="/admin/posts" element={<AdminPosts />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <Footer />
        <BackToTop />
      </div>
    </>
  );
}

function AppWithRouter() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWithRouter;
