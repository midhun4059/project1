
const session=require('express-session');
const nodemailer=require("nodemailer");
const generateOtp=require("generate-otp");
const users = require('../model/userModels');
const productcollection = require('../model/productModels');
const couponcollection=require('../model/couponModel');
const walletcollection=require('../model/walletModel')
const bcrypt = require('bcrypt');
const { name } = require('ejs');
const bannercollection = require('../model/bannerModel');
const easyinvoice=require('easyinvoice')




// const fetch=require('node-fetch');




const loginLoad=async(req,res)=>{
  if(req.session.user){
    res.redirect('/')
  }else{
    res.render('login');
  }
}


const signupLoad= async(req,res)=>{
  try{
    const data=await users.findOneAndRemove({isVerified:false});

    
  if(req.session.user){

    res.redirect('/')
  }
  else{
    res.render('signup')
  }
  }
catch(error){
  console.log(error);
}
}

const PAGE_SIZE = 4;
const homeLoad=async(req,res)=>{
  if(req.session.user){
    const banner=await bannercollection.find();

    const currentPage = parseInt(req.query.page) || 1;
    const skip = (currentPage - 1) * PAGE_SIZE;

    const products = await productcollection
        .find()
        .skip(skip)
        .limit(PAGE_SIZE)
        .exec(); // Use .exec() to execute the query


    const user = await users.findOne({ email: req.session.user });
    
    const wallet = await walletcollection.findOne({ customerid: user._id });
    if (!wallet) {
      const newwallet = new walletcollection({
          customerid: user._id ,
      });
     
      await newwallet.save();
  }
  
    
    
    res.render('home',{products,currentPage,banner})
  }else{
    res.redirect('/login')
  }
  }
  

const loginVerify=async (req, res) => {
  try{
      console.log("Starting login verification");
      const check=await users.findOne({email:req.body.email})
      
      if(check.email===req.body.email && check.isblocked===false && check.password===req.body.password && check.isVerified===true){
      
      {
        console.log("Login successful");
        req.session.user=req.body.email;
        res.redirect("/")
      }
      }else{
        console.log("Login failed");
        res.render("login",{error:"Invalid login credential.Please try again"})
      }
    }
  catch(error){
    console.log("error",error);
  }
 }
 
  
const insertUser=async(req,res)=>{
  try{

    const { username, email, password, phone } = req.body;
//checking  the email is existing or not

const existingUser = await users.findOne({ email:email });

if (existingUser) {

  console.log("hereee")
  // Email already exists, send an error message to EJS
  return res.render('signup', {
    error: 'Email already exists. Please use a different email address.',
  });
}
else{

 const otp = generateOtp.generate(4, { digits: true, alphabets: false, specialChars: false });


 
   const data={
    username:req.body.username,
    email:req.body.email,
    password:req.body.password,
    phone:req.body.phone,
    OTP:otp,
}


await users.create([data]);

req.session.email=req.body.email;


   transporter=nodemailer.createTransport({
      service:"gmail",
      auth:{
          user: 'testtdemoo11111@gmail.com',
          pass: 'wikvaxsgqyebphvh'
            
      },
  })
  const mailOptions={
      from:"midhunrpillai4059@gmail.com",
      to:"midhunrpillai4059@gmail.com",
      subject:"Your Otp code",
      text:`your otp code is:${otp}`
  }
  transporter.sendMail(mailOptions,(error,info) =>{
      if(error){
          console.error("error sending otp",error)

      }
      else{
          console.log("otp send:",info.response);
      }


  })
 
  
  setTimeout(async () => {
  await users.findOneAndUpdate(
        { email:req.session.email},
        { $unset: { OTP: 1 } },
        {new:true}
    );
    console.log("otp  unset sucessfull")
}, 30000);
 res.redirect('/otp');


  console.log("send successfully", otp);
}

}
  
catch(error){
 console.log(error);

}
}



const otpLoad=(req,res)=>{
  try{
     res.render("otp",{errorMessage: ''})
  }catch(error){
    console.log(error);

  }
}
const verifyOtp = async (req, res) => {
  try {
    const username = req.session.email;
    const foundUser = await users.findOne({email: username }); // Change the variable name to foundUser
    
    const enterOtp =parseInt( req.body.otp);
    console.log(enterOtp);

    if (parseInt(foundUser.OTP) === enterOtp) {

  await users.findByIdAndUpdate(foundUser._id, { isVerified: true });
      

      // await users.insertMany([data])

      res.redirect("/login");
    } else {
      res.render("otp", { errorMessage: 'Invalid OTP. Please try again.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
}


const resendOtp = async (req, res) => {
  try {
    const email = req.session.email;
    console.log('230:',email);
    const userData = await users.findOne({ email: email });

  
    const otp = generateOtp.generate(4, { digits: true, alphabets: false, specialChars: false });
    console.log('Generated OTP:', otp);

    req.session.user = req.body.email;

    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'testtdemoo11111@gmail.com',
        pass: 'wikvaxsgqyebphvh',
      },
    });

    const mailOptions = {
      from: 'midhunrpillai4059@gmail.com',
      to: 'midhunrpillai4059@gmail.com', // Change this to userData.email if it's not the same
      subject: 'Your Resent OTP Code',
      text: `Your resend OTP code is: ${otp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending OTP:', error);
        return res.status(500).json({ message: 'Error sending OTP' });
      } else {
        console.log('OTP sent:', info.response);
      }
    });

    const values=await users.findOneAndUpdate(
      { email:email },
      { $set: { OTP: otp } },
      { new: true }
    );
    console.log('OTP updated successfully 267:',values);

    res.redirect('/otp');
    console.log('reSend otp successfully', otp);
  } catch (error) {
    console.error('Error in resendOtp controller:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



const profile=async (req,res)=>{
  try{
    const user=req.session.user;
    console.log(user);

    const data=await users.findOne({email:user});
    

    const wallet = await walletcollection.findOne({customerid: data._id });
    console.log('11:',wallet);
        
    if(user && wallet){
      var walletBalance = wallet.Amount;

      res.render('profile',{data,walletBalance});
      console.log("data",data);
    }
    else{
      res.redirect('/profile')
    }
  }
  catch(error){
    console.log(error);
  }
}

const editprofile= async (req,res)=>{
  const user=req.session.user;

  const data=await users.findOne({email:user});

  try{
    if(data){
      res.render('editprofile',{data});
    }
    else{
      res.redirect('/profile');
    }
  }
  catch (error){
 console.log(error);
  }
}

const resetpassLoad=async(req,res)=>{
  try{
    if(req.session.user){
      res.render('resetpassword');
    }else{
      res.redirect('/profile');
  }

  }
  catch(error){
    console.log(error);
  }
}

const checkpassword=async(req,res)=>{
  try{
    const user=req.session.user;
    const data=await users.findOne({email:user});

if(req.body.currentpassword===data.password){
  await users.findByIdAndUpdate(data._id,{password:req.body.newpassword})
 res.redirect('/profile');
}
 }
 catch(error){
  console.log(error);
 }
}


const updateprofile = async (req, res) => {
  
  const user = req.session.user;
  const check = await users.findOne({ email: user });
 
  if (!check) {
    return res.redirect('/profile');
  } else {
    const userdata =await users.findOneAndUpdate({ email: user },{
      username: req.body.username,
      email: req.body.email,
      phone: req.body.phone
    });
    console.log(userdata);
    // console.log(name);
    // await users.find(userdata);
    res.redirect('/profile');
  }
}

const addaddress=async(req,res)=>{
  const user=req.session.user;
const data=await users.findOne({email:user})
try{
    if(data){
      res.render('addaddress',{user,data});
    }else{
      res.redirect('/profile')
    }
  }
  catch(error){
    console.error(error);
  }
}



const addAddressToUser = async (req, res) => {
const userId = req.params.id; // Assuming you have a userId parameter in your route
  // The address data from the request body

  try {
    const newAddress = {
      street: req.body.street,
      city: req.body.city,
      state: req.body.state,
      pincode: req.body.pincode,
      country: req.body.country,
      // primary: newAddressData.primary || false, // Set to false by default
    };

   
    // Push the new address directly to the user's address array
    const updatedUser = await users.findByIdAndUpdate(
      userId,
      { $push: { address: newAddress } },
      { new: true }
    );
res.redirect('/profile');
if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
res.status(201).json(updatedUser); // Respond with the updated user document
  } catch (error) {
    console.error(error);
    
  }
};

const addaddresscheckout=async(req,res)=>{
  const user=req.session.user;

  const data=await users.findOne({email:user})

  try{
    if(data){
      res.render('addaddresscheckout',{user,data});
    }else{
      res.redirect('/checkout')
    }
  }
  catch(error){
    console.error(error);
  }
}


  

   const addAddressToCheckout = async (req, res) => {
    const userId = req.params.id; // Assuming you have a userId parameter in your route
      // The address data from the request body
    
      try {
        const newAddress = {
          street: req.body.street,
          city: req.body.city,
          state: req.body.state,
          pincode: req.body.pincode,
          country: req.body.country,
          // primary: newAddressData.primary || false, // Set to false by default
        };
    
       
        // Push the new address directly to the user's address array
        const updatedUser = await users.findByIdAndUpdate(
          userId,
          { $push: { address: newAddress } },
          { new: true }
        );
    
    res.redirect('/checkout');
    if (!updatedUser) {
          return res.status(404).json({ error: 'User not found' });
        }
    
        res.status(201).json(updatedUser); // Respond with the updated user document
      } catch (error) {
        console.error(error);
        
      }
    };

    


 const editAddress=async(req,res)=>{
const user=req.session.user
  const data=await users.findOne({email:user})
  try{
    if(data){
      res.render('editaddress',{data});
    }
    else{
      res.redirect('/profile');
    }
  }
  catch(error){
    console.error(error);
  }
 }

 const editaddresscheckout=async(req,res)=>{
  const user=req.session.user
    const data=await users.findOne({email:user})
    try{
      if(data){
        res.render('editaddresscheckout',{data});
      }
      else{
        res.redirect('/checkout');
      }
    }
    catch(error){
      console.error(error);
    }
   }

 const updateAddress=async(req,res)=>{
 try{
    const user={email:req.session.user};
    
    
const newAddress={
        address:[{
        street:req.body.street,
        city:req.body.city,
        state:req.body.state,
        pincode:req.body.pincode,
        country:req.body.country,
  }]}

 
const option={upsert:true};
await users.updateOne(user,newAddress,option);
res.redirect('/profile');
  
  }
  catch(error){
    console.error(error)
  }
 }

 const updateAddresscheckout=async(req,res)=>{
  try{
     const user={email:req.session.user};
     
     
 const newAddress={
         address:[{
         street:req.body.street,
         city:req.body.city,
         state:req.body.state,
         pincode:req.body.pincode,
         country:req.body.country,
   }]}
 
  
 const option={upsert:true};
 await users.updateOne(user,newAddress,option);
 res.redirect('/checkout');
   
   }
   catch(error){
     console.error(error)
   }
  }







// Apply Coupon


const applyCoupon =async(req,res)=>{
  const email=req.session.user
 try{
    const couponCode = req.body.code;
      const totalPrice=req.body.total;
      const coupon = await couponcollection .findOne({ couponCode });
       const minimumAmount=coupon.minimumpurchase;
       if (!coupon=== coupon.couponCode) {
         return res.json({ success: false, message: "Not Valid" });
       }
      
      if (!coupon || coupon.expirationDate < new Date()) {
        return res.json({ success: false, message: "Coupon Expired" });
      }
      
   
      const user = await users.findOne({email:email});
 
      if (totalPrice <= minimumAmount) {
          return res.json({ success: false, message:` Minimum purchase of ${minimumAmount} is required to claim the coupon `});
      }
      const newTotal = totalPrice - coupon.discountAmount;
    
      user.totalPrice = newTotal;
      const discountAmount=coupon.discountAmount
   

     
      await user.save();

      res.json({ success: true, newTotal,discountAmount });


  }catch(error){
      console.error("Error applying coupon:", error);
  res.status(500).json({ success: false, message: "Invalid coupon code" });
  }
}






const userLogout=(req,res)=>{
  req.session.destroy((err)=>{
    if(err){
      console.log(err);
      res.redirect("/")
    }else{
      console.log("logout susccesfully");
      res.status(200)
      res.redirect('/')
    }
  })
}


const forgotLoad=async(req,res)=>{
  let error=''
  res.render('forgot',{error})
}

const verifyEmail=async(req,res)=>{
req.session.email=req.body.email;
const email=req.session.email;
  try{
      const userremail=await users.findOne({email:email});

      if(userremail){
          
   otp=generateOtp.generate(4,{digits:true,alphabets:false,specialChars:false})

  transporter=nodemailer.createTransport({
      service:"gmail",
      auth:{
          user: 'testtdemoo11111@gmail.com',
            pass: 'wikvaxsgqyebphvh',
      },
  })
  const mailOptions={
      from:"midhunrpillai4059@gmail.com",
      to:"midhunrpillai4059@gmail.com",
      subject:"Your Otp code",
      text:`your otp code is:${otp}`
  }
  transporter.sendMail(mailOptions,(error,info) =>{
      if(error){
          console.error("error sending otp",error)

      }
      else{
          console.log("otp send:",info.response);
      }

  })
  console.log("send successfully");
  let errorMessage=''
  res.render('forgototp',{errorMessage,user:userremail._id})


      }else{
          let error='Email not match'
          res.render('forgot',{error})
      }

  }catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
  }
}

const forgototpverify=async(req,res)=>{
  try{
      const id=req.params.id
      const user=await users.findById(id)
      
      const enterOtp=req.body.otp;
      console.log(enterOtp)
      if(otp===enterOtp){
          
      
      res.render("newpassword",{userr:user._id})
      }
      else{
          res.render("forgototp",{ errorMessage: 'Invalid OTP. Please try again.' })
      }
  }
  catch(error){
      console.error(error);
      res.status(500).send("internal server error")
  }


}

const setnewpassword=async(req,res)=>{
  try{
      const newPassword = req.body.password;
      const id=req.params.id;
      const user=await users.findById(id)
    
   

      await users.findByIdAndUpdate(id, { password:newPassword });

      res.redirect('/login')

  }catch(error){
      console.error(error);
      res.status(500).send("internal server error")
  }
}






const errorpage=async(req,res)=>{

  res.render("errorpage");
}

const fs = require('fs');
const path =require('path')
const PDFDocument = require('pdfkit');
 // Replace with the actual path

const generateInvoice = async (req, res) => {
  const orderId = req.params.id;
  const userId = req.session.user;
  
  try {
      const user = await users.findOne({ email: userId });
      const orderDetails = await users.findOne({ 'orders._id': orderId }).populate('orders.product');

      const order = orderDetails.orders.find(order => order._id == orderId);
      

      // Assuming 'order.product' is a single product
      const product = order.product;
      console.log('product:', product);
      const quantity = order.quantity;

      const products = [{
          quantity: quantity,
          description: product.name,
          "tax-rate": 0,
          price: product.price,
      }];

      // Calculate the total price as the sum of all product prices
      const totalPrice = products.reduce((total, product) => {
          return total + product.price * product.quantity;
      }, 0);

      const logoUrl =  "https://watchbox-sfcc.imgix.net/og/watchbox-og-full.png"
      const invoiceData = {
          currency: 'INR',
          marginTop: 25,
          marginRight: 25,
          marginLeft: 25,
          marginBottom: 25,
          logo: logoUrl,
          sender: {
              company: 'Glassy',
              address: 'Dotspace Trivandrum',
              zip: '695411',
              city: 'Trivandrum',
              country: 'India'
          },
          client: {
              company: user.username,
              address: ` ${user.address[0].street}, ${user.address[0].city}, ${user.address[0].state} - ${user.address[0].pincode}, ${user.address[0].country}`
          },
          
          information: {
              date: new Date().toLocaleDateString(),
              number: `INV_${order._id}`,
          },
          products: products,
          "bottom-notice": `Thank you for choosing GLASSY! We appreciate your business
          If you have any questions or concerns regarding this invoice,
          please contact our customer support at support@glassy.com.
          Your satisfaction is our priority. Hope to see you again!`
      };

      // Create invoice
      easyinvoice.createInvoice(invoiceData, function (result) {
          // Send the PDF as a response for download
          res.setHeader('Content-Disposition', `attachment; filename=invoice_${orderId}.pdf`);
          res.setHeader('Content-Type', 'application/pdf');
          res.send(Buffer.from(result.pdf, 'base64'));
      });
  } catch (error) {
      console.error(error);
      res.status(500).send('Error generating the invoice.');
  }
};


const resendOtpagain = async (req, res) => {
  try {
    // Your logic here, if needed
    res.render('forgototp');
  } catch (error) {
    console.error('Error in resendOtpagain controller:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



module.exports={
  loginVerify,
  otpLoad,
  verifyOtp,
  resendOtp,
 
  errorpage,

 insertUser,
  loginLoad,
  homeLoad,
  signupLoad,
  userLogout,
  
  addAddressToUser,
  editAddress,
  addaddress,
  updateAddress,
  editaddresscheckout,
  updateAddresscheckout,
  addaddresscheckout,
  addAddressToCheckout ,
  
  profile,
  editprofile,
  updateprofile,
  resetpassLoad,
  checkpassword,



applyCoupon,


forgotLoad,
verifyEmail,
forgototpverify,
setnewpassword,
generateInvoice,
resendOtpagain,

 

}