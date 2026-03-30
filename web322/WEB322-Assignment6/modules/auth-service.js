const mongoose = require('mongoose');
let Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

require('dotenv').config();

let userSchema = new Schema({
    "userName": { 
        "type": String, 
        "unique": true 
    },
    "password": String,
    "email": String,
    "loginHistory": [
      {
        "dateTime": Date,
        "userAgent": String,
      },
    ],
  });

  let User; //

  exports.initialize = () => {
    return new Promise((resolve, reject) => {
        let db = mongoose.createConnection("process.env.MONGODB", { useNewUrlParser: true });
        db.on('error', (err) => {
            reject(err);
        })
        db.once('open', () => {
            User = db.model("Users",userSchema);
            resolve("connected to mongodb");
        })
    })
  }

  exports.registerUser = (userData) => {
    return new Promise((resolve, reject) => {
        if (userData.password != userData.password2) {
            reject("Passwords do not match");
        }
        else {
            bcrypt.genSalt(10, function(err, salt) {
                bcrypt.hash(userData.password, salt, function(err, hash) {
                    if (err) {
                        reject("error encrypting password");
                    }
                    else {
                        userData.password = hash;
                        let newUser = new User(userData);
                        newUser.save((err) => {
                            if (err) {
                                if (err.code === 11000) {
                                    reject("User Name already taken");
                                }
                                else {
                                    reject("There was an error creating the user: " + err);
                                }
                            }
                            else {
                                resolve();
                            }
                        })
                    }
                })
            })
        }
    })
};

exports.checkUser = async (userData) => {
    try {
      const users = await User.find({ userName: userData.userName }).exec();
  
      if (users.length === 0) {
        throw new Error(`Unable to find user: ${userData.userName}`);
      }
  
      const user = users[0];
      const passwordMatch = await bcrypt.compare(userData.password, user.password);
  
      if (passwordMatch) {
        if (user.loginHistory.length === 8) {
          user.loginHistory.pop();
        }
  
        user.loginHistory.unshift({
          dateTime: new Date().toString(),
          userAgent: userData.userAgent,
        });
  
        await User.updateOne({ userName: user.userName }, { $set: { loginHistory: user.loginHistory } }).exec();
        return user;
      } else {
        throw new Error(`Incorrect Password for user: ${userData.userName}`);
      }
    } catch (err) {
      console.log(err);
      throw new Error(`Error checking user credentials for user: ${userData.userName}`);
    }
  };





//   module.exports = {
//     User,
//     initialize,
//   };
  