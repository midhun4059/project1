const express=require('express');
const app=express()
const path=require('path');
const dotenv=require('dotenv').config
const mongoose=require('mongoose');
mongoose.set('strictQuery', false);
const Razorpay = require('razorpay');
const session=require('express-session');
const nocache=require('nocache');







const mongoDBconnection=async()=>{
try{
  
  const connect=await mongoose.connect("mongodb://0.0.0.0/sunglassDB");
  console.log("data base connected");
}
catch(error){
  console.log("errror")
  console.log(error);
}

}

mongoDBconnection()

app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret:"wdgfsathgfdsfsdsd",
  saveUninitialized:false,
  resave:false
}))

app.use(nocache());

// app.use(express.static('public'))
app.use(express.static(path.join(__dirname,'public')))

app.set('view engine','ejs')
app.set('views',path.join(__dirname,'views'));


const userroutes=require('./routes/userRoutes');
app.use('/',userroutes);

const adminroutes=require('./routes/adminRoutes');
app.use('/',adminroutes);


const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
