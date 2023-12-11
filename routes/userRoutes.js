const express=require('express')
const userRoutes=express();
const path=require('path');
const userController=require('../controller/userController');
const cartController=require('../controller/cartController');
const productController=require('../controller/productController');
const orderController=require('../controller/orderController');
const wishlistController = require('../controller/wishlistController');
const walletController=require('../controller/walletController')

const dotenv=require('dotenv').config()

const session=require("express-session");
const { use } = require('moongose/routes');
const walletcollection = require('../model/walletModel');
//session handling
userRoutes.use(session({
  secret:"wdgfsathgfdsfsdsd",
  saveUninitialized:false,
  resave:false
}))

// const Razorpay = require('razorpay');
// var instance = new Razorpay({ key_id: process.env.KEY_ID, key_secret:process.env.KEY_SECRET })

// var options = {
//   amount: 50000,  // amount in the smallest currency unit
//   currency: "INR",
//   receipt: "order_rcptid_11"
// };
// instance.orders.create(options, function(err, order) {
//   console.log(order);
// });


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



userRoutes.get('/productsonly',productController.productonly);
userRoutes.post('/sortproducts',productController.sortedProducts);

userRoutes.post('/login',userController.loginVerify);
userRoutes.post('/signup',userController.insertUser);

userRoutes.get("/otp",userController.otpLoad);
userRoutes.post("/otp",userController.verifyOtp);
userRoutes.post('/otp/resend',userController.resendOtp);

userRoutes.get('/profile',userController.profile);
userRoutes.get('/addaddress',userController.addaddress);
userRoutes.post('/addaddress/:id',userController.addAddressToUser)
userRoutes.get('/editaddress',userController.editAddress);
userRoutes.post('/editaddress',userController.updateAddress);

userRoutes.get('/editaddresscheckout',userController.editaddresscheckout);
userRoutes.post('/editaddresscheckout',userController.updateAddresscheckout);

userRoutes.get('/addaddresscheckout',userController.addaddresscheckout);
userRoutes.post('/addaddresscheckout/:id',userController.addAddressToCheckout )

userRoutes.get('/editprofile',userController.editprofile);
userRoutes.post('/editprofile',userController.updateprofile);

userRoutes.get('/resetpassword',userController.resetpassLoad);
userRoutes.post('/resetpassword',userController.checkpassword);  

userRoutes.get('/showorders',orderController.showorders);
userRoutes.get('/cancelOrder/:id',orderController.cancelOrder);
userRoutes.get('/returnOrder/:id',orderController.returnOrder);
userRoutes.post('/logout',userController.userLogout);



userRoutes.get("/productdetails/:id",productController.productdetails);


userRoutes.get('/cart',cartController.cart);
userRoutes.post('/addtocart/:id', cartController.addtocart);
userRoutes.get('/deletecart/:id',cartController.deleteCart);
userRoutes.post('/incrementQuantity/:userId/:productId',cartController.addQuantity);
userRoutes.post('/decrementQuantity/:userId/:productId',cartController.subQuantity);
userRoutes.get('/checkout',cartController.checkoutLoad);
userRoutes.post('/orderconfirm',cartController.confirmLoad);

userRoutes.post('/razorpay',orderController.razorpayLoad);

userRoutes.post('/applycoupon',userController.applyCoupon);

userRoutes.get('/profile',walletController.walletLoad);




userRoutes.get('/wishlist',wishlistController.wishLoad);
userRoutes.post('/addtowish/:id',wishlistController.addToWish);
userRoutes.get('/remove/:id',wishlistController.removeFromWishlist);
userRoutes.get('/addcart/:id',wishlistController.wishlistAddCart);


module.exports=userRoutes;
