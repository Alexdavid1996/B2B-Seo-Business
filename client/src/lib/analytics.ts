// Define the gtag function globally
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// Initialize Google Analytics
export const initGA = () => {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

  if (!measurementId) {
    console.warn('Missing required Google Analytics key: VITE_GA_MEASUREMENT_ID');
    return;
  }

  // Add Google Analytics script to the head
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script1);

  // Initialize gtag
  const script2 = document.createElement('script');
  script2.textContent = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${measurementId}');
  `;
  document.head.appendChild(script2);

  // Debug mode in development
  if (import.meta.env.DEV) {
    console.log('Google Analytics initialized in debug mode');
  }
};

// Track page views - useful for single-page applications
export const trackPageView = (url: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (!measurementId) return;
  
  window.gtag('config', measurementId, {
    page_path: url
  });

  if (import.meta.env.DEV) {
    console.log(`Analytics: Page view tracked for ${url}`);
  }
};

// Track events
export const trackEvent = (
  action: string, 
  category?: string, 
  label?: string, 
  value?: number
) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });

  if (import.meta.env.DEV) {
    console.log(`Analytics: Event tracked - ${action}`, { category, label, value });
  }
};

// Track custom events with additional parameters
export const trackCustomEvent = (eventName: string, parameters: Record<string, any>) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', eventName, parameters);

  if (import.meta.env.DEV) {
    console.log(`Analytics: Custom event tracked - ${eventName}`, parameters);
  }
};

// Business-specific tracking functions
export const trackBusinessEvent = {
  // User registration
  signUp: (method: string = 'email') => {
    trackEvent('sign_up', 'conversion', method);
  },

  // Premium subscription
  purchase: (planType: string, value: number) => {
    trackCustomEvent('purchase', {
      currency: 'USD',
      value: value,
      items: [{
        item_id: planType,
        item_name: `${planType} Plan`,
        item_category: 'subscription',
        price: value,
        quantity: 1
      }]
    });
  },

  // Collaboration events
  collaborationStart: (type: 'link_exchange' | 'guest_post') => {
    trackEvent('collaboration_start', 'engagement', type);
  },

  // Content engagement
  blogEngagement: (articleTitle: string, category: string) => {
    trackCustomEvent('blog_engagement', {
      content_group1: 'Blog',
      content_group2: category,
      article_title: articleTitle
    });
  },

  // Lead generation
  leadGeneration: (source: string, value: number = 50) => {
    trackCustomEvent('generate_lead', {
      currency: 'USD',
      value: value,
      source: source
    });
  },

  // Form submissions
  formSubmit: (formType: string) => {
    trackEvent('form_submit', 'lead_generation', formType);
  },

  // External link clicks
  externalClick: (url: string, linkText: string) => {
    trackEvent('click', 'external_link', linkText, 1);
  }
};