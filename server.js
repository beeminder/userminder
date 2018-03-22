// ---------------------------------- 80chars --------------------------------->
var express = require('express')
var app = express()
var https = require('https')
var bodyParser = require('body-parser')
//var request = require('request')

app.use(express.static('public'))
//app.set('trust proxy', 1)
app.use(bodyParser.json())


//app.get("/", function (request, response) {
//  response.sendFile(__dirname + '/views/index.html')
//})


app.get("/dossier", function(req, resp) {
  console.log("GET /dossier")
  console.log(req.query)
  getDossier(req.query.email, req.query.token,
    (userp) => {
      resp.send(JSON.stringify(userp))
    }, 
    (error) => {
      console.log("error in get dossier", error)
    }
  )
})

var listener = app.listen(process.env.PORT, function() {
  console.log('The Userminder app is running on port '+listener.address().port)
})

function getDossier(email, token, success, error) {
  console.log("getDossier helper")
   var options = {
    host: 'www.beeminder.com',
    port: 80,
    path: '/api/private/raplet.json?users[]='+email+"&auth_token="+token,
    method: 'GET',
  }
  var req = https.get(options, function (res) {
    var data = ''
    res.on('data', (chunk) => {
      data = data + chunk
    }).on('end', () => {
      var userd = JSON.parse(data)
      console.log(userd)
      success(userd)
    })
  })
  req.on('error', (e) => {
    console.log('problem with request: ' + e.message)
    error(e.message)
  })
  req.write('')
  req.end()
}
