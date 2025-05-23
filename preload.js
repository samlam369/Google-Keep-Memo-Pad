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
    pointerEvents: 'none', // Let all events pass through
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
  });

  // Track mouse position for the top margin area
  const trackMouse = (e) => {
    if (e.clientY <= 32) {
      visualIndicator.style.opacity = '1';
    } else {
      visualIndicator.style.opacity = '0';
    }
  };

  // Add mouse tracking to window
  window.addEventListener('mousemove', trackMouse);
  // Hide indicator if window loses focus
  window.addEventListener('blur', () => {
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
