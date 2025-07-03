console.log("Running client")
// Initialise
let serverURL

const urlParams = new URLSearchParams(window.location.search);
let mode = urlParams.get('mode');
console.log("mode", mode)

if (mode==="desktop") {
  serverURL = null; //Signals that it hasn't been set yet (contrast to "" where it has)
  console.log("Client running desktop mode")

  //Setup listeners
  window.addEventListener("message", (event) => {
    if (event.source != window) return
    if (event.data.type && (event.data.type == "READCLIP_ANS")) {
      console.log("READ CLIPBOARD", event.data.text)
      readClipboardCallback(event.data.text)
    }
    if (event.data.type && (event.data.type == "GETPORT_ANS")) {
      serverURL = `http://localhost:${event.data.text}`
    }
  }, false)

  const readClipboardCallback = content => {
    var magic_textarea = document.getElementById("clipboard")
    magic_textarea.value = content
    if(serverURL!=null){
      processInput(content)
    }
  }

  const getPortMessage = () => {
    window.postMessage({ type: "GETPORT_REQ" }, "*")
  }

  //Get port and set the server URL
  getPortMessage()

  $(() => {
    console.log("Client page is ready")
    let external = $(".external")
    external.data("link", external.prop("href"))
    external.prop("href", "#");
    external.click(function(event){
      let link = $(event.target).data("link")
      console.log(`Open external: ${link}`)
      window.postMessage({type: "OPENLINK_REQ", "link": link}, "*")
    })
  })
} else{
  serverURL = ''  
}
// ---------------------------------- 80chars --------------------------------->
// Global variable w/ currently extracted email address (email address we see)
var seemail = '' 

// Simple in-memory store: use this to keep track of what email addresses we've
// already looked up and don't re-add them to the page.
var seen = {}

function processInput(input){
  seemail = extract_email(input)
  if (seemail) {
    console.log(`Found email ${seemail}`)
    //document.getElementById("email_box").value = email
    document.getElementById("email_span").textContent = 
      seemail // + (seen[seemail] ? ' (already fetched!)' : '')
  } 
  
  if (seemail !== '' && !seen[seemail]) {
    console.log("Email is new")
    seen[seemail] = true
    $.getJSON(
      `${serverURL}/dossier`, {
        email: seemail,
        token: document.getElementById('token').value
      },
      function(data) {
        console.log(`Received data ${data}`)
        $("#userinfo").append(formatDossier(data[0]))
      })
  }
}

// Take a string and return the first email address you find in it
function extract_email(s) {
  if (typeof(s) !== "string") { // pretty sure this check is superfluous now
    console.log(`ERROR3: extract_email("${s}")`)
    return ''
  }
  const erx = // eg a@b.c or a+b@c-d.e or even +-@x.co or _@.a or +@-b
    // /[\w\-\.\_\+]+\@[\w\-\.\_]+[a-zA-Z]/
    /[\w\-\.\_\+]+\@[a-zA-Z][\w\-\.\_]*\.[\w\-\.\_]*[a-zA-Z]/
  const matches = s.match(erx)
  return matches === null ? '' : matches[0]
}


let startedMonitoring = false
// This is what runs when the page loads
$(function() {
  $("form.raplet").submit(function(e) { // start monitoring when got auth token
    console.log("Submit clicked")
    e.preventDefault() // do we need this?
    if(!startedMonitoring){
      console.log("Starting monitoring")
      if(mode === "desktop"){
        console.log("Setting up interval timer")
        setInterval(() => {
          window.postMessage({ type: "READCLIP_REQ" }, "*")
        }, 1000)
      }else{
        $("#clipboard").on('input', function(event) {
          console.log("Input changed")
          processInput($(event.target).val())
        })
      }
      startedMonitoring = true
    }
  })
})

function formatDossier(doss) {
  var div = $("<div></div>") // would it be safer/clearer to find this by id?
  
  // Add close button (Codebuff's code here)
  var closeBtn = $('<button class="close-btn" title="Dismiss this dossier">&times;</button>')
  closeBtn.click(function() {
    div.fadeOut(300, function() {
      div.remove()
    })
  })
  div.append(closeBtn)
  
  if (doss.username === undefined) {
    div.append("<h2>"+doss.email_given+" &rarr; NOT A BEEMINDER USER</h2>")
  } else {
    var hover = JSON.stringify(doss) // show the full JSON on hover
    hover = hover.replace(/\"/g, "'")
    var bkg = doss.subscription ? "vip" : doss.is_payer ? "prio2" : "prio3"
    div.addClass(bkg)
    div.append(
      `<h2>${seemail} &rarr; ` + 
      `<a href="https://www.beeminder.com/${doss.username}"` + 
      `   target="_blank"` + 
      `   title="${hover}">${doss.username}</a>` + 
      (seemail === doss.email ? '' : ` &rarr; ${doss.email}`) + '</h2>' +
      `<span>${doss.subscription}</span> ` +
      `<span>$${doss.pledged}</span> ` +
      `<span>since ${doss.since}</span>`
    )
  }
  return div
}

// ---------------------------------- 80chars --------------------------------->
