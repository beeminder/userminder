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
      document.getElementById("email_span").innerHTML = seemail
    }
  } else {
    console.log("ERROR2: Probably the Chrome extension that's supposed to let "
                + "us monitor the clipboard isn't working?")
  }
  
  $.getJSON(
    "/dossier", {
      email: seemail,
      token: $("#token").val(), // document.getElementById('token').value
    },
    function(data) {
      console.log("ADDING DOSSIER: ", data)
      //users.push(data[0]) #SCHDEL
      seen[data[0]] = true
      $("#userinfo").append(formatDossier(data[0]))
      console.log(seen)
    })
}

// Take a string and return the first email address you find in it
function extract_email(s) {
  if (typeof(s) !== "string") {
    console.log("ERROR3: extract_email(" + s + ")")
    return ''
  }
  var erx = // eg a@b.c or a+b@c-d.e or even +-@x.co or _@.a or +@-b
    /[\w\-\.\_\+]+\@[\w\-\.\_]+[a-zA-Z]/
  var matches = s.match(erx)
  return matches === null ? '' : matches[0]
}

// This is what runs when the page loads.
$(function() {  
  //$("#email").change(function(e) { $("form.raplet").submit() }) #SCHDEL
  
  $("form.raplet").submit(function(e) {
    e.preventDefault() // do we need this?
    setInterval(cbmonitor, 1000)
  })
})

function formatDossier(doss) {
  var div = $("<div></div>")
  if (doss.username === undefined) {
    div.append("<h2>"+doss.email_given+"</h2>")
  } else {
    var bkg = doss.subscription ? "vip" : doss.is_payer ? "prio2" : "prio3"
    div.addClass(bkg)
    div.append("<a><h2></h2></a>")
    div.find("h2").text(doss.username)
    div.find("a").attr("href", "https://www.beeminder.com/"+doss.username)
    div.append("<span>"+doss.subscription+"</span>")
    div.append("<span>$"+doss.pledged+"</span>")
    div.append("<span>since "+doss.since+"</span>")
  }
  return div
}

// ---------------------------------- 80chars --------------------------------->
