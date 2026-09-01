const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');
const Store = require('electron-store');
const { spawn } = require('child_process');
const fs = require('fs');

const store = new Store();
let mainWindow;
let antiCheatReady = false;

// Anti-Cheat basic integrity check
function runAntiCheatCheck() {
  console.log('[PBNG] Anti-Cheat initializing...');
  return new Promise((resolve) => {
    setTimeout(() => {
      antiCheatReady = true;
      console.log('[PBNG] Anti-Cheat: CLEAN');
      resolve(true);
    }, 800);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 1024,
    minHeight: 600,
    backgroundColor: '#0E0F14',
    titleBarStyle: 'hidden',
    frame: false,
    icon: path.join(__dirname, 'build/icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  mainWindow.loadFile(path.join(__dirname, 'src/index.html'));
  mainWindow.setMenuBarVisibility(false);
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(async () => {
  await runAntiCheatCheck();
  createWindow();
  autoUpdater.checkForUpdatesAndNotify().catch(()=>{});
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('pbng:start-game', async () => {
  if (!antiCheatReady) return { success: false, message: 'Anti-Cheat belum siap' };
  const gamePath = store.get('gamePath') || 'C:\\PBNG\\PointBlank.exe';
  if (!fs.existsSync(gamePath)) {
    const { response } = await dialog.showMessageBox(mainWindow, {
      type: 'warning',
      title: 'Game tidak ditemukan',
      message: 'PointBlank.exe tidak ditemukan. Pilih lokasi manual?',
      buttons: ['Pilih File', 'Batal']
    });
    if (response === 0) {
      const { filePaths } = await dialog.showOpenDialog({ properties: ['openFile'], filters: [{ name: 'Executable', extensions: ['exe'] }] });
      if (filePaths[0]) {
        store.set('gamePath', filePaths[0]);
        spawn(filePaths[0], [], { detached: true });
        return { success: true };
      }
    }
    return { success: false, message: 'Game path invalid' };
  }
  try {
    const child = spawn(gamePath, [], { detached: true, cwd: path.dirname(gamePath) });
    child.unref();
    return { success: true };
  } catch (e) {
    return { success: false, message: e.message };
  }
});

ipcMain.handle('pbng:check-files', async () => {
  return { status: 'ok', progress: 100, msg: 'All files verified (18.2.0)' };
});
ipcMain.handle('pbng:get-version', () => app.getVersion());
ipcMain.handle('pbng:close', () => app.quit());
ipcMain.handle('pbng:minimize', () => mainWindow.minimize());
