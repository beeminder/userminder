electron = require('electron')

// Determine mode
const urlParams = new URLSearchParams(window.location.search);
window.mode = urlParams.get('mode');
window.port = electron.remote.getGlobal('port')

if(window.mode == "desktop"){
    window.shell = electron.shell
    window.clipboard = electron.clipboard
}

window.readClipboard = function(){
    return window.clipboard.readText()
}

console.log("Finished preloading")
