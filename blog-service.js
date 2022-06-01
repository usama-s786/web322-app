const fs = require("fs");

var posts = []
var categories = []

module.exports.initialize = () => {

    var promise = new Promise((resolve, reject) => {
       
        try {

            fs.readFile('./data/posts.json', (err, data) => {
                if (err) throw err;

                posts = JSON.parse(data);
                console.log("INITIALIZE - Posts.");
            })

            fs.readFile('./data/categories.json', (err, data) => {
                if (err) throw err;

                categories = JSON.parse(data);
                console.log("INITIALIZE - Categories.");
            })

        } catch (ex) {
                      console.log("INITIALIZE - FAILURE.");
                      reject("UNABLE TO READ THE FILE.");
                     }
        console.log("INITIALIZE - SUCCESS.");

        resolve("INITIALIZE - SUCCESS.");
    })

    return promise;
};

module.exports.getAllPosts = () => {

    var promise = new Promise((resolve, reject) => {
        
       if(posts.length === 0) {
        var err = "no results returned";
        reject({message: err});
       }  

        resolve(posts);
    })
    return promise;
};

module.exports.getPublishedPosts = () => {

    var pPosts = [];
    var promise = new Promise((resolve, reject) => {
      
       for (var i=0; i < posts.length; i++){
           if (posts[i].published == true) {
            pPosts.push(posts[i]);
           }
       }

       if(pPosts.length === 0) {
        var err = "no results returned";
        reject({message: err});
       }  

    resolve (pPosts);
    })
    return promise;
};

module.exports.getCategories = () => {

    var promise = new Promise((resolve, reject) => {
        if(categories.length === 0) {
         var err = "no results returned";
         reject({message: err});
        }  
 
     resolve (categories);
     })
     return promise;
};


