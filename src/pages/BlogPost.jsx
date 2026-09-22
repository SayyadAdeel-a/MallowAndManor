import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchPostBySlug } from "../lib/api";
import DOMPurify from "dompurify";
import AnimatedIcon, { ICONS } from "../components/AnimatedIcon";
import { setMeta, articleSchema } from "../lib/seo";

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!post) return;
    setMeta({
      title: post.title,
      description: post.excerpt || post.seoDescription || (post.content || "").slice(0, 150),
      path: `/blog/${post.slug}`,
      image: post.featuredImage,
      type: "article",
      jsonLd: articleSchema({ post }),
    });
  }, [post]);

  useEffect(() => {
    setLoading(true);
    fetchPostBySlug(slug)
      .then(data => setPost(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  const renderedContent = useMemo(() => {
    if (!post?.content) return '';
    return DOMPurify.sanitize(post.content);
  }, [post]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 lg:px-8 py-16">
        <div className="animate-pulse">
          <div className="h-3 bg-brand-blush/40 rounded w-1/4 mb-8" />
          <div className="aspect-[16/9] bg-brand-blush/40 rounded mb-8" />
          <div className="h-4 bg-brand-blush/40 rounded w-1/3 mb-4" />
          <div className="h-8 bg-brand-blush/40 rounded w-3/4 mb-4" />
          <div className="space-y-3">
            <div className="h-3 bg-brand-blush/40 rounded w-full" />
            <div className="h-3 bg-brand-blush/40 rounded w-5/6" />
            <div className="h-3 bg-brand-blush/40 rounded w-4/6" />
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-32 text-center">
        <AnimatedIcon
          path={ICONS.document}
          animation="float"
          className="w-16 h-16 mx-auto mb-4 text-brand-wine-dark/20"
          strokeWidth={1.5}
        />
        <h1 className="text-2xl font-bold mb-2 text-brand-burgundy">Post not found</h1>
        <p className="text-brand-wine-dark/60 text-sm mb-6">This story may have been removed or is no longer available.</p>
        <Link to="/blog" className="inline-block px-6 py-2 text-sm font-medium text-brand-burgundy border border-brand-border hover:border-brand-gold hover:text-brand-gold transition-colors rounded-full">
          Back to Journal
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-3xl mx-auto px-6 lg:px-8 py-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-brand-dark/50 mb-8">
        <a href="/" className="hover:text-brand-burgundy transition-colors">Home</a>
        <span>/</span>
        <Link to="/blog" className="hover:text-brand-burgundy transition-colors">Journal</Link>
        <span>/</span>
        <span className="text-brand-burgundy truncate max-w-[300px]">{post.title}</span>
      </nav>

      {post.featuredImage && (
        <div className="aspect-[16/9] overflow-hidden mb-8 bg-brand-cream border border-brand-border shadow-sm">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
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
