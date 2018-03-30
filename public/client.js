// ---------------------------------- 80chars --------------------------------->

var email = '' // global variable with currently extracted email address

// Put the contents of the clipboard in the "clipboard" span
function cbmonitor() {
  var textarea = document.getElementById("clipboard")
  textarea.value = ''
  //var current_focus = document.activeElement // to remember what has focus now
  textarea.focus()
  if (document.execCommand("paste")) {
    email = extract_email(textarea.value)
    if (email) {
      //document.getElementById("email_box").value = email
      document.getElementById("email_span").innerHTML = email
    }
  } else {
    var contents = 'ERROR2' // if we see this then probably the Chrome extension
                            // that's supposed to let us monitor the clipboard
                            // isn't working.
  }
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

$(function() {
  // Simple in-memory store -- use this to keep track of what email addresses
  // we've already looked up and don't re-add them to the page
  const users = []
  
  $("#email").change(function(e) {
    $("form.raplet").submit()
  })
  
  $("form.raplet").submit(function(e){
    e.preventDefault()
    $.getJSON(
      "/dossier", {
        email: extract_email(document.getElementById("email_span").innerHTML),
        token: $("#token").val(),
      },
      function(data) {
        console.log(data)
        users.push(data[0])
        $("#userinfo").append(formatDossier(data[0]))
        console.log(users)
      })
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
