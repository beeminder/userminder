// client-side js
// run by the browser each time your view template is loaded

// by default, you've got jQuery,
// add other scripts at the bottom of index.html
$(function() {
  if (document.execCommand("paste")) {
    console.log("pasted! yay!")
  } else {
    console.log("could not paste. boo!")
  }
  
  $("form#email").submit(function(e){
    e.preventDefault();
    $.getJSON(
      "/dossier", {
        email: $("#email").val(),
        token: $("#token").val()
      },
      function(data) {
        console.log(data)
        $("#userinfo").append(formatDossier(data[0]));
      });
  });
});

function formatDossier(doss) {
  var div = $("<div></div>");
  var bkg = doss.subscription?"vip":doss.is_payer?"prio2":"prio3";
  div.addClass(bkg);
  div.append("<a><h2></h2></a>");
  div.find("h2").text(doss.username);
  div.find("a").attr("href", "https://www.beeminder.com/"+doss.username);
  return div;
}
