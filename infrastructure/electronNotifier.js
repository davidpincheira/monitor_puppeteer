const { Notification } = require('electron');

class ElectronNotifier {
  constructor(window) {
    this.window = window;
  }

  notifyChange(url) {
    new Notification({ title: 'Cambio Detectado', body: `Se detectaron cambios en: ${url}` }).show();
    this.window.webContents.send('url-content', { url, res: "Change detected at: " + this.getDateNow() });
  }

  getDateNow() {
    const date = new Date();
    return date.toLocaleString();
  }
}

module.exports = ElectronNotifier;