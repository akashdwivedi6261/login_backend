const router = require("express").Router();
const {signUp, verifyOtp, login, verifyLoginOtp} = require("../Controllers/userController")

router.route("/signup")
.post(signUp)

router.route("/signup/verify")
.post(verifyOtp)

router.route("/login/verify")
.post(verifyLoginOtp)

router.route("/login")
.post(login)

module.exports = router