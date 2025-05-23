const { app, BrowserWindow, Tray, Menu, nativeImage, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { ElectronChromeExtensions } = require('electron-chrome-extensions');

let mainWindow;
let tray;
let alwaysOnTop = false; // Track always-on-top state
let showTitleBar = true; // Track show-title-bar state, enabled by default
let extensions;

const WINDOW_WIDTH = 300;
const WINDOW_HEIGHT = 500;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    minWidth: 200,
    minHeight: 300,
    resizable: true,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: getIconPath(),
    autoHideMenuBar: true, // hide menu bar by default
    alwaysOnTop: alwaysOnTop, // initialize with current state
    skipTaskbar: true, // do not show in taskbar
    frame: showTitleBar, // control title bar visibility
  });

  mainWindow.loadURL('https://keep.google.com/u/0/');

  mainWindow.webContents.on('did-finish-load', () => {
  });

  mainWindow.on('close', (e) => {
    // Hide window instead of closing (app stays in tray)
    if (!app.isQuiting) {
      e.preventDefault();
      mainWindow.hide();
    }
    return false;
  });

  // Hide menu bar if not already hidden
  mainWindow.setMenuBarVisibility(false);
}

function getIconPath() {
  // Use a default icon if none exists
  const iconIco = path.join(__dirname, 'icon.ico');
  if (fs.existsSync(iconIco)) return iconIco;
  const iconPng = path.join(__dirname, 'icon.png');
  if (fs.existsSync(iconPng)) return iconPng;
  return undefined; // fallback to Electron default
}

function createTray() {
  const icon = getIconPath();
  tray = new Tray(icon || undefined);
  tray.setToolTip('Google Keep Memo Pad');

  tray.on('double-click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
    updateTrayMenu();
  });

  tray.on('click', () => {
    // Left click: toggle window
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
    updateTrayMenu();
  });

  // No need for explicit right-click handler; setContextMenu handles it
  updateTrayMenu();
}

function updateTrayMenu() {
  if (!tray) return;
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Window',
      type: 'checkbox',
      checked: mainWindow && mainWindow.isVisible(),
      click: () => {
        if (mainWindow.isVisible()) {
          mainWindow.hide();
        } else {
          mainWindow.show();
          mainWindow.focus();
        }
        updateTrayMenu();
      },
    },
    {
      label: 'Always on Top',
      type: 'checkbox',
      checked: alwaysOnTop,
      click: () => {
        alwaysOnTop = !alwaysOnTop;
        if (mainWindow) mainWindow.setAlwaysOnTop(alwaysOnTop);
        updateTrayMenu();
      },
    },
    {
      label: 'Show Title Bar',
      type: 'checkbox',
      checked: showTitleBar,
      click: () => {
        showTitleBar = !showTitleBar;
        if (mainWindow) {
          // Recreate window to apply frame change
          const currentBounds = mainWindow.getBounds();
          mainWindow.close();
          mainWindow = null; // Clear reference to old window
          createWindow();
          mainWindow.setBounds(currentBounds);
          mainWindow.show();
        }
        updateTrayMenu();
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.isQuiting = true;
        app.quit();
      },
    },
  ]);
  tray.setContextMenu(contextMenu);
}

app.on('ready', async () => {
  // Initialize ElectronChromeExtensions with required license
  extensions = new ElectronChromeExtensions({ license: "GPL-3.0" });

  // Load the unpacked Chrome extension
  const extPath = path.join(__dirname, 'chrome-google-keep-full-screen');
  try {
    const loadedExt = await (mainWindow ? mainWindow.webContents.session : require('electron').session.defaultSession).loadExtension(extPath, { allowFileAccess: true });
    console.log('Loaded extension:', loadedExt);
  } catch (err) {
    console.error('Failed to load extension:', err);
  }

  createWindow();
  createTray();
  
  // Open DevTools for debugging
  if (mainWindow) {
    // mainWindow.webContents.openDevTools();
  }
  
  if (mainWindow) {
    mainWindow.once('ready-to-show', () => {
      mainWindow.show(); // Show window at startup
    });
  }
});

app.on('window-all-closed', (e) => {
  // Don't quit app when all windows are closed (keep in tray)
  e.preventDefault();
});

app.on('activate', () => {
  if (mainWindow) mainWindow.show();
});

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
}

app.on('web-contents-created', (event, contents) => {
  contents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
});
