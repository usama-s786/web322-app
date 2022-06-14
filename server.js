/*********************************************************************************
* WEB322 – Assignment 03
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. 
* No part of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.
*
* Name: Usama Sidat 
* Student ID: 131034217
* Date: 14/06/2022
*
* Online (Heroku) Link: https://stark-wildwood-15403.herokuapp.com/
*
********************************************************************************/ 

var express = require("express")
var app = express()
var blogService = require('./blog-service')
const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')

var HTTP_PORT = process.env.PORT || 8080        //http port

cloudinary.config({             //cloudinary details
 cloud_name: 'usamasidat',
 api_key: '854176769438177',
 api_secret: 'ajqoPgr6G-GnlFCykF5znnkSsVk',
 secure: true
})

const upload = multer() // no { storage: storage }

// call this function after the http server starts listening for requests
function onHttpStart() {
  console.log("Express http server listening on port: " + HTTP_PORT)
}

app.use(express.static('public'))       //to load static files

// setup a 'route' to listen on the default url path (http://localhost)
app.get("/", (req,res)=>{
    res.redirect('/about')
});

// setup another route to listen on /about
app.get("/about", (req,res)=>{
    res.sendFile('views/about.html' , { root : __dirname})
});

// setup another route to listen on /blog
app.get("/blog", (req, res)=>{
    blogService.getPublishedPosts()
        .then((data) => {
        console.log ("getPublishedPosts displayed.")
        res.json(data)
        })
        .catch((err) => {
        console.log('ERROR MESSAGE:', err.message)
        res.json(err)
        })
});

// setup another route to listen on /posts
app.get("/posts", (req, res)=>{
    if(req.query.category){
        blogService.getPostByCategory(req.query.category)   //get by category
        .then((data)=>{
            console.log ("getAllPosts by category displayed.")
            res.json(data)
        })
        .catch((err)=>{
            console.log('ERROR MESSAGE:', err.message)
            res.json(err)
        })
    }
    else if(req.query.minDate){
        blogService.getPostByMinDate(req.query.minDate)     //get by min date
        .then((data)=>{
            console.log ("getAllPosts by minDate displayed.")
            res.json(data)
        })
        .catch((err)=>{
            console.log('ERROR MESSAGE:', err.message)
            res.json(err)
        })
    }
    else{
        blogService.getAllPosts()           //get all posts
            .then((data) => {
            console.log ("getAllPosts displayed.")
            res.json(data)
            })
            .catch((err) => {
            console.log('ERROR MESSAGE:', err.message)
            res.json(err)
        })
    }
});

// setup another route to listen on /post:id
app.get("/post/:id", (req,res)=>{   
    blogService.getPostById(req.params.id)          //get by id
            .then((data) => {
            console.log ("getPostById displayed.")
            res.json(data)
            })
            .catch((err) => {
            console.log('ERROR MESSAGE:', err.message)
            res.json(err)
        })
})

// setup another route to listen on /categories
app.get("/categories", (req, res)=>{
    blogService.getCategories()
        .then((data) => {
        console.log ("getCategories displayed.")
        res.json(data)
        })
        .catch((err) => {
        console.log('ERROR MESSAGE:', err.message)
        res.json(err)
        })
});

// setup another route to listen on /posts/add
app.get("/posts/add", (req,res)=>{
    res.sendFile('views/addPost.html' , { root : __dirname})
})

// setup another route to post
app.post("/posts/add", upload.single("featureImage"), (req,res)=>{
let streamUpload = (req) => {
    return new Promise((resolve, reject) => {
let stream = cloudinary.uploader.upload_stream((error, result) => {
if (result) {
resolve(result)
}
else {
reject(error)
}
})

streamifier.createReadStream(req.file.buffer).pipe(stream)
})
}

async function upload(req) {
let result = await streamUpload(req)
console.log(result)
return result
}

upload(req).then((uploaded)=> {
req.body.featureImage = uploaded.url;
//TODO: Process the req.body and add it as a new Blog Post before redirecting to/posts
blogService.addPost(req.body)
    .then((data)=> {
    res.redirect('/posts')
    })
    .catch((err)=> { 
    console.log('ERROR MESSAGE:', err.message)
    })
});
})

// setup another route to redirect to error page if the link is not correct
app.use((req,res)=>{
    res.status(404).sendFile('/views/error.html' , { root : __dirname})
})

console.log ("Ready for initialize");
blogService.initialize()
    .then(() => {
        console.log ("starting the server");
        app.listen(HTTP_PORT, onHttpStart); 
    })
    .catch(err => {
        console.log('ERROR MESSAGE:', err.message);
})
