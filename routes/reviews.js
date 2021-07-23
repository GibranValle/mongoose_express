const express = require('express')
// to read params from index.js
const router = express.Router({ mergeParams: true })

// error handling
const appError = require("../utils/ExpressError")
const catchAsync = require("../utils/catchAsync")

// mongoose models
const Campground = require("../models/campground")
const Review = require("../models/review")

// MIDDLEWARE
// validation middleware
const { validateReview, isLoggedIn } = require('../middleware')

// ADD REVIEW TO CAMPGROUND
router.post("/", validateReview, isLoggedIn, catchAsync(async (req, res) => {
  const { id } = req.params
  const campground = await Campground.findById(id)
  const review = new Review(req.body.review)
  campground.reviews.push(review)
  await campground.save()
  await review.save()
  req.flash('success', 'You have created a new review')
  res.redirect(`/campgrounds/${id}`)
}))

// DELETE REVIEW FROM CAMPGROUND
router.delete("/:reviewId", isLoggedIn, catchAsync(async (req, res) => {
  const { id, reviewId } = req.params
  await Campground.findByIdAndUpdate(id, { $pull: { reviews: { reviewId } } })
  await Review.findByIdAndDelete(reviewId)
  req.flash('success', 'You have deleted a review')
  res.redirect(`/campgrounds/${id}`)
}))

module.exports = router