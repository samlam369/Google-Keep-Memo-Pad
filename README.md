# Google Keep Memo Pad

## First Time Install

1. **Clone this repository**:
   ```sh
   git clone https://github.com/samlam369/Google-Keep-Memo-Pad.git
   cd Google-Keep-Memo-Pad
   ```

2. **Clone the fullscreen extension repository inside the app directory**:
   ```sh
   git clone https://github.com/chrisputnam9/chrome-google-keep-full-screen.git
   ```

3. **Install dependencies and prepare the extension**:
   ```sh
   npm install
   # This will automatically set up the extension manifest and patch the extension for Electron compatibility
   ```

4. **Start the app**:
   ```sh
   npm start
   ```

If you update either repository in the future, simply run:
```sh
npm run setup-extension
```
to re-apply the manifest and compatibility patch.

Google Keep Memo Pad is an Electron desktop application that delivers access to Google Keep via a system tray icon. It features a narrow, resizable window, Always on Top functionality, Windows System Tray integration, and a full page note capability to mimick a memo pad while leveraging Google Keep's cloud synchronization and cross-platform support.

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
2. Use the provided `launch_keep.vbs` script in this repo to launch the app silently at startup.
3. Right-click `launch_keep.vbs` and choose **Create shortcut**.
4. Press `Win + R`, type `shell:startup`, and press Enter. This opens your Startup folder.
5. Move the **shortcut** (not the `.vbs` file itself) into the Startup folder.

This ensures the script always runs from your app's folder, so `npm start` works correctly.

To remove auto-launch, simply delete the shortcut from the Startup folder.

## Full Screen Extension Integration

This app integrates the [chrome-google-keep-full-screen](https://github.com/chrisputnam9/chrome-google-keep-full-screen) extension by directly sideloading it into the Electron app.

- The extension is loaded from the `chrome-google-keep-full-screen` directory, which should be cloned alongside the main repository.
- The extension provides full-screen note viewing capability, with a toggle button in the note toolbar.
- When opening a note, it automatically enters full-screen mode to maximize the note viewing experience.

### Setup Instructions

1. Clone this repository:
   ```sh
   git clone https://github.com/samlam369/Google-Keep-Memo-Pad.git
   cd Google-Keep-Memo-Pad
   ```

2. Clone the fullscreen extension repository inside the app directory:
   ```sh
   git clone https://github.com/chrisputnam9/chrome-google-keep-full-screen.git
   ```

3. Install dependencies and run:
   ```sh
   npm install
   npm start
   ```

### Updating Both Repositories

Since this app integrates two separate repositories, you need to update each independently:

1. Update the main app:
   ```sh
   # From the Google-Keep-Memo-Pad directory
   git pull origin main
   npm install  # Will automatically set up the extension manifest
   ```

2. Update the extension:
   ```sh
   # From the Google-Keep-Memo-Pad directory
   cd chrome-google-keep-full-screen
   git pull origin master
   cd ..
   npm run setup-extension  # Ensure manifest.json is properly configured
   ```

The setup process will automatically configure the extension for Electron compatibility by:
- Copying and configuring the manifest.json file
- Adding minimal error handling to make the extension work correctly in Electron
- Preserving all extension functionality while ensuring it works in a desktop environment

## Development
- Main process: `main.js`
- No auto-update or analytics in initial release
- Future support for macOS/Linux planned

## License
MIT

---

See [PRD.md](./PRD.md) for full requirements.

> **Disclaimer:** This is a third-party project and is not affiliated with, endorsed by, or associated with Google LLC. All Google Keep trademarks and copyrights are property of Google.

## Credits

Systray icon is from [Boxicons](https://boxicons.com/), used under the [MIT License](https://github.com/atisawd/boxicons/blob/master/LICENSE).
