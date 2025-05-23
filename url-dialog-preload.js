const { contextBridge, ipcRenderer } = require('electron');

// Expose a limited API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Method to send the selected URL back to the main process
  setUrl: (url) => ipcRenderer.send('url-selected', url),
  // Method to cancel the dialog
  cancel: () => ipcRenderer.send('url-dialog-cancelled')
});
