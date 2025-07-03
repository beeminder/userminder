electron = require('electron')

// Determine mode
const urlParams = new URLSearchParams(window.location.search);
let port = electron.remote.getGlobal('port')

let clipboard = electron.clipboard
let shell = electron.shell

function readClipboard(){
  return clipboard.readText()
}

window.addEventListener("message", (event) => {
  if (event.source != window) return
  if (event.data.type && (event.data.type == "READCLIP_REQ")) {
    window.postMessage({type: "READCLIP_ANS", text: readClipboard()}, "*")
  }
  if (event.data.type && (event.data.type == "GETPORT_REQ")) {
    window.postMessage({type: "GETPORT_ANS", text: port}, "*")
  }
  if (event.data.type && (event.data.type == "OPENLINK_REQ")) {
    shell.openExternal(event.data.link)
  }
}, false)

console.log("Finished preloading")
