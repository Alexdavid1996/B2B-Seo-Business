# Blog Posts System

## Overview
This folder contains individual blog post components for the CollabPro platform blog system.

## Adding New Blog Posts

### 1. Create the Blog Post Component
Create a new `.tsx` file in this folder with your blog post content:

```tsx
// client/src/blog-posts/my-new-post.tsx
export default function MyNewPost() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Post Title</h2>
      <p className="text-lg text-gray-700 leading-relaxed">
        Your blog post content here...
      </p>
      {/* Add more content as needed */}
    </div>
  );
}
```

### 2. Register the Post
Add your post to the `index.ts` file:

1. Import your component:
```tsx
import MyNewPost from './my-new-post';
```

2. Add to the blogPosts array:
```tsx
{
  slug: 'my-new-post',
  title: 'My New Blog Post',
  excerpt: 'A brief description of what this post is about.',
  date: '2025-08-07',
  author: 'Your Name',
  readTime: '5 min read',
  tags: ['Tag1', 'Tag2', 'Tag3'],
  component: MyNewPost,
}
```

### 3. URL Structure
Your post will automatically be available at: `/blog/my-new-post`

## File Naming Convention
- Use kebab-case for file names (lowercase with hyphens)
- Keep names descriptive but concise
- Example: `getting-started-with-seo.tsx`

## Content Guidelines
- Use semantic HTML structure (h2, h3, p, ul, etc.)
- Apply Tailwind CSS classes for styling
- Use the provided space-y-6 container for consistent spacing
- Include code examples in proper code blocks when needed

## Available Styling
The blog system includes Tailwind CSS with typography plugin support:
- `prose` classes for beautiful typography
- Consistent spacing and colors
- Responsive design out of the box