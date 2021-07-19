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

// error handling
const appError = require("./utils/ExpressError")
const catchAsync = require("./utils/catchAsync")

//joi
const { campgroundSchema, reviewSchema } = require("./validationSchemas.js")

// mongoose models
const Campground = require("./models/campground")
const Review = require("./models/review")

//mongoose
const mongoose = require("mongoose")
const db = mongoose.connection
const userName = 'admin'
const password = 'admin'
const dbName = 'test'
const mongoAtlasUri =
  `mongodb+srv://${userName}:${password}@cluster0.qkqu4.mongodb.net/${dbName}?retryWrites=true&w=majority`
try {
  // Connect to the MongoDB cluster
  mongoose.connect(
    mongoAtlasUri, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: true },
    () => console.log(" Mongoose is connected"),
  );
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

// validation middleware
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

app.listen(3000, () => {
  console.log("LISTENING ON PORT 3000")
})

// session 
const session = require('express-session')
const sessionConfig = {
  secret: "improveSecret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}
app.use(session(sessionConfig))
// flash
const flash = require('connect-flash')
app.use(flash())
//flash middelware
app.use((req, res, next) => {
  // load success message
  res.locals.success = req.flash('success')
  res.locals.error = req.flash('error')
  next()
})

// passport
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require("./models/user")
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

// home page
app.get("/", (req, res) => {
  res.render("home.ejs")
})

//register new user
app.get("/register", async (req, res) => {
  res.render("users/register")
})

app.get("/fakeUser", async (req, res) => {
  const user = new User({ email: "test@test.com", username: "testname" })
  const newUser = await User.register(user, "testpassword")
  res.send(newUser)
})

// public directory static files
app.use(express.static(path.join(__dirname, 'public')));

// router campground
app.use("/campgrounds", campgroundsRouter)
// router reviews
app.use('/campgrounds/:id/reviews', reviewRouter)

app.all("*", (req, res, next) => {
  next(new appError(404, "Page not found"))
})

app.use((err, req, res, next) => {
  const { status = 500, message = "oh no error" } = err
  res.status(status).send(message)
})