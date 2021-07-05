const mongoose = require("mongoose")
const Schema = mongoose.Schema
const Model = mongoose.model

const reviewSchema = new Schema({
    body: String,
    rating: Number 
})

const Review = new Model("Review", reviewSchema)

module.exports = Review