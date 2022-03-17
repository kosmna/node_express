var express = require('express')
var bodyParser = require('body-parser')
var fileUpload = require('express-fileupload')
var fs = require('fs')

// App
var app = express()
var server
if (process.env.PORT == "443") {
	const options = {
  		key: fs.readFileSync("/etc/letsencrypt/live/privkey.pem"),
 	 	cert: fs.readFileSync("/etc/letsencrypt/live/fullchain.pem")
	}
	server = require('https').createServer(options, app)
} else {
	server = require('http').createServer(app)
}

// Routes
var homeRoutes  	 	 	 = require("./routes/home")
var detailRoutes  	 	 	 = require("./routes/detail")

// Other
var helpers = require("./controllers/helpers.js")

// Error Handling
process.on('uncaughtException', function(err) {
    console.error(err)
    process.exit(1)
})

// Configure Passport
//authentications.configure(app)

app.use(bodyParser.urlencoded({
    extended: true
}))

app.use(fileUpload())
//app.set("secretKey", "WeLikeDave")

app.set('views', 'public/views/pages')
app.set('view engine', 'ejs')

app.use(express.static('public'))
app.use(express.static('files'))
// app.use('/admin', adminRoutes)

app.use("/home", homeRoutes)
app.use("/detail", detailRoutes)

app.get("/", function(req, res) {
    res.redirect("/home")
})

// Error Handling
app.get('/500', helpers.internalServerError)
app.all('*', helpers.pageNotFound)


server.listen(process.env.PORT || 80, function() {
    console.log("Starting Server")
})
