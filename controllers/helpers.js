FileDebug = require('debug')("File")
AreYouSureDebug = require("debug")("Are-You-Sure")

FS = require("fs")
Jimp = require("jimp")

// Get UUID
function getUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    })
}

function serverMessage(res, message) {
    if (message === undefined || typeof message != "string" || message.length == 0) {
        console.log("-- helpers.js serverMessage message parameter is undefined or is not a string: %O", message)
        res.render("other/error500")
        return
    }
    res.render("other/serverMessage", {
        message: message
    })
}

module.exports = {
    getUUID: function() {
        return getUUID()
    },
    sendEmailMessage: function(to, subject, html) {
        const msg = {
            to: to,
            from: "team@early-years.com", // Use the email address or domain you verified above
            subject: subject,
            html: html,
        }
        /*sendgrid.send(msg).then(() => {}, error => {
            console.error(error);
            if (error.response) {
              console.error(error.response.body)
            }
        })*/
    },
    pageNotFound: function(req, res) {
        res.render("other/error404")
    },
    internalServerError: function(req, res) {
        res.render("other/error500")
    },
    serverMessage: function(res, message) {
        serverMessage(res, message)
    },
    areYouSure: function(req, res, next) {
        if (req.query.deleteConfirmation == "true") {
            return next()
        }
        res.render("other/areYouSure", {
            path: req._parsedOriginalUrl.path + "&deleteConfirmation=true"
        })
    }
}
