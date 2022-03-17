const production = false
const requireAdminLogin = true
const requireEmailValidation = true

// Debug
RequireLoginDebug = require("debug")("Require-Login")

module.exports = {
    getRequireAdminLogin: function() {
        if (production) {
            RequireLoginDebug("Production == true. returin true")
            return true
        }
        if (process.env.REQUIRE_ADMIN_LOGIN == "false") {
        	return false
        } else if (process.env.REQUIRE_ADMIN_LOGIN == "true") {
        	return true
        }
        return requireAdminLogin
    },
    emailValidationRequired: function() {
        if (production) {
            return true
        }
        if (process.env.EMAIL_VALIDATION_REQUIRED == "no") {
            return false
        } else if (process.env.EMAIL_VALIDATION_REQUIRED == "yes") {
            return true
        }
        return requireEmailValidation
    }
}
