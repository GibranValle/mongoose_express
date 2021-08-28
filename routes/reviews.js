const express = require('express')
// to read params from index.js
const router = express.Router({ mergeParams: true })

// error handling
const appError = require("../utils/ExpressError")
const catchAsync = require("../utils/catchAsync")

// mongoose models
const Campground = require("../models/campground")
const Review = require("../models/review")

//controller functions
const { addReview, deleteReview } = require('../controller/reviews')

// MIDDLEWARE
// validation middleware
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware')

router.post("/", validateReview, isLoggedIn, catchAsync(addReview))

router.delete("/:reviewId", isLoggedIn, isReviewAuthor, catchAsync(deleteReview))

module.exports = router