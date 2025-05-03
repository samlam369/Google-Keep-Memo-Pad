# Google Keep Desktop

Google Keep Desktop is an Electron-based desktop application that provides quick access to Google Keep from your system tray. Designed for Windows, with future cross-platform support in mind.

## Features
- System tray icon for quick access
- Tray menu with checkboxes for:
    - Show Window (toggle window visibility)
    - Auto-launch on Startup (toggle auto-launch)
    - Always On Top (toggle window always-on-top)
- Double-click tray icon to show/hide main window
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
