const { ipcRenderer } = require('electron');

document.getElementById('urlForm').addEventListener('submit', (event) => {
  event.preventDefault();

  const url = document.getElementById('urlInput').value;
  const interval = document.getElementById('intervalInput').value;
  const urlList = document.getElementById('urlList');

  try {
    new URL(url);
  } catch (e) {
    alert('Por favor, ingresa una URL válida.');
    return;
  }

  const listItem = document.createElement('li');
  listItem.textContent = `URL: ${url}, Intervalo: ${interval} segundos`;

  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Eliminar';

  deleteButton.addEventListener('click', () => {
    ipcRenderer.send('remove-url', { url });
    urlList.removeChild(listItem);
  });

  listItem.appendChild(deleteButton);
  urlList.appendChild(listItem);

  ipcRenderer.send('add-url', { url, interval });
});

ipcRenderer.on('url-content', (event, { url, res }) => {
  console.log(`Contenido recibido de ${url}: ${res}`);
  const contentList = document.getElementById('contentList');
  const contentItem = document.createElement('li');
  contentItem.textContent = `URL: ${url}, Contenido: ${res}`;
  contentList.appendChild(contentItem);
});