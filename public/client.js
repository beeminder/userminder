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
  const emails = extract_emails(input)
  
  if (emails.length > 0) {
    console.log(`Found ${emails.length} email(s): ${emails.join(', ')}`)
    document.getElementById("email_span").textContent = 
      emails.length === 1 ? emails[0] : `${emails.length} emails: ${emails.join(', ')}`
  } else {
    document.getElementById("email_span").textContent = "(no email address found yet)"
  }
  
  // Process each new email
  emails.forEach(email => {
    if (!seen[email]) {
      console.log(`Processing new email: ${email}`)
      seen[email] = true
      $.getJSON(
        `${serverURL}/dossier`, {
          email: email,
          token: document.getElementById('token').value
        },
        function(data) {
          console.log(`Received data for ${email}: ${JSON.stringify(data)}`)
          $("#userinfo").append(formatDossier(data[0], email))
        })
      .fail(function(jqXHR, textStatus, errorThrown) {
        console.error(`API request failed for ${email}:`, textStatus, errorThrown)
        const errorDiv = $('<div class="error-message"></div>')
        errorDiv.html(
          `<h2>❌ Auth Error for ${email}</h2><p>Invalid auth token or API call failed.</p>`)
        
        // Add close button to error message
        const closeBtn = 
                   $('<button class="close-btn" title="Dismiss">&times;</button>')
        closeBtn.click(function() {
          errorDiv.fadeOut(300, function() { errorDiv.remove() })
        })
        errorDiv.append(closeBtn)
        $("#userinfo").append(errorDiv)
      })
    }
  })
  
  // Update global seemail for backward compatibility
  seemail = emails.length > 0 ? emails[0] : ''
}

// Take a string and return all email addresses found in it
function extract_emails(s) {
  if (typeof(s) !== "string") {
    console.log(`ERROR3: extract_emails("${s}")`)
    return []
  }
  const erx = // eg a@b.c or a+b@c-d.e or even +-@x.co or _@.a or +@-b
    // /[\w\-\.\_\+]+\@[\w\-\.\_]+[a-zA-Z]/
    /[\w\-\.\_\+]+\@[a-zA-Z][\w\-\.\_]*\.[\w\-\.\_]*[a-zA-Z]/g
  const matches = s.match(erx)
  return matches === null ? [] : matches
}

// Legacy function for backward compatibility
function extract_email(s) {
  const emails = extract_emails(s)
  return emails.length > 0 ? emails[0] : ''
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

function formatDossier(doss, email) {
  var div = $("<div></div>") // would it be safer/clearer to find this by id?
  
  // Add close button (Codebuff's code here)
  var closeBtn = $('<button class="close-btn" title="Dismiss this dossier">&times;</button>')
  closeBtn.click(function() {
    div.fadeOut(300, function() {
      div.remove()
    })
  })
  div.append(closeBtn)
  
  // Safety check for malformed data
  if (!doss || typeof doss !== 'object') {
    div.addClass('error-message')
    div.append('<h2>❌ Error!</h2><p>Probably your auth token is bad?</p>')
    return div
  }
  
  if (doss.username === undefined) {
    div.append("<h2>"+doss.email_given+" &rarr; NOT A BEEMINDER USER</h2>")
  } else {
    var hover = JSON.stringify(doss) // show the full JSON on hover
    hover = hover.replace(/\"/g, "'")
    var bkg = doss.subscription ? "vip" : doss.is_payer ? "prio2" : "prio3"
    div.addClass(bkg)
    div.append(
      `<h2>${email} &rarr; ` + 
      `<a href="https://www.beeminder.com/${doss.username}"` + 
      `   target="_blank"` + 
      `   title="${hover}">${doss.username}</a>` + 
      (email === doss.email ? '' : ` &rarr; ${doss.email}`) + '</h2>' +
      `<span>${doss.subscription}</span> ` +
      `<span>$${doss.pledged}</span> ` +  // note intentional double dollar sign
      `<span>since ${doss.since}</span>`
    )
  }
  
  // Add collapsible raw JSON section (inline)
  var jsonToggle = $('<span class="json-toggle">[raw json]</span>')
  var jsonContent = $('<pre class="raw-json-content hidden"></pre>')
  jsonContent.text(JSON.stringify(doss, null, 2))
  
  jsonToggle.click(function() {
    jsonContent.toggleClass('hidden')
    jsonToggle.text(jsonContent.hasClass('hidden') ? '[raw json]' : '[hide json]')
  })
  
  div.append(jsonToggle)
  div.append(jsonContent)
  
  return div
}

// ---------------------------------- 80chars --------------------------------->
