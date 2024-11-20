const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://mhweather:rohanpotharkar@cluster0.tnsek.mongodb.net/rohanpotharkar?retryWrites=true&w=majority&appName=Cluster0").then(() => {
   console.log("Database has connected successfully.")});

