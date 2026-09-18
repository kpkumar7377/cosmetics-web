// Thin wrapper around Meta Pixel's global fbq(). Every call is a no-op if
// NEXT_PUBLIC_META_PIXEL_ID isn't set yet, so this is safe to leave wired
// in before the client hands over their Pixel ID.
export const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export const pageview = () => {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "PageView");
  }
};

export const trackEvent = (name, params = {}) => {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", name, params);
  }
};
