var mongoose = require("mongoose")
var Schema = mongoose.Schema
const bcrypt = require("bcryptjs")

var userSchema = new Schema({       //defining a new user schema    
    "userName": {
        "type": String,
        "unique": true
    },
    "password": String,
    "email": String,
    "loginHistory": [{
        "dateTime": Date,
        "userAgent": String
    }]
})

let User;   // to be defined on new connection (see initialize)

module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection("mongodb+srv://uisidat:abcd1234@senecaweb.3jkmm4i.mongodb.net/?retryWrites=true&w=majority")
        db.on('error', (err) => {
            reject(err) // reject the promise with the provided error
        });
        db.once('open', () => {
            User = db.model("users", userSchema);
            resolve()
        })
    })
}

module.exports.registerUser = function (userData) {
    return new Promise(function (resolve, reject) {
        if (userData.password != userData.password2) reject("Passwords don't match!")       //if passwords do not match
        else {
            bcrypt.hash(userData.password, 10)
                .then(hash => {
                    userData.password = hash
                    let newUser = new User(userData)    //creating new user from the user data
                    newUser.save()                      //invoking the save method
                        .then(() => {
                            resolve()
                        })
                        .catch((err) => {
                            if (err.code == 11000) reject("User Name already taken")
                            else reject("There was an error creating the user:" + err)
                        })
                })
                .catch((err) => {
                    reject("There was an error encrypting the password")
                })
        }
    })

}

module.exports.checkUser = function (userData) {
    return new Promise(function (resolve, reject) {
        User.find({ userName: userData.userName })      //invoking find method on the User object
            .then((users) => {
                if (users.length == 0) reject("Unable to find user: " + userData.userName)      //if the array is empty
                else {
                    bcrypt.compare(userData.password, users[0].password)
                        .then((result) => {
                            if (result == false) reject("Incorrect Password for user: " + userData.userName)
                            else
                                users[0].loginHistory.push({
                                    "dateTime": (new Date()).toString(),
                                    "userAgent": userData.userAgent
                                })

                            User.updateOne({        //invoking update for the User
                                userName: users[0].userName
                            }, {
                                $set: { loginHistory: users[0].loginHistory }
                            })
                                .then(() => {
                                    resolve(users[0])
                                })
                                .catch((err) => {
                                    reject("There was an error verifying the user: ", err)
                                })
                        })
                }
            })
            .catch((err) => {
                reject("Unable to find user: " + userData.userName)
            })
    })
}


