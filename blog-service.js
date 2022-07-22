const Sequelize = require('sequelize');

//credentials
var sequelize = new Sequelize('dec9ffd5l54rt6', 'tjnjovsebbqeva', 'd4c032f95956f9ff0377339994f14e02e7913ea29575506de5a8db723dd08076', {
    host: 'ec2-54-225-234-165.compute-1.amazonaws.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

//post data model
var Post = sequelize.define('Post', {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN
});

//category data model
var Category = sequelize.define('Category', {
    category: Sequelize.STRING,
});

//relationship between the models
Post.belongsTo(Category, { foreignKey: 'category' });

//function to initialize the connection to the database
module.exports.initialize = () => {
    return new Promise((resolve, reject) => {
        sequelize.sync()
            .then(() => {
                resolve()
            })
            .catch((err) => {
                console.log("Error: ", err.message)
                reject("Unable to sync the database")
            })
    });
}

//function to get all the posts
module.exports.getAllPosts = () => {
    return new Promise((resolve, reject) => {
        sequelize.sync()
            .then(() => {
                Post.findAll()
                    .then((data) => {
                        resolve(data)
                    })
                    .catch((err) => {
                        console.log("Error: ", err.message)
                        reject("no results returned")
                    })
            })
    });
}

//function to get the published posts
module.exports.getPublishedPosts = () => {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                published: true
            }
        })
            .then((data) => {
                resolve(data)
            })
            .catch((err) => {
                console.log("Error: ", err.message)
                reject("no results returned")
            })
    });
}

//function to get posts by categories
module.exports.getCategories = () => {
    return new Promise((resolve, reject) => {
        sequelize.sync()
            .then(() => {
                Category.findAll()
                    .then((data) => {
                        resolve(data)
                    })
                    .catch((err) => {
                        console.log("Error: ", err.message)
                        reject("no results returned")
                    })
            })
    });
}


//function to add posts
module.exports.addPost = (postData) => {
    return new Promise((resolve, reject) => {

        for (var i in postData) {
            if (postData[i] == "") postData[i] = null
        }

        postData.postDate = new Date()
        postData.published = (postData.published) ? true : false;

        sequelize.sync()
            .then(() => {
                Post.create(postData)
                    .then(() => {
                        resolve()
                    })
                    .catch((err) => {
                        console.log("Error: ", err.message)
                        reject("unable to create post")
                    })
            })
    });
}

//function to get posts by category
module.exports.getPostByCategory = (cat) => {
    return new Promise((resolve, reject) => {
        sequelize.sync()
            .then(() => {
                Post.findAll({
                    where: { category: cat }
                })
                    .then((data) => {
                        resolve(data)
                    })
                    .catch((err) => {
                        console.log("Error: ", err.message)
                        reject("no results returned")
                    })
            })
    });
}

//function to get posts by min date
module.exports.getPostByMinDate = (minDateStr) => {
    return new Promise((resolve, reject) => {
        sequelize.sync()
            .then(() => {
                Post.findAll({
                    where: {
                        postDate: {
                            [gte]: new Date(minDateStr)
                        }
                    }
                })
                    .then((data) => {
                        resolve(data)
                    })
                    .catch((err) => {
                        console.log("Error: ", err.message)
                        reject("no results returned")
                    })
            })
    });
}

//function to get posts by id
module.exports.getPostById = (id_i) => {
    return new Promise((resolve, reject) => {
        sequelize.sync()
            .then(() => {
                Post.findAll({
                    where: {
                        id: id_i
                    }
                })
                    .then((data) => {
                        resolve(data)    //check
                    })
                    .catch((err) => {
                        console.log("Error: ", err.message)
                        reject("no results returned")
                    })
            })
    });
}

//function to get published posts by category
module.exports.getPublishedPostsByCategory = (cat) => {
    return new Promise((resolve, reject) => {
        sequelize.sync()
            .then(() => {
                Post.findAll({
                    where: {
                        published: true,
                        category: cat
                    }
                })
                    .then((data) => {
                        resolve(data)
                    })
                    .catch((err) => {
                        console.log("Error: ", err.message)
                        reject("no results returned")
                    })
            })
    });
}

//function to add a category
module.exports.addCategory = (categoryData) => {
    return new Promise((resolve, reject) => {

        for (var i in categoryData) {
            if (categoryData[i] == "") categoryData[i] = null
        }

        Category.create(categoryData)
            .then((data) => {
                resolve(data)
            })
            .catch((err) => {
                console.log("Error: ", err.message)
                reject("unable to create category")
            })
    });
}

//function to delete a category
module.exports.deleteCategoryById = (id_i) => {
    return new Promise((resolve, reject) => {
        sequelize.sync()
            .then(() => {
                Category.destroy({
                    where: {
                        id: id_i
                    }
                })
            })
            .then(() => {
                resolve()
            })
            .catch((err) => {
                console.log("Error: ", err.message)
                reject("unable to delete category")
            })
    })
}

//function to delete a post by id
module.exports.deletePostById = (id_i) => {
    return new Promise((resolve, reject) => {
        sequelize.sync()
            .then(() => {
                Post.destroy({
                    where: {
                        id: id_i
                    }
                })
            })
            .then(() => {
                resolve()
            })
            .catch((err) => {
                console.log("Error: ", err.message)
                reject("unable to delete category")
            })
    })
}