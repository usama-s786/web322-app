const fs = require("fs") 

var posts = []
var categories = []

module.exports.initialize = () => {

    var promise = new Promise((resolve, reject) => {
       
        try {

            fs.readFile('./data/posts.json', (err, data) => {
                if (err) throw err 

                posts = JSON.parse(data) 
                console.log("INITIALIZE - Posts.") 
            })

            fs.readFile('./data/categories.json', (err, data) => {
                if (err) throw err 

                categories = JSON.parse(data) 
                console.log("INITIALIZE - Categories.") 
            })

        } catch (ex) {
                      console.log("INITIALIZE - FAILURE.") 
                      reject("UNABLE TO READ THE FILE.") 
                     }
        console.log("INITIALIZE - SUCCESS.") 

        resolve("INITIALIZE - SUCCESS.") 
    })

    return promise 
} 

module.exports.getAllPosts = () => {

    var promise = new Promise((resolve, reject) => {
        
       if(posts.length === 0) {
        var err = "no results returned" 
        reject({message: err}) 
       }  

        resolve(posts) 
    })
    return promise 
} 

module.exports.getPublishedPosts = () => {

    var pPosts = [] 
    var promise = new Promise((resolve, reject) => {
      
       for (var i=0;  i < posts.length;  i++){
           if (posts[i].published == true) {
            pPosts.push(posts[i]) 
           }
       }

       if(pPosts.length === 0) {
        var err = "no results returned" 
        reject({message: err}) 
       }  

    resolve (pPosts) 
    })
    return promise 
} 

module.exports.getCategories = () => {

    var promise = new Promise((resolve, reject) => {
        if(categories.length === 0) {
         var err = "no results returned" 
         reject({message: err}) 
        }  
 
     resolve (categories) 
     })
     return promise 
} 

module.exports.addPost = (postData) => {
   
    var promise = new Promise((resolve, reject) => {
        postData.published = (postData.published) ? true : false
        postData.id= posts.length+1
        posts.push(postData)
 
        if(posts.length == 0) {
         var err = "no results returned" 
         reject({message: err}) 
        }  
        resolve (postData) 
     })

    return promise 
}

module.exports.getPostByCategory = (category) => {
    var arrByCategory = [];
    var promise = new Promise((resolve, reject) => {
        
        for(let i = 0; i<posts.length; i++){
            if(posts[i].category == category) arrByCategory.push(posts[i])
        }
       if(arrByCategory.length === 0) {
        var err = "no results returned" 
        reject({message: err}) 
       }  

        resolve(arrByCategory) 
    })
    return promise 
} 

module.exports.getPostByMinDate = (minDateStr) => {
    var arrByminDate = [];
    var promise = new Promise((resolve, reject) => {
        
        for(let i = 0; i<posts.length; i++){
            if(new Date (posts[i].postDate) >= new Date (minDateStr)) arrByminDate.push(posts[i])
        }
        if(arrByminDate.length === 0) {
            var err = "no results returned" 
            reject({message: err}) 
        }  

        resolve(arrByminDate) 
    })
    return promise 
} 

module.exports.getPostById = (id) => {
    var arrById = [];
    var promise = new Promise((resolve, reject) => {
        
        for(let i = 0; i<posts.length; i++){
            if ( posts[i].id == id) arrById.push(posts[i])
        }
        if(arrById.length === 0) {
            var err = "no results returned" 
            reject({message: err}) 
        }  

        resolve(arrById) 
    })
    return promise 
} 
