// ---------------------------------- 80chars --------------------------------->

// Put the contents of the clipboard in the "clipboard" span
function cbmonitor() {
  var textarea = document.getElementById("clipboard")
  textarea.value = ''
  //var current_focus = document.activeElement
  textarea.focus()
  if (document.execCommand("paste")) {
    var email = extract_email(textarea.value)
    if (email) {
      document.getElementById("email").value = email
    }
  } else {
    var contents = 'ERROR23' // if we see this then probably the Chrome extension
                          // that's supposed to let us monitor the clipboard
                          // isn't working.
  }
  //current_focus.focus()
  //document.getElementById("clipboard").textContent = clipboard
//bsoule@gmail.com
}

// Take a string and return the first email address you find in it
function extract_email(s) {
  var matches = s.match(/^.*?([\w\-\.\_\+]+\@[\w\-\.\_]+[^\.])/)
  return matches === null ? '' : matches[1]
}

setInterval(cbmonitor, 1000)

$(function() {
  // Simple in-memory store -- use this to keep track of what email addresses we've already looked up and don't re-add them to the page
  const users = [];
  
  $("#email").change(function(e) {
    $("form.raplet").submit();
  });
  
  $("form.raplet").submit(function(e){
    e.preventDefault()
    $.getJSON(
      "/dossier", {
        email: extract_email($("#email").val()),
        token: $("#token").val(),
      },
      function(data) {
        console.log(data)
        users.push(data[0])
        $("#userinfo").append(formatDossier(data[0]))
        console.log(users);
      })
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
