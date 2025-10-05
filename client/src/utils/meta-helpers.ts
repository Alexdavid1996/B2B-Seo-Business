// Utility functions for managing meta tags in the DOM

export function updateMetaTag(name: string, content: string): void {
  // Handle different meta tag types
  let selector = `meta[name="${name}"]`;
  if (name.startsWith('og:')) {
    selector = `meta[property="${name}"]`;
  } else if (name.startsWith('twitter:')) {
    selector = `meta[name="${name}"]`;
  }

  let tag = document.querySelector(selector) as HTMLMetaElement;
  
  if (tag) {
    // Update existing tag
    if (name.startsWith('og:')) {
      tag.setAttribute('content', content);
    } else {
      tag.setAttribute('content', content);
    }
  } else {
    // Create new tag
    tag = document.createElement('meta');
    if (name.startsWith('og:')) {
      tag.setAttribute('property', name);
    } else {
      tag.setAttribute('name', name);
    }
    tag.setAttribute('content', content);
    document.head.appendChild(tag);
  }
}

export function updateCanonicalUrl(url: string): void {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  
  if (link) {
    link.setAttribute('href', url);
  } else {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', url);
    document.head.appendChild(link);
  }
}

export function removeMetaTag(name: string): void {
  let selector = `meta[name="${name}"]`;
  if (name.startsWith('og:')) {
    selector = `meta[property="${name}"]`;
  }
  
  const tag = document.querySelector(selector);
  if (tag) {
    tag.remove();
  }
}

export function updateTitle(title: string): void {
  document.title = title;
}

export function injectTrackingScript(scriptContent: string, id: string): void {
  // Remove existing script if present
  const existingScript = document.getElementById(id);
  if (existingScript) {
    existingScript.remove();
  }

  // Create and inject new script
  const script = document.createElement('script');
  script.id = id;
  script.innerHTML = scriptContent;
  document.head.appendChild(script);
}

export function injectGoogleAnalytics(trackingId: string): void {
  // Remove existing GA scripts
  const existingGA = document.querySelector(`script[src*="gtag/js"]`);
  const existingGAScript = document.getElementById('google-analytics');
  if (existingGA) existingGA.remove();
  if (existingGAScript) existingGAScript.remove();

  // Inject Google Analytics
  const gaScript = document.createElement('script');
  gaScript.async = true;
  gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
  document.head.appendChild(gaScript);

  const gaConfigScript = document.createElement('script');
  gaConfigScript.id = 'google-analytics';
  gaConfigScript.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${trackingId}');
  `;
  document.head.appendChild(gaConfigScript);
}

export function injectFacebookPixel(pixelId: string): void {
  // Remove existing FB pixel
  const existingFB = document.getElementById('facebook-pixel');
  if (existingFB) existingFB.remove();

  const fbScript = document.createElement('script');
  fbScript.id = 'facebook-pixel';
  fbScript.innerHTML = `
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${pixelId}');
    fbq('track', 'PageView');
  `;
  document.head.appendChild(fbScript);
}

export function injectGoogleTagManager(containerId: string): void {
  // Remove existing GTM
  const existingGTM = document.getElementById('google-tag-manager');
  if (existingGTM) existingGTM.remove();

  const gtmScript = document.createElement('script');
  gtmScript.id = 'google-tag-manager';
  gtmScript.innerHTML = `
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${containerId}');
  `;
  document.head.appendChild(gtmScript);
}

export function fireCustomEvent(eventData: any): void {
  if (eventData.type === 'gtag' && typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventData.event, eventData.params);
  } else if (eventData.type === 'fbq' && typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq(eventData.event, ...eventData.params);
  }
}

// Get current domain for canonical URLs
export function getCurrentDomain(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return '';
}

// Generate full canonical URL
export function getFullCanonicalUrl(path: string): string {
  const domain = getCurrentDomain();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${domain}${cleanPath}`;
}