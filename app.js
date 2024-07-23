const ElectronApp = require('./infrastructure/electronApp');
const WebsiteMonitor = require('./application/websiteMonitor');
const PuppeteerContentFetcher = require('./infrastructure/puppeteerContentFetcher');
const InMemoryWebsiteRepository = require('./infrastructure/inMemoryWebsiteRepository');
const ElectronNotifier = require('./infrastructure/electronNotifier');

const websiteRepository = new InMemoryWebsiteRepository();
const contentFetcher = new PuppeteerContentFetcher();

const websiteMonitor = new WebsiteMonitor(websiteRepository, contentFetcher);
const electronApp = new ElectronApp(websiteMonitor, (window) => {
  // Pasar la ventana a ElectronNotifier
  const notifier = new ElectronNotifier(window);
  websiteMonitor.setNotifier(notifier);
});

electronApp.start();
