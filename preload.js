const { contextBridge, ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', () => {
  // Push content down
  const bodyStyle = document.createElement('style');
  bodyStyle.textContent = `
    body {
      margin-top: 32px !important;
    }
  `;
  document.head.appendChild(bodyStyle);


  // Create the drag region (always present, fully transparent)
  const dragRegion = document.createElement('div');
  Object.assign(dragRegion.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    height: '32px',
    webkitAppRegion: 'drag',
    zIndex: '2147483647',
    pointerEvents: 'auto', // Changed to auto to detect mouse events
  });


  // Create the visual indicator (shows on hover)
  const visualIndicator = document.createElement('div');
  Object.assign(visualIndicator.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    height: '32px',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    opacity: '0',
    zIndex: '2147483646',
    pointerEvents: 'none', // Let all events pass through
    transition: 'opacity 200ms ease-out 100ms', // 200ms fade-out, delayed by 50ms
  });

  // --- Global mouse tracking logic (from preload.mockfix.js) ---
  let trackingTimeoutId = null;
  let isInDragRegion = false;
  let windowBounds = null;
  let isWindowFocused = document.hasFocus();
  const TRACKING_INTERVAL = 100; // Mouse position check interval

  // Helper to update window bounds (for multi-display/resize support)
  const updateWindowBounds = async () => {
    windowBounds = await ipcRenderer.invoke('get-window-bounds');
  };

  // Check if mouse is in drag region
  const checkMouseInDragRegion = async (x, y) => {
    if (!windowBounds) return false;
    const withinX = x >= windowBounds.x && x <= windowBounds.x + windowBounds.width;
    const withinY = y >= windowBounds.y && y <= windowBounds.y + 32; // 32px drag region
    return withinX && withinY;
  };

  const startTracking = () => {
    const track = async () => {
      try {
        const globalPos = await ipcRenderer.invoke('get-cursor-position');
        const inRegion = await checkMouseInDragRegion(globalPos.x, globalPos.y);
        isInDragRegion = inRegion;
        if (inRegion) {
          visualIndicator.style.transition = 'none'; 
          visualIndicator.style.opacity = '1';
        } else {
          visualIndicator.style.transition = 'opacity 200ms ease-out 100ms'; 
          visualIndicator.style.opacity = '0';
        }
      } catch (error) {
        // Ignore errors, keep tracking
      }
      trackingTimeoutId = setTimeout(track, TRACKING_INTERVAL);
    };
    if (!trackingTimeoutId) track();
  };

  const stopTracking = () => {
    if (trackingTimeoutId) {
      clearTimeout(trackingTimeoutId);
      trackingTimeoutId = null;
    }
  };


  // Keep windowBounds up-to-date after move/resize
  ipcRenderer.on('window-moved-or-resized', () => {
    updateWindowBounds();
    // Only start tracking if window is focused
    if (isWindowFocused) {
      startTracking();
    }
  });

  // Event listeners to control tracking
  window.addEventListener('mouseenter', () => {
    updateWindowBounds();
    startTracking();
  });

  window.addEventListener('mouseleave', () => {
    stopTracking();
    isInDragRegion = false;
    visualIndicator.style.opacity = '0';
  });

  window.addEventListener('focus', () => {
    isWindowFocused = true;
    updateWindowBounds();
    startTracking();
  });

  window.addEventListener('blur', () => {
    isWindowFocused = false;
    stopTracking();
    isInDragRegion = false;
    visualIndicator.style.opacity = '0';
  });

  // Insert elements when body is ready
  const insertElements = () => {
    if (document.body) {
      document.body.insertBefore(visualIndicator, document.body.firstChild);
      document.body.insertBefore(dragRegion, document.body.firstChild);
      return true;
    }
    return false;
  };

  // Try to insert immediately or wait for body
  if (!insertElements()) {
    const observer = new MutationObserver(() => {
      if (insertElements()) {
        observer.disconnect();
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }
});
