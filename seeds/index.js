const mongoose = require('mongoose');
const Campground = require("../models/campground")
const cities = require("./cities")
const { places, descriptors } = require("./seedHelpers")

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})

const db = mongoose.connection
db.on("error", console.error.bind(console, "connection error:"))
db.once("open", () => {
    console.log("database connected")
})

const sample = (array) => array[Math.floor(Math.random() * array.length)]

const seedsDB = async () => {
    await Campground.deleteMany({})
    for (let i = 0; i < 10; i++) {
        let random1000 = Math.floor(Math.random() * 1000)
        const price = Math.floor(Math.random() * 20) + 10
        const camp = new Campground({
            title: `${sample(places)} ${sample(descriptors)}`,
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            image: "https://source.unsplash.com/collection/190727/480x600",
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsam blanditiis soluta quaerat dolorem, aliquam nam labore recusandae harum deleniti est ipsum omnis modi inventore reprehenderit fugit distinctio, velit officiis voluptate.",
            price
        })
        await camp.save()
    }


}

seedsDB().then(() => {
    mongoose.connection.close()
})