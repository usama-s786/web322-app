/*********************************************************************************
* WEB322 – Assignment 02
* I declare that this assignment is my own work in accordance with Seneca Academic
Policy. No part * of this assignment has been copied manually or electronically from any
other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: Usama Sidat 
* Student ID: 131034217
* Date: 26/05/2022
*
* Online (Heroku) Link:
________________________________________________________
*
********************************************************************************/ 

var express = require("express");
var app = express()

var blog = require('./blog-service')

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
    res.sendFile("./data/posts.json" , { root : __dirname}, function (err) {
        if (err) {
            next(err);
        }
        else {
            console.log('Sent:');
            next();
        }})
})

app.get('*', function(req, res){
    res.sendFile('/error.html' , { root : __dirname});
});

// setup http server to listen on HTTP_PORT
app.listen(HTTP_PORT, onHttpStart);