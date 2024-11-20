const express = require("express");
const app = express();
const path = require("path");
const request = require("request");
const port = process.env.PORT || 8000;
require("./db/connection");
const User = require("./models/user");
const bcrypt = require("bcryptjs");
const session = require("express-session");

app.set('view engine', "hbs");
const static_path = path.join(__dirname, "/public");


app.use(express.static(static_path));

//to fetch data of request
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(session({
   secret: "rohan$p@90219", // Replace with a strong secret key
   resave: false,
   saveUninitialized: false,
   cookie: { secure: false } // Use secure cookies in production with HTTPS
}));

app.get("/", (req, res) => {
   res.render('register');
});

app.post("/", async (req, res) => {
   try {
      const password = req.body.password;
      const cpassword = req.body.confirm_password;

      //for hashing password
      const passwordHash = await bcrypt.hash(password, 10);
    
      //for checking both passwords are same or not
      if (password === cpassword) {
         const newUser = new User({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            phone_number: req.body.phone_number,
            password: passwordHash
         })
         //for saving user in database
         const registerUser = await newUser.save();
         res.redirect("/sign_in");
         console.log(registerUser);
      } else {
         res.send("Passwords are not matching. Enter the details again.")
      }
   } catch (error) {
      res.send("Enter the details properly. Please try again.");
   }
})

app.get("/sign_in", (req, res) => {
   res.render('sign_in');
});

const isAuthenticated = (req, res, next) => {
   if (req.session && req.session.user) {
       next(); // User is authenticated, proceed to the requested route
   } else {
       res.redirect("/sign_in"); // Redirect to sign-in if not authenticated
   }
};


app.post("/sign_in", async (req, res) => {
   try {
      //to get email and password that have typed by user
      const email = req.body.email;
      const password = req.body.password;

      //for finding user by email that have typed by user
      const findUser = await User.findOne({email : email});
      //if user does not exist then show this
      if(!findUser){
         return res.send("Invalid email or password. Enter the details again.");
      }

      //for checking password
      const passwordMatch = await bcrypt.compare(password, findUser.password);

      //showing home page if password matches
      if (passwordMatch === true){
         req.session.user = { id: findUser._id, email: findUser.email }; // Store user info in session
         res.redirect("/home");
         // console.log(req.session);
      } else {
         res.send("Invalid email or password. Enter the details again.")
      }

   } catch (error) {
      res.send(` Invalid email or password. Enter the details again.`);
   }
})

app.get("/home", isAuthenticated,  (req, res) => {
   res.render("index");
});

app.get("/about",  isAuthenticated, (req, res) => {
   res.render('about');
});

app.get('/weather',  isAuthenticated, (req, res) => {
   const city = req.query.city;
   console.log(city);

   if (!city) {
      return res.render('weather');
   }

   const apiURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=d30a4f72c654dec5229fd4e8b57eed63`;

   // // Fetch weather data for the selected city
   request(apiURL, (error, response, body) => {
      if (error) {
         return res.status(500).send('Error occurred while fetching weather data. Please try after sometime!');
      }

      const data = JSON.parse(body);


      // Extract temperature or any other info from the API response
      const gettemp = data.main.temp;
      let temp = gettemp - 273.15;
      temp = temp.toFixed(1);
      let weather_type = data.weather[0].main;
      let weather_des = data.weather[0].description;

      // send the get_weather page with the fetched weather data
      res.render('weather_output', { city_name: city, temperature: temp, weathertype: weather_type, weatherdes: weather_des });
      // res.send(data);
   });
});

app.get("/contact",  isAuthenticated, (req, res) => {
   res.render('contact');
});

app.get("/sign_out", (req, res) => {
   req.session.destroy((err) => {
      if (err) {
          return res.send("Error logging out. Please try again.");
      }
      res.redirect("/sign_in");
   });

});

app.get("*", (req, res) => {
   res.render('error');
});

app.listen(port, () => {
   console.log("Connection has done successfully.");
});