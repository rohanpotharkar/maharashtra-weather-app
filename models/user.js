
const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = mongoose.Schema({
first_name : {
   type: String,
   required: true
},
last_name: {
   type: String,
   required: true
},
email: {
   type: String,
   required: true,
   unique: true,
   validate(value){
      if(!validator.isEmail(value)){
         throw new Error("Email address is inappropriate. Please try again...")
      }
   }
   },
   phone_number: {
      type: Number,
      required: true,
      unique: true,
      min: 10
   },
   password: {
      type: String,
      required: true
   }

})

const User = new mongoose.model("User", userSchema);

module.exports = User;