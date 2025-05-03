# Google Keep Desktop

Google Keep Desktop is an Electron-based desktop application that provides quick access to Google Keep from your system tray. Designed for Windows, with future cross-platform support in mind.

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
git clone https://github.com/yourusername/Google-Keep-Desktop.git
cd Google-Keep-Desktop
npm install
npm start
```

## Auto-launch at Startup (Windows)

To have Google Keep Desktop launch automatically when you log in:

1. Make sure you have [Node.js](https://nodejs.org/) installed.
2. Use the provided `launch_keep.vbs` script in this repo to launch the app silently at startup.
3. Right-click `launch_keep.vbs` and choose **Create shortcut**.
4. Press `Win + R`, type `shell:startup`, and press Enter. This opens your Startup folder.
5. Move the **shortcut** (not the `.vbs` file itself) into the Startup folder.

This ensures the script always runs from your app's folder, so `npm start` works correctly.

To remove auto-launch, simply delete the shortcut from the Startup folder.

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
