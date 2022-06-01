/*********************************************************************************
* WEB322 – Assignment 02
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. 
* No part of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.
*
* Name: Usama Sidat 
* Student ID: 131034217
* Date: 26/05/2022
*
* Online (Heroku) Link: https://stark-wildwood-15403.herokuapp.com/
*
********************************************************************************/ 

var express = require("express");
var app = express()
var blogService = require('./blog-service')

var HTTP_PORT = process.env.PORT || 8080;

// call this function after the http server starts listening for requests
function onHttpStart() {
  console.log("Express http server listening on port: " + HTTP_PORT);
}

app.use(express.static('public')); 

// setup a 'route' to listen on the default url path (http://localhost)
app.get("/", function(req,res){
    res.redirect('/about')
});

// setup another route to listen on /about
app.get("/about", function(req,res){
    res.sendFile('views/about.html' , { root : __dirname});
});

app.get("/blog", function(req, res){
    blogService.getPublishedPosts()
        .then((data) => {
        console.log ("getPublishedPosts displayed.");
        res.json(data);
        })
        .catch((err) => {
        console.log('ERROR MESSAGE:', err.message);
        res.json(err);
        })
});

app.get("/posts", function(req, res){
    blogService.getAllPosts()
        .then((data) => {
        console.log ("getAllPosts displayed.");
        res.json(data);
        })
        .catch((err) => {
        console.log('ERROR MESSAGE:', err.message);
        res.json(err);
        })
});

app.get("/categories", function(req, res){
    blogService.getCategories()
        .then((data) => {
        console.log ("getCategories displayed.");
        res.json(data);
        })
        .catch((err) => {
        console.log('ERROR MESSAGE:', err.message);
        res.json(err);
        })
});

app.use((req,res)=>{
    res.status(404).sendFile('/error.html' , { root : __dirname})
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
