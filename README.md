# Google Keep Memo Pad

## First Time Install

1. **Clone this repository**:
   ```sh
   git clone https://github.com/samlam369/Google-Keep-Memo-Pad.git
   cd Google-Keep-Memo-Pad
   ```

2. **Install dependencies (this will also auto-download the fullscreen extension fork)**:
   ```sh
   npm install
   ```

3. **Start the app**:
   ```sh
   npm start
   ```

## Features
- System tray icon for quick access
- Tray menu with checkboxes for:
    - Show Window (toggle window visibility)
    - Always On Top (toggle window always-on-top)
- Left-click tray icon to show/hide main window
- Main window displays https://keep.google.com/u/0/
- Default window size: 500x300px, resizable
- Manual login required

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [Git](https://git-scm.com/)

### Installation
```sh
git clone https://github.com/samlam369/Google-Keep-Memo-Pad.git
cd Google-Keep-Memo-Pad
npm install
npm start
```

## Auto-launch at Startup (Windows)

To have Google Keep Memo Pad launch automatically when you log in:

1. Make sure you have [Node.js](https://nodejs.org/) installed.
2. Use the provided `Google-Keep-Memo-Pad.vbs` script in this repo to launch the app silently at startup.
3. Right-click `Google-Keep-Memo-Pad.vbs` and choose **Create shortcut**.
4. Press `Win + R`, type `shell:startup`, and press Enter. This opens your Startup folder.
5. Move the **shortcut** (not the `.vbs` file itself) into the Startup folder.

This ensures the script always runs from your app's folder, so `npm start` works correctly.

To remove auto-launch, simply delete the shortcut from the Startup folder.

## Full Screen Extension Integration

This app integrates a forked version of the [chrome-google-keep-full-screen](https://github.com/chrisputnam9/chrome-google-keep-full-screen) extension by directly sideloading it into the Electron app.

- The extension is loaded from the `chrome-google-keep-full-screen` directory, using our [custom fork](https://github.com/samlam369/chrome-google-keep-full-screen) which contains Electron compatibility modifications.
- The extension provides full-screen note viewing capability, with a toggle button in the note toolbar.
- When opening a note, it automatically enters full-screen mode to maximize the note viewing experience.
- The fullscreen extension fork will now be automatically downloaded during `npm install`.

### Updating Both Repositories

Since this app integrates two separate repositories, you need to update each independently:

1. Update the main app:
   ```sh
   # From the Google-Keep-Memo-Pad directory
   git pull origin main
   npm install
   ```

2. Update the extension fork:
   ```sh
   # Simple method - use the provided npm script
   npm run update-extension
   ```
   
   Alternatively, you can manually update the extension:
   ```sh
   # Manual method
   cd chrome-google-keep-full-screen
   git pull origin main
   cd ..
   ```

The extension fork contains detailed documentation in [samlam369/chrome-google-keep-full-screen/README.md](https://github.com/samlam369/chrome-google-keep-full-screen/blob/master/README.md) explaining the modifications made for Electron compatibility. These modifications ensure the extension works properly in a desktop environment without breaking core functionality.

## Development
- Main process: `main.js`
- No auto-update or analytics in initial release

## License
MIT

---

See [PRD.md](./PRD.md) for full requirements.

> **Disclaimer:** This is a third-party project and is not affiliated with, endorsed by, or associated with Google LLC. All Google Keep trademarks and copyrights are property of Google.

## Credits

Systray icon is from [Boxicons](https://boxicons.com/), used under the [MIT License](https://github.com/atisawd/boxicons/blob/master/LICENSE).
