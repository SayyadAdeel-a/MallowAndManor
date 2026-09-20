import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchPosts } from "../lib/api";

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPosts = () => {
    setLoading(true);
    setError(null);
    fetchPosts()
      .then(data => setPosts(data || []))
      .catch((err) => {
        console.error(err);
        setError("Failed to load posts");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPosts();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16">
      <div className="mb-12">
        <span className="text-xs font-bold tracking-[0.3em] uppercase text-brand-gold mb-4 block">Journal</span>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-brand-burgundy">Stories & Inspiration</h1>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[16/9] bg-brand-blush/40 rounded mb-4" />
              <div className="h-3 bg-brand-blush/40 rounded w-1/4 mb-3" />
              <div className="h-4 bg-brand-blush/40 rounded w-3/4 mb-2" />
              <div className="h-3 bg-brand-blush/40 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <svg className="w-12 h-12 mx-auto mb-4 text-brand-wine-dark/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-brand-wine-dark/60 text-sm mb-4">{error}</p>
          <button
            onClick={loadPosts}
            className="px-6 py-2 text-sm font-medium text-brand-burgundy border border-brand-border hover:border-brand-gold hover:text-brand-gold transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20">
          <svg className="w-12 h-12 mx-auto mb-4 text-brand-wine-dark/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
          <p className="text-brand-wine-dark/60 text-sm">No posts yet. Check back soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map(post => (
            <Link key={post._id} to={`/blog/${post.slug}`} className="group">
              {post.featuredImage && (
                <div className="aspect-[16/9] overflow-hidden mb-4 bg-brand-cream border border-brand-border">
                  <img src={post.featuredImage} alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              )}
              <div className="flex gap-2 mb-3">
                {(post.tags || []).slice(0, 2).map(tag => (
                  <span key={tag} className="text-[10px] font-semibold tracking-wider uppercase text-brand-rose bg-brand-blush px-2.5 py-0.5 rounded-full">{tag}</span>
                ))}
              </div>
              <h2 className="text-lg font-semibold mb-2 text-brand-burgundy group-hover:text-brand-gold transition-colors">{post.title}</h2>
              {post.excerpt && <p className="text-sm text-brand-wine-dark/70 line-clamp-2 mb-3">{post.excerpt}</p>}
              <div className="text-xs text-brand-wine-dark/50">
                {post.author && <span>{post.author}</span>}
                {post.author && " · "}
                <span>{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
