const express=require('express')
const userRoutes=express();
const path=require('path');
const user=require('../model/userModels');
const userController=require('../controller/userController');
const cartController=require('../controller/cartController')
const nodemailer=require("nodemailer");
const generateOtp=require('generate-otp');

const session=require("express-session")
//session handling
userRoutes.use(session({
  secret:"wdgfsathgfdsfsdsd",
  saveUninitialized:false,
  resave:false
}))

//pairng the user inputted data
userRoutes.use(express.urlencoded({extended:true}))
userRoutes.use(express.json())

//setting static pages
userRoutes.use(express.static('public'))

//setting view engines
userRoutes.set('view engine','ejs');
userRoutes.set('views','./views');
userRoutes.use(express.static(path.join(__dirname,'public')))



// userRoutes.post('/signup',async (req,res)=>{

//   const data={
//     username:req.body.username,
//     email:req.body.email,
//     password:req.body.password,
//     phone:req.body.phone
//   }
// console.log(req.body);
//   const newdata=await user.insertMany([data]);
// console.log(newdata);
// res.send('Sign in sucessfully')


userRoutes.get('/login',userController.loginLoad);
userRoutes.get('/signup',userController.signupLoad);
userRoutes.get('/',userController.homeLoad);

userRoutes.post('/login',userController.loginVerify);
userRoutes.post('/signup',userController.insertUser);

userRoutes.get("/otp",userController.otpLoad);
userRoutes.post("/otp",userController.verifyOtp);
// userRoutes.post('/otp/resend',userController.resend)


userRoutes.get('/profile',userController.profile);
userRoutes.get('/addaddress',userController.addaddress);
userRoutes.post('/addaddress/:id',userController.addAddressToUser)
userRoutes.get('/editaddress',userController.editAddress);
userRoutes.post('/editaddress',userController.updateAddress);

userRoutes.get('/editprofile',userController.editprofile);
userRoutes.post('/editprofile',userController.updateprofile);


userRoutes.get('/cart',cartController.cart);
userRoutes.post('/addtocart/:id', cartController.addtocart);

userRoutes.get("/productdetails/:id",userController.productdetails)

userRoutes.post('/logout',userController.userLogout);

module.exports=userRoutes;
