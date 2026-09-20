import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, fetchProducts, createProduct, updateProduct, deleteProduct, uploadImage } from "../lib/api";
import AdminHeader from "../components/AdminHeader";

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "", price: "", category: "bangles", description: "", mainImage: "", thumbnails: "",
  });
  const [mainImageFile, setMainImageFile] = useState(null);
  const [thumbnailFiles, setThumbnailFiles] = useState([]);

  useEffect(() => { checkUser(); }, []);

  const checkUser = async () => {
    try {
      const userData = await getCurrentUser();
      if (userData.error || !userData._id) { navigate("/admin/login"); return; }
      setUser(userData);
      await loadProducts();
    } catch { navigate("/admin/login"); }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileUpload = async (file) => {
    if (!file) return null;
    setUploading(true);
    try {
      const result = await uploadImage(file);
      return result.url;
    } catch (err) {
      alert("Upload error: " + err.message);
      return null;
    } finally { setUploading(false); }
  };

  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMainImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, mainImage: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const handleThumbnailChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) { alert("Maximum 5 images"); return; }
    const readers = files.map(file => new Promise(resolve => {
      const reader = new FileReader();
      reader.onloadend = () => resolve({ file, preview: URL.createObjectURL(file), dataUrl: reader.result });
      reader.readAsDataURL(file);
    }));
    Promise.all(readers).then(results => {
      setThumbnailFiles(prev => [...prev, ...results].slice(0, 5));
      results.forEach(r => {
        setFormData(prev => ({ ...prev, thumbnails: [...(prev.thumbnails || []), r.dataUrl] }));
      });
    });
  };

  const removeThumbnail = (index) => {
    setThumbnailFiles(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      thumbnails: (prev.thumbnails || []).filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    let mainImageUrl = formData.mainImage;
    let thumbnailUrls = [];

    if (mainImageFile && mainImageFile instanceof File) {
      const uploadedUrl = await handleFileUpload(mainImageFile);
      if (!uploadedUrl) { setLoading(false); return; }
      mainImageUrl = uploadedUrl;
    }
    if (!mainImageUrl) { alert("Please select a main image"); setLoading(false); return; }

    let existingThumbnails = [];
    if (formData.thumbnails && Array.isArray(formData.thumbnails)) {
      existingThumbnails = formData.thumbnails.filter(t => typeof t === 'string' && t.startsWith('http'));
    }
    for (const thumb of thumbnailFiles) {
      if (thumb.file && thumb.file instanceof File) {
        const url = await handleFileUpload(thumb.file);
        if (url) thumbnailUrls.push(url);
      }
    }
    thumbnailUrls = [...existingThumbnails, ...thumbnailUrls];

    const productData = {
      name: formData.name, price: parseInt(formData.price), category: formData.category,
      description: formData.description, mainImage: mainImageUrl, thumbnails: thumbnailUrls,
    };

    try {
      if (editingProduct) {
        const result = await updateProduct(editingProduct.id, productData);
        if (result.error) throw new Error(result.error);
      } else {
        const result = await createProduct(productData);
        if (result.error) throw new Error(result.error);
      }
      setFormData({ name: "", price: "", category: "bangles", description: "", mainImage: "", thumbnails: [] });
      setMainImageFile(null); setThumbnailFiles([]); setShowForm(false); setEditingProduct(null);
      await loadProducts();
    } catch (err) { alert("Error: " + err.message); }
    finally { setLoading(false); }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await fetchProducts({ page: 1, limit: 100 });
      const items = Array.isArray(data) ? data : (data?.products || []);
      setProducts(items.map(p => ({ ...p, id: p._id })));
    } catch (err) { console.error("Error:", err); }
    setLoading(false);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name, price: product.price.toString(), category: product.category,
      description: product.description || "", mainImage: product.mainImage || "",
      thumbnails: Array.isArray(product.thumbnails) ? product.thumbnails : [],
    });
    setMainImageFile(null); setThumbnailFiles([]); setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    try {
      const result = await deleteProduct(id);
      if (result.error) alert("Error: " + result.error);
      else await loadProducts();
    } catch (err) { alert("Error: " + err.message); }
  };

  const filteredProducts = products.filter(p => {
    const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = categoryFilter === "all" || p.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const categories = [...new Set(products.map(p => p.category))];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-brand-cream">
      <AdminHeader userEmail={user.email} />

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Actions bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-brand-burgundy">Products</h2>
            <p className="text-sm text-brand-wine-dark/60 mt-1">{products.length} total</p>
          </div>
          <button onClick={() => {
            setShowForm(!showForm); setEditingProduct(null);
            setFormData({ name: "", price: "", category: "bangles", description: "", mainImage: "", thumbnails: [] });
            setMainImageFile(null); setThumbnailFiles([]);
          }}
            className={`px-5 py-2.5 text-xs font-semibold tracking-wider uppercase transition-colors shadow-sm rounded-sm ${showForm ? "bg-brand-blush text-brand-wine-dark border border-brand-border" : "bg-brand-burgundy text-brand-cream hover:bg-brand-wine-dark"}`}>
            {showForm ? "Cancel" : "Add Product"}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white/80 border border-brand-border p-6 mb-8 rounded-lg shadow-sm">
            <h3 className="text-lg font-bold mb-5 text-brand-burgundy">{editingProduct ? "Edit Product" : "New Product"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold tracking-wider uppercase text-brand-wine-dark/70 mb-2">Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-brand-blush/20 border border-brand-border text-brand-wine-dark text-sm focus:outline-none focus:border-brand-gold" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold tracking-wider uppercase text-brand-wine-dark/70 mb-2">Price (Rs.)</label>
                  <input type="number" name="price" value={formData.price} onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-brand-blush/20 border border-brand-border text-brand-wine-dark text-sm focus:outline-none focus:border-brand-gold" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold tracking-wider uppercase text-brand-wine-dark/70 mb-2">Category</label>
                  <select name="category" value={formData.category} onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-brand-blush/20 border border-brand-border text-brand-wine-dark text-sm focus:outline-none">
                    <option value="bangles">Bangles</option>
                    <option value="nails">Nails</option>
                    <option value="abayas">Abayas</option>
                    <option value="necklaces">Necklaces</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold tracking-wider uppercase text-brand-wine-dark/70 mb-2">Main Image</label>
                  <input type="file" accept="image/*" onChange={handleMainImageChange}
                    className="w-full px-4 py-2 bg-brand-blush/20 border border-brand-border text-brand-wine-dark text-sm focus:outline-none" />
                  {formData.mainImage && <img src={formData.mainImage} alt="Preview" className="mt-2 w-20 h-20 object-cover border border-brand-border rounded-sm" />}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-wider uppercase text-brand-wine-dark/70 mb-2">Additional Images (max 5)</label>
                <input type="file" accept="image/*" multiple onChange={handleThumbnailChange}
                  className="w-full px-4 py-2 bg-brand-blush/20 border border-brand-border text-brand-wine-dark text-sm focus:outline-none" />
                {Array.isArray(formData.thumbnails) && formData.thumbnails.filter(t => typeof t === 'string').length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {formData.thumbnails.filter(t => typeof t === 'string').map(url => (
                      <div key={url} className="relative">
                        <img src={url} alt="" className="w-14 h-14 object-cover border border-brand-border" />
                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, thumbnails: prev.thumbnails.filter(t => t !== url) }))}
                          className="absolute -top-1 -right-1 bg-brand-burgundy text-brand-cream w-4 h-4 flex items-center justify-center text-[10px] rounded-full">×</button>
                      </div>
                    ))}
                  </div>
                )}
                {thumbnailFiles.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {thumbnailFiles.map((thumb, idx) => (
                      <div key={thumb.preview} className="relative">
                        <img src={thumb.preview} alt="" className="w-14 h-14 object-cover border border-brand-border" />
                        <button type="button" onClick={() => removeThumbnail(idx)}
                          className="absolute -top-1 -right-1 bg-brand-burgundy text-brand-cream w-4 h-4 flex items-center justify-center text-[10px] rounded-full">×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-wider uppercase text-brand-wine-dark/70 mb-2">Description</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3"
                  className="w-full px-4 py-2.5 bg-brand-blush/20 border border-brand-border text-brand-wine-dark text-sm focus:outline-none focus:border-brand-gold" />
              </div>
              <button type="submit" disabled={loading || uploading}
                className="px-6 py-2.5 bg-brand-burgundy text-brand-cream text-xs font-semibold tracking-wider uppercase hover:bg-brand-wine-dark transition-colors disabled:opacity-50 shadow-sm rounded-sm">
                {loading ? "Saving..." : uploading ? "Uploading..." : editingProduct ? "Update" : "Create"}
              </button>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <input type="text" placeholder="Search products..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-brand-border text-brand-wine-dark placeholder:text-brand-wine-dark/40 text-sm focus:outline-none focus:border-brand-gold" />
          </div>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
            className="px-4 py-2 bg-white border border-brand-border text-brand-wine-dark text-sm focus:outline-none focus:border-brand-gold">
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
        </div>

        {/* Products table */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-6 h-6 border-2 border-brand-border border-t-brand-burgundy rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <div className="bg-white/80 border border-brand-border rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-brand-border bg-brand-blush/20">
                    <th className="text-left p-4 text-xs font-bold tracking-wider uppercase text-brand-wine-dark/70">Product</th>
                    <th className="text-left p-4 text-xs font-bold tracking-wider uppercase text-brand-wine-dark/70 hidden sm:table-cell">Category</th>
                    <th className="text-left p-4 text-xs font-bold tracking-wider uppercase text-brand-wine-dark/70">Price</th>
                    <th className="text-right p-4 text-xs font-bold tracking-wider uppercase text-brand-wine-dark/70">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b border-brand-border/40 hover:bg-brand-blush/20 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {product.mainImage && <img src={product.mainImage} alt="" className="w-10 h-10 object-cover border border-brand-border/60 rounded-sm" />}
                          <span className="font-medium truncate max-w-[200px] text-brand-wine-dark">{product.name}</span>
                        </div>
                      </td>
                      <td className="p-4 hidden sm:table-cell">
                        <span className="text-xs text-brand-wine-dark/70 capitalize">{product.category}</span>
                      </td>
                      <td className="p-4 font-bold text-brand-burgundy">Rs. {product.price.toLocaleString()}</td>
                      <td className="p-4 text-right">
                        <a href={`/product/${product.id}`} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-brand-gold hover:text-brand-burgundy transition-colors mr-3 font-semibold">View</a>
                        <button onClick={() => handleEdit(product)} className="text-xs text-brand-burgundy hover:text-brand-wine-dark transition-colors mr-3 font-semibold">Edit</button>
                        <button onClick={() => handleDelete(product.id)} className="text-xs text-red-600 hover:text-red-800 transition-colors font-semibold">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredProducts.length === 0 && (
              <div className="text-center py-12 text-brand-wine-dark/60 text-sm">
                {searchQuery || categoryFilter !== "all" ? "No products match your filters." : "No products yet."}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
