//mongoose model
const User = require("../models/user")

module.exports.renderRegisterForm = (req, res) => {
  res.render("users/register")
}

module.exports.registerUser = async (req, res, next) => {
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
}

module.exports.renderLoginForm = (req, res) => {
  res.render("users/login")
}

module.exports.login = (req, res) => {
  req.flash('success', 'welcome back')
  //console.log('route user while authentication', req.user)
  const redirectUrl = req.session.returnTo || '/campgrounds'
  delete req.session.returnTo
  res.redirect(redirectUrl)
}

module.exports.logout = (req, res) => {
  req.logOut()
  req.flash('success', 'Goodbye')
  res.redirect('/')
}