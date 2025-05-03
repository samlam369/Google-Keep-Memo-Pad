const { app, BrowserWindow, Tray, Menu, nativeImage, shell } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let tray;
let autoLaunchEnabled = false; // Default: disabled

const WINDOW_WIDTH = 300;
const WINDOW_HEIGHT = 500;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    minWidth: 300,
    minHeight: 300,
    resizable: true,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: getIconPath(),
    autoHideMenuBar: true, // hide menu bar by default
  });

  mainWindow.loadURL('https://keep.google.com/u/0/');

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

function setAutoLaunch(enable) {
  try {
    const AutoLaunch = require('auto-launch');
    const launcher = new AutoLaunch({
      name: 'Google Keep Desktop',
      path: process.execPath,
    });
    if (enable) {
      launcher.enable();
    } else {
      launcher.disable();
    }
    autoLaunchEnabled = enable;
  } catch (err) {
    // Ignore auto-launch errors for now
  }
}

function createTray() {
  const icon = getIconPath();
  tray = new Tray(icon || undefined);
  tray.setToolTip('Google Keep Desktop');

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
      label: mainWindow && mainWindow.isVisible() ? 'Hide' : 'Show',
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
      label: (autoLaunchEnabled ? 'Disable' : 'Enable') + ' Auto-launch on Startup',
      type: 'normal',
      click: () => {
        setAutoLaunch(!autoLaunchEnabled);
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

app.on('ready', () => {
  createWindow();
  createTray();
  if (mainWindow) {
    mainWindow.once('ready-to-show', () => {
      // Optionally show window at startup
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
