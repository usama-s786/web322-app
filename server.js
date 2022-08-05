/*********************************************************************************
 * WEB322 – Assignment 06
 * I declare that this assignment is my own work in accordance with Seneca Academic Policy.
 * No part of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.
 *
 * Name: Usama Sidat
 * Student ID: 131034217
 * Date: 05/08/2022
 *
 * Online (Heroku) Link: https://stark-wildwood-15403.herokuapp.com/
 *
 ********************************************************************************/

var express = require("express")
var app = express()
var blogService = require("./blog-service")
const multer = require("multer")
const cloudinary = require("cloudinary").v2
const streamifier = require("streamifier");
const exphbs = require("express-handlebars")
const stripJs = require("strip-js")
const authData = require("./auth-service")
const clientSessions = require("client-sessions")

var HTTP_PORT = process.env.PORT || 8080; //http port for my environment

//cloudinary details
cloudinary.config({
  cloud_name: "usamasidat",
  api_key: "854176769438177",
  api_secret: "ajqoPgr6G-GnlFCykF5znnkSsVk",
  secure: true,
})

const upload = multer() // no { storage: storage }

// call this function after the http server starts listening for requests
function onHttpStart() {
  console.log("Express http server listening on port: " + HTTP_PORT)
}

//to load static files
app.use(express.static("public"))

app.use(express.urlencoded({ extended: true }))

//middleware function to setup client-session details
app.use(clientSessions({
  cookieName: "session",
  secret: "a_secret_which_is_web322",
  duration: 2 * 60 * 1000,
  activeDuration: 1000 * 60
}))

//custom middleware to make sure all templates have access to the "session" object
app.use(function (req, res, next) {
  res.locals.session = req.session
  next()
})

//middleware function to check whether the user is logged in or not
function ensureLogin(req, res, next) {
  if (!req.session.user) res.redirect("/login")
  else next()
}

//define template engine for our app
app.engine(
  ".hbs",
  exphbs.engine({
    extname: ".hbs",
    defaultLayout: "main",
    helpers: {
      navLink: function (url, options) {
        return (
          "<li" +
          (url == app.locals.activeRoute ? ' class="active" ' : "") +
          '><a href="' +
          url +
          '">' +
          options.fn(this) +
          "</a></li>"
        )
      },
      equal: function (lvalue, rvalue, options) {
        if (arguments.length < 3)
          throw new Error("Handlebars Helper equal needs 2 parameters")
        if (lvalue != rvalue) {
          return options.inverse(this)
        } else {
          return options.fn(this)
        }
      },
      safeHTML: function (context) {
        return stripJs(context)
      },
      formatDate: function (dateObj) {
        let year = dateObj.getFullYear()
        let month = (dateObj.getMonth() + 1).toString()
        let day = dateObj.getDate().toString()
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      },
    },
  })
)

app.set("view engine", ".hbs")

app.set("views", "./views")

app.use(function (req, res, next) {
  let route = req.path.substring(1)
  app.locals.activeRoute =
    "/" +
    (isNaN(route.split("/")[1])
      ? route.replace(/\/(?!.*)/, "")
      : route.replace(/\/(.*)/, ""))
  app.locals.viewingCategory = req.query.category
  next()
})

// setup a 'route' to listen on the default url path (http://localhost)
app.get("/", (req, res) => {
  res.redirect("/blog")
})

// setup another route to listen on /about
app.get("/about", (req, res) => {
  res.render("about")
})


/* /blog routes */


// setup another get route to listen on /blog
app.get("/blog", async (req, res) => {
  // Declare an object to store properties for the view
  let viewData = {}
  try {
    // declare empty array to hold "post" objects
    let posts = []

    // if there's a "category" query, filter the returned posts by category
    if (req.query.category) {
      // Obtain the published "posts" by category
      posts = await blogService.getPublishedPostsByCategory(req.query.category)
    } else {
      // Obtain the published "posts"
      posts = await blogService.getPublishedPosts()
    }

    // sort the published posts by postDate
    posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate))

    // get the latest post from the front of the list (element 0)
    let post = posts[0]

    // store the "posts" and "post" data in the viewData object (to be passed to the view)
    viewData.posts = posts
    viewData.post = post
  } catch (err) {
    viewData.message = "no results"
  }

  try {
    // Obtain the full list of "categories"
    let categories = await blogService.getCategories()

    // store the "categories" data in the viewData object (to be passed to the view)
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results"
  }

  // render the "blog" view with all of the data (viewData)
  res.render("blog", { data: viewData })
});

// setup another get route to listen on /blog/:id
app.get("/blog/:id", async (req, res) => {
  // Declare an object to store properties for the view
  let viewData = {}

  try {
    // declare empty array to hold "post" objects
    let posts = []

    // if there's a "category" query, filter the returned posts by category
    if (req.query.category) {
      // Obtain the published "posts" by category
      posts = await blogService.getPublishedPostsByCategory(req.query.category)
    } else {
      // Obtain the published "posts"
      posts = await blogService.getPublishedPosts()
    }

    // sort the published posts by postDate
    posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate))

    // store the "posts" and "post" data in the viewData object (to be passed to the view)
    viewData.posts = posts
  } catch (err) {
    viewData.message = "no results"
  }

  try {
    // Obtain the post by "id"
    const posts = await blogService.getPostById(req.params.id)
    viewData.post = posts[0]
  } catch (err) {
    viewData.message = "no results"
  }

  try {
    // Obtain the full list of "categories"
    let categories = await blogService.getCategories()

    // store the "categories" data in the viewData object (to be passed to the view)
    viewData.categories = categories
  } catch (err) {
    viewData.categoriesMessage = "no results"
  }

  // render the "blog" view with all of the data (viewData)
  res.render("blog", { data: viewData })
})


/* /categories routes */


// setup another get route to listen on /categories
app.get("/categories", ensureLogin, (req, res) => {
  blogService
    .getCategories()
    .then((data) => {
      console.log("getCategories displayed.");
      if (data.length > 0)
        res.render("categories", { categories: data })
      else
        res.render("categories", { message: "no results" })
    })
    .catch((err) => {
      console.log("ERROR MESSAGE:", err.message)
      res.render("categories", { message: "no results" })
    })
})

// setup another get route to listen on /categories/add
app.get("/categories/add", ensureLogin, (req, res) => {
  res.render("addCategory")
})

// setup another post route to add category
app.post("/categories/add", ensureLogin, (req, res) => {
  blogService
    .addCategory(req.body)
    .then(() => {
      res.redirect('/categories');
    })
    .catch((err) => {
      console.log("ERROR MESSAGE:", err.message);
    })
})

// setup another get route to delete category by id
app.get("/categories/delete/:id", ensureLogin, (req, res) => {
  blogService
    .deleteCategoryById(req.params.id)
    .then(() => {
      res.redirect('/categories')
    })
    .catch((err) => {
      console.log("Unable to remove category/ Category not found")
      console.log("ERROR MESSAGE:", err.message)
    })
})


/* /post routes */


// setup another get route to listen on /posts
app.get("/posts", ensureLogin, (req, res) => {
  if (req.query.category) {
    blogService
      .getPostByCategory(req.query.category) //get by category
      .then((data) => {
        console.log("getAllPosts by category displayed.")
        if (data.length > 0)
          res.render("posts", { posts: data });
        else
          res.render("posts", { message: "no results" })
      })
      .catch((err) => {
        console.log("ERROR MESSAGE:", err.message);
        res.render("posts", { message: "no results" })
      })
  } else if (req.query.minDate) {
    blogService
      .getPostByMinDate(req.query.minDate) //get by min date
      .then((data) => {
        console.log("getAllPosts by minDate displayed.")
        if (data.length > 0)
          res.render("posts", { posts: data })
        else
          res.render("posts", { message: "no results" })
      })
      .catch((err) => {
        console.log("ERROR MESSAGE:", err.message)
        res.render("posts", { message: "no results" })
      })
  } else {
    blogService
      .getAllPosts() //get all posts
      .then((data) => {
        console.log("getAllPosts displayed.")
        if (data.length > 0)
          res.render("posts", { posts: data })
        else
          res.render("posts", { message: "no results" })
      })
      .catch((err) => {
        console.log("ERROR MESSAGE:", err.message);
        res.render("posts", { message: "no results" })
      })
  }
})

// setup another get route to listen on /posts/add
app.get("/posts/add", ensureLogin, (req, res) => {
  blogService.getCategories()
    .then((data) => {
      res.render("addPost", { categories: data })
    })
    .catch(() => {
      res.render("addPost", { categories: [] })
    })
})

// setup another get route to listen on /post:id
app.get("/post/:id", ensureLogin, (req, res) => {
  blogService
    .getPostById(req.params.id) //get by id
    .then((data) => {
      console.log("getPostById displayed.")
      res.json(data)
    })
    .catch((err) => {
      console.log("ERROR MESSAGE:", err.message)
      res.json(err)
    })
})

// setup another post route to add a post
app.post("/posts/add", ensureLogin, upload.single("featureImage"), (req, res) => {
  let streamUpload = (req) => {
    return new Promise((resolve, reject) => {
      let stream = cloudinary.uploader.upload_stream((error, result) => {
        if (result) {
          resolve(result)
        } else {
          reject(error)
        }
      });

      streamifier.createReadStream(req.file.buffer).pipe(stream)
    })
  }

  async function upload(req) {
    let result = await streamUpload(req)
    console.log(result)
    return result
  }

  upload(req).then((uploaded) => {
    req.body.featureImage = uploaded.url
    //TODO: Process the req.body and add it as a new Blog Post before redirecting to/posts
    blogService
      .addPost(req.body)
      .then((data) => {
        res.redirect('/posts')
      })
      .catch((err) => {
        console.log("ERROR MESSAGE:", err.message)
      })
  })
})

// setup another route to delete post by id
app.get("/posts/delete/:id", ensureLogin, (req, res) => {
  blogService
    .deletePostById(req.params.id)
    .then(() => {
      res.redirect('/posts')
    })
    .catch(() => {
      console.log("Unable to remove post/ Post not found")
    })
})


/* authentication routes */


//another get route for login
app.get("/login", (req, res) => {
  res.render('login')
})

//another get route for register
app.get("/register", (req, res) => {
  res.render('register')
})

//another post route for register
app.post("/register", (req, res) => {
  authData.registerUser(req.body)
    .then(() => {
      res.render('register', {
        successMessage: "User created"
      })
    })
    .catch((err) => {
      res.render('register', {
        errorMessage: err,
        userName: req.body.userName
      })
    })
})

//another post route for login
app.post("/login", (req, res) => {
  req.body.userAgent = req.get('User-Agent')

  authData.checkUser(req.body)
    .then((user) => {
      req.session.user = {
        userName: user.userName,
        email: user.email,
        loginHistory: user.loginHistory
      }
      res.redirect('/posts');
    })
    .catch((err) => {
      res.render('login', {
        errorMessage: err,
        userName: req.body.userName
      })
    })
})

//another get route for logout
app.get('/logout', (req, res) => {
  req.session.reset();
  res.redirect('/login')
})

//another get route for userHistory
app.get('/userHistory', (req, res) => {
  res.render('userHistory')
})

//setup another route to redirect to error page if the link is not correct
app.use((req, res) => {
  res.status(404).render("error");
});

//initialize
console.log("Ready for initialize")
blogService
  .initialize()
  .then(authData.initialize)
  .then(() => {
    console.log("starting the server")
    app.listen(HTTP_PORT, onHttpStart)
  })
  .catch((err) => {
    console.log("ERROR MESSAGE:", err.message)
  })


