const express = require("express");
const bodyparser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption")

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

const secret = "enckey";

userSchema.plugin(encrypt,{secret:secret , encryptedFields:["password"]});

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
    const newuser = new User({
        email : req.body.username,
        password : req.body.password,
    });

    newuser.save().then(() =>{
        res.render("secrets");
    }).catch((err)=>{
        console.log(err);
    });
    
});

app.post("/login",function(req,res){

    User.findOne({email : req.body.username}).then((found)=>{
        if(found){
            if(found.password === req.body.password) res.render("secrets");
            else res.send("Invalid Password");
        }
        else res.send("Username doesnot exist, please register");

        
    }).catch((err)=>{
        console.log(err);
    })
})


app.listen("4000",function(){
    console.log("done");
});

