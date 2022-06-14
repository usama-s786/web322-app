/*********************************************************************************
* WEB322 – Assignment 02
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. 
* No part of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.
*
* Name: Usama Sidat 
* Student ID: 131034217
* Date: 26/05/2022
*
* Online (Heroku) Link: https://fathomless-sierra-86850.herokuapp.com/
*
********************************************************************************/ 

var express = require("express")
var app = express()
var blogService = require('./blog-service')
const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')

var HTTP_PORT = process.env.PORT || 8080

cloudinary.config({
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

app.use(express.static('public'))

// setup a 'route' to listen on the default url path (http://localhost)
app.get("/", (req,res)=>{
    res.redirect('/about')
});

// setup another route to listen on /about
app.get("/about", (req,res)=>{
    res.sendFile('views/about.html' , { root : __dirname})
});

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

app.get("/posts", (req, res)=>{
    if(req.query.category){
        blogService.getPostByCategory(req.query.category)
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
        blogService.getPostByMinDate(req.query.minDate)
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
        blogService.getAllPosts()
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

app.get("/post/:id", (req,res)=>{   
    blogService.getPostById(req.params.id)
            .then((data) => {
            console.log ("getPostById displayed.")
            res.json(data)
            })
            .catch((err) => {
            console.log('ERROR MESSAGE:', err.message)
            res.json(err)
        })
})

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

app.get("/posts/add", (req,res)=>{
    res.sendFile('views/addPost.html' , { root : __dirname})
})

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
// })
//   blogService.addPost(req.body)
//   .then(()=>{
//         console.log(req.body)
//         res.redirect('/posts');
//     })
//     .catch((err)=>{
//         res.send(err);
//     })
// })
// })

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
