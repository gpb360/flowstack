/**
 * Analytics tracking library
 * Supports Google Analytics, Mixpanel, and PostHog
 */

export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
}

// Analytics providers configuration
const ANALYTICS_CONFIG = {
  googleAnalyticsId: import.meta.env.VITE_GA_MEASUREMENT_ID,
  mixpanelToken: import.meta.env.VITE_MIXPANEL_TOKEN,
  posthogKey: import.meta.env.VITE_POSTHOG_KEY,
  posthogHost: import.meta.env.VITE_POSTHOG_HOST,
};

/**
 * Initialize analytics providers
 */
export const initAnalytics = (): void => {
  // Google Analytics
  if (ANALYTICS_CONFIG.googleAnalyticsId) {
    // Load gtag script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_CONFIG.googleAnalyticsId}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer! = window.dataLayer! || [];
    window.gtag = function gtag() {
      window.dataLayer!.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', ANALYTICS_CONFIG.googleAnalyticsId);
  }

  // PostHog
  if (ANALYTICS_CONFIG.posthogKey) {
    // Load PostHog script
    const script = document.createElement('script');
    script.innerHTML = `
      !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures onSessionId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
      posthog.init('${ANALYTICS_CONFIG.posthogKey}',{api_host:'${ANALYTICS_CONFIG.posthogHost || 'https://app.posthog.com'}'})
    `;
    document.head.appendChild(script);
  }

  // Mixpanel
  if (ANALYTICS_CONFIG.mixpanelToken) {
    // Load Mixpanel script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js`;
    document.head.appendChild(script);

    script.onload = () => {
      if (window.mixpanel) {
        window.mixpanel.init(ANALYTICS_CONFIG.mixpanelToken);
      }
    };
  }
};

/**
 * Track a page view
 */
export const trackPageView = (path: string, title?: string): void => {
  // Google Analytics
  if (window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: title,
    });
  }

  // PostHog
  if (window.posthog) {
    window.posthog.capture('$pageview', {
      $current_url: window.location.href,
    });
  }

  // Mixpanel
  if (window.mixpanel) {
    window.mixpanel.track('Page View', {
      path,
      title,
    });
  }
};

/**
 * Track a custom event
 */
export const trackEvent = ({ event, properties = {} }: AnalyticsEvent): void => {
  // Google Analytics
  if (window.gtag) {
    window.gtag('event', event, properties);
  }

  // PostHog
  if (window.posthog) {
    window.posthog.capture(event, properties);
  }

  // Mixpanel
  if (window.mixpanel) {
    window.mixpanel.track(event, properties);
  }
};

/**
 * Track CTA clicks
 */
export const trackCTAClick = (ctaType: string, location: string): void => {
  trackEvent({
    event: 'cta_clicked',
    properties: {
      cta_type: ctaType,
      location,
    },
  });
};

/**
 * Track video modal opens
 */
export const trackVideoModalOpen = (): void => {
  trackEvent({
    event: 'demo_video_opened',
    properties: {
      source: 'landing_page',
    },
  });
};

/**
 * Track pricing tier selection
 */
export const trackPricingClick = (tier: string, price: number | null): void => {
  trackEvent({
    event: 'pricing_tier_clicked',
    properties: {
      tier,
      price,
    },
  });
};

/**
 * Track newsletter signup
 */
export const trackNewsletterSignup = (email: string): void => {
  trackEvent({
    event: 'newsletter_signup',
    properties: {
      email_domain: email.split('@')[1],
    },
  });
};

/**
 * Track scroll depth
 */
export const trackScrollDepth = (depth: number, maxDepth: number): void => {
  trackEvent({
    event: 'scroll_depth',
    properties: {
      depth_percent: Math.round((depth / maxDepth) * 100),
    },
  });
};

/**
 * Initialize scroll depth tracking
 */
export const initScrollTracking = (): void => {
  const depths = [25, 50, 75, 100];
  const tracked = new Set<number>();

  const handleScroll = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;

    depths.forEach((depth) => {
      if (scrollPercent >= depth && !tracked.has(depth)) {
        tracked.add(depth);
        trackScrollDepth(scrollTop, docHeight);
      }
    });
  };

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        handleScroll();
        ticking = false;
      });
      ticking = true;
    }
  });
};

// Type declarations for window objects
declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
    posthog?: any;
    mixpanel?: any;
  }
}

export default {
  initAnalytics,
  trackPageView,
  trackEvent,
  trackCTAClick,
  trackVideoModalOpen,
  trackPricingClick,
  trackNewsletterSignup,
  initScrollTracking,
};
