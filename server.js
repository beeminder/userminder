/* -------- detect CLI flag ------------------------------------------------- */
let webMode = process.argv.includes('-web');
if (webMode) console.log('Running in web mode');

/* -------- core deps ------------------------------------------------------- */
const express = require('express');
const https   = require('https');

/* --------- express bootstrap ---------------------------------------------- */
function setupExpress() {
  const app = express();

  app.use(express.static('public'));   // serve /public
  app.set('trust proxy', 1);
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // simple Beeminder proxy
  app.get('/dossier', (req, res) => {
    getDossier(
      req.query.email,
      req.query.token,
      data  => res.json(data),
      error => {
        console.error('GET /dossier error:', error);
        res.status(500).send('error');
      }
    );
  });

  const listener = app.listen(process.env.PORT || 3000, () => {
    const { port } = listener.address();
    console.log(`Userminder web server listening on port ${port}`);
    global.port = port;   // (legacy code still reads this)
  });
}

/* --------- optional Electron wrapper -------------------------------------- */
function setupElectron(electron) {
  const { app, BrowserWindow, Menu } = electron;
  const path = require('path');

  const menuTemplate = [
    {
      label: 'Application',
      submenu: [
        { label: 'About', selector: 'orderFrontStandardAboutPanel:' },
        { type: 'separator' },
        { label: 'Quit', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
        { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
        { type: 'separator' },
        { label: 'Cut',   accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
        { label: 'Copy',  accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
        { label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:' }
      ]
    }
  ];

  let mainWindow = null;

  function createWindow() {
    mainWindow = new BrowserWindow({
      show: false,
      webPreferences: {
        preload: path.join(__dirname, 'public', 'preload.js'),
        nodeIntegration: false,
        contextIsolation: true
      }
    });
    mainWindow.maximize();
    mainWindow.show();
    mainWindow.loadURL(`file://${__dirname}/public/index.html?mode=desktop`);
    mainWindow.on('closed', () => (mainWindow = null));
  }

  app.on('ready', () => {
    console.log('Electron ready — launching desktop window');
    Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));
    createWindow();
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });

  app.on('activate', () => {
    if (mainWindow === null) createWindow();
  });
}

/* --------- helper: call Beeminder API ------------------------------------- */
function getDossier(email, token, ok, err) {
  const opts = {
    host: 'www.beeminder.com',
    port: 443,
    path: `/api/private/raplet.json?users[]=${encodeURIComponent(email)}&auth_token=${token}`,
    method: 'GET'
  };
  https
    .request(opts, resp => {
      let data = '';
      resp.on('data', chunk => (data += chunk));
      resp.on('end', () => ok(JSON.parse(data)));
    })
    .on('error', e => err(e.message))
    .end();
}

/* --------- main ----------------------------------------------------------- */
setupExpress();                       // always run the web server

if (!webMode) {
  let electron;
  try      { electron = require('electron'); }
  catch    { /* not installed — fine */ }

  if (electron) {
    setupElectron(electron);
  } else {
    console.log('Electron not found — desktop wrapper skipped');
  }
}
