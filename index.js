process.env.NODE_ENV = "development"
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

// run mongodb in powershell to initialize DB
// express and ejs
const express = require("express")
const app = express()
// to read from body
const { urlencoded } = require("express")
//get from POST with req.body
app.use(urlencoded({ extended: true }))
// RESTfull delete, updave http verbs
const methodOverride = require("method-override")
app.use(methodOverride("_method"))

// router campground
const campgroundsRouter = require('./routes/campgrounds')
const reviewRouter = require('./routes/reviews')
const userRouter = require("./routes/users")

// error handling
const appError = require("./utils/ExpressError")
const catchAsync = require("./utils/catchAsync")

// mongoose models
const Campground = require("./models/campground")
const Review = require("./models/review")

//mongoose
const mongoose = require("mongoose")
const dbUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/yelp-camp'
try {
  // Connect to the MongoDB cluster
  mongoose.connect(
    dbUrl, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false },
    () => console.log(" Mongoose is connected"),
  );
  mongoose.set('useCreateIndex', true)
} catch (e) {
  console.log("could not connect");
}
const dbConnection = mongoose.connection;
dbConnection.on("error", (err) => console.log(`Connection error ${err}`));
dbConnection.once("open", () => console.log("Connected to DB!"));

// engine
const ejsMate = require("ejs-mate")
app.engine("ejs", ejsMate)

// ejs
const path = require("path")
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs")

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`LISTENING ON PORT ${port}`)
})

// session 
const session = require('express-session')
const secret = process.env.SECRET || "improveSecret"
//mongodbsession
const MongoStore = require('connect-mongo')
const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 3600 // seconds
}).on('error', function(e) {
  console.log('SESSION STORE ERROR', e)
})
// local session
const sessionConfig = {
  secret,
  store,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}
app.use(session(sessionConfig))

// passport
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require("./models/user")
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

// flash
const flash = require('connect-flash')
app.use(flash())

//flash middelware
app.use((req, res, next) => {
  // load success message
  res.locals.user = req.user
  res.locals.success = req.flash('success')
  res.locals.error = req.flash('error')
  next()
})

// home page
app.get("/", (req, res) => {
  res.render("home.ejs")
})

// security 
const mongoSanitize = require('express-mongo-sanitize');
// to replace prohibited characters with _, use:
app.use(
  mongoSanitize({
    replaceWith: '_',
  }),
)
const helmet = require("helmet");
const scriptSrcUrls = [
  "https://www.bootstrapcdn.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
  'https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/css/bootstrap.min.css',
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
];
const connectSrcUrls = [
  "https://api.mapbox.com/",
  "https://a.tiles.mapbox.com/",
  "https://b.tiles.mapbox.com/",
  "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
        "https://images.unsplash.com/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);


// public directory static files
app.use(express.static(path.join(__dirname, 'public')));

// router campground
app.use("/campgrounds", campgroundsRouter)

// router reviews
app.use('/campgrounds/:id/reviews', reviewRouter)

// router users
app.use("/", userRouter)

app.all("*", (req, res, next) => {
  next(new appError(404, "Page not found"))
})

app.use((err, req, res, next) => {
  const { status = 500 } = err
  if (!err.message) err.message = 'Something went wrong'
  res.status(status).render('error', { err })
})