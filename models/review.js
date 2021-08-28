const mongoose = require("mongoose")
const Schema = mongoose.Schema
const Model = mongoose.model
const id = Schema.Types.ObjectId

const reviewSchema = new Schema({
  body: String,
  rating: Number,
  author: {
    type: id,
    ref: 'User'
  }
})

const Review = new Model("Review", reviewSchema)

module.exports = Review