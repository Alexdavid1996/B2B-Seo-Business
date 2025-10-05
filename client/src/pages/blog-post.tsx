import { useRoute } from "wouter";
import { getBlogPostBySlug } from "@/blog-posts";
import BlogPostLayout from "@/components/blog/blog-post-layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, FileText } from "lucide-react";
import { useSEOBlogPost } from "@/hooks/use-seo";

export default function BlogPostPage() {
  // Extract the slug from the URL pattern /blog/:slug
  const [match, params] = useRoute("/blog/:slug");
  
  if (!match || !params?.slug) {
    return <NotFound />;
  }

  const post = getBlogPostBySlug(params.slug);
  
  if (!post) {
    return <PostNotFound slug={params.slug} />;
  }

  // SEO for individual blog post (auto-generated from post data)
  useSEOBlogPost({
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    category: post.category,
    author: post.author,
    featuredImage: post.featuredImage
  });

  const PostComponent = post.component;

  return (
    <BlogPostLayout post={post}>
      <PostComponent />
    </BlogPostLayout>
  );
}

// Component for when URL doesn't match
function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FileText className="h-12 w-12 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
        <Link href="/blog">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Button>
        </Link>
      </div>
    </div>
  );
}

// Component for when blog post doesn't exist
function PostNotFound({ slug }: { slug: string }) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FileText className="h-12 w-12 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Blog Post Not Found</h2>
        <p className="text-gray-600 mb-2">The blog post "{slug}" doesn't exist or has been removed.</p>
        <p className="text-sm text-gray-500 mb-8">Check the URL or browse our available posts.</p>
        <Link href="/blog">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to All Posts
          </Button>
        </Link>
      </div>
    </div>
  );
}