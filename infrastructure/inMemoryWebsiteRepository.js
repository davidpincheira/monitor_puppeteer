class InMemoryWebsiteRepository {
    constructor() {
      this.websites = new Map();
    }
  
    async save(website) {
      this.websites.set(website.url, website);
    }
  
    async remove(url) {
      this.websites.delete(url);
    }
  
    async getAll() {
      return Array.from(this.websites.values());
    }
  }
  
  module.exports = InMemoryWebsiteRepository;