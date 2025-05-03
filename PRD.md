# Product Requirements Document (PRD)

## Project: Google Keep Desktop

### Overview
Google Keep Desktop is an Electron-based application that provides quick access to Google Keep from the system tray. The app is initially developed for Windows, with future consideration for cross-platform support (macOS/Linux).

---

## 1. Goals
- Provide a lightweight, always-available desktop wrapper for Google Keep.
- Enable quick access via a system tray icon.
- Allow users to resize the window for better usability.

---

## 2. Features & Requirements

### 2.1 System Tray Integration
- The app displays an icon in the system tray when running.
- **Double-click** on the tray icon toggles (shows/hides) the main window.
- **Right-click** on the tray icon opens a context menu with:
    - "Show Window" (checkbox, toggles window visibility)
    - "Auto-launch on Startup" (checkbox, toggles auto-launch)
    - "Always On Top" (checkbox, toggles window always-on-top)
    - "Quit" to close the app

### 2.2 Main Window
- **Default Size:** 500 x 300 pixels (height x width)
- **Resizable:** User can freely resize the window by dragging its edges/corners.
- **Content:** Displays the live content of https://keep.google.com/u/0/ in a webview/browser window.
- **Authentication:** User logs into Google Keep manually in the app window. Enlarging the window is supported for easier login.
- **Always On Top:** User can toggle this feature from the tray menu.

### 2.3 Platform Support
- **Primary:** Windows
- **Future:** Leave code structure open for cross-platform support (macOS, Linux)

### 2.4 Distribution & Setup
- Distributed via GitHub. Users can clone the repo and run `npm start` to launch the app.
- No installer or packaged distribution initially.

### 2.5 Additional Notes
- No analytics, privacy, or data storage requirements at this stage.
- No auto-update or advanced accessibility features planned for initial release.

---

## 3. Future Improvements (Not in Initial Scope)
- Cross-platform support (macOS, Linux)
- Auto-update mechanism
- Customizable shortcuts
- Notifications integration
- Advanced accessibility features

---

## 4. Open Questions / Implementation Considerations
- If any privacy or technical requirements arise during implementation (e.g., handling cookies, user data, or permissions), they should be documented and addressed as needed.

---

## 5. Appendix
- **Last updated:** 2025-05-03
- **Contact:** [Your Name or GitHub handle]
