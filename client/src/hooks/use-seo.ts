import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { 
  getSEOData, 
  detectPageFromRoute, 
  seoConfig, 
  isIndexablePage,
  type SEOData 
} from '@shared/seo-config';
import {
  updateTitle,
  updateMetaTag,
  updateCanonicalUrl,
  getFullCanonicalUrl,
  injectGoogleAnalytics,
  injectFacebookPixel,
  injectGoogleTagManager,
  fireCustomEvent
} from '@/utils/meta-helpers';

interface UseSEOOptions {
  pageKey?: string;
  dynamicData?: any;
  forceUpdate?: boolean;
}

export function useSEO(options: UseSEOOptions = {}) {
  const [location] = useLocation();
  const { pageKey, dynamicData, forceUpdate = false } = options;

  // Fetch platform settings for dynamic platform name
  const { data: settings } = useQuery<{ platformName?: string }>({
    queryKey: ['/api/settings/public'],
    enabled: true
  });

  useEffect(() => {
    // Determine the page key
    const detectedPageKey = pageKey || detectPageFromRoute(location);
    
    // Get SEO data for this page
    let seoData: SEOData | null = null;
    
    if (detectedPageKey === 'blogPost' && dynamicData) {
      // Dynamic blog post data
      seoData = getSEOData('blogPost', dynamicData);
    } else if (detectedPageKey && detectedPageKey !== 'unknown') {
      // Static page data
      seoData = getSEOData(detectedPageKey);
    }

    // Apply SEO data or default to noindex
    if (seoData) {
      applySEOData(seoData, location, settings?.platformName || 'OutMarkly');
    } else {
      // Default for unknown pages: noindex
      applyDefaultNoIndex(settings?.platformName || 'OutMarkly');
    }

    // Inject tracking scripts only for indexable pages
    if (seoData && !seoData.excludeTracking && isIndexablePage(detectedPageKey)) {
      injectTrackingScripts();
      
      // Fire custom events
      if (seoData.customEvents) {
        seoData.customEvents.forEach(eventData => {
          setTimeout(() => fireCustomEvent(eventData), 100);
        });
      }
    }
  }, [location, pageKey, dynamicData, forceUpdate, settings?.platformName]);
}

function applySEOData(seoData: SEOData, currentPath: string, platformName: string) {
  // Update title with dynamic platform name
  const dynamicTitle = seoData.title.replace(/OutMarkly/g, platformName);
  updateTitle(dynamicTitle);
  
  // Update basic meta tags with dynamic platform name
  const dynamicDescription = seoData.description.replace(/OutMarkly/g, platformName);
  updateMetaTag('description', dynamicDescription);
  updateMetaTag('robots', seoData.robots);
  
  // Add Google Site Verification (appears on ALL pages)
  updateMetaTag('google-site-verification', seoConfig.global.googleSiteVerification);
  
  if (seoData.keywords) {
    updateMetaTag('keywords', seoData.keywords);
  }
  
  // Update canonical URL
  if (seoData.canonical) {
    const fullCanonicalUrl = getFullCanonicalUrl(seoData.canonical);
    updateCanonicalUrl(fullCanonicalUrl);
  } else if (seoData.robots.includes('index')) {
    // Auto-generate canonical for indexable pages
    const fullCanonicalUrl = getFullCanonicalUrl(currentPath);
    updateCanonicalUrl(fullCanonicalUrl);
  }
  
  // Update Open Graph tags
  if (seoData.openGraph) {
    const dynamicOGTitle = seoData.openGraph.title.replace(/OutMarkly/g, platformName);
    const dynamicOGDescription = seoData.openGraph.description.replace(/OutMarkly/g, platformName);
    updateMetaTag('og:title', dynamicOGTitle);
    updateMetaTag('og:description', dynamicOGDescription);
    updateMetaTag('og:type', seoData.openGraph.type || 'website');
    updateMetaTag('og:site_name', platformName);
    
    if (seoData.openGraph.image) {
      updateMetaTag('og:image', seoData.openGraph.image);
    } else {
      // Use default fallback image from index.html
      updateMetaTag('og:image', '/og-image.svg');
    }
    
    updateMetaTag('og:image:width', '1200');
    updateMetaTag('og:image:height', '630');
    
    // Update URL for Open Graph
    const fullUrl = getFullCanonicalUrl(currentPath);
    updateMetaTag('og:url', fullUrl);
  }
  
  // Update Twitter Card tags
  if (seoData.twitter) {
    const dynamicTwitterTitle = seoData.twitter.title.replace(/OutMarkly/g, platformName);
    const dynamicTwitterDescription = seoData.twitter.description.replace(/OutMarkly/g, platformName);
    updateMetaTag('twitter:card', seoData.twitter.card);
    updateMetaTag('twitter:title', dynamicTwitterTitle);
    updateMetaTag('twitter:description', dynamicTwitterDescription);
    
    if (seoData.twitter.image) {
      updateMetaTag('twitter:image', seoData.twitter.image);
    } else {
      // Use default fallback image
      updateMetaTag('twitter:image', '/og-image.svg');
    }
  }
}

function applyDefaultNoIndex(platformName: string) {
  // Default SEO for unknown/private pages
  updateTitle(`Page - ${platformName}`);
  updateMetaTag('description', `${platformName} platform page`);
  updateMetaTag('robots', 'noindex,follow');
  
  // Add Google Site Verification (appears on ALL pages)
  updateMetaTag('google-site-verification', seoConfig.global.googleSiteVerification);
  
  // Basic Open Graph for social sharing even on private pages
  updateMetaTag('og:site_name', platformName);
  updateMetaTag('og:image', '/og-image.png');
  updateMetaTag('og:image:width', '1200');
  updateMetaTag('og:image:height', '630');
}

function injectTrackingScripts() {
  const { globalScripts } = seoConfig;
  
  // Google Analytics
  if (globalScripts.googleAnalytics?.enabled && globalScripts.googleAnalytics.trackingId) {
    injectGoogleAnalytics(globalScripts.googleAnalytics.trackingId);
  }
  
  // Facebook Pixel  
  if (globalScripts.facebookPixel?.enabled && globalScripts.facebookPixel.pixelId) {
    injectFacebookPixel(globalScripts.facebookPixel.pixelId);
  }
  
  // Google Tag Manager
  if (globalScripts.googleTagManager?.enabled && globalScripts.googleTagManager.containerId) {
    injectGoogleTagManager(globalScripts.googleTagManager.containerId);
  }
}

// Convenience hooks for specific page types
export function useSEOPage(pageKey: string) {
  return useSEO({ pageKey });
}

export function useSEOBlogPost(post: { title: string; excerpt?: string; content?: string; category?: string; author?: string; featuredImage?: string }) {
  return useSEO({ pageKey: 'blogPost', dynamicData: post });
}

export function useSEOWithData(pageKey: string, data: any) {
  return useSEO({ pageKey, dynamicData: data });
}

// Hook for auto-detection (no parameters needed)
export function useSEOAuto() {
  return useSEO({});
}