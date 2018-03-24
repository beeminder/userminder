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
  
      // TODO: can we put the cursor in the text area before doing the following?
      if (document.execCommand("paste")) {
        console.log("pasted! yay!")
      } else {
        console.log("could not paste. boo!")
      }

  })
})

function formatDossier(doss) {
  var div = $("<div></div>")
  var bkg = doss.subscription ? "vip" : doss.is_payer ? "prio2" : "prio3"
  div.addClass(bkg)
  div.append("<a><h2></h2></a>")
  div.find("h2").text(doss.username)
  div.find("a").attr("href", "https://www.beeminder.com/"+doss.username)
  return div
}
