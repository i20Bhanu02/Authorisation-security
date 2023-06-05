require("dotenv").config();
const express = require("express");
const bodyparser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltrounds = 5;

const app=express();

app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyparser.urlencoded({extended:true}));

mongoose.set('bufferCommands', false);
mongoose.connect("mongodb://127.0.0.1:27017/userDB");

const userSchema = new mongoose.Schema( {
    email : String,
    password : String,
});


const User = new mongoose.model("User",userSchema);

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
    
    bcrypt.hash(req.body.password, saltrounds, function(err, hash) {
        if(err) console.log(err);
        else{
            const newuser = new User({
                email : req.body.username,
                password : hash,
            });
        
            newuser.save().then(() =>{
                res.render("secrets");
            }).catch((err)=>{
                console.log(err);
            });
        }
    });
    
    
});

app.post("/login",function(req,res){

    User.findOne({email : req.body.username}).then((found)=>{
        if(found){
            bcrypt.compare(req.body.password, found.password, function(err, result) {
                if(result) res.render("secrets");
                else res.send("Invalid Password");
            });
        }
        else res.send("Username doesnot exist, please register");
    }).catch((err)=>{
        console.log(err);
    })
})


app.listen("4000",function(){
    console.log("done");
});

