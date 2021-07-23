const express = require("express")
// to read params from index.js
const router = express.Router({ mergeParams: true })

// error handling
const appError = require("../utils/ExpressError")
const catchAsync = require("../utils/catchAsync")

//mongoose model
const User = require("../models/user")

//joi TODO

//middlewares
const { validateCampground } = require('../middleware')
const { isLoggedIn } = require('../middleware')

//passport
const passport = require("passport")
const { required } = require("joi")

//routes
router.get("/register", (req, res) => {
  res.render("users/register")
})

router.post("/register", catchAsync(async (req, res, next) => {
  const { username, password, email } = req.body
  const user = new User({ email, username })
  try {
    const newUser = await User.register(user, password)
    user.login(newUser, err => {
      if (err) return next(err)
      req.flash('success', 'You have updated a campground')
      res.redirect("/campgrounds")
    })
  } catch (e) {
    req.flash("error", e.message)
    res.redirect("/register")
  }
}))

router.get("/login", (req, res) => {
  res.render("users/login")
})

router.post("/login", passport.authenticate('local', { failureFlash: true, failureRedirect: 'login' }), (req, res) => {
  req.flash('success', 'welcome back')
  console.log(req.user)
  const redirectUrl = req.session.returnTo || '/campgrounds'
  delete req.session.returnTo
  res.redirect(redirectUrl)
})

module.exports = router