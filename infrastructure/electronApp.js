const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

class ElectronApp {
  constructor(websiteMonitor, onWindowCreated) {
    this.websiteMonitor = websiteMonitor;
    this.window = null;
    this.onWindowCreated = onWindowCreated;
  }

  start() {
    app.whenReady().then(() => this.createWindow());

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') app.quit();
    });

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) this.createWindow();
    });

    this.setupIPC();
  }

  createWindow() {
    this.window = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: true,
        contextIsolation: false,
      },
    });

    this.window.loadFile(path.join(__dirname, 'ui', 'index.html'));

    // Ejecutar el callback pasando la ventana
    if (this.onWindowCreated) {
      this.onWindowCreated(this.window);
    }
  }

  setupIPC() {
    ipcMain.on('add-url', async (event, { url, interval }) => {
      await this.websiteMonitor.addWebsite(url, interval);
    });

    ipcMain.on('remove-url', async (event, { url }) => {
      await this.websiteMonitor.removeWebsite(url);
    });
  }
}

module.exports = ElectronApp;