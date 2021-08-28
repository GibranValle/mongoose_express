const express = require('express')
const router = express.Router()

// error handling
const appError = require("../utils/ExpressError")
const catchAsync = require("../utils/catchAsync")

// mongoose models
const Campground = require("../models/campground")

// MIDDLEWARE
// valitation middleware JOI
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware')

// controller functions
const {
  index,
  renderNewForm,
  showCampground,
  renderEditForm,
  createCampground,
  updateCampground,
  deleteCampground
} = require('../controller/campgrounds')

// upload image to cloudinary
const multer = require('multer');
const { storage } = require('../cloudinary')
const upload = multer({ storage })

router.route('/')
  // all campgrounds
  .get(catchAsync(index))
  .post(isLoggedIn, upload.array('campground[image]'), validateCampground, catchAsync(createCampground))

router.get("/new", isLoggedIn, renderNewForm)

router.route('/:id')
  .get(catchAsync(showCampground))
  .put(isLoggedIn, isAuthor, upload.array('campground[image]'), catchAsync(updateCampground))
  .delete(isLoggedIn, isAuthor, catchAsync(deleteCampground))

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(renderEditForm))

module.exports = router