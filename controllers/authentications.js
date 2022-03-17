// Models
UserModel = require("../models/user")
RegionModel = require("../models/region")
GenderModel = require("../models/gender")
AuthenticationCodeModel = require("../models/oneTimeAuthenticationCode")

// User Login
Passport = require("passport")
LocalStrategy = require('passport-local').Strategy

// Other
Helpers = require("./helpers")
ServerDebug = require("../serverDebug")

// Debug
SignupClientDebug = require("debug")("Signup-Client")
LoginClientDebug = require("debug")("Login-Client")
SignupCreatorDebug = require("debug")("Signup-Creator")
LoginCreatorDebug = require("debug")("Login-Creator")
SignupAgencyDebug = require("debug")("Signup-Agency")
LoginAgencyDebug = require("debug")("Login-Agency")

module.exports = {
    configure: function(app) {
        app.use(require('express-session')({
            secret: 'This is a really big secret',
            resave: false,
            saveUninitialized: false
        }))
        app.use(Passport.initialize())
        app.use(Passport.session())
        Passport.use(new LocalStrategy(UserModel.authenticate()))
        Passport.serializeUser(UserModel.serializeUser())
        Passport.deserializeUser(UserModel.deserializeUser())
    },
    getClientSignUpView: function(req, res) {
        authenticationCode = req.query.authenticationCode
        if (authenticationCode === undefined || typeof authenticationCode != "string" || authenticationCode.length == 0) {
            SignupClientDebug("-- Authentication code is undefined")
            Helpers.serverMessage(res, "Authentication Code not provided")
            return
        }
        SignupClientDebug("Authentication Code: %O", authenticationCode)
        AuthenticationCodeModel.findOne({
            code: authenticationCode
        }, function(err, authenticationCode) {
            if (err) {
                console.log("-- error finding authenticationCode in getSignUpView in clientPortal controller: %O", err)
                Helpers.serverMessage(res, "Error finding authenticationCode: " + err)
            } else if (authenticationCode) {
                SignupClientDebug("Found AuthenticationCodeModel: %O", authenticationCode)
                res.render("clientPortal/signup", {
                    authenticationCode: authenticationCode.code
                })
            } else {
                Helpers.serverMessage(res, "Authentication Code Not Valid or Already Used")
            }
        })
    },
    clientSignup: function(req, res) {
        var username = req.body.username
        var password = req.body.password
        var email = req.body.email
        var companyName = req.body.companyName
        var authenticationCode = req.body.authenticationCode
        var rememberMe = req.body.rememberMe

        SignupClientDebug("Username:           %O", username)
        SignupClientDebug("Password:           %O", password)
        SignupClientDebug("Email:              %O", email)
        SignupClientDebug("Company Name:       %O", companyName)
        SignupClientDebug("AuthenticationCode: %O", authenticationCode)
        SignupClientDebug("RememberMe:         %O", rememberMe)

        if (username === undefined || typeof username != 'string' || username.length == 0) {
            SignupClientDebug("-- Username not provided")
            Helpers.serverMessage(res, "Username not provided", "/clientPortal/signup")
            return
        }

        if (password === undefined || typeof password != "string" || password.length == 0) {
            SignupClientDebug("-- Password not provided")
            Helpers.serverMessage(res, "Password not provided", "/clientPortal/signup")
            return
        }

        if (email === undefined || typeof email != "string" || email.length == 0) {
            SignupClientDebug("-- Email not provided")
            Helpers.serverMessage(res, "Email not provided", "/clientPortal/signup")
            return
        }

        if (companyName === undefined || typeof companyName != "string" || companyName.length == 0) {
            SignupClientDebug("-- Company Name Not Provided")
            Helpers.serverMessage(res, "Company Name not provided")
            return
        }

        if (authenticationCode === undefined || typeof authenticationCode != 'string' || authenticationCode.length == 0) {
            SignupClientDebug("-- Authentication Code")
            Helpers.serverMessage(res, "Authentication code not provided")
            return
        }
        UserModel.findOne({
            username: username
        }, function(err, foundUser) {
            if (err) {
                console.log("-- Error finding clinetmodel in signupClient")
                Helpers.serverMessage(res, "Error checking your username", "/clientPortal/signup")
            } else if (foundUser) {
                Helpers.serverMessage(res, "Username selected already exists", "/clientPortal/signup")
            } else {
                AuthenticationCodeModel.findOne({
                    code: authenticationCode
                }, function(err, authenticationCodeModel) {
                    if (err) {
                        console.log("-- Error finding authenticationCode in signupClient: %O", err)
                        Helpers.serverMessage(res, "Error finding authenticationCode: " + err, "/clientPortal/signup")
                    } else if (authenticationCodeModel) {
                        AuthenticationCodeModel.deleteOne({
                            _id: authenticationCodeModel._id
                        }, function(err) {
                            if (err) {
                                console.log("-- Error deleting authenticationCode: %O", err)
                                Helpers.serverMessage(res, "Error deleting authenticationCode: " + err, "/clientPortal/signup")
                                return
                            }
                            UserModel.register(new UserModel({
                                username: username,
                                email: email,
                                role: 1,
                                companyName: companyName
                            }), password, function(err, user) {
                                if (err) {
                                    Helpers.serverMessage(res, "Error creating client: " + err, "/clientPortal/signup")
                                    console.log()
                                    return
                                }
                                SignupClientDebug("Registered New Client User: %O", user)
                                Passport.authenticate('local')(req, res, function() {
                                    if (rememberMe) {
                                        SignupClientDebug("User Will Be Remembered")
                                        req.session.cookie.maxAge = 7 * 24 * 60 * 60 * 1000;
                                    } else {
                                        SignupClientDebug("User Will Be FORGOTTED AFTER SESSION")
                                        req.session.cookie.expires = false;
                                    }
                                    res.redirect('/clientPortal/campaigns')
                                })
                            })
                        })
                    } else {
                        Helpers.serverMessage(res, "Invalid Authentication Code", "/clientPortal/signup")
                        SignupClientDebug("-- Invalid authenticationCode")
                    }
                })
            }
        })
    },
    getClientLoginView: function(req, res) {
        res.render("clientPortal/login")
    },
    clientLogin: function(req, res) {
        var username = req.body.username
        var password = req.body.password
        var rememberMe = req.body.rememberMe

        LoginClientDebug("Username: %O", username)
        LoginClientDebug("Password: %O", password)
        LoginClientDebug("RememberME: %O", rememberMe)

        if (username === undefined || typeof username != "string" || username.length == 0) {
            Helpers.serverMessage(res, "Username not provided")
            LoginClientDebug("-- Username not provided")
            return
        }

        if (password === undefined || typeof password != "string" || password.length == 0) {
            Helpers.serverMessage(res, "Password not provided")
            LoginClientDebug("-- Password not provided")
            return
        }
        Passport.authenticate('local', function(err, user, info) {
            if (err) {
                console.log("-- Error authenticating in Passport.autenticate in clientLogin: %O", err)
                Helpers.serverMessage(res, "Error login into the client portal: " + err)
                return
            }
            if (!user) {
                Helpers.serverMessage(res, "Incorrect Login Info")
                LoginClientDebug("User is nil. Perhaps bad login info")
                return
            }
            if (user.role != 1) {
                Helpers.serverMessage(res, "You have the wrong login portal. You tried to login via the client portal")
                return
            }
            req.logIn(user, function(err) {
                if (err) {
                    console.log("-- Error req.login user in clientLogin: %O", err)
                    return
                }
                if (rememberMe) {
                    LoginClientDebug("User Will Be Remembered")
                    req.session.cookie.maxAge = 7 * 24 * 60 * 60 * 1000;
                } else {
                    LoginClientDebug("User Will Be FORGOTTED AFTER SESSION")
                    req.session.cookie.expires = false;
                }
                return res.redirect('/clientPortal/campaigns')
            })
        })(req, res);
    },
    clientForgotPassword: function(req, res) {
        res.render("clientPortal/forgotPassword")
    },
    clientSendResetPasswordLink: function(req, res) {
        res.send("Give me reset link")
    },
    clientResetPassword: function(req, res) {
        res.render("clientPortal/resetPassword")
    },
    clientResetUserPassword: function(req, res) {
        res.send("Reset my password")
    },
    isClientLoggedIn: function(req, res, next) {
        if (ServerDebug.getRequireAdminLogin() == false) {
            return next()
        }
        if (req.isAuthenticated()) {
            if (!req.user) {
                res.redirect("/authentication/client-login")
                return
            } else if (req.user.role != 1) {
                res.redirect("/authentication/client-login")
                return
            }
            return next()
        }
        res.redirect("/authentication/client-login")
    },
    logoutClient: function(req, res) {
        req.logout()
        res.redirect("/authentication/client-login")
    },
    // Creators
    getCreatorSignUpView: function(req, res) {
        authenticationCode = req.query.authenticationCode
        if (authenticationCode === undefined || typeof authenticationCode != "string" || authenticationCode.length == 0) {
            SignupCreatorDebug("-- Authentication code is undefined")
            Helpers.serverMessage(res, "Authentication Code not provided")
            return
        }
        SignupCreatorDebug("Authentication Code: %O", authenticationCode)
        AuthenticationCodeModel.findOne({
            code: authenticationCode
        }, function(err, authenticationCode) {
            if (err) {
                console.log("-- error finding authenticationCode in getSignUpView in clientPortal controller: %O", err)
                Helpers.serverMessage(res, "Error finding authenticationCode: " + err)
            } else if (authenticationCode) {
                SignupCreatorDebug("Found AuthenticationCodeModel: %O", authenticationCode)
                res.render("creatorPortal/signup", {
                    authenticationCode: authenticationCode.code
                })
            } else {
                Helpers.serverMessage(res, "Authentication Code Not Valid or Already Used")
            }
        })
    },
    creatorSignup: function(req, res) {
        var username = req.body.username
        var password = req.body.password
        var email = req.body.email
        var authenticationCode = req.body.authenticationCode
        var rememberMe = req.body.rememberMe

        SignupCreatorDebug("Username:           %O", username)
        SignupCreatorDebug("Password:           %O", password)
        SignupCreatorDebug("Email:              %O", email)
        SignupCreatorDebug("AuthenticationCode: %O", authenticationCode)
        SignupCreatorDebug("RememberMe:         %O", rememberMe)

        if (username === undefined || typeof username != 'string' || username.length == 0) {
            SignupCreatorDebug("-- Username not provided")
            Helpers.serverMessage(res, "Username not provided", "/clientPortal/signup")
            return
        }

        if (password === undefined || typeof password != "string" || password.length == 0) {
            SignupCreatorDebug("-- Password not provided")
            Helpers.serverMessage(res, "Password not provided", "/clientPortal/signup")
            return
        }

        if (email === undefined || typeof email != "string" || email.length == 0) {
            SignupCreatorDebug("-- Email not provided")
            Helpers.serverMessage(res, "Email not provided", "/clientPortal/signup")
            return
        }

        if (authenticationCode === undefined || typeof authenticationCode != 'string' || authenticationCode.length == 0) {
            SignupCreatorDebug("-- Authentication Code")
            Helpers.serverMessage(res, "Authentication code not provided")
            return
        }
        UserModel.findOne({
            $or: [{ username: username }, { email: email.toLowerCase() }]
        }, function(err, foundUser) {
            if (err) {
                console.log("-- Error finding clinetmodel in signupCreator")
                Helpers.serverMessage(res, "Error checking your username", "/clientPortal/signup")
            } else if (foundUser) {
                Helpers.serverMessage(res, "Username or email already used by another user")
            } else {
                AuthenticationCodeModel.findOne({
                    code: authenticationCode
                }, function(err, authenticationCodeModel) {
                    if (err) {
                        console.log("-- Error finding authenticationCode in signupCreator: %O", err)
                        Helpers.serverMessage(res, "Error finding authenticationCode: " + err)
                    } else if (authenticationCodeModel) {
                        AuthenticationCodeModel.deleteOne({
                            _id: authenticationCodeModel._id
                        }, function(err) {
                            if (err) {
                                console.log("-- Error deleting authenticationCode in signupCreator: %O", err)
                                Helpers.serverMessage(res, "Error deleting authenticationCode: " + err)
                                return
                            }
                            UserModel.register(new UserModel({
                                username: username,
                                email: email.toLowerCase(),
                                profileFilledOut: false,
                                emailVerified: false,
                                role: 2
                            }), password, function(err, user) {
                                if (err) {
                                    Helpers.serverMessage(res, "Error creating creator: " + err)
                                    console.log()
                                    return
                                }
                                SignupCreatorDebug("Registered New Creator User: %O", user)
                                Passport.authenticate('local')(req, res, function() {
                                    if (rememberMe) {
                                        SignupCreatorDebug("User Will Be Remembered")
                                        req.session.cookie.maxAge = 7 * 24 * 60 * 60 * 1000;
                                    } else {
                                        SignupCreatorDebug("User Will Be FORGOTTED AFTER SESSION")
                                        req.session.cookie.expires = false;
                                    }
                                    res.redirect('/creator/campaigns?filter=active')
                                })
                            })
                        })
                    } else {
                        Helpers.serverMessage(res, "Invalid Authentication Code")
                        SignupCreatorDebug("-- Invalid authenticationCode")
                    }
                })
            }
        })
    },
    getCreatorLoginView: function(req, res) {
        res.render("creatorPortal/login")
    },
    creatorLogin: function(req, res) {
        var username = req.body.username
        var email = req.body.email
        var password = req.body.password
        var rememberMe = req.body.rememberMe

        LoginCreatorDebug("Username: %O", username)
        LoginCreatorDebug("Password: %O", password)
        LoginCreatorDebug("RememberME: %O", rememberMe)

        if (password === undefined || typeof password != "string" || password.length == 0) {
            Helpers.serverMessage(res, "Password not provided")
            LoginCreatorDebug("-- Password not provided")
            return
        }

        var usernameNull = false
        var emailNull = false

        if ((username === undefined || typeof username != "string" || username.length == 0)) {
            usernameNull = true
        }

        if (email === undefined || typeof email != "string" || email.length == 0) {
            emailNull = true
        } else {
            email = email.toLowerCase()
        }

        if (usernameNull == true && emailNull == true) {
            Helpers.serverMessage(res, "Username or Email not provided")
            return
        } else if (usernameNull == true && emailNull == false) {
            username = email
            req.body.username = email
        }
        Passport.authenticate('local', function(err, user, info) {
            if (err) {
                console.log("-- Error authenticating in Passport.autenticate in clientLogin: %O", err)
                Helpers.serverMessage(res, "Error login into the client portal: " + err)
                return
            }
            if (!user) {
                Helpers.serverMessage(res, "Incorrect Login Info")
                LoginCreatorDebug("User is nil. Perhaps bad login info")
                return
            }
            if (user.role != 2) {
                Helpers.serverMessage(res, "You have the wrong login portal. You tried to login via the creator portal")
                return
            }
            req.logIn(user, function(err) {
                if (err) {
                    console.log("-- Error req.login user in clientLogin: %O", err)
                    return
                }
                if (rememberMe) {
                    LoginCreatorDebug("User Will Be Remembered")
                    req.session.cookie.maxAge = 7 * 24 * 60 * 60 * 1000;
                } else {
                    LoginCreatorDebug("User Will Be FORGOTTED AFTER SESSION")
                    req.session.cookie.expires = false;
                }
                return res.redirect('/creator/campaigns?filter=active')
            })
        })(req, res)
    },
    creatorForgotPassword: function(req, res) {
        res.render("creatorPortal/forgotPassword")
    },
    creatorSendResetPasswordLink: function(req, res) {
        var email = req.body.email

        if (email === undefined || typeof email != "string" || email.length == 0) {
            Helpers.serverMessage(res, "Email not provided")
            return
        }
        var code = new AuthenticationCodeModel({
            code: Helpers.getUUID(),
            dateCreated: new Date()
        })
        code.save(function(err, savedModel) {
            if (err) {
                console.log("-- Error saving code in creatorSendResetPasswordLink in authentications Controller.js: %O", err)
                Helpers.serverMessage(res, "Error saving auth code: " + err)
                return
            }
            UserModel.findOne({
                email: email.toLowerCase()
            }, function(err, user) {
                if (err) {
                    console.log("-- Error finding user model in creatorSendResetPasswordLink in authenticaion controller: %O", err)
                    Helpers.serverMessage(res, "Error finding user: " + err)
                } else if (user) {
                    var route = req.headers.origin + "/authentication/creator-reset-password?username=" + user.username + "&authenticationCode=" + code.code
                    Helpers.sendEmailMessage(email.toLowerCase(), "Reset your password", "Hey " + user.name + ", it looks like your forgot your password. <a href=\"" + route + "\">Reset Password</a>")
                    Helpers.serverMessage(res, "Check your email")
                } else {
                    Helpers.serverMessage(res, "No user was found with email: " + email)
                }
            })
        })
    },
    creatorResetPassword: function(req, res) {
        var username = req.query.username
        var code = req.query.authenticationCode

        if (username === undefined || typeof username != "string" || username.length == 0) {
            Helpers.serverMessage(res, "Username not provided")
            return
        }

        if (code === undefined || typeof code != "string" || code.length == 0) {
            Helpers.serverMessage(res, "Code not provided")
            return
        }

        AuthenticationCodeModel.findOne({
            code: code
        }, function(err, authenticationCode) {
            if (err) {
                console.log("-- Error finding authentication code in creatorResetPassword is authetnications: %O", err)
                Helpers.serverMessage(res, "Error finding authentication code: " + err)
            } else if (authenticationCode) {
                UserModel.findOne({
                    username: username
                }, function(userErr, user) {
                    if (userErr) {
                        console.log("-- Error finding user model in creatorResetPassword in authentications controllers: %O", userErr)
                        Helpers.serverMessage(res, "Error finding user: " + userErr)
                    } else if (user) {
                        res.render("creatorPortal/resetPassword", {
                            username: user.username,
                            authenticationCode: authenticationCode.code
                        })
                    } else {
                        Helpers.serverMessage(res, "User not found. It might have just been deleted")
                    }
                })
            } else {
                Helpers.serverMessage(res, "Invalid link")
            }
        })
    },
    creatorResetUserPassword: function(req, res) {
        var username = req.body.username
        var code = req.body.authenticationCode
        var password = req.body.password

        if (username === undefined || typeof username != "string" || username.length == 0) {
            Helpers.serverMessage(res, "Username not provided")
            return
        }

        if (code === undefined || typeof code != "string" || code.length == 0) {
            Helpers.serverMessage(res, "Code not provided")
            return
        }

        if (password === undefined || typeof password != "string" || password.length == 0) {
            Helpers.serverMessage(res, "Password not provided")
            return
        }

        AuthenticationCodeModel.findOne({
            code: code
        }, function(err, authenticationCode) {
            if (err) {
                console.log("-- Error finding authentication code in creatorResetUserPassword is authentications controller: %O", err)
                Helpers.serverMessage(res, "Error finding authentication code: " + err)
            } else if (authenticationCode) {
                UserModel.findOne({
                    username: username
                }, function(userErr, user) {
                    if (userErr) {
                        console.log("-- Error finding user model in creatorResetUserPassword in authentications controllers: %O", userErr)
                        Helpers.serverMessage(res, "Error finding user: " + userErr)
                    } else if (user) {
                        user.setPassword(password, function(setPasswordErr, newUserModel, passwordErr) {
                            if (setPasswordErr) {
                                console.log("-- Error setPasswordErr in creatorResetUserPassword in authentications: %O", setPasswordErr)
                            }
                            if (passwordErr) {
                                console.log("-- Error passwordErr in creatorResetUserPassword in authetnications: %O", passwordErr)
                            }
                            newUserModel.save(function(saveUserErr) {
                                if (saveUserErr) {
                                    console.log("-- Error saving user in creatorResetUserPassword in authentications controller: %O", saveUserErr)
                                    Helpers.serverMessage(res, "Error saving new password: " + saveUserErr)
                                    return
                                }
                                res.redirect("/authentication/creator-login")
                            })
                            AuthenticationCodeModel.deleteMany({
                                code: code
                            }, function(deleteCodeError) {
                                if (deleteCodeError) {
                                    console.log("-- Delete Code Error in creatorResetUserPassword in authentications controller: %O", deleteCodeError)
                                }
                            })
                        })
                    } else {
                        Helpers.serverMessage(res, "User not found. It might have just been deleted")
                    }
                })
            } else {
                Helpers.serverMessage(res, "Link Already Used")
            }
        })

    },
    isCreatorLoggedIn: function(req, res, next) {
        if (ServerDebug.getRequireAdminLogin() == false) {
            return next()
        }
        if (req.isAuthenticated()) {
            if (!req.user) {
                res.redirect("/authentication/creator-login")
                return
            } else if (req.user.role != 2) {
                res.redirect("/authentication/creator-login")
                return
            } else {
                var shouldConfigureUser = false
                if (req.user.name === undefined || typeof req.user.name != "string" || req.user.name.length == 0) {
                    shouldConfigureUser = true
                }
                if (req.user.genderID === undefined || typeof req.user.genderID != "string" || req.user.genderID.length == 0) {
                    shouldConfigureUser = true
                }
                if (req.user.profileFilledOut == false) {
                    shouldConfigureUser = true
                }
                if (req.user.regionID === undefined || typeof req.user.regionID != "string" || req.user.regionID.length == 0) {
                    shouldConfigureUser = true
                }
                if (req.user.age === undefined || typeof req.user.age != "number") {
                    shouldConfigureUser = true
                }

                if (req.user.phoneNumber === undefined || typeof req.user.phoneNumber != "string" || req.user.phoneNumber.length == 0) {
                    shouldConfigureUser = true
                }
                if (shouldConfigureUser) {
                    RegionModel.find({}, function(err, regions) {
                        if (err) {
                            console.log("-- Error finding regions in configureCreatorAfterSignup in creatorPortal controller: %O", err)
                            Helpers.serverMessage(res, "Error finding regions: " + err)
                            return
                        }
                        GenderModel.find({}, function(err, genders) {
                            if (err) {
                                console.log("-- Error finding gender after configureCreatorAfterSignup in creatorPortal controller: %O", err)
                                Helpers.serverMessage(res, "Error finding genders: " + err)
                                return
                            }
                            if (regions.length == 0) {
                                Helpers.serverMessage(res, "There are no regions. Please contact agency and tell them to create some regions")
                            } else if (genders.length == 0) {
                                Helpers.serverMessage(res, "There are no genders. Please contact agency and tell them to create some genders")
                            } else {
                                res.render("creatorPortal/configureCreatorAfterSignup", {
                                    regions: regions,
                                    genders: genders
                                })
                            }
                        })
                    })
                    return
                }
                if (req.user.emailVerified == false && ServerDebug.emailValidationRequired()) {
                    res.render("creatorPortal/verifyEmail", {
                        username: req.user.username,
                        email: req.user.email.toLowerCase()
                    })
                    return
                }
            }
            return next()
        }
        res.redirect("/authentication/creator-login")
    },
    logoutCreator: function(req, res) {
        req.logout()
        res.redirect("/authentication/creator-login")
    },
    // Agency
    getAgencyLoginView: function(req, res) {
        res.render("agencyPortal/login")
    },
    getAgencySignUpView: function(req, res) {
        res.render("agencyPortal/signup", {
            authenticationCode: '1111'
        })
        //authenticationCode only for test
    },
    agencyForgotPasswordView: function(req, res) {
        res.render("agencyPortal/forgotPassword")
    },
    agencyLogin: function(req, res) {
        var username = req.body.username
        var password = req.body.password
        var rememberMe = req.body.rememberMe

        LoginAgencyDebug("Username: %O", username)
        LoginAgencyDebug("Password: %O", password)
        LoginAgencyDebug("RememberME: %O", rememberMe)

        if (username === undefined || typeof username != "string" || username.length == 0) {
            Helpers.serverMessage(res, "Username not provided")
            LoginAgencyDebug("-- Username not provided")
            return
        }

        if (password === undefined || typeof password != "string" || password.length == 0) {
            Helpers.serverMessage(res, "Password not provided")
            LoginAgencyDebug("-- Password not provided")
            return
        }
        Passport.authenticate('local', function(err, user, info) {
            if (err) {
                console.log("-- Error authenticating in Passport.autenticate in clientLogin: %O", err)
                Helpers.serverMessage(res, "Error login into the agency portal: " + err)
                return
            }
            if (!user) {
                Helpers.serverMessage(res, "Incorrect Login Info")
                LoginAgencyDebug("User is nil. Perhaps bad login info")
                return
            }
            if (user.role != 0) {
                Helpers.serverMessage(res, "You have the wrong login portal. You tried to login via the agency portal")
                return
            }
            req.logIn(user, function(err) {
                if (err) {
                    console.log("-- Error req.login user in agencyLogin: %O", err)
                    return
                }
                if (rememberMe) {
                    LoginAgencyDebug("User Will Be Remembered")
                    req.session.cookie.maxAge = 7 * 24 * 60 * 60 * 1000;
                } else {
                    LoginAgencyDebug("User Will Be FORGOTTED AFTER SESSION")
                    req.session.cookie.expires = false
                }
                return res.redirect('/agency/campaigns?filter=active')
            })
        })(req, res)
    },
    agencySignup: function(req, res) {
        var username = req.body.username
        var password = req.body.password
        var authenticationCode = req.body.authenticationCode
        var rememberMe = req.body.rememberMe
        var email = req.body.email
        var phoneNumber = req.body.phoneNumber
        var name = req.body.name

        SignupAgencyDebug("Username: %O", username)
        SignupAgencyDebug("Password: %O", password)
        SignupAgencyDebug("AuthenticationCode: %O", authenticationCode)

        if (username === undefined || typeof username != "string" || username.length == 0) {
            Helpers.serverMessage(res, "Username not provided")
            SignupAgencyDebug("-- Username not provided")
            return
        }

        if (password === undefined || typeof password != "string" || password.length == 0) {
            Helpers.serverMessage(res, "Password not provided")
            SignupAgencyDebug("-- Password not provided")
            return
        }

        if (email === undefined || typeof email != "string" || email.length == 0) {
            Helpers.serverMessage(res, "Email not provided")
            SignupAgencyDebug("-- Email not provided")
            return
        }

        if (phoneNumber === undefined || typeof phoneNumber != "string" || phoneNumber.length == 0) {
            Helpers.serverMessage(res, "Phone Number not provided")
            SignupAgencyDebug("-- Phone Number not provided")
            return
        }

        if (name === undefined || typeof name != "string" || name.length == 0) {
            Helpers.serverMessage(res, "Name not provided")
            SignupAgencyDebug("-- Name not provided")
            return
        }

        if (authenticationCode === undefined || typeof authenticationCode != "string" || authenticationCode.length == 0) {
            Helpers.serverMessage(res, "Incorrect code")
            SignupAgencyDebug("-- Code Inccorect")
            return
        }

        if (authenticationCode != "txXwKVcfQa") {
            Helpers.serverMessage(res, "Incorrect Code")
            SignupAgencyDebug("-- Code Incorrect")
            return
        }

        UserModel.register(new UserModel({
            username: username,
            role: 0,
            email: email,
            phoneNumber: phoneNumber,
            name: name
        }), password, function(err, user) {
            if (err) {
                Helpers.serverMessage(res, "Error creating creator: " + err)
                return
            }
            SignupAgencyDebug("Registered New Agency User: %O", user)
            Passport.authenticate('local')(req, res, function() {
                if (rememberMe) {
                    SignupAgencyDebug("User Will Be Remembered")
                    req.session.cookie.maxAge = 7 * 24 * 60 * 60 * 1000;
                } else {
                    SignupAgencyDebug("User Will Be FORGOTTED AFTER SESSION")
                    req.session.cookie.expires = false;
                }
                res.redirect('/agencyPortal/campaigns')
            })
        })
    },
    isAgencyLoggedIn: function(req, res, next) {
        if (ServerDebug.getRequireAdminLogin() == false) {
            return next()
        }
        if (req.isAuthenticated()) {
            if (!req.user) {
                res.redirect("/authentication/agency-login")
                return
            } else if (req.user.role != 0) {
                res.redirect("/authentication/agency-login")
                return
            }
            return next()
        }
        res.redirect("/authentication/agency-login")
    },
    agencyLogout: function(req, res) {
        req.logout()
        res.redirect("/authentication/agency-login")
    }
}
