//Detect Mode - currently only web and desktop mode, so can use some shortcuts
let webMode = false
for (let i = 0; i < process.argv.length; i++) {
  const argVal = process.argv[i] 
  if(i>=2 && argVal === "-web"){
    console.log("Running in web mode")
    webMode = true
  }
}

// ---------------------------------- 80chars --------------------------------->
const express = require('express')
const https = require('https')
const bodyParser = require('body-parser')
//var request = require('request')

let app
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

// Boilerplate for an electron app
function setupExpress(expressApp){
  var expressApp = express()
  expressApp.use(express.static('public'))
  expressApp.set('trust proxy', 1)
  expressApp.use(bodyParser.json())

  //expressApp.get("/", function (request, response) {
  //  response.sendFile(__dirname + '/views/index.html')
  //})

  expressApp.get(`/dossier`, function(req, resp) {
    //console.log("GET /dossier")
    //console.log(req.query)
    getDossier(req.query.email, req.query.token,
      (userp) => { resp.send(JSON.stringify(userp)) }, 
      (error) => { console.log("error in GET /dossier:", error) }
    )
  })

  var listener = expressApp.listen(process.env.PORT, function() {
    const port = listener.address().port
    console.log(`The Userminder app is running on port ${port}`)
    global['port'] = port
  })

  console.log("Finished setting up express")
}

var menuTemplate = [{
  label: "Application",
  submenu: [
      { label: "About Application", selector: "orderFrontStandardAboutPanel:" },
      { type: "separator" },
      { label: "Quit", accelerator: "Command+Q", click: function() { app.quit(); }}
  ]}, {
  label: "Edit",
  submenu: [
      { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
      { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
      { type: "separator" },
      { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
      { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
      { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
      { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
  ]}
]

function setupElectron(){
  const path = require('path')
  const electron = require('electron')
  const Menu = electron.Menu
  const BrowserWindow = electron.BrowserWindow
  app = electron.app

  // Boilerplate for an electron app
  function createWindow() {
    // Create the browser window.

    mainWindow = new BrowserWindow({
      show: false,
      webPreferences: {
        preload: path.join(__dirname, 'public', 'preload.js'),
        nodeIntegration: false,
        contextIsolation: true
      }
    })
    mainWindow.maximize()
    mainWindow.show()

    // and load the index.html of the app.
    mainWindow.loadURL(`file://${__dirname}/public/index.html?mode=desktop`)

    //mainWindow.webContents.openDevTools()

    mainWindow.on('closed', function () {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      mainWindow = null
    })
    console.log("Created window")
  }

  app.on('ready', () => {
    console.log("App is ready")
    setupExpress()
    Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));
    createWindow()
    console.log("Created window")
  })

  app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
      createWindow()
    }
  })
}

function getDossier(email, token, success, error) {
  var options = {
    host: 'www.beeminder.com',
    port: 443,
    path: '/api/private/raplet.json?users[]='+encodeURIComponent(email)
                                  +"&auth_token="+token,
    method: 'GET',
  }
  var req = https.request(options, function(resp) {
    var data = ''
    resp.on('data', (chunk) => {
      data += chunk
    }).on('end', () => {
      success(JSON.parse(data))
    })
  })
  req.on('error', (e) => {
    console.log('problem with request:', e.message)
    error(e.message)
  })
  req.write('')
  req.end()
}

if(webMode){
  setupExpress()
}else{
  setupElectron()
}

