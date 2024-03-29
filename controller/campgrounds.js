//mapbox
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN
const geocoder = mbxGeocoding({ accessToken: MAPBOX_TOKEN })

const Campground = require('../models/campground')
const { cloudinary } = require('../cloudinary')



module.exports.index = async (req, res, next) => {
  const campgrounds = await Campground.find({})
  res.render("campgrounds/index", { campgrounds })
}

module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/new")
}

module.exports.createCampground = async (req, res, next) => {
  const geoData = await geocoder.forwardGeocode({
    query: 'Puebla, Pue',
    limit: 1
  }).send()
  const campground = new Campground(req.body.campground)
  campground.geometry = geoData.body.features[0].geometry
  if (campground.images) {
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
  }
  campground.author = req.user._id
  await campground.save()
  req.flash('success', 'You have updated a campground')
  res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.showCampground = async (req, res) => {
  const id = req.params.id
  // nested population
  const campground = await Campground.findById(id).populate({
    path: "reviews",
    populate: {
      path: 'author'
    }
  }).populate('author')
  if (!campground) {
    req.flash('error', 'Cannot find the campground')
    return res.redirect("/campgrounds")
  }
  res.render("campgrounds/show", { campground })
}

module.exports.renderEditForm = async (req, res) => {
  const id = req.params.id
  const campground = await Campground.findById(id)
  if (!campground) {
    req.flash('error', 'Cannot find the campground')
    return res.redirect("/campgrounds")
  }
  res.render("campgrounds/edit", { campground })
}

module.exports.updateCampground = async (req, res, next) => {
  const { id } = req.params
  const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground, })
  campground.geometry = geoData.body.features[0].geometry
  if (campground.images) {
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.images.push(...images)
  }
  await campground.save()
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename)
    }
    await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
  }
  req.flash('success', 'You have updated a campground')
  res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params
  const campground = await Campground.findByIdAndDelete(id)
  if (!campground) {
    req.flash('error', 'Cannot find the campground')
    return res.redirect("/campgrounds")
  }
  req.flash('success', 'You have deleted a campground')
  res.redirect("/campgrounds")
}