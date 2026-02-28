/**
 * Chunk Load Error Handler
 * 
 * After a new deploy, old cached index.html may reference JS/CSS files
 * that no longer exist (because Vite generates new content hashes).
 * This causes ChunkLoadError / failed imports → infinite reload loops.
 * 
 * This handler detects such errors and does a SINGLE hard refresh
 * (using sessionStorage to prevent infinite loops).
 */

const RELOAD_KEY = 'chunk-error-reload';
const RELOAD_EXPIRY_MS = 10_000; // 10 seconds window to prevent rapid reloads

function shouldReload() {
  const lastReload = sessionStorage.getItem(RELOAD_KEY);
  if (!lastReload) return true;

  const elapsed = Date.now() - parseInt(lastReload, 10);
  // Only allow one reload within the expiry window
  return elapsed > RELOAD_EXPIRY_MS;
}

function forceReload() {
  sessionStorage.setItem(RELOAD_KEY, Date.now().toString());
  // true = reload from server, not from cache
  window.location.reload();
}

function isChunkError(error) {
  const message = error?.message || '';
  return (
    message.includes('Failed to fetch dynamically imported module') ||
    message.includes('ChunkLoadError') ||
    message.includes('Loading chunk') ||
    message.includes('Loading CSS chunk') ||
    message.includes('error loading dynamically imported module') ||
    // Vite-specific: module script failed
    (error?.type === 'error' && error?.target?.tagName === 'SCRIPT')
  );
}

export function initChunkErrorHandler() {
  // Catch unhandled promise rejections (dynamic imports)
  window.addEventListener('unhandledrejection', (event) => {
    if (isChunkError(event.reason) && shouldReload()) {
      event.preventDefault();
      console.warn('[ChunkErrorHandler] Detected stale chunk, reloading...');
      forceReload();
    }
  });

  // Catch script/link load errors (static imports in index.html)
  window.addEventListener('error', (event) => {
    const target = event.target;
    if (
      (target?.tagName === 'SCRIPT' || target?.tagName === 'LINK') &&
      shouldReload()
    ) {
      console.warn('[ChunkErrorHandler] Detected failed resource load, reloading...');
      forceReload();
    }
  }, true); // Use capture phase to catch resource load errors

  // Clear the reload flag after successful page load
  window.addEventListener('load', () => {
    // If the page loaded successfully, clear the flag after a delay
    setTimeout(() => {
      sessionStorage.removeItem(RELOAD_KEY);
    }, 2000);
  });
}
