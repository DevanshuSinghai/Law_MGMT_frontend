/**
 * Chunk Load Error Handler
 * 
 * After a new deploy, old cached index.html may reference JS/CSS files
 * that no longer exist (because Vite generates new content hashes).
 * This causes ChunkLoadError / failed imports.
 * 
 * This handler detects such errors and does a SINGLE hard refresh
 * per session (using sessionStorage counter to prevent infinite loops).
 */

const RELOAD_KEY = 'chunk-error-reload-count';
const MAX_RELOADS = 1; // Allow at most 1 auto-reload per session

function shouldReload() {
  const count = parseInt(sessionStorage.getItem(RELOAD_KEY) || '0', 10);
  return count < MAX_RELOADS;
}

function forceReload() {
  const count = parseInt(sessionStorage.getItem(RELOAD_KEY) || '0', 10);
  sessionStorage.setItem(RELOAD_KEY, (count + 1).toString());
  // Reload from server, not from cache
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
}
