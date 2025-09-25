import createCache from '@emotion/cache';

const isBrowser = typeof document !== 'undefined';

/**
 * Creates and configures an emotion cache for styled-components.
 * This helps prevent style conflicts and ensures proper server-side rendering.
 * 
 * @returns {import('@emotion/cache').EmotionCache} A configured emotion cache instance
 */
export default function createEmotionCache() {
  let insertionPoint: HTMLElement | undefined;

  // On the client side, find the insertion point for styles
  if (isBrowser) {
    const emotionInsertionPoint = document.querySelector<HTMLMetaElement>(
      'meta[name="emotion-insertion-point"]'
    );
    insertionPoint = emotionInsertionPoint ?? undefined;
  }

  // Create and return the cache with the insertion point
  return createCache({
    key: 'css',
    insertionPoint,
    // Only enable speedy in production for better performance
    speedy: process.env.NODE_ENV === 'production',
  });
}
