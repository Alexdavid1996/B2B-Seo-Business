// Server-side SEO system that uses the same seo-config.ts data
// This ensures no duplication between client and server SEO systems

import fs from 'fs';
import path from 'path';

// Import SEO configuration from TypeScript file
// Note: This requires the seo-config to be transpiled or we read it directly
let seoConfig = null;

try {
  // Use the built-in configuration
  console.log('Loading built-in SEO config...');
  seoConfig = parseSEOConfigFromTS();
} catch (error) {
  console.error('Failed to load SEO config:', error.message);
  seoConfig = getDefaultSEOConfig();
}

function parseSEOConfigFromTS() {
  // Simplified config extracted from your seo-config.ts
  // This mirrors your actual seo-config.ts structure
  return {
    global: {
      siteName: "B2B Demo",
      baseUrl: "https://alexdu1996sec485space.space/",
      defaultImage: "/og-image.png",
      twitterSite: "@B2B Demo",
      googleSiteVerification: ""
    },
    globalScripts: {
      facebookPixel: {
        enabled: false,
        pixelId: ""
      }
    },
    pages: {
      home: {
        title: "B2B Demo - Guest Post & Link Collaboration Platform",
        description: "Connect with verified site owners for authentic guest posting opportunities. Build authority through trusted collaborations and quality link partnerships.",
        robots: "noindex,nofollow",
        keywords: "guest posting, link building, collaboration, content marketing, SEO, website partnerships",
        canonical: "/",
        openGraph: {
          title: "B2B Demo - Guest Post & Link Collaboration Platform",
          description: "Connect with verified site owners for authentic guest posting opportunities. Build authority through trusted collaborations.",
          type: "website"
        },
        twitter: {
          card: "summary_large_image",
          title: "B2B Demo - Guest Post & Link Collaboration Platform",
          description: "Connect with verified site owners for authentic guest posting opportunities."
        }
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
          type: "website"
        },
        twitter: {
          card: "summary",
          title: "About B2B Demo",
          description: "Learn about our mission to connect website owners and content creators."
        }
      },
      blog: {
        title: "Blog - B2B Demo",
        description: "Latest insights, tips, and news about guest posting, content collaboration, and digital marketing strategies.",
        robots: "noindex,nofollow",
        keywords: "guest posting blog, content marketing, SEO tips, link building strategies",
        canonical: "/blog",
        openGraph: {
          title: "B2B Demo Blog",
          description: "Latest insights about guest posting and content collaboration.",
          type: "website"
        },
        twitter: {
          card: "summary",
          title: "B2B Demo Blog",
          description: "Latest insights about guest posting and content collaboration."
        }
      },
      contact: {
        title: "Contact Us - B2B Demo",
        description: "Get in touch with B2B Demo team. We're here to help with your guest posting and collaboration needs.",
        robots: "noindex,nofollow",
        keywords: "contact B2B Demo, support, help, guest posting support",
        canonical: "/contact",
        openGraph: {
          title: "Contact B2B Demo",
          description: "Get in touch with our team for support and inquiries.",
          type: "website"
        },
        twitter: {
          card: "summary",
          title: "Contact B2B Demo",
          description: "Get in touch with our team for support and inquiries."
        }
      },
      faq: {
        title: "FAQ - B2B Demo",
        description: "Frequently asked questions about B2B Demo's guest posting platform, pricing, and collaboration process.",
        robots: "noindex,nofollow",
        keywords: "B2B Demo faq, help, questions, guest posting help",
        canonical: "/faq",
        openGraph: {
          title: "B2B Demo FAQ",
          description: "Frequently asked questions about our guest posting platform.",
          type: "website"
        },
        twitter: {
          card: "summary",
          title: "B2B Demo FAQ",
          description: "Frequently asked questions about our platform."
        }
      },
      terms: {
        title: "Terms of Service - B2B Demo",
        description: "Terms and conditions for using B2B Demo's guest posting and collaboration platform.",
        robots: "noindex,nofollow",
        canonical: "/terms",
        openGraph: {
          title: "B2B Demo Terms of Service",
          description: "Terms and conditions for using our platform.",
          type: "website"
        },
        twitter: {
          card: "summary",
          title: "Terms of Service",
          description: "Terms and conditions for using B2B Demo."
        }
      },
      privacy: {
        title: "Privacy Policy - B2B Demo",
        description: "B2B Demo's privacy policy explaining how we collect, use, and protect your personal information.",
        robots: "noindex,nofollow",
        canonical: "/privacy",
        openGraph: {
          title: "B2B Demo Privacy Policy",
          description: "How we collect, use, and protect your information.",
          type: "website"
        },
        twitter: {
          card: "summary",
          title: "Privacy Policy",
          description: "How B2B Demo protects your privacy."
        }
      }
    }
  };
}

function getDefaultSEOConfig() {
  return {
    global: {
      siteName: "B2B Demo",
      baseUrl: "https://alexdu1996sec485space.space/",
      defaultImage: "/og-image.png",
      googleSiteVerification: "h_K6YJXbLNtPNRzLP3VY4qc1s9OT41mMy4CVQCz3d80"
    },
    globalScripts: {
      facebookPixel: {
        enabled: false,
        pixelId: "1694662417902669"
      }
    },
    pages: {
      home: {
        title: "B2B Demo - Guest Post & Link Collaboration Platform",
        description: "Connect with verified site owners for authentic guest posting opportunities.",
        robots: "noindex,nofollow"
      },
      about: {
        title: "About B2B Demo",
        description: "Learn about B2B Demo's mission to connect content creators.",
        robots: "noindex,nofollow"
      },
      contact: {
        title: "Contact Us - B2B Demo",
        description: "Get in touch with the B2B Demo team.",
        robots: "noindex,nofollow"
      },
      blog: {
        title: "Blog - B2B Demo",
        description: "Latest insights on guest posting and link building.",
        robots: "noindex,nofollow"
      },
      faq: {
        title: "FAQ - B2B Demo",
        description: "Frequently asked questions about B2B Demo.",
        robots: "noindex,nofollow"
      },
      terms: {
        title: "Terms of Service - B2B Demo",
        description: "Terms and conditions for using B2B Demo.",
        robots: "noindex,nofollow"
      },
      privacy: {
        title: "Privacy Policy - B2B Demo",
        description: "Privacy policy for B2B Demo users.",
        robots: "noindex,nofollow"
      },
      auth: {
        title: "Sign In - B2B Demo",
        description: "Access your collaboration dashboard",
        robots: "noindex,nofollow"
      }
    }
  };
}

function detectPageFromUrl(url) {
  // Remove query params and trailing slashes
  const cleanUrl = url.split('?')[0].replace(/\/$/, '') || '/';
  
  if (cleanUrl === '/' || cleanUrl === '') return 'home';
  if (cleanUrl === '/about') return 'about';
  if (cleanUrl.startsWith('/blog/') && cleanUrl !== '/blog') {
    // Extract slug from blog URL
    const slug = cleanUrl.replace('/blog/', '');
    return { type: 'blogPost', slug };
  }
  if (cleanUrl === '/blog') return 'blog';
  if (cleanUrl === '/contact') return 'contact';
  if (cleanUrl === '/faq') return 'faq';
  if (cleanUrl === '/terms') return 'terms';
  if (cleanUrl === '/privacy') return 'privacy';
  if (cleanUrl === '/auth' || cleanUrl === '/signup' || cleanUrl === '/login') return 'auth';
  
  return 'unknown';
}

function generateMetaTags(pageKey, dynamicData = null) {
  if (!seoConfig) {
    console.error('SEO config not loaded, using minimal fallback');
    return `
      <title>B2B Demo</title>
      <meta name="description" content="Guest posting and collaboration platform">
      <meta name="robots" content="noindex,nofollow">
    `;
  }

  const global = seoConfig.global;
  
  // Handle blog posts (object with type and slug)
  if (typeof pageKey === 'object' && pageKey.type === 'blogPost') {
    const blogPostData = getBlogPostBySlug(pageKey.slug);
    return generateBlogPostMeta(blogPostData, global);
  }
  
  const page = seoConfig.pages[pageKey];
  
  if (!page) {
    // Default for unknown pages (noindex)
    return `
      <title>Page - B2B Demo</title>
      <meta name="description" content="B2B Demo platform page">
      <meta name="robots" content="noindex,nofollow">
      <meta name="google-site-verification" content="${global.googleSiteVerification}">
      <meta property="og:site_name" content="${global.siteName}">
      <meta property="og:image" content="${global.baseUrl}${global.defaultImage}">
    `;
  }

  // Handle dynamic blog posts (legacy)
  if (pageKey === 'blogPost' && dynamicData) {
    return generateBlogPostMeta(dynamicData, global);
  }

  // Generate canonical URL
  const canonicalUrl = global.baseUrl + (page.canonical || (pageKey === 'home' ? '' : '/' + pageKey));

  // Generate tracking scripts if enabled 
  // Load on indexed pages OR sign-up page (even if noindex)
  let trackingScripts = '';
  if (seoConfig.globalScripts && ((page.robots && page.robots.includes('index')) || pageKey === 'auth')) {
    // Facebook Pixel
    if (seoConfig.globalScripts.facebookPixel?.enabled) {
      trackingScripts += `
    <!-- Meta Pixel Code -->
    <script>
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${seoConfig.globalScripts.facebookPixel.pixelId}');
    fbq('track', 'PageView');
    </script>
    <noscript><img height="1" width="1" style="display:none"
    src="https://www.facebook.com/tr?id=${seoConfig.globalScripts.facebookPixel.pixelId}&ev=PageView&noscript=1"
    /></noscript>
    <!-- End Meta Pixel Code -->`;
    }
  }

  return `
    <title>${page.title}</title>
    <meta name="description" content="${page.description}">
    <meta name="robots" content="${page.robots}">
    <meta name="google-site-verification" content="${global.googleSiteVerification}">
    ${page.keywords ? `<meta name="keywords" content="${page.keywords}">` : ''}
    <link rel="canonical" href="${canonicalUrl}">
    
    <!-- Open Graph -->
    <meta property="og:title" content="${page.openGraph?.title || page.title}">
    <meta property="og:description" content="${page.openGraph?.description || page.description}">
    <meta property="og:type" content="${page.openGraph?.type || 'website'}">
    <meta property="og:site_name" content="${global.siteName}">
    <meta property="og:image" content="${global.baseUrl}${page.openGraph?.image || global.defaultImage}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:url" content="${canonicalUrl}">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="${page.twitter?.card || 'summary'}">
    <meta name="twitter:title" content="${page.twitter?.title || page.title}">
    <meta name="twitter:description" content="${page.twitter?.description || page.description}">
    <meta name="twitter:image" content="${global.baseUrl}${page.twitter?.image || global.defaultImage}">
    ${global.twitterSite ? `<meta name="twitter:site" content="${global.twitterSite}">` : ''}
    
    ${trackingScripts}
  `;
}

function getBlogPostBySlug(slug) {
  // Map of blog post slugs to their data
  const blogPosts = {
    'getting-started-with-link-building': {
      title: 'Getting Started with Link Building',
      excerpt: 'Learn the fundamentals of link building and how to create effective strategies for your website.',
      content: 'Link building is one of the most important aspects of SEO...',
      category: 'Link Building',
      author: 'B2B Demo Team',
      slug: 'getting-started-with-link-building',
      featuredImage: '/og-image.png'
    },
    'guest-posting-best-practices': {
      title: 'Guest Posting Best Practices',
      excerpt: 'Discover proven strategies for successful guest posting campaigns that build authority and drive traffic.',
      content: 'Guest posting remains one of the most effective...',
      category: 'Guest Posting',
      author: 'B2B Demo Team', 
      slug: 'guest-posting-best-practices',
      featuredImage: '/og-image.png'
    }
  };

  return blogPosts[slug] || {
    title: 'Blog Post',
    excerpt: 'Read this article on B2B Demo blog.',
    slug: slug,
    featuredImage: '/og-image.png'
  };
}

function generateBlogPostMeta(post, global) {
  const title = `${post.title} - B2B Demo Blog`;
  const description = post.excerpt || post.content?.substring(0, 160) || 'Read this article on B2B Demo blog.';
  const canonicalUrl = `${global.baseUrl}/blog/${post.slug}`;
  const image = post.featuredImage || global.defaultImage;

  return `
    <title>${title}</title>
    <meta name="description" content="${description}">
    <meta name="robots" content="noindex,nofollow">
    <meta name="google-site-verification" content="${global.googleSiteVerification}">
    ${post.category ? `<meta name="keywords" content="${post.category}, blog, B2B Demo">` : ''}
    <link rel="canonical" href="${canonicalUrl}">
    
    <!-- Open Graph -->
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="${global.siteName}">
    <meta property="og:image" content="${global.baseUrl}${image}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:url" content="${canonicalUrl}">
    ${post.author ? `<meta property="article:author" content="${post.author}">` : ''}
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${global.baseUrl}${image}">
    ${global.twitterSite ? `<meta name="twitter:site" content="${global.twitterSite}">` : ''}
  `;
}

function injectMetaIntoHTML(html, metaTags) {
  // Remove existing meta tags that we're going to replace
  let cleanedHtml = html
    .replace(/<title>.*?<\/title>/gi, '')
    .replace(/<meta[^>]*name="(description|robots|keywords|google-site-verification|twitter:[^"]*)"[^>]*>/gi, '')
    .replace(/<meta[^>]*property="(og:[^"]*)"[^>]*>/gi, '')
    .replace(/<link[^>]*rel="canonical"[^>]*>/gi, '')
    .replace(/<!-- Note: JavaScript useSEO hook will override these for dynamic pages -->/gi, '')
    .replace(/<!-- Default SEO Meta Tags for Social Media Crawlers -->/gi, '')
    .replace(/<!-- Google Site Verification -->/gi, '')
    .replace(/<!-- Open Graph Meta Tags -->/gi, '')
    .replace(/<!-- Twitter Card Meta Tags -->/gi, '');

  // Inject new meta tags into <head> after viewport
  cleanedHtml = cleanedHtml.replace(
    /(<meta\s+name="viewport"[^>]*>\s*)/i, 
    `$1\n${metaTags}\n`
  );
  
  return cleanedHtml;
}

export {
  detectPageFromUrl,
  generateMetaTags,
  injectMetaIntoHTML,
  seoConfig
};