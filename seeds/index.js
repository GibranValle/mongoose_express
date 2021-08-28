const Campground = require("../models/campground")
const cities = require("./cities")
const { places, descriptors } = require("./seedHelpers")


/* LOCAL MONGOOSE CODE
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
 */


//mongoose atlas
const mongoose = require("mongoose")
const userName = 'admin'
const password = 'admin'
const dbName = 'test'
const mongoAtlasUri =
  `mongodb+srv://${userName}:${password}@cluster0.qkqu4.mongodb.net/${dbName}?retryWrites=true&w=majority`
try {
  // Connect to the MongoDB cluster
  mongoose.connect(
    mongoAtlasUri, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false },
    () => console.log(" Mongoose is connected"),
  );
  mongoose.set('useCreateIndex', true)
} catch (e) {
  console.log("could not connect");
}
const dbConnection = mongoose.connection;
dbConnection.on("error", (err) => console.log(`Connection error ${err}`));
dbConnection.once("open", () => console.log("Connected to DB!"));

const sample = (array) => array[Math.floor(Math.random() * array.length)]

const seedsDB = async () => {
  await Campground.deleteMany({})
  for (let i = 0; i < 10; i++) {
    let random1000 = Math.floor(Math.random() * 1000)
    const price = Math.floor(Math.random() * 20) + 10
    const camp = new Campground({
      author: '60f9e7d88dcf4905485b2b39',
      title: `${sample(places)} ${sample(descriptors)}`,
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      image: "https://source.unsplash.com/collection/190727/480x600",
      description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsam blanditiis soluta quaerat dolorem, aliquam nam labore recusandae harum deleniti est ipsum omnis modi inventore reprehenderit fugit distinctio, velit officiis voluptate.",
      price,
      geometry: {
        type: 'Point',
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude
        ]
      },
      images: [{
          url: 'https://res.cloudinary.com/gibrimagenes/image/upload/v1629600676/yelpCamp/fngods91jiggpdrswadq.jpg',
          filename: 'yelpCamp/fngods91jiggpdrswadq'
        },
        {
          url: 'https://res.cloudinary.com/gibrimagenes/image/upload/v1629174855/yelpCamp/bkvelzsskuzzc4xmf2bo.png',
          filename: 'yelpCamp/bkvelzsskuzzc4xmf2bo'
        },
      ]
    })
    await camp.save()
  }
}

seedsDB().then(() => {
  mongoose.connection.close()
})