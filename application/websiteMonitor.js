const Website = require('../domain/website');

class WebsiteMonitor {
  constructor(websiteRepository, contentFetcher) {
    this.websiteRepository = websiteRepository;
    this.contentFetcher = contentFetcher;
    this.notifier = null;
    this.monitoringTasks = new Map(); 
  }

  setNotifier(notifier) {
    this.notifier = notifier;
  }

  async addWebsite(url, interval) {
    const website = new Website(url, interval);
    await this.websiteRepository.save(website);
    this.startMonitoring(website);
  }

  async removeWebsite(url) {
    await this.websiteRepository.remove(url);
  }

  async startMonitoring(website) {
    if (this.monitoringTasks.has(website.url)) return; // Evita duplicar intervalos

    const monitorTask = setInterval(async () => {
      try{
        const content = await this.contentFetcher.fetch(website.url);
        const hasChanged = website.updateContent(content);
        if (hasChanged && this.notifier) {
          this.notifier.notifyChange(website.url);
        }
      } catch (error) {
        console.error(`Error al monitorear ${website.url}:`, error);
      }
    }, website.interval * 1000);

    this.monitoringTasks.set(website.url, monitorTask);
  }

  async startAllMonitoring() {
    const websites = await this.websiteRepository.getAll();
    websites.forEach(website => this.startMonitoring(website));
  }
}

module.exports = WebsiteMonitor;