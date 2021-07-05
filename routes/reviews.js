const express = require('express')
// to read params from index.js
const router = express.Router({ mergeParams: true })

// error handling
const appError = require("../utils/ExpressError")
const catchAsync = require("../utils/catchAsync")

// mongoose models
const Campground = require("../models/campground")
const Review = require("../models/review")

//joi
const { campgroundSchema, reviewSchema } = require("../validationSchemas.js")

const validateCampground = (req, res, next) => {
  console.log("VALIDANDO")
  const { error } = campgroundSchema.validate(req.body)
  if (error) {
    const msg = error.details.map((el) => el.message).join(",")
    throw new appError(400, msg)
  }
  console.log("NEXT")
  next()
}

// ADD REVIEW TO CAMPGROUND
router.post("/", catchAsync(async (req, res) => {
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
router.delete("/:reviewId", catchAsync(async (req, res) => {
  const { id, reviewId } = req.params
  await Campground.findByIdAndUpdate(id, { $pull: { reviews: { reviewId } } })
  await Review.findByIdAndDelete(reviewId)
  req.flash('success', 'You have deleted a review')
  res.redirect(`/campgrounds/${id}`)
}))

module.exports = router