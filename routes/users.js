const express = require("express")
// to read params from index.js
const router = express.Router({ mergeParams: true })

// error handling
const appError = require("../utils/ExpressError")
const catchAsync = require("../utils/catchAsync")

//mongoose model
const User = require("../models/user")

// controller functions
const { renderRegisterForm, renderLoginForm, registerUser, logout, login } = require('../controller/user')

//joi TODO

//middlewares
const { validateCampground, isLoggedIn } = require('../middleware')

//passport
const passport = require("passport")
const { required } = require("joi")

router.route('/register')
  .get(renderRegisterForm)
  .post(catchAsync(registerUser))

router.route('/login', )
  .get(renderLoginForm)
  .post(passport.authenticate('local', { failureFlash: true, failureRedirect: 'login' }), login)

router.get('/logout', logout)

module.exports = router