export interface SEOData {
  title: string;
  description: string;
  robots: string;
  keywords?: string;
  canonical?: string;
  openGraph?: {
    title: string;
    description: string;
    image?: string;
    type?: string;
  };
  twitter?: {
    card: string;
    title: string;
    description: string;
    image?: string;
  };
  customEvents?: Array<{
    type: 'gtag' | 'fbq' | 'custom';
    event: string;
    params?: any;
  }>;
  excludeTracking?: boolean;
}

export interface SEOConfig {
  global: {
    siteName: string;
    defaultTitle: string;
    defaultDescription: string;
    defaultImage: string;
    siteUrl: string;
    locale: string;
    twitterSite: string;
    googleSiteVerification: string; // Google Search Console verification meta tag
  };
  globalScripts: {
    googleAnalytics?: {
      enabled: boolean;
      trackingId: string;
    };
    facebookPixel?: {
      enabled: boolean;
      pixelId: string;
    };
    googleTagManager?: {
      enabled: boolean;
      containerId: string;
    };
  };
  pages: Record<string, SEOData>;
  generators: {
    blogPost: (post: { title: string; excerpt?: string; content?: string; category?: string; author?: string; featuredImage?: string }) => SEOData;
    userProfile: (user: { username: string; isPublic: boolean }) => SEOData;
  };
}

export const seoConfig: SEOConfig = {
  // Global site settings
  global: {
    siteName: "B2B Demo",
    defaultTitle: "B2B Demo - Guest Post & Link Collaboration Platform", 
    defaultDescription: "Connect with verified site owners for authentic guest posting opportunities. Build authority through trusted collaborations.",
    defaultImage: "/og-image.png",
    siteUrl: "", // To be configured with actual domain
    locale: "en_US",
    twitterSite: "@B2B Demo", // To be configured
    googleSiteVerification: "", // Google Search Console verification
  },

  // Global tracking scripts (only applied to indexed pages)
  globalScripts: {
    googleAnalytics: {
      enabled: false, // Will be enabled when user provides tracking ID
      trackingId: "", // To be configured
    },
    facebookPixel: {
      enabled: true, // Facebook Pixel enabled
      pixelId: "", // Your Meta Pixel ID
    },
    googleTagManager: {
      enabled: false, // Will be enabled when user provides container ID
      containerId: "", // To be configured
    },
  },

  // Static page configurations - ONLY THESE PAGES WILL BE INDEXED
  pages: {
    // === INDEXABLE PAGES ONLY ===
    // Only pages listed here will be indexed, everything else gets noindex by default
    
    home: {
      title: "B2B Demo - Guest Post & Link Collaboration Platform",
      description: "Connect with verified site owners for authentic guest posting opportunities. Build authority through trusted collaborations and quality link partnerships.",
      robots: "noindex,nofollow",
      keywords: "guest posting, link building, collaboration, content marketing, SEO, website partnerships",
      canonical: "/",
      openGraph: {
        title: "B2B Demo - Guest Post & Link Collaboration Platform",
        description: "Connect with verified site owners for authentic guest posting opportunities. Build authority through trusted collaborations.",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: "B2B Demo - Guest Post & Link Collaboration Platform",
        description: "Connect with verified site owners for authentic guest posting opportunities.",
      },
      customEvents: [
        { type: 'gtag', event: 'page_view', params: { page_title: 'Homepage', content_group1: 'Public' } },
      ],
    },

    about: {
      title: "About Us - B2B Demo",
      description: "Learn about B2B Demo's mission to connect website owners, content creators, and marketers for authentic collaboration opportunities.",
      robots: "noindex,nofollow",
      keywords: "about B2B Demo, company mission, team, guest posting platform",
      canonical: "/about",
      openGraph: {
        title: "About B2B Demo",
        description: "Learn about our mission to connect website owners and content creators.",
        type: "website",
      },
      twitter: {
        card: "summary",
        title: "About B2B Demo",
        description: "Learn about our mission to connect website owners and content creators.",
      },
      customEvents: [
        { type: 'gtag', event: 'page_view', params: { content_group1: 'About' } },
      ],
    },

    blog: {
      title: "Blog - B2B Demo",
      description: "Latest insights on guest posting, link building, content marketing, and collaboration strategies. Expert tips for growing your online presence.",
      robots: "noindex,nofollow",
      keywords: "guest posting tips, link building strategies, content marketing, SEO blog",
      canonical: "/blog",
      openGraph: {
        title: "B2B Demo Blog",
        description: "Latest insights on guest posting and content collaboration strategies.",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: "B2B Demo Blog",
        description: "Latest insights on guest posting and content collaboration strategies.",
      },
      customEvents: [
        { type: 'gtag', event: 'page_view', params: { content_group1: 'Blog', content_group2: 'Blog Listing' } },
      ],
    },

    faq: {
      title: "FAQ - B2B Demo",
      description: "Frequently asked questions about guest posting, link collaboration, and using the B2B Demo platform effectively.",
      robots: "noindex,nofollow",
      keywords: "guest posting FAQ, link building questions, B2B Demo help",
      canonical: "/faq",
      openGraph: {
        title: "FAQ - B2B Demo",
        description: "Frequently asked questions about guest posting and collaboration.",
        type: "website",
      },
      twitter: {
        card: "summary",
        title: "FAQ - B2B Demo",
        description: "Frequently asked questions about our platform.",
      },
      customEvents: [
        { type: 'gtag', event: 'page_view', params: { content_group1: 'FAQ' } },
      ],
    },

    contact: {
      title: "Contact Us - B2B Demo",
      description: "Get in touch with the B2B Demo team. We're here to help with your guest posting and collaboration needs.",
      robots: "noindex,nofollow",
      keywords: "contact B2B Demo, customer support, help, guest posting support",
      canonical: "/contact",
      openGraph: {
        title: "Contact B2B Demo",
        description: "Get in touch with our team for guest posting and collaboration support.",
        type: "website",
      },
      twitter: {
        card: "summary",
        title: "Contact B2B Demo",
        description: "Get in touch with our team for support.",
      },
      customEvents: [
        { type: 'gtag', event: 'page_view', params: { content_group1: 'Contact' } },
      ],
    },

    terms: {
      title: "Terms of Service - B2B Demo",
      description: "Terms and conditions for using the B2B Demo guest posting and link collaboration platform.",
      robots: "noindex,nofollow",
      keywords: "B2B Demo terms, terms of service, legal",
      canonical: "/terms",
      openGraph: {
        title: "Terms of Service - B2B Demo",
        description: "Terms and conditions for using the B2B Demo platform.",
        type: "website",
      },
      customEvents: [
        { type: 'gtag', event: 'page_view', params: { content_group1: 'Legal' } },
      ],
    },

    privacy: {
      title: "Privacy Policy - B2B Demo",
      description: "Privacy policy and data protection information for B2B Demo users and website visitors.",
      robots: "noindex,nofollow",
      keywords: "B2B Demo privacy, privacy policy, data protection",
      canonical: "/privacy",
      openGraph: {
        title: "Privacy Policy - B2B Demo",
        description: "Privacy policy and data protection information for B2B Demo users.",
        type: "website",
      },
      customEvents: [
        { type: 'gtag', event: 'page_view', params: { content_group1: 'Legal' } },
      ],
    },

    // === ALL OTHER PAGES GET NOINDEX BY DEFAULT ===
    // These are defined for completeness but are noindex
    auth: {
      title: "Sign In - B2B Demo",
      description: "Access your collaboration dashboard",
      robots: "noindex,nofollow",
      excludeTracking: true,
    },

    dashboard: {
      title: "Dashboard - B2B Demo", 
      description: "Manage your collaborations and account",
      robots: "noindex,nofollow",
      excludeTracking: true,
    },

    profile: {
      title: "Profile Settings - B2B Demo",
      description: "Manage your profile and account settings", 
      robots: "noindex,nofollow",
      excludeTracking: true,
    },

    messages: {
      title: "Messages - B2B Demo",
      description: "View and manage your collaboration messages",
      robots: "noindex,nofollow",
      excludeTracking: true,
    },

    admin: {
      title: "Admin Panel - B2B Demo",
      description: "Administrative dashboard",
      robots: "noindex,nofollow", 
      excludeTracking: true,
    },

    directory: {
      title: "Website Directory - B2B Demo",
      description: "Browse websites",
      robots: "noindex,nofollow", // Removed from indexable list as requested
      excludeTracking: true,
    },

    support: {
      title: "Support - B2B Demo",
      description: "Get help with your account",
      robots: "noindex,nofollow", // Removed from indexable list as requested
      excludeTracking: true,
    },

    // Dashboard subsections for better SEO
    'dashboard-sites': {
      title: "My Sites - B2B Demo",
      description: "Manage your registered websites",
      robots: "noindex,nofollow",
      excludeTracking: true,
    },

    'dashboard-wallet': {
      title: "Wallet - B2B Demo",
      description: "Manage your account balance and transactions",
      robots: "noindex,nofollow",
      excludeTracking: true,
    },

    'dashboard-orders': {
      title: "Orders & Requests - B2B Demo",
      description: "View and manage your collaboration orders",
      robots: "noindex,nofollow",
      excludeTracking: true,
    },
  },

  // Dynamic page generators
  generators: {
    // AUTO-INDEXING: All blog posts in blog-posts folder get indexed automatically
    blogPost: (post) => {
      // Generate SEO-friendly slug from title
      const slug = post.title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .trim();

      // Auto-generate description from title if no content provided
      const autoDescription = post.excerpt || 
                             (post.content ? post.content.substring(0, 160) + "..." : 
                             `Read "${post.title}" on the B2B Demo blog. Expert insights on guest posting and content collaboration.`);

      return {
        title: `${post.title} - B2B Demo Blog`,
        description: autoDescription,
        robots: "noindex,nofollow", // ALL blog posts are indexed automatically
        keywords: `${post.title}, guest posting, content marketing, ${post.category || 'SEO'}, B2B Demo blog`,
        canonical: `/blog/${slug}`,
        openGraph: {
          title: post.title,
          description: autoDescription,
          image: post.featuredImage || "/images/blog-default.jpg", // Default blog image
          type: "article",
        },
        twitter: {
          card: "summary_large_image",
          title: post.title,
          description: autoDescription,
          image: post.featuredImage || "/images/blog-default.jpg",
        },
        customEvents: [
          { 
            type: 'gtag', 
            event: 'page_view', 
            params: { 
              content_group1: 'Blog',
              content_group2: post.category || 'General',
              custom_map: { dimension1: post.author || 'B2B Demo Team' }
            }
          },
          {
            type: 'gtag',
            event: 'article_view',
            params: {
              article_title: post.title,
              article_category: post.category || 'General',
              article_author: post.author || 'B2B Demo Team'
            }
          },
          {
            type: 'fbq',
            event: 'track',
            params: ['ViewContent', { 
              content_name: post.title,
              content_category: 'Blog Article'
            }]
          }
        ],
      };
    },

    // User profiles - NOT indexed by default (private data)
    userProfile: (user) => ({
      title: `${user.username} - B2B Demo Profile`,
      description: `User profile page`,
      robots: "noindex,nofollow", // User profiles are private by default
      excludeTracking: true, // No tracking on user profiles for privacy
    }),
  },
};

// Helper function to get SEO data for a page
export function getSEOData(pageKey: string, dynamicData?: any): SEOData | null {
  // Check if it's a static page
  if (seoConfig.pages[pageKey]) {
    return seoConfig.pages[pageKey];
  }
  
  // Check if it's a dynamic page with generator
  if (seoConfig.generators[pageKey as keyof typeof seoConfig.generators] && dynamicData) {
    return seoConfig.generators[pageKey as keyof typeof seoConfig.generators](dynamicData);
  }
  
  // Return null if no configuration found (will default to noindex)
  return null;
}

// Helper function to detect page key from route
export function detectPageFromRoute(pathname: string): string {
  // INDEXABLE ROUTES (only these get indexed)
  if (pathname === '/') return 'home';
  if (pathname === '/about') return 'about';
  if (pathname === '/blog') return 'blog';
  if (pathname === '/faq') return 'faq';
  if (pathname === '/contact') return 'contact';
  if (pathname === '/terms') return 'terms';
  if (pathname === '/privacy') return 'privacy';
  
  // BLOG POSTS (auto-indexed from blog-posts folder)
  if (pathname.startsWith('/blog/') && pathname !== '/blog') return 'blogPost';
  
  // PRIVATE ROUTES (noindex)
  if (pathname === '/auth') return 'auth';
  if (pathname.startsWith('/dashboard')) return 'dashboard';
  if (pathname.startsWith('/profile')) return 'profile';
  if (pathname.startsWith('/messages')) return 'messages';
  if (pathname.startsWith('/admin')) return 'admin';
  if (pathname === '/directory') return 'directory';
  if (pathname === '/support') return 'support';
  
  // DEFAULT: Any route not explicitly listed gets noindex
  return 'unknown';
}

// Helper function to check if a page should be indexed
export function isIndexablePage(pageKey: string): boolean {
  const indexablePages = ['home', 'about', 'blog', 'faq', 'contact', 'terms', 'privacy', 'blogPost'];
  return indexablePages.includes(pageKey);
}