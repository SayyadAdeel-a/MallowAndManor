import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCurrentUser, fetchProducts, createProduct, updateProduct, deleteProduct,
  fetchCategories, createCategory, deleteCategory,
  fetchAdminPosts, createPost, updatePost, deletePost,
  fetchSettings, updateSettings, uploadImage,
} from "../lib/api";
import AdminHeader from "../components/AdminHeader";

function InputField({ label, value, onChange, type = "text", multiline, rows = 3 }) {
  if (multiline) {
    return (
      <div>
        <label className="block text-xs font-semibold tracking-wider uppercase text-brand-wine-dark/70 mb-1.5">{label}</label>
        <textarea
          value={value || ""}
          onChange={onChange}
          rows={rows}
          className="w-full px-3 py-2 bg-white border border-brand-border text-brand-wine-dark text-sm focus:outline-none focus:border-brand-gold rounded-lg resize-y"
        />
      </div>
    );
  }
  return (
    <div>
      <label className="block text-xs font-semibold tracking-wider uppercase text-brand-wine-dark/70 mb-1.5">{label}</label>
      <input
        type={type}
        value={value || ""}
        onChange={onChange}
        className="w-full px-3 py-2 bg-white border border-brand-border text-brand-wine-dark text-sm focus:outline-none focus:border-brand-gold rounded-lg"
      />
    </div>
  );
}

function ImageUpload({ label, value, onChange }) {
  const [preview, setPreview] = useState(value || "");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setPreview(value || "");
  }, [value]);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setPreview(url);
      onChange(url);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Image upload failed: " + err.message);
    }
    setUploading(false);
  };

  return (
    <div>
      <label className="block text-xs font-semibold tracking-wider uppercase text-brand-wine-dark/70 mb-1.5">{label}</label>
      {preview && (
        <img src={preview} alt="Preview" className="w-32 h-32 object-cover rounded-lg border border-brand-border mb-2" />
      )}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
        className="block w-full text-sm text-brand-wine-dark/70 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-brand-burgundy file:text-brand-cream hover:file:bg-brand-wine-dark file:cursor-pointer"
      />
      {uploading && <span className="text-xs text-brand-gold mt-1 block">Uploading...</span>}
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("products");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [products, setProducts] = useState([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({ name: "", price: "", category: "", description: "" });
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("");

  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategorySlug, setNewCategorySlug] = useState("");

  const [posts, setPosts] = useState([]);
  const [showPostForm, setShowPostForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [postForm, setPostForm] = useState({ title: "", slug: "", content: "", excerpt: "", author: "", published: false, featuredImage: "" });

  const [settings, setSettings] = useState({});

  const loadAll = async () => {
    setLoading(true);
    try {
      const [prodData, catData, postData, settingsData] = await Promise.all([
        fetchProducts({ page: 1, limit: 200 }),
        fetchCategories(),
        fetchAdminPosts(),
        fetchSettings(),
      ]);
      const prods = Array.isArray(prodData) ? prodData : (prodData?.products || []);
      setProducts(prods.map(p => ({ ...p, id: p._id })));
      setCategories(Array.isArray(catData) ? catData : (catData?.categories || []));
      setPosts(Array.isArray(postData) ? postData : (postData?.posts || []));
      setSettings(settingsData);
    } catch (err) { console.error("Load error:", err); }
    setLoading(false);
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const u = await getCurrentUser();
        if (u.error || !u._id) { navigate("/admin/login"); return; }
        setUser(u);
        loadAll();
      } catch { navigate("/admin/login"); }
    };
    checkAuth();
  }, [navigate]);

  const updateSetting = (path, value) => {
    setSettings(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split(".");
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) {
        if (typeof obj[keys[i]] === "object" && obj[keys[i]] !== null) obj = obj[keys[i]];
        else return prev;
      }
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const handleSettingsSave = async () => {
    setSaving(true);
    try {
      await updateSettings(settings);
      alert("Saved!");
    } catch (err) { alert("Error: " + err.message); }
    setSaving(false);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const price = parseFloat(productForm.price);
    if (!productForm.name?.trim()) { alert("Product name is required"); return; }
    if (productForm.price === "" || isNaN(price)) { alert("Please enter a valid numeric price"); return; }
    if (!productForm.category) { alert("Please select a category"); return; }
    setSaving(true);
    try {
      const payload = {
        name: productForm.name,
        price,
        category: productForm.category,
        description: productForm.description || "",
        mainImage: productForm.mainImage || "",
      };
      if (editingProduct) {
        await updateProduct(editingProduct.id || editingProduct._id, payload);
      } else {
        await createProduct(payload);
      }
      setShowProductForm(false);
      setEditingProduct(null);
      setProductForm({ name: "", price: "", category: "", description: "", mainImage: "" });
      await loadAll();
    } catch (err) { alert("Error: " + err.message); }
    setSaving(false);
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm("Delete this product?")) return;
    try { await deleteProduct(id); await loadAll(); }
    catch (err) { alert("Error: " + err.message); }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createCategory({ name: newCategoryName, slug: newCategorySlug });
      setNewCategoryName("");
      setNewCategorySlug("");
      await loadAll();
    } catch (err) { alert("Error: " + err.message); }
    setSaving(false);
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm("Delete this category?")) return;
    try { await deleteCategory(id); await loadAll(); }
    catch (err) { alert("Error: " + err.message); }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingPost) {
        await updatePost(editingPost.id || editingPost._id, postForm);
      } else {
        await createPost(postForm);
      }
      setShowPostForm(false);
      setEditingPost(null);
      setPostForm({ title: "", slug: "", content: "", excerpt: "", author: "", published: false, featuredImage: "" });
      await loadAll();
    } catch (err) { alert("Error: " + err.message); }
    setSaving(false);
  };

  const handleDeletePost = async (id) => {
    if (!confirm("Delete this post?")) return;
    try { await deletePost(id); await loadAll(); }
    catch (err) { alert("Error: " + err.message); }
  };

  const tabs = [
    { id: "products", label: "Products" },
    { id: "categories", label: "Categories" },
    { id: "posts", label: "Blog Posts" },
    { id: "hero", label: "Hero" },
    { id: "sale", label: "Sale Banner" },
    { id: "story", label: "Story Section" },
    { id: "newsletter", label: "Newsletter" },
    { id: "contact", label: "Contact" },
    { id: "footer", label: "Footer" },
  ];

  const filteredProducts = products.filter(p => {
    const matchSearch = !productSearch || p.name?.toLowerCase().includes(productSearch.toLowerCase());
    const matchCat = !productCategoryFilter || p.category === productCategoryFilter || p.category?.name === productCategoryFilter;
    return matchSearch && matchCat;
  });

  if (!user) return <div className="min-h-screen bg-brand-cream flex items-center justify-center text-brand-wine-dark">Loading...</div>;

  return (
    <div className="min-h-screen bg-brand-cream">
      <AdminHeader userEmail={user.email} />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-brand-burgundy font-display">Admin Dashboard</h1>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-xs font-semibold tracking-wider uppercase rounded-full transition-colors ${
                activeTab === tab.id
                  ? "bg-brand-burgundy text-brand-cream"
                  : "bg-white border border-brand-border text-brand-wine-dark/70 hover:border-brand-gold hover:text-brand-burgundy"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-brand-wine-dark/50">Loading dashboard...</div>
        ) : (
          <div className="bg-white border border-brand-border rounded-xl shadow-sm p-6">
            {/* ========== PRODUCTS TAB ========== */}
            {activeTab === "products" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-brand-burgundy">Products ({products.length})</h2>
                  <button
                    onClick={() => { setShowProductForm(true); setEditingProduct(null); setProductForm({ name: "", price: "", category: "", description: "" }); }}
                    className="px-4 py-2 bg-brand-burgundy text-brand-cream text-xs font-semibold tracking-wider uppercase rounded-full hover:bg-brand-wine-dark transition-colors"
                  >
                    Add Product
                  </button>
                </div>

                {/* Product Form */}
                {showProductForm && (
                  <div className="bg-brand-cream/50 border border-brand-border rounded-xl p-6 mb-6">
                    <h3 className="text-sm font-semibold text-brand-burgundy mb-4">{editingProduct ? "Edit Product" : "New Product"}</h3>
                    <form onSubmit={handleProductSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField label="Name" value={productForm.name} onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))} />
                      <InputField label="Price" value={productForm.price} onChange={e => setProductForm(f => ({ ...f, price: e.target.value }))} type="number" />
                      <div>
                        <label className="block text-xs font-semibold tracking-wider uppercase text-brand-wine-dark/70 mb-1.5">Category</label>
                        <select
                          value={productForm.category}
                          onChange={e => setProductForm(f => ({ ...f, category: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border border-brand-border text-brand-wine-dark text-sm focus:outline-none focus:border-brand-gold rounded-lg"
                        >
                          <option value="">Select category</option>
{categories.map(c => (
<option key={c._id || c.id} value={c.slug || c._id || c.id}>{c.name}</option>
))}
                        </select>
                      </div>
                      <ImageUpload
                        label="Main Image"
                        value={productForm.mainImage}
                        onChange={url => setProductForm(f => ({ ...f, mainImage: url }))}
                      />
                      <div className="md:col-span-2">
                        <InputField label="Description" value={productForm.description} onChange={e => setProductForm(f => ({ ...f, description: e.target.value }))} multiline rows={4} />
                      </div>
                      <div className="md:col-span-2 flex gap-3">
                        <button
                          type="submit"
                          disabled={saving}
                          className="px-6 py-2.5 bg-brand-burgundy text-brand-cream text-xs font-semibold tracking-wider uppercase hover:bg-brand-wine-dark transition-colors disabled:opacity-50 shadow-sm rounded-full"
                        >
                          {saving ? "Saving..." : editingProduct ? "Update Product" : "Create Product"}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setShowProductForm(false); setEditingProduct(null); }}
                          className="px-6 py-2.5 bg-white border border-brand-border text-brand-wine-dark/70 text-xs font-semibold tracking-wider uppercase hover:border-brand-gold rounded-full transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Filters */}
                <div className="flex gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white border border-brand-border text-brand-wine-dark text-sm focus:outline-none focus:border-brand-gold rounded-lg"
                  />
                  <select
                    value={productCategoryFilter}
                    onChange={e => setProductCategoryFilter(e.target.value)}
                    className="px-3 py-2 bg-white border border-brand-border text-brand-wine-dark text-sm focus:outline-none focus:border-brand-gold rounded-lg"
                  >
                    <option value="">All Categories</option>
                    {categories.map(c => (
                      <option key={c._id || c.id} value={c.slug || c._id || c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Products Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-brand-border">
                        <th className="text-left py-3 px-4 text-xs font-semibold tracking-wider uppercase text-brand-wine-dark/70">Product</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold tracking-wider uppercase text-brand-wine-dark/70">Category</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold tracking-wider uppercase text-brand-wine-dark/70">Price</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold tracking-wider uppercase text-brand-wine-dark/70">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map(product => (
                        <tr key={product.id || product._id} className="border-b border-brand-border/50 hover:bg-brand-cream/30">
                          <td className="py-3 px-4 flex items-center gap-3">
                            {product.mainImage && (
                              <img src={product.mainImage} alt="" className="w-10 h-10 rounded-lg object-cover" />
                            )}
                            <span className="font-medium text-brand-wine-dark">{product.name}</span>
                          </td>
                          <td className="py-3 px-4 text-brand-wine-dark/70">{product.category?.name || product.category || "-"}</td>
                          <td className="py-3 px-4 text-brand-wine-dark/70">₹{product.price}</td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => { window.open(`/products/${product.slug || product.id}`, "_blank"); }}
                                className="px-3 py-1 text-xs rounded-full border border-brand-border text-brand-wine-dark/70 hover:border-brand-gold transition-colors"
                              >
                                View
                              </button>
                              <button
                                onClick={() => {
                                  setEditingProduct(product);
                                  // Resolve stored category (slug or old ObjectId) to slug for the dropdown
                                  const storedCat = product.category?._id || product.category || "";
                                  const match = categories.find(c => c.slug === storedCat || c._id === storedCat || c.id === storedCat);
                                  setProductForm({
                                    name: product.name || "",
                                    price: product.price ?? "",
                                    category: match?.slug || storedCat,
                                    description: product.description || "",
                                    mainImage: product.mainImage || "",
                                  });
                                  setShowProductForm(true);
                                }}
                                className="px-3 py-1 text-xs rounded-full border border-brand-border text-brand-wine-dark/70 hover:border-brand-gold transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.id || product._id)}
                                className="px-3 py-1 text-xs rounded-full border border-red-300 text-red-500 hover:bg-red-50 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredProducts.length === 0 && (
                        <tr><td colSpan="4" className="py-8 text-center text-brand-wine-dark/40">No products found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ========== CATEGORIES TAB ========== */}
            {activeTab === "categories" && (
              <div>
                <h2 className="text-lg font-semibold text-brand-burgundy mb-4">Categories ({categories.length})</h2>
                <form onSubmit={handleCategorySubmit} className="flex gap-4 mb-6 items-end">
                  <div className="flex-1">
                    <InputField label="Category Name" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} />
                  </div>
                  <div className="flex-1">
                    <InputField label="Slug" value={newCategorySlug} onChange={e => setNewCategorySlug(e.target.value)} />
                  </div>
                  <button
                    type="submit"
                    disabled={saving || !newCategoryName || !newCategorySlug}
                    className="px-6 py-2.5 bg-brand-burgundy text-brand-cream text-xs font-semibold tracking-wider uppercase hover:bg-brand-wine-dark transition-colors disabled:opacity-50 shadow-sm rounded-full h-[38px] mt-auto"
                  >
                    {saving ? "Adding..." : "Add Category"}
                  </button>
                </form>
                <div className="space-y-2">
                  {categories.map(cat => (
                    <div key={cat._id || cat.id} className="flex items-center justify-between p-3 bg-brand-cream/50 border border-brand-border rounded-lg">
                      <div>
                        <span className="font-medium text-brand-wine-dark">{cat.name}</span>
                        <span className="text-brand-wine-dark/50 text-xs ml-2">/{cat.slug}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteCategory(cat._id || cat.id)}
                        className="px-3 py-1 text-xs rounded-full border border-red-300 text-red-500 hover:bg-red-50 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                  {categories.length === 0 && (
                    <p className="text-center py-8 text-brand-wine-dark/40">No categories yet.</p>
                  )}
                </div>
              </div>
            )}

            {/* ========== BLOG POSTS TAB ========== */}
            {activeTab === "posts" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-brand-burgundy">Blog Posts ({posts.length})</h2>
                  <button
                    onClick={() => { setShowPostForm(true); setEditingPost(null); setPostForm({ title: "", slug: "", content: "", excerpt: "", author: "", published: false, featuredImage: "" }); }}
                    className="px-4 py-2 bg-brand-burgundy text-brand-cream text-xs font-semibold tracking-wider uppercase rounded-full hover:bg-brand-wine-dark transition-colors"
                  >
                    Add Post
                  </button>
                </div>

                {/* Post Form */}
                {showPostForm && (
                  <div className="bg-brand-cream/50 border border-brand-border rounded-xl p-6 mb-6">
                    <h3 className="text-sm font-semibold text-brand-burgundy mb-4">{editingPost ? "Edit Post" : "New Post"}</h3>
                    <form onSubmit={handlePostSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField label="Title" value={postForm.title} onChange={e => setPostForm(f => ({ ...f, title: e.target.value }))} />
                      <InputField label="Slug" value={postForm.slug} onChange={e => setPostForm(f => ({ ...f, slug: e.target.value }))} />
                      <InputField label="Author" value={postForm.author} onChange={e => setPostForm(f => ({ ...f, author: e.target.value }))} />
                      <InputField label="Excerpt" value={postForm.excerpt} onChange={e => setPostForm(f => ({ ...f, excerpt: e.target.value }))} />
                      <div className="md:col-span-2">
                        <InputField label="Content" value={postForm.content} onChange={e => setPostForm(f => ({ ...f, content: e.target.value }))} multiline rows={8} />
                      </div>
                      <ImageUpload
                        label="Featured Image"
                        value={postForm.featuredImage}
                        onChange={url => setPostForm(f => ({ ...f, featuredImage: url }))}
                      />
                      <div className="flex items-center gap-2 mt-6">
                        <input
                          type="checkbox"
                          checked={postForm.published}
                          onChange={e => setPostForm(f => ({ ...f, published: e.target.checked }))}
                          className="w-4 h-4 accent-brand-burgundy"
                        />
                        <label className="text-sm text-brand-wine-dark">Published</label>
                      </div>
                      <div className="md:col-span-2 flex gap-3">
                        <button
                          type="submit"
                          disabled={saving}
                          className="px-6 py-2.5 bg-brand-burgundy text-brand-cream text-xs font-semibold tracking-wider uppercase hover:bg-brand-wine-dark transition-colors disabled:opacity-50 shadow-sm rounded-full"
                        >
                          {saving ? "Saving..." : editingPost ? "Update Post" : "Create Post"}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setShowPostForm(false); setEditingPost(null); }}
                          className="px-6 py-2.5 bg-white border border-brand-border text-brand-wine-dark/70 text-xs font-semibold tracking-wider uppercase hover:border-brand-gold rounded-full transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Posts Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-brand-border">
                        <th className="text-left py-3 px-4 text-xs font-semibold tracking-wider uppercase text-brand-wine-dark/70">Title</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold tracking-wider uppercase text-brand-wine-dark/70">Status</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold tracking-wider uppercase text-brand-wine-dark/70">Date</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold tracking-wider uppercase text-brand-wine-dark/70">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {posts.map(post => (
                        <tr key={post.id || post._id} className="border-b border-brand-border/50 hover:bg-brand-cream/30">
                          <td className="py-3 px-4 font-medium text-brand-wine-dark">{post.title}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 text-xs rounded-full ${post.published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                              {post.published ? "Published" : "Draft"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-brand-wine-dark/70">
                            {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "-"}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => {
                                  setEditingPost(post);
                                  setPostForm({ title: post.title, slug: post.slug, content: post.content || "", excerpt: post.excerpt || "", author: post.author || "", published: post.published || false, featuredImage: post.featuredImage || "" });
                                  setShowPostForm(true);
                                }}
                                className="px-3 py-1 text-xs rounded-full border border-brand-border text-brand-wine-dark/70 hover:border-brand-gold transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeletePost(post.id || post._id)}
                                className="px-3 py-1 text-xs rounded-full border border-red-300 text-red-500 hover:bg-red-50 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {posts.length === 0 && (
                        <tr><td colSpan="4" className="py-8 text-center text-brand-wine-dark/40">No blog posts yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ========== HERO TAB ========== */}
            {activeTab === "hero" && (
              <div>
                <h2 className="text-lg font-semibold text-brand-burgundy mb-4">Hero Section</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField label="Tagline" value={settings.hero?.tagline} onChange={e => updateSetting("hero.tagline", e.target.value)} />
                  <InputField label="Tagline Bottom" value={settings.hero?.taglineBottom} onChange={e => updateSetting("hero.taglineBottom", e.target.value)} />
                  <InputField label="Heading 1" value={settings.hero?.heading1} onChange={e => updateSetting("hero.heading1", e.target.value)} />
                  <InputField label="Heading 2" value={settings.hero?.heading2} onChange={e => updateSetting("hero.heading2", e.target.value)} />
                  <InputField label="Subtitle" value={settings.hero?.subtitle} onChange={e => updateSetting("hero.subtitle", e.target.value)} />
                  <InputField label="CTA 1 Text" value={settings.hero?.cta1Text} onChange={e => updateSetting("hero.cta1Text", e.target.value)} />
                  <InputField label="CTA 1 Link" value={settings.hero?.cta1Link} onChange={e => updateSetting("hero.cta1Link", e.target.value)} />
                  <InputField label="CTA 2 Text" value={settings.hero?.cta2Text} onChange={e => updateSetting("hero.cta2Text", e.target.value)} />
                  <InputField label="CTA 2 Link" value={settings.hero?.cta2Link} onChange={e => updateSetting("hero.cta2Link", e.target.value)} />
                  <div className="md:col-span-2">
                    <ImageUpload
                      label="Hero Image"
                      value={settings.hero?.image}
                      onChange={url => updateSetting("hero.image", url)}
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <button
                    onClick={handleSettingsSave}
                    disabled={saving}
                    className="px-6 py-2.5 bg-brand-burgundy text-brand-cream text-xs font-semibold tracking-wider uppercase hover:bg-brand-wine-dark transition-colors disabled:opacity-50 shadow-sm rounded-full"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            )}

            {/* ========== SALE BANNER TAB ========== */}
            {activeTab === "sale" && (
              <div>
                <h2 className="text-lg font-semibold text-brand-burgundy mb-4">Sale Banner</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField label="Badge" value={settings.sale?.badge} onChange={e => updateSetting("sale.badge", e.target.value)} />
                  <InputField label="Heading" value={settings.sale?.heading} onChange={e => updateSetting("sale.heading", e.target.value)} />
                  <InputField label="Heading Accent" value={settings.sale?.headingAccent} onChange={e => updateSetting("sale.headingAccent", e.target.value)} />
                  <InputField label="Description" value={settings.sale?.description} onChange={e => updateSetting("sale.description", e.target.value)} />
                  <InputField label="CTA Text" value={settings.sale?.ctaText} onChange={e => updateSetting("sale.ctaText", e.target.value)} />
                  <InputField label="CTA Link" value={settings.sale?.ctaLink} onChange={e => updateSetting("sale.ctaLink", e.target.value)} />
                  <div className="md:col-span-2">
                    <ImageUpload
                      label="Sale Banner Image"
                      value={settings.sale?.image}
                      onChange={url => updateSetting("sale.image", url)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.sale?.enabled || false}
                      onChange={e => updateSetting("sale.enabled", e.target.checked)}
                      className="w-4 h-4 accent-brand-burgundy"
                    />
                    <label className="text-sm text-brand-wine-dark">Enabled</label>
                  </div>
                </div>
                <div className="mt-6">
                  <button
                    onClick={handleSettingsSave}
                    disabled={saving}
                    className="px-6 py-2.5 bg-brand-burgundy text-brand-cream text-xs font-semibold tracking-wider uppercase hover:bg-brand-wine-dark transition-colors disabled:opacity-50 shadow-sm rounded-full"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            )}

            {/* ========== STORY SECTION TAB ========== */}
            {activeTab === "story" && (
              <div>
                <h2 className="text-lg font-semibold text-brand-burgundy mb-4">Story Section</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField label="Tagline" value={settings.story?.tagline} onChange={e => updateSetting("story.tagline", e.target.value)} />
                  <InputField label="Heading" value={settings.story?.heading} onChange={e => updateSetting("story.heading", e.target.value)} />
                  <div className="md:col-span-2">
                    <InputField label="Description" value={settings.story?.description} onChange={e => updateSetting("story.description", e.target.value)} multiline rows={4} />
                  </div>
                  <InputField label="CTA Text" value={settings.story?.ctaText} onChange={e => updateSetting("story.ctaText", e.target.value)} />
                  <InputField label="CTA Link" value={settings.story?.ctaLink} onChange={e => updateSetting("story.ctaLink", e.target.value)} />
                  <div className="md:col-span-2">
                    <ImageUpload
                      label="Story Image"
                      value={settings.story?.image}
                      onChange={url => updateSetting("story.image", url)}
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <button
                    onClick={handleSettingsSave}
                    disabled={saving}
                    className="px-6 py-2.5 bg-brand-burgundy text-brand-cream text-xs font-semibold tracking-wider uppercase hover:bg-brand-wine-dark transition-colors disabled:opacity-50 shadow-sm rounded-full"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            )}

            {/* ========== NEWSLETTER TAB ========== */}
            {activeTab === "newsletter" && (
              <div>
                <h2 className="text-lg font-semibold text-brand-burgundy mb-4">Newsletter</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField label="Tagline" value={settings.newsletter?.tagline} onChange={e => updateSetting("newsletter.tagline", e.target.value)} />
                  <InputField label="Heading" value={settings.newsletter?.heading} onChange={e => updateSetting("newsletter.heading", e.target.value)} />
                  <div className="md:col-span-2">
                    <InputField label="Description" value={settings.newsletter?.description} onChange={e => updateSetting("newsletter.description", e.target.value)} multiline rows={3} />
                  </div>
                  <InputField label="Button Text" value={settings.newsletter?.buttonText} onChange={e => updateSetting("newsletter.buttonText", e.target.value)} />
                  <InputField label="Success Message" value={settings.newsletter?.successMessage} onChange={e => updateSetting("newsletter.successMessage", e.target.value)} />
                </div>
                <div className="mt-6">
                  <button
                    onClick={handleSettingsSave}
                    disabled={saving}
                    className="px-6 py-2.5 bg-brand-burgundy text-brand-cream text-xs font-semibold tracking-wider uppercase hover:bg-brand-wine-dark transition-colors disabled:opacity-50 shadow-sm rounded-full"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            )}

            {/* ========== CONTACT TAB ========== */}
            {activeTab === "contact" && (
              <div>
                <h2 className="text-lg font-semibold text-brand-burgundy mb-4">Contact</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField label="Heading" value={settings.contact?.heading} onChange={e => updateSetting("contact.heading", e.target.value)} />
                  <InputField label="Subheading" value={settings.contact?.subheading} onChange={e => updateSetting("contact.subheading", e.target.value)} />
                  <InputField label="Phone" value={settings.contact?.phone} onChange={e => updateSetting("contact.phone", e.target.value)} />
                  <InputField label="Email" value={settings.contact?.email} onChange={e => updateSetting("contact.email", e.target.value)} />
                  <InputField label="Address" value={settings.contact?.address} onChange={e => updateSetting("contact.address", e.target.value)} multiline rows={2} />
                  <InputField label="WhatsApp" value={settings.contact?.whatsapp} onChange={e => updateSetting("contact.whatsapp", e.target.value)} />
                </div>

                {/* FAQ Section */}
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-brand-burgundy">FAQs ({(settings.contact?.faqs || []).length})</h3>
                    <button
                      onClick={() => {
                        const faqs = [...(settings.contact?.faqs || []), { q: "", a: "" }];
                        updateSetting("contact.faqs", faqs);
                      }}
                      className="px-4 py-1.5 bg-brand-burgundy text-brand-cream text-xs font-semibold tracking-wider uppercase rounded-full hover:bg-brand-wine-dark transition-colors"
                    >
                      Add FAQ
                    </button>
                  </div>
                  <div className="space-y-4">
                    {(settings.contact?.faqs || []).map((faq, idx) => (
                      <div key={idx} className="bg-brand-cream/50 border border-brand-border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-semibold text-brand-wine-dark/50">FAQ #{idx + 1}</span>
                          <button
                            onClick={() => {
                              const faqs = (settings.contact?.faqs || []).filter((_, i) => i !== idx);
                              updateSetting("contact.faqs", faqs);
                            }}
                            className="text-xs text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                        <InputField
                          label="Question"
                          value={faq.q}
                          onChange={e => {
                            const faqs = [...(settings.contact?.faqs || [])];
                            faqs[idx] = { ...faqs[idx], q: e.target.value };
                            updateSetting("contact.faqs", faqs);
                          }}
                        />
                        <div className="mt-3">
                          <InputField
                            label="Answer"
                            value={faq.a}
                            onChange={e => {
                              const faqs = [...(settings.contact?.faqs || [])];
                              faqs[idx] = { ...faqs[idx], a: e.target.value };
                              updateSetting("contact.faqs", faqs);
                            }}
                            multiline
                            rows={2}
                          />
                        </div>
                      </div>
                    ))}
                    {(!settings.contact?.faqs || settings.contact.faqs.length === 0) && (
                      <p className="text-sm text-brand-wine-dark/40 text-center py-4">No FAQs yet. Click "Add FAQ" to create one.</p>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={handleSettingsSave}
                    disabled={saving}
                    className="px-6 py-2.5 bg-brand-burgundy text-brand-cream text-xs font-semibold tracking-wider uppercase hover:bg-brand-wine-dark transition-colors disabled:opacity-50 shadow-sm rounded-full"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            )}

            {/* ========== FOOTER TAB ========== */}
            {activeTab === "footer" && (
              <div>
                <h2 className="text-lg font-semibold text-brand-burgundy mb-4">Footer</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <InputField label="Description" value={settings.footer?.description} onChange={e => updateSetting("footer.description", e.target.value)} multiline rows={3} />
                  </div>
                  <InputField label="Instagram URL" value={settings.footer?.instagram} onChange={e => updateSetting("footer.instagram", e.target.value)} />
                  <InputField label="TikTok URL" value={settings.footer?.tiktok} onChange={e => updateSetting("footer.tiktok", e.target.value)} />
                  <div className="md:col-span-2">
                    <InputField label="Copyright Text" value={settings.footer?.copyrightText} onChange={e => updateSetting("footer.copyrightText", e.target.value)} />
                  </div>
                </div>
                <div className="mt-6">
                  <button
                    onClick={handleSettingsSave}
                    disabled={saving}
                    className="px-6 py-2.5 bg-brand-burgundy text-brand-cream text-xs font-semibold tracking-wider uppercase hover:bg-brand-wine-dark transition-colors disabled:opacity-50 shadow-sm rounded-full"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
