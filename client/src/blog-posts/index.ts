// Blog posts index - exports all blog posts for easy importing
// This file will be automatically updated when new blog posts are added

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  tags: string[];
  component: React.ComponentType;
}

// Import your blog post components here
import GettingStartedWithLinkBuilding from "./getting-started-with-link-building";

// Export all blog posts here
export const blogPosts: BlogPost[] = [

];

// Helper function to get a blog post by slug
export const getBlogPostBySlug = (slug: string): BlogPost | undefined => {
  return blogPosts.find((post) => post.slug === slug);
};

// Helper function to get all blog post slugs
export const getAllBlogSlugs = (): string[] => {
  return blogPosts.map((post) => post.slug);
};
