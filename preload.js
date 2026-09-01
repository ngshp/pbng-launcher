const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('pbngAPI', {
  // Game controls
  startGame: () => ipcRenderer.invoke('pbng:start-game'),
  checkFiles: () => ipcRenderer.invoke('pbng:check-files'),
  getVersion: () => ipcRenderer.invoke('pbng:get-version'),

  // Window controls
  close: () => ipcRenderer.invoke('pbng:close'),
  minimize: () => ipcRenderer.invoke('pbng:minimize'),

  // Events
  onProgress: (cb) => ipcRenderer.on('pbng:progress', (_, data) => cb(data)),
  onToast: (cb) => ipcRenderer.on('pbng:toast', (_, msg) => cb(msg)),

  // Platform
  platform: process.platform,
  isElectron: true
});

console.log('[PBNG] preload.js loaded - pbngAPI exposed');
