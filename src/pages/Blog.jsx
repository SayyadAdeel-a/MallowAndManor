import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchPosts } from "../lib/api";

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts()
      .then(data => setPosts(data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16">
      <div className="mb-12">
        <span className="text-xs font-medium tracking-[0.3em] uppercase text-gray-400 mb-4 block">Journal</span>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Stories & Inspiration</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border-2 border-brand-border border-t-brand-gold rounded-full animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-sm">No posts yet. Check back soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map(post => (
            <Link key={post._id} to={`/blog/${post.slug}`} className="group">
              {post.featuredImage && (
                <div className="aspect-[16/9] overflow-hidden mb-4 bg-brand-cream/60 border border-brand-border/60">
                  <img src={post.featuredImage} alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              )}
              <div className="flex gap-2 mb-3">
                {(post.tags || []).slice(0, 2).map(tag => (
                  <span key={tag} className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-brand-blush text-brand-burgundy border border-brand-border/60">{tag}</span>
                ))}
              </div>
              <h2 className="text-lg font-bold mb-2 text-brand-black group-hover:text-brand-burgundy transition-colors">{post.title}</h2>
              {post.excerpt && <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">{post.excerpt}</p>}
              <div className="text-xs text-brand-gold font-medium">
                {post.author && <span className="text-brand-black/70">{post.author}</span>}
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
