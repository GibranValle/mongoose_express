// error handling
const appError = require("./utils/ExpressError")

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl
    req.flash('error', 'you must be logged in')
    return res.redirect('/login')
  }
  next()
}

module.exports.validateCampground = (req, res, next) => {
  const { campgroundSchema } = require('./validationSchemas')
  const { error } = campgroundSchema.validate(req.body)
  console.log(error)
  if (error) {
    const msg = error.details.map(e => e.message).join(',')
    throw new appError(msg, 400)
  } else {
    next()
  }
}

module.exports.validateReview = (req, res, next) => {
  const { reviewSchema } = require('./validationSchemas')
  const { error } = reviewSchema.validate(req.body)
  console.log(error)
  if (error) {
    const msg = error.details.map(e => e.message).join(',')
    throw new appError(msg, 400)
  } else {
    next()
  }
}