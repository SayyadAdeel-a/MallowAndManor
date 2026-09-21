import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, fetchAdminPosts, createPost, updatePost, deletePost, uploadImage, resolveUploadUrl } from "../lib/api";
import AdminHeader from "../components/AdminHeader";

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function AdminPosts() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const navigate = useNavigate();

  const [uploadingImg, setUploadingImg] = useState(false);
  const [uploadingFeatured, setUploadingFeatured] = useState(false);

  const [form, setForm] = useState({
    title: '', slug: '', content: '', excerpt: '', author: '',
    published: false, tags: '', featuredImage: '', seoTitle: '', seoDescription: '',
  });

  const contentRef = useRef(null);

  const handleFeaturedUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingFeatured(true);
    try {
      const url = resolveUploadUrl(await uploadImage(file));
      setForm({ ...form, featuredImage: url });
    } catch (err) {
      alert('Upload error: ' + err.message);
    }
    setUploadingFeatured(false);
  };

  const insertContentImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImg(true);
    try {
      const url = resolveUploadUrl(await uploadImage(file));
      const imgMd = `![image](${url})`;
      const textarea = contentRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const before = form.content.substring(0, start);
        const after = form.content.substring(end);
        setForm({ ...form, content: before + imgMd + after });
        requestAnimationFrame(() => {
          textarea.selectionStart = textarea.selectionEnd = start + imgMd.length;
          textarea.focus();
        });
      } else {
        setForm({ ...form, content: form.content + '\n' + imgMd });
      }
    } catch (err) {
      alert('Upload error: ' + err.message);
    }
    setUploadingImg(false);
  };

  useEffect(() => {
    getCurrentUser().then(u => {
      if (u.error || !u._id) { navigate('/admin/login'); return; }
      setUser(u);
      loadPosts();
    }).catch(() => navigate('/admin/login'));
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminPosts();
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); setPosts([]); }
    setLoading(false);
  };

  const resetForm = () => {
    setForm({ title: '', slug: '', content: '', excerpt: '', author: '', published: false, tags: '', featuredImage: '', seoTitle: '', seoDescription: '' });
    setEditing(null);
  };

  const handleEdit = (post) => {
    setForm({
      title: post.title, slug: post.slug, content: post.content || '', excerpt: post.excerpt || '',
      author: post.author || '', published: post.published || false,
      tags: (post.tags || []).join(', '), featuredImage: post.featuredImage || '',
      seoTitle: post.seoTitle || '', seoDescription: post.seoDescription || '',
    });
    setEditing(post); setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
    try {
      if (editing) await updatePost(editing._id, payload);
      else await createPost(payload);
      resetForm(); setShowForm(false); await loadPosts();
    } catch (err) { alert('Error: ' + err.message); }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this post?')) return;
    try { await deletePost(id); await loadPosts(); } catch (err) { alert('Error: ' + err.message); }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-brand-cream">
      <AdminHeader userEmail={user.email} />

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-brand-burgundy">Blog Posts</h2>
            <p className="text-sm text-brand-wine-dark/60 mt-1">{posts.length} total</p>
          </div>
          <button onClick={() => { resetForm(); setShowForm(!showForm); }}
            className={`px-5 py-2.5 text-xs font-semibold tracking-wider uppercase transition-colors shadow-sm rounded-sm ${showForm ? "bg-brand-blush text-brand-wine-dark border border-brand-border" : "bg-brand-burgundy text-brand-cream hover:bg-brand-wine-dark"}`}>
            {showForm ? "Cancel" : "New Post"}
          </button>
        </div>

        {showForm && (
          <div className="bg-white/80 border border-brand-border p-6 mb-8 rounded-lg shadow-sm">
            <h3 className="text-lg font-bold mb-5 text-brand-burgundy">{editing ? "Edit Post" : "New Post"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold tracking-wider uppercase text-brand-wine-dark/70 mb-2">Title</label>
                  <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value, slug: editing ? form.slug : slugify(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-brand-blush/20 border border-brand-border text-brand-wine-dark text-sm focus:outline-none focus:border-brand-gold" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold tracking-wider uppercase text-brand-wine-dark/70 mb-2">Slug</label>
                  <input type="text" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })}
                    className="w-full px-4 py-2.5 bg-brand-blush/20 border border-brand-border text-brand-wine-dark text-sm focus:outline-none focus:border-brand-gold" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold tracking-wider uppercase text-brand-wine-dark/70 mb-2">Author</label>
                  <input type="text" value={form.author} onChange={e => setForm({ ...form, author: e.target.value })}
                    className="w-full px-4 py-2.5 bg-brand-blush/20 border border-brand-border text-brand-wine-dark text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold tracking-wider uppercase text-brand-wine-dark/70 mb-2">Featured Image</label>
                  <div className="flex gap-2">
                    <input type="text" value={form.featuredImage} onChange={e => setForm({ ...form, featuredImage: e.target.value })}
                      className="flex-1 px-4 py-2.5 bg-brand-blush/20 border border-brand-border text-brand-wine-dark text-sm focus:outline-none focus:border-brand-gold" placeholder="Paste URL or upload" />
                    <label className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors rounded-sm ${uploadingFeatured ? 'bg-brand-blush text-brand-wine-dark/40' : 'bg-brand-blush text-brand-wine-dark hover:bg-brand-border'}`}>
                      {uploadingFeatured ? 'Uploading...' : 'Upload'}
                      <input type="file" accept="image/*" onChange={handleFeaturedUpload} className="hidden" disabled={uploadingFeatured} />
                    </label>
                  </div>
                  {form.featuredImage && <img src={form.featuredImage} alt="" className="mt-2 w-20 h-14 object-cover border border-brand-border rounded-sm" />}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold tracking-wider uppercase text-brand-wine-dark/70 mb-2">Tags (comma separated)</label>
                  <input type="text" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })}
                    className="w-full px-4 py-2.5 bg-brand-blush/20 border border-brand-border text-brand-wine-dark text-sm focus:outline-none" placeholder="style, trends, bangles" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold tracking-wider uppercase text-brand-wine-dark/70 mb-2">Excerpt</label>
                  <textarea value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} rows="2"
                    className="w-full px-4 py-2.5 bg-brand-blush/20 border border-brand-border text-brand-wine-dark text-sm focus:outline-none" />
                </div>
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold tracking-wider uppercase text-brand-wine-dark/70">Content</label>
                    <label className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold tracking-wider uppercase cursor-pointer transition-colors rounded-sm ${uploadingImg ? 'bg-brand-blush text-brand-wine-dark/40' : 'bg-brand-blush/60 text-brand-burgundy hover:bg-brand-blush border border-brand-border/60'}`}>
                      {uploadingImg ? 'Uploading...' : '+ Insert Image'}
                      <input type="file" accept="image/*" onChange={insertContentImage} className="hidden" disabled={uploadingImg} />
                    </label>
                  </div>
                  <textarea ref={contentRef} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows="10"
                    className="w-full px-4 py-2.5 bg-brand-blush/20 border border-brand-border text-brand-wine-dark text-sm focus:outline-none font-mono" />
                </div>
              </div>
              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.published} onChange={e => setForm({ ...form, published: e.target.checked })}
                    className="w-4 h-4 rounded border-brand-border text-brand-burgundy focus:ring-brand-gold" />
                  <span className="text-sm text-brand-wine-dark font-medium">Published</span>
                </label>
                <button type="submit" disabled={loading}
                  className="px-6 py-2.5 bg-brand-burgundy text-brand-cream text-xs font-semibold tracking-wider uppercase hover:bg-brand-wine-dark transition-colors disabled:opacity-50 ml-auto shadow-sm rounded-sm">
                  {loading ? "Saving..." : editing ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        )}

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
                    <th className="text-left p-4 text-xs font-bold tracking-wider uppercase text-brand-wine-dark/70">Title</th>
                    <th className="text-left p-4 text-xs font-bold tracking-wider uppercase text-brand-wine-dark/70 hidden sm:table-cell">Status</th>
                    <th className="text-left p-4 text-xs font-bold tracking-wider uppercase text-brand-wine-dark/70 hidden md:table-cell">Date</th>
                    <th className="text-right p-4 text-xs font-bold tracking-wider uppercase text-brand-wine-dark/70">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map(post => (
                    <tr key={post._id} className="border-b border-brand-border/40 hover:bg-brand-blush/20 transition-colors">
                      <td className="p-4 font-medium truncate max-w-[200px] text-brand-wine-dark">{post.title}</td>
                      <td className="p-4 hidden sm:table-cell">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${post.published ? 'bg-green-100 text-green-700' : 'bg-brand-blush text-brand-wine-dark/60'}`}>
                          {post.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="p-4 text-brand-wine-dark/60 text-xs hidden md:table-cell">{new Date(post.createdAt).toLocaleDateString()}</td>
                      <td className="p-4 text-right">
                        <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer"
                          className={`text-xs font-semibold mr-3 transition-colors ${post.published ? 'text-brand-gold hover:text-brand-burgundy' : 'text-brand-wine-dark/30 pointer-events-none'}`}>
                          View
                        </a>
                        <button onClick={() => handleEdit(post)} className="text-xs text-brand-burgundy hover:text-brand-wine-dark transition-colors mr-3 font-semibold">Edit</button>
                        <button onClick={() => handleDelete(post._id)} className="text-xs text-red-600 hover:text-red-800 transition-colors font-semibold">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {posts.length === 0 && <div className="text-center py-12 text-brand-wine-dark/60 text-sm">No posts yet.</div>}
          </div>
        )}
      </main>
    </div>
  );
}
