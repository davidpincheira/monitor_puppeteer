const puppeteer = require('puppeteer');

class PuppeteerContentFetcher {
  async fetch(url) {
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        defaultViewport: null,
      });
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle2', waitUntil: ['networkidle0', 'domcontentloaded', 'load'] });
      return await page.evaluate(() => document.body.innerText);
    } finally {
      if (browser) await browser.close();
    }
  }
}

module.exports = PuppeteerContentFetcher;