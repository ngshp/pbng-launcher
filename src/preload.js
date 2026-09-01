const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('pbngAPI', {
  version: '18.2.0',
  platform: process.platform,
  // Your custom API
  startGame: () => ipcRenderer.invoke('pbng:start-game'),
  checkFiles: () => ipcRenderer.invoke('pbng:check-files'),
  getVersion: () => ipcRenderer.invoke('pbng:get-version'),
  close: () => ipcRenderer.invoke('pbng:close'),
  minimize: () => ipcRenderer.invoke('pbng:minimize'),
  // Legacy
  getAppPath: () => ipcRenderer.invoke('get-app-path')
});

console.log('[PBNG] Preload loaded with Anti-Cheat API');
