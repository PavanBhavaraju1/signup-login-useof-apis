require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const https = require("https");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');


const app = express();

var f= "";var l =""; var p =""; var e ="";

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb+srv://PavanBhavaraju:Hanuman-11@cluster0.5ys8h.mongodb.net/userdb?retryWrites=true&w=majority");
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema ({
  firstname:String,
  lastname:String,
  email: String,
  password: String,
  phoneno: String,
  googleId: String,
  secret: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});



app.get("/weather", function(req, res) {

res.render("weather",{f:f,l:l,p:p ,e:e});

})
app.post("/weather",function(req,res){
  const query = req.body.CityName ;
  const apikey ="197696401486eec9ce02c571bb4a39af";
  const unit ="metric";
    const url = "https://api.openweathermap.org/data/2.5/weather?q="+ query +"&appid="+ apikey +"&units="+unit;

    https.get(url, function(response) {

    console.log(response.statusCode);

    response.on("data", function(data) {

    const weatherData = JSON.parse(data)
    const temp = weatherData.main.temp;
    const weatherDescription=weatherData.weather[0].description;
    const icon =weatherData.weather[0].icon;
    const imageUrl = "http://openweathermap.org/img/wn/"+icon+"@2x.png";

        res.write("<h1>The temparetaure in "+query+" is " + temp + " degress celcius</h1>")
        res.write("<img src = "+imageUrl+">")
        res.write("<p>The weather is currently "+ weatherDescription + "</p>")
        res.send();
      })
    })


})


app.get("/", function(req, res){
  res.render("home");
});



app.get("/login", function(req, res){
  res.render("login");

});

app.get("/register", function(req, res){
  res.render("register");
});





//Once the user is authenticated and their session gets saved, their user details are saved to req.user.
  // console.log(req.user.id);



app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});

app.post("/register", function(req, res){

  User.register({username: req.body.username,  firstname:req.body.firstname,
    lastname:req.body.lastname, phoneno:req.body.phoneno}, req.body.password, function(err, user){
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {


      passport.authenticate("local")(req, res, function(){
        f =req.user.firstname; l =req.user.lastname; p =req.user.phoneno;  e= req.user.username;

        res.redirect("/weather");
      });
    }
  });

});

app.post("/login", function(req, res){

  const user = new User({
    firstname:req.body.firstname,
    lastname:req.body.lastname,
    username: req.body.username,
    password: req.body.password,
    phoneno:req.body.phoneno
  });

  req.login(user, function(err){

    if (err) {
      console.log(err);
    } else {
f =req.user.firstname; l =req.user.lastname; p =req.user.phoneno;  e= req.user.username;
      passport.authenticate("local")(req, res, function(){

        res.redirect("/weather");
      });
    }
  });

});







app.listen(process.env.PORT ||3000, function() {
  console.log("Server started on port 3000.");
});
