electron = require(electron)

// Determine mode
const urlParams = new URLSearchParams(window.location.search);
window.mode = urlParams.get('mode');
window.port = electron.remote.getGlobal('port')

let clipboard

if(window.mode == "desktop"){
    const shell = electron.shell
    clipboard = electron.clipboard
}

window.readClipboard = function(){
    clipboard.readText()
}


