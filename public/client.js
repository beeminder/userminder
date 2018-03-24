// ---------------------------------- 80chars --------------------------------->

$(function() {
  if (document.execCommand("paste")) {
    console.log("pasted! yay!")
  } else {
    console.log("could not paste. boo!")
  }
  // Simple in-memory store
  const users = [];
  
  $("form.raplet").submit(function(e){
    e.preventDefault()
    $.getJSON(
      "/dossier", {
        email: $("#email").val(),
        token: $("#token").val(),
      },
      function(data) {
        console.log(data)
        users.push(data[0])
        $("#userinfo").append(formatDossier(data[0]))
        console.log(users);
      })
  
    // ok, this works whenever the submit button is pressed.
    // it lets us get the clipboard contents as a string.
    var clipboard = ''
    var textarea = document.getElementById("visible_textarea")
    textarea.value = ''
    textarea.focus()
    if (document.execCommand("paste")) {
      clipboard = textarea.value
    } else {
      clipboard = 'ERROR23' // if we see this then probably the Chrome extension
                            // that's supposed to let us monitor the clipboard
                            // isn't working.
    }
    document.getElementById("clipboard").textContent = clipboard

  })
})

function formatDossier(doss) {
  var div = $("<div></div>")
  if (doss.username === undefined) {
    div.append("<h2>"+doss.email_given+"</h2>")
  } else {
    var bkg = doss.subscription ? "vip" : doss.is_payer ? "prio2" : "prio3"
    div.addClass(bkg)
    div.append("<a><h2></h2></a><span class='subs'></span>")
    div.find("h2").text(doss.username)
    div.find("a").attr("href", "https://www.beeminder.com/"+doss.username)
    div.append("<span>"+find(".subs").textdoss.subscription)
  }
  return div
}
