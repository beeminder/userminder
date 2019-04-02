const {remote} = require('electron')
const port = remote.getGlobal('port')
// ---------------------------------- 80chars --------------------------------->
// Global variable w/ currently extracted email address (email address we see)
var seemail = '' 

// Simple in-memory store: use this to keep track of what email addresses we've
// already looked up and don't re-add them to the page.
var seen = {}

// Put the contents of the clipboard in the magic "clipboard" span
function cbmonitor() {
  var magic_textarea = document.getElementById("clipboard")
  magic_textarea.value = ''
  //var current_focus = document.activeElement // to remember what has focus now
  magic_textarea.focus()
  if (document.execCommand("paste")) {
    seemail = extract_email(magic_textarea.value)
    if (seemail) {
      //document.getElementById("email_box").value = email
      document.getElementById("email_span").textContent = 
        seemail // + (seen[seemail] ? ' (already fetched!)' : '')
    }
  } else {
    console.log("ERROR2: Probably the Chrome extension that's supposed to let "
                + "us monitor the clipboard isn't working?")
  }
  
  if (seemail !== '' && !seen[seemail]) {
    seen[seemail] = true
    $.getJSON(
      `http://localhost:${port}/dossier`, {
        email: seemail,
        token: document.getElementById('token').value
      },
      function(data) {
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
  var erx = // eg a@b.c or a+b@c-d.e or even +-@x.co or _@.a or +@-b
    /[\w\-\.\_\+]+\@[\w\-\.\_]+[a-zA-Z]/
  var matches = s.match(erx)
  return matches === null ? '' : matches[0]
}

// This is what runs when the page loads
$(function() {  
  // scrap the submit button and just do an onChange() on the token field?
  // although we don't want to do more setInterval()s without stopping old ones
  $("form.raplet").submit(function(e) { // start monitoring when got auth token
    e.preventDefault() // do we need this?
    setInterval(cbmonitor, 1000)
  })
}) 

function formatDossier(doss) {
  var div = $("<div></div>") // would it be safer/clearer to find this by id?
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
