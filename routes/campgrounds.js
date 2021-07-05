const express = require('express')
const router = express.Router()

// error handling
const appError = require("../utils/ExpressError")
const catchAsync = require("../utils/catchAsync")

// mongoose models
const Campground = require("../models/campground")
const Review = require("../models/review")

//joi
const { campgroundSchema, reviewSchema } = require("../validationSchemas.js")

// all campgrounds
router.get("/", catchAsync(async (req, res, next) => {
  const campgrounds = await Campground.find({})
  res.render("campgrounds/index", { campgrounds })
}))

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

// create campground form
router.get("/new", (req, res) => {
  res.render("campgrounds/new")
})

// show details of one campground
router.get("/:id", catchAsync(async (req, res) => {
  const id = req.params.id
  const campground = await Campground.findById(id).populate("reviews") //key to populate
  if (!campground) {
    req.flash('error', 'Cannot find the campground')
    return res.redirect("/campgrounds")
  }
  res.render("campgrounds/show", { campground })
}))

// edit campground
router.get("/:id/edit", catchAsync(async (req, res) => {
  const id = req.params.id
  const campground = await Campground.findById(id)
  if (!campground) {
    req.flash('error', 'Cannot find the campground')
    return res.redirect("/campgrounds")
  }
  req.flash('success', 'You have updated a campground')
  res.render("campgrounds/edit", { campground })
}))

// valitation middleware
router.post("/", validateCampground, catchAsync(async (req, res, next) => {
  console.log("POST ENVIADO")
  const campground = new Campground(req.body.campground)
  await campground.save()
  // create flash message
  res.redirect(`/campgrounds/${campground._id}`)
}))

// valitation middleware
router.put("/:id", validateCampground, catchAsync(async (req, res, next) => {
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
router.delete("/:id", catchAsync(async (req, res) => {
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