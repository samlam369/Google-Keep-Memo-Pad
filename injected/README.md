# Injected Extension Code for Google Keep Memo Pad

This folder contains JavaScript and CSS extracted from the [chrome-google-keep-full-screen](https://github.com/chrisputnam9/chrome-google-keep-full-screen) Chrome extension for use in Google Keep Memo Pad.

- `fullscreen.js`: Main content script to enable full-screen mode for Google Keep Memo Pad.
- `fullscreen.css`: CSS styles for the full-screen mode.

## Updating
To update these files, re-download the latest version from the upstream repository and replace the contents here.

**License:** MIT (see original repo for details)

---

## Upstream Extension Comparison & Maintenance Notes

### Overview
This Electron-injected fullscreen code is adapted from the Chrome extension [chrome-google-keep-full-screen](https://github.com/chrisputnam9/chrome-google-keep-full-screen), but has diverged in several important ways to fit the Electron environment and simplify the user experience.

### Key Technical Adaptations

#### 1. Chrome Extension APIs Removed
- **No `chrome.storage` or `chrome.runtime`:**
  - All code referencing Chrome's extension APIs has been stripped out.
  - Example from upstream:
    ```js
    // Chrome extension version
    const storage = await promise_chrome_storage_sync_get(["settings"]);
    if ("settings" in storage && "fullscreen" in storage.settings) {
      this.fullscreen = storage.settings.fullscreen;
    }
    ```
  - In Electron, we always enable fullscreen mode:
    ```js
    // Electron version
    window.main.fullscreen = true;
    ```
- **No extension messaging:**
  - Listeners such as `chrome.runtime.onMessage.addListener` have been removed.

#### 2. Global Scope and Initialization
- **Global `window.main` object:**
  - Instead of a local `const main`, the object is attached to `window` so it can be invoked from anywhere in the renderer context.
    ```js
    // Electron version
    window.main = { ... };
    ```
- **Initialization:**
  - The Electron version ensures `window.main.init()` is called after `DOMContentLoaded` (or immediately if already loaded):
    ```js
    if (typeof window !== 'undefined') {
      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(() => { if (window.main && typeof window.main.init === 'function') window.main.init(); }, 0);
      } else {
        window.addEventListener('DOMContentLoaded', () => { if (window.main && typeof window.main.init === 'function') window.main.init(); });
      }
    }
    ```
  - This replaces async logic and storage waits in the extension.

#### 3. UI/UX Differences
- **No Fullscreen Button:**
  - The fullscreen toggle button is not injected into the toolbar. Fullscreen is always enabled for open notes.
  - Any code related to button creation, event listeners, and icon injection has been removed.
- **Responsive Toolbar:**
  - Custom CSS hides less important toolbar buttons when the window is very narrow, preventing the Close button from wrapping. This is not present in the original extension.
    ```css
    @media (max-width: 540px) {
      .IZ65Hb-yePe5c .IZ65Hb-INgbqf [role="button"]:not(:last-child):not(:nth-last-child(2)) {
        display: none !important;
      }
    }
    ```

#### 4. Debugging & Logging
- **Debug logs removed:**
  - All `[gkfs]` debug logging has been stripped for production.

#### 5. Options/Settings
- **No options menu:**
  - The Electron version disables or omits any menu items that would open an extension options page.

### Upstream Merge Guidance
- **CSS changes** (fullscreen.css) can usually be merged directly.
- **Fullscreen logic**: Carefully check for Chrome API usage. Remove or adapt any Chrome-specific code.
- **Toolbar/UI button logic**: Omit or patch any logic related to the fullscreen toggle button.
- **Settings/Storage**: Remove all Chrome storage logic. Fullscreen is always enabled.
- **Debug/logging**: Ignore or remove log lines.

### Example: Adapting Upstream Code

**Original (extension):**
```js
chrome.runtime.onMessage.addListener(function (request) {
  if (request.command === "toggle-fullscreen") {
    main.set({ fullscreen: !main.fullscreen });
    if (main.note) main.note.toggle_fullscreen();
  }
});
```

**Electron (removed):**
```js
// No runtime messaging or toggle button; fullscreen is always on for notes.
```

### Summary Table
| Area                     | Upstream Merge Difficulty | Notes                                               |
|--------------------------|--------------------------|-----------------------------------------------------|
| CSS (fullscreen.css)     | Easy                     | Minor or direct merges possible                     |
| Core fullscreen logic    | Moderate                 | Needs review for Chrome API usage                   |
| Toolbar button logic     | Hard                     | Button removed; must skip/patch manually            |
| Settings & storage       | Hard                     | Remove/adapt all Chrome storage logic               |
| Debug/logging            | Easy                     | Just ignore log lines                               |

### Recommendations for Future Maintenance
- **When merging upstream:**
  - Do a manual diff and port only relevant logic.
  - Maintain this README section as a living guide to adaptation decisions.
  - Add comments in code where Electron-specific changes were made.
- **If upstream adds new features:**
  - Evaluate if they depend on Chrome APIs or extension options.
  - If yes, decide if you want to hardcode, ignore, or implement your own logic.

---
