const express=require('express')
const userRoutes=express();
const path=require('path');
const userController=require('../controller/userController');
const cartController=require('../controller/cartController');
const productController=require('../controller/productController');
const orderController=require('../controller/orderController');
const wishlistController = require('../controller/wishlistController');
const walletController=require('../controller/walletController')
const userAuth=require("../middleware/userAuth")
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





userRoutes.get('/login',userController.loginLoad);
userRoutes.post('/login',userController.loginVerify);
userRoutes.get('/signup',userController.signupLoad);
userRoutes.post('/signup',userController.insertUser);

userRoutes.get('/forgot',userController.forgotLoad);
userRoutes.post('/emailverify',userController.verifyEmail);
userRoutes.post('/passwordotp/:id',userController.forgototpverify);
userRoutes.post('/newpassword/:id',userController.setnewpassword);
userRoutes.get('/forgototp', userController.resendOtpagain);



userRoutes.get('/',userController.homeLoad);
userRoutes.get('/productsonly',productController.productonly);
userRoutes.post('/sortproducts',productController.sortedProducts);

userRoutes.get("/productdetails/:id",productController.productdetails);

userRoutes.get("/otp",userController.otpLoad);
userRoutes.post("/otp",userController.verifyOtp);
userRoutes.get('/otp/resend',userController.resendOtp);

userRoutes.get('/profile',userController.profile);
userRoutes.get('/profile',walletController.walletLoad);
userRoutes.get('/editprofile',userController.editprofile);
userRoutes.post('/editprofile',userController.updateprofile);

userRoutes.get('/walletpage',walletController.walletHistory)

userRoutes.get('/addaddress',userController.addaddress);
userRoutes.post('/addaddress/:id',userController.addAddressToUser)
userRoutes.get('/editaddress',userController.editAddress);
userRoutes.post('/editaddress',userController.updateAddress);


userRoutes.get('/cart',cartController.cart);
userRoutes.post('/addtocart/:id', cartController.addtocart);
userRoutes.get('/deletecart/:id',cartController.deleteCart);
userRoutes.post('/incrementQuantity/:userId/:productId',cartController.addQuantity);
userRoutes.post('/decrementQuantity/:userId/:productId',cartController.subQuantity);
userRoutes.get('/checkout',cartController.checkoutLoad);
userRoutes.post('/orderconfirm',cartController.confirmLoad);

userRoutes.get('/wishlist',wishlistController.wishLoad);
userRoutes.post('/addtowish/:id',wishlistController.addToWish);
userRoutes.get('/remove/:id',wishlistController.removeFromWishlist);
userRoutes.get('/addcart/:id',wishlistController.wishlistAddCart);
userRoutes.get('/invoice/:id',userController.generateInvoice)


userRoutes.get('/showorders',orderController.showorders);
userRoutes.get('/cancelOrder/:id',orderController.cancelOrder);
userRoutes.get('/returnOrder/:id',orderController.returnOrder);

userRoutes.get('/resetpassword',userController.resetpassLoad);
userRoutes.post('/resetpassword',userController.checkpassword);  

userRoutes.get('/getCouponCodes',orderController.couponlist);

userRoutes.get('/editaddresscheckout',userController.editaddresscheckout);
userRoutes.post('/editaddresscheckout',userController.updateAddresscheckout);
userRoutes.get('/addaddresscheckout',userController.addaddresscheckout);
userRoutes.post('/addaddresscheckout/:id',userController.addAddressToCheckout );

userRoutes.post('/razorpay',orderController.razorpayLoad);
userRoutes.post('/applycoupon',userController.applyCoupon);

userRoutes.get('/error',userController.errorpage);
userRoutes.post('/logout',userController.userLogout);

module.exports=userRoutes;
