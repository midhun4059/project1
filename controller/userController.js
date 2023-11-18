
const session=require('express-session');
const nodemailer=require("nodemailer");
const generateOtp=require("generate-otp");
const users = require('../model/userModels');
const productcollection = require('../model/productModels');


const bcrypt = require('bcrypt');
const { name } = require('ejs');


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

const homeLoad=async(req,res)=>{
  if(req.session.user){
    const products=await productcollection.find()
    
    
    res.render('home',{products})
  }else{
    res.redirect('/login')
  }
  }
  
// const signuppost= async (req, res) => {
  
//   const data = {
//     username: req.body.username,
//     email: req.body.email,
//     password: req.body.password,
//     phone: req.body.phone,
//   }

//   try {
//     const newdata = await users.insertMany([data]);
//     console.log(newdata);
//     res.render('login');
//   } catch (error) {
//     console.error('Error during signup:', error);

//     if (error && error.writeErrors && error.writeErrors.length > 0) {
//       console.error('Write errors:', error.writeErrors);
//     }

//     res.status(500).send('An error occurred during signup.');
//   }
// }
const loginVerify=async (req, res) => {
  try{
      console.log("Starting login verification");
      const check=await users.findOne({email:req.body.email})
      
      if(check.email===req.body.email && check.isblocked===false && check.password===req.body.password){
      
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
console.log("existingUser",existingUser)
if (existingUser) {

  console.log("hereee")
  // Email already exists, send an error message to EJS
  return res.render('signup', {
    error: 'Email already exists. Please use a different email address.',
  });
}
else{

  console.log("ererer")

 const otp = generateOtp.generate(4, { digits: true, alphabets: false, specialChars: false });

 const hashedPassword = await bcrypt.hash(req.body.password, 10);
 
console.log(`hashed password: ${hashedPassword}`);

   const data={
    username:req.body.username,
    email:req.body.email,
    password:req.body.password,
    phone:req.body.phone,
    OTP:otp,
}


await users.create([data]);

req.session.username=req.body.username


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
    const otpUnset = await users.findOneAndUpdate(
        { username:req.body.username},
        { $unset: { otp: 1 } },
        {new:true}
    );
    console.log("otp un set sucessfull")
}, 30000);
 res.redirect('/otp');


  console.log("send successfully", otp);
}

}
  
catch(error){
 console.log(error);

}
}

// const otpLoad=(req,res)=>{
//   try{
    
//     res.render("otp")
//   }catch(error){
//     console.log(error);

//   }
// }



// const verifyOtp=async(req,res)=>{
//   try{
//       const enterOtp=req.body.otp;
//       console.log(enterOtp)
//       if(otp===enterOtp){
//           // await users.insertMany([data])
      
//       res.render("login")
//       }
//       else{
//           res.redirect("/otp")
//       }
//   }
//   catch(error){
//       console.error(error);
//       res.status(500).send("internal server error")
//   }

// }
///////////////////////////
const otpLoad=(req,res)=>{
  try{
    
  

      res.render("otp",{errorMessage: ''})
    
  }catch(error){
    console.log(error);

  }
}

// const verifyOtp = async (req, res) => {
//   try {
//     const username = req.session.username;
//     const foundUser = await users.findOne({ username });
    
//     const enterOtp = parseInt(req.body.otp); // Convert user input to a number
//     console.log(enterOtp);

//     if (enterOtp && foundUser.OTP === enterOtp) { // Check if it's a valid number
//       // The OTP is correct, you can proceed with further actions
//       res.redirect("/login");
//     } else {
//       res.render("otp", { errorMessage: 'Invalid OTP. Please try again.' });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Internal server error");
//   }
// }


const verifyOtp = async (req, res) => {
  try {
    const username = req.session.username;
    const foundUser = await users.findOne({ username }); // Change the variable name to foundUser
    
    const enterOtp =parseInt( req.body.otp);
    console.log(enterOtp);

    if (parseInt(foundUser.OTP) === enterOtp) {

    const user = await users.findByIdAndUpdate(foundUser._id, { isVerified: true });
      

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
//////////////////////
// const resend = (req, res) => {
//   // Generate a new OTP
//   const newOTP = generateOtp.generate(4, { digits: true, alphabets: false, specialChars: false });



// req.session.username=req.body.username

//   // Create a Nodemailer transporter for sending the new OTP
//   const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//           user: 'testtdemoo11111@gmail.com',
//           pass: 'wikvaxsgqyebphvh'
//       },
//   });

//   // Define the email message with the new OTP
//   const mailOptions = {
//       from: "midhunrpillai4059@gmail.com",
//       to: "midhunrpillai4059@gmail.com", // Update the recipient email
//       subject: "Your New OTP Code",
//       text: `Your new OTP code is: ${newOTP}`,
//   };

//   // Send the new OTP to the user
//   transporter.sendMail(mailOptions, (error, info) => {
//       if (error) {
//           console.error("Error sending new OTP", error);
//           res.status(500).json({ error: "Error sending new OTP" });
//       } else {
//           console.log("New OTP sent successfully", info.response);
//           res.status(200).json({ message: "New OTP sent successfully" });
//       }
//   });
//   console.log("newOTP",newOTP)

 
// };



const productdetails=async(req,res)=>{
  let id=req.params.id;
  const products=await productcollection.findById(id)
  res.render('productdetails',{products})
}




const profile=async (req,res)=>{
  try{
    const user=req.session.user;
    console.log(user);

    const data=await users.findOne({email:user});
    if(user){
      res.render('profile',{data});
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


// Controller function to add a new address to a user by ID
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



// const profiledata= async (req,res)=>{
// try{
//  const user=req.session.user;
//   const id=req.params.id;

  

//   if(data){
//     res.render('profile',{ data });
//   }
// else{
//   res.redirect('/home')
// }
// }catch(error){
// console.log(`Error fetching user with ID : ${error}`);
// }

// }

const confirmLoad=async(req,res)=>{
 const userId =req.session.user;
  const user=await users.findOne({email:userId}).populate('cart')
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


module.exports={
  loginVerify,
  otpLoad,
  verifyOtp,
  insertUser,
  loginLoad,
  homeLoad,
  userLogout,
  signupLoad,
  productdetails,
  profile,
  addAddressToUser,
  editAddress,
  addaddress,
  updateAddress,
  editprofile,
  updateprofile,
  resetpassLoad,
  checkpassword,
editaddresscheckout,
updateAddresscheckout,
addaddresscheckout,
addAddressToCheckout 


 

}