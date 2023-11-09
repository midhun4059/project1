const mongoose=require('mongoose')



const addressSchema = new mongoose.Schema({
  street: String,
  city: String,
  state: String,
  pincode: String,
  country: String,
  primary: {
    type: Boolean,
    default:false,
},
});

const userSchema=new mongoose.Schema({

  username:{
    type:String,
    required:true
  },

  email:{
    type:String,
    required:true,
  },
  password:{
    type:String,
    required:true
  },
  OTP:{
    type:String,
    required:false
  },
  phone:{
    type:String,
    required:true
  },
  isblocked:{
    type:Boolean,
    default:false
  },
  address:[addressSchema]
})




module.exports= mongoose.model("User",userSchema);



