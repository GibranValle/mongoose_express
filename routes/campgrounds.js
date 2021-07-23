const express = require('express')
const router = express.Router()

// error handling
const appError = require("../utils/ExpressError")
const catchAsync = require("../utils/catchAsync")

// mongoose models
const Campground = require("../models/campground")

// MIDDLEWARE
// valitation middleware JOI
const { isLoggedIn, validateCampground } = require('../middleware')

// all campgrounds
router.get("/", catchAsync(async (req, res, next) => {
  const campgrounds = await Campground.find({})
  res.render("campgrounds/index", { campgrounds })
}))

// create campground form
router.get("/new", isLoggedIn, (req, res) => {
  res.render("campgrounds/new")
})

// show details of one campground
router.get("/:id", isLoggedIn, catchAsync(async (req, res) => {
  const id = req.params.id
  const campground = await Campground.findById(id).populate("reviews").populate('author')
  if (!campground) {
    req.flash('error', 'Cannot find the campground')
    return res.redirect("/campgrounds")
  }
  res.render("campgrounds/show", { campground })
}))

// edit campground form
router.get("/:id/edit", isLoggedIn, catchAsync(async (req, res) => {
  const id = req.params.id
  const campground = await Campground.findById(id)
  if (!campground) {
    req.flash('error', 'Cannot find the campground')
    return res.redirect("/campgrounds")
  }
  res.render("campgrounds/edit", { campground })
}))

// create New campground
router.post("/", validateCampground, catchAsync(async (req, res, next) => {
  const campground = new Campground(req.body.campground)
  campground.author = req.user._id
  await campground.save()
  req.flash('success', 'You have updated a campground')
  res.redirect(`/campgrounds/${campground._id}`)
}))

// edit campground
router.put("/:id", isLoggedIn, catchAsync(async (req, res, next) => {
  const { id } = req.params
  const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground, })
  if (!campground) {
    req.flash('error', 'Cannot find the campground')
    return res.redirect("/campgrounds")
  }
  req.flash('success', 'You have updated a campground')
  res.redirect(`/campgrounds/${campground._id}`)
}))

// delete one campground
router.delete("/:id", isLoggedIn, catchAsync(async (req, res) => {
  const { id } = req.params
  const campground = await Campground.findByIdAndDelete(id)
  if (!campground) {
    req.flash('error', 'Cannot find the campground')
    return res.redirect("/campgrounds")
  }
  req.flash('success', 'You have deleted a campground')
  res.redirect("/campgrounds")
}))

module.exports = router