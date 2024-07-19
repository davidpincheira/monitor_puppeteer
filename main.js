const { app, BrowserWindow, ipcMain, Notification } = require('electron');
const path = require('path');
const puppeteer = require('puppeteer');

let win;
const urlIntervals = {};

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});


ipcMain.on('add-url', async(event, { url, interval }) => {
  let browser;
  let previousValue = null;

  const intervalId = setInterval(async () => {
    try {
      browser = await puppeteer.launch({
        headless: true,
        defaultViewport: null
      });
      const page = await browser.newPage();
      await page.goto(url, {waitUntil:'networkidle2'});

      //lo que esta comentado es para obtener el valor del bitcoint y dolar blue, respectivamente.
      //coinmarket
      //await page.waitForSelector('#section-coin-overview > div.sc-d1ede7e3-0.gNSoet.flexStart.alignBaseline > span');
      //dolarhoy
      //await page.waitForSelector('#home_0 > div.modulo.modulo_bloque > section > div > div > div > div.tile.is-parent.is-9.cotizacion.is-vertical > div > div.tile.is-parent.is-5 > div > div.values > div.venta > div.val');

      const item = await page.evaluate(() => {
        //coinmarket 
        //return document.querySelector('#section-coin-overview > div.sc-d1ede7e3-0.gNSoet.flexStart.alignBaseline > span').outerText;
        //dolarhoy 
        //return document.querySelector('#home_0 > div.modulo.modulo_bloque > section > div > div > div > div.tile.is-parent.is-9.cotizacion.is-vertical > div > div.tile.is-parent.is-5 > div > div.values > div.venta > div.val').outerText;
        return document.body.innerText;
      });

      //comparo con el dato previo
      if (item !== previousValue) {
       
        let resDate = getDateNow()
        // respondo al frontend
        let res = "Change detected at: " + resDate
        win.webContents.send('url-content', { url, res });
        new Notification({ title: 'Cambio Detectado', body: `Se detectaron cambios en: ${url}` }).show();
        //guardo el nuevo valor
        previousValue = item;
      } else {
        let res = "no hay cambios"
        win.webContents.send('url-content', { url, res });
        console.log('No change detected:');
      }

    } catch (error) {
      console.error('Error al usar Puppeteer:', error);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }, interval * 1000);

  urlIntervals[url] = intervalId;
});

ipcMain.on('remove-url', (event, url) => {
  clearInterval(urlIntervals[url]);
  delete urlIntervals[url];
  console.log(`Dejó de monitorear: ${url}`);
});

function getDateNow(){
  const timestamp = Date.now();
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  return formattedDate = `${day.toString().padStart(2, '0')}-${month.toString().padStart(2, '0')}-${year} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}



/* ipcMain.on('add-url', async (event, { url, interval }) => {
  let previousContent = {}; // Diccionario para almacenar el contenido anterior de cada elemento observado

  setInterval(async () => {
    let browser;
    try {
      browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle2' });

      // Definir los selectores específicos que queremos observar
      const selectors = ['span', 'h1', 'h2', 'h3', 'p', 'div'];

      // Crear un observador de mutaciones
      await page.exposeFunction('sendToMain', (selector, content) => {
        if (content !== previousContent[selector]) {
          console.log('Cambio detectado en elemento:', selector, content);
          win.webContents.send('url-content', { url, selector, content });
          previousContent[selector] = content;
        }
      });

      await page.evaluate((selectors) => {
        const observer = new MutationObserver((mutations) => {
          for (const mutation of mutations) {
            if (mutation.type === 'childList' || mutation.type === 'characterData') {
              selectors.forEach((selector) => {
                document.querySelectorAll(selector).forEach((node) => {
                  const content = node.textContent;
                  window.sendToMain(selector, content);
                });
              });
            }
          }
        });

        observer.observe(document.body, { childList: true, characterData: true, subtree: true });

        // Inicialmente, enviar todos los elementos ya presentes en la página
        selectors.forEach((selector) => {
          document.querySelectorAll(selector).forEach((node) => {
            const content = node.textContent;
            window.sendToMain(selector, content);
          });
        });
      }, selectors);

      // Esperar un tiempo antes de cerrar el navegador
      await page.waitForTimeout(10000);
    } catch (error) {
      console.error('Error al usar Puppeteer:', error);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }, interval * 1000);
}); */