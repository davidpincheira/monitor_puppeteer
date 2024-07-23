class Website {
    constructor(url, interval) {
      this.url = url;
      this.interval = interval;
      this.lastContent = null;
    }
  
    updateContent(content) {
      const hasChanged = this.lastContent !== content;
      this.lastContent = content;
      return hasChanged;
    }
  }
  
  module.exports = Website;