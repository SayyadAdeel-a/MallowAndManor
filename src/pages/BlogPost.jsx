import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchPostBySlug } from "../lib/api";
import { marked } from "marked";

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchPostBySlug(slug)
      .then(data => setPost(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  const renderedContent = useMemo(() => {
    if (!post?.content) return '';
    return marked(post.content, { breaks: true });
  }, [post?.content]);

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <div className="w-6 h-6 border-2 border-brand-border border-t-brand-burgundy rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-32 text-center">
        <h1 className="text-2xl font-bold mb-2 text-brand-burgundy">Post not found</h1>
        <p className="text-brand-wine-dark/60 text-sm mb-6">This story may have been removed.</p>
        <Link to="/blog" className="text-sm font-medium text-brand-burgundy underline hover:text-brand-gold transition-colors">Back to Journal</Link>
      </div>
    );
  }

  return (
    <article className="max-w-3xl mx-auto px-6 lg:px-8 py-16">
      <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-brand-wine-dark/60 hover:text-brand-burgundy mb-8 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Journal
      </Link>

      {post.featuredImage && (
        <div className="aspect-[16/9] overflow-hidden mb-8 bg-brand-cream border border-brand-border shadow-sm">
          <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}

      {(post.tags || []).length > 0 && (
        <div className="flex gap-3 mb-4">
          {post.tags.map(tag => (
            <span key={tag} className="text-[10px] font-semibold tracking-wider uppercase text-brand-rose bg-brand-blush px-3 py-1 rounded-full">{tag}</span>
          ))}
        </div>
      )}

      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 leading-tight text-brand-burgundy">{post.title}</h1>

      <div className="flex items-center gap-3 text-sm text-brand-wine-dark/50 mb-8">
        {post.author && <span>{post.author}</span>}
        {post.author && " · "}
        <span>{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
      </div>

      {post.excerpt && (
        <p className="text-lg text-brand-wine-dark/80 italic mb-8 leading-relaxed border-l-2 border-brand-gold pl-4">{post.excerpt}</p>
      )}

      <div className="blog-content text-brand-wine-dark" dangerouslySetInnerHTML={{ __html: renderedContent }} />
    </article>
  );
}
