require("dotenv").config();
const express = require("express");
const bodyparser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportlocalmongoose = require("passport-local-mongoose");


const app=express();

app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyparser.urlencoded({extended:true}));

app.use(session({
    secret : "its a secret",
    resave : false,
    saveUninitialized : false,
})); 

app.use(passport.initialize());
app.use(passport.session());

mongoose.set('bufferCommands', false);
mongoose.connect("mongodb://127.0.0.1:27017/userDB");
// mongoose.set("use/")

const userSchema = new mongoose.Schema( {
    email : String,
    password : String,
});

userSchema.plugin(passportlocalmongoose);

const User = new mongoose.model("User",userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/",function(req,res){
    res.render("home");
});

app.get("/login",function(req,res){
    res.render("login");
});

app.get("/register",function(req,res){
    res.render("register");
});


app.post("/register",function(req,res){
    
    // bcrypt.hash(req.body.password, saltrounds, function(err, hash) {
    //     if(err) console.log(err);
    //     else{
    //         const newuser = new User({
    //             email : req.body.username,
    //             password : hash,
    //         });
        
    //         newuser.save().then(() =>{
    //             res.render("secrets");
    //         }).catch((err)=>{
    //             console.log(err);
    //         });
    //     }
    // });

    User.register({username : req.body.username} , req.body.password , function(err,user){
        if(err){
            console.log(err);
            res.redirect("/");
        }
        else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secrets");
            })
        }
    })
});

app.get("/secrets",function(req,res){
    if(req.isAuthenticated()){
        res.render("secrets");
    } else{
        res.redirect("/login");
    }
})

app.post("/login",function(req,res){

    // User.findOne({email : req.body.username}).then((found)=>{
    //     if(found){
    //         bcrypt.compare(req.body.password, found.password, function(err, result) {
    //             if(result) res.render("secrets");
    //             else res.send("Invalid Password");
    //         });
    //     }
    //     else res.send("Username doesnot exist, please register");
    // }).catch((err)=>{
    //     console.log(err);
    // })
    const newuser = new User({
        username : req.body.username,
        password : req.body.password,
    });

    req.login(newuser,function(err){
        if(err) console.log("f");
        else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secrets");
            })
        }
    })
});

app.get("/logout",function(req,res){
    req.logout(function(err){
        if(err) console.log(err);
        else res.redirect("/");
    });
});


app.listen("4000",function(){
    console.log("done");
});

