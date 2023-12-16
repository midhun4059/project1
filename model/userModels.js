const mongoose=require('mongoose')


const cartItemSchema=new mongoose.Schema({
 
 cart:[{
  productId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'product',
    required:true,
  },
  quantity:{
    type:Number,
    required:true,
    default:1,
    },
    totalPrice:{
      type:Number,
      default:0,
    },
    paymentmethod:{
      type:String,
      default:" ",
    }
}]
})

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
    type:Number,
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
  isVerified:{
type:Boolean,
default:false
  },
  address:[addressSchema],

  cartitems:[cartItemSchema],
  totalPrice:{
    type:Number,
    default:0,
  },

  orders:[{
    product: {
    type:mongoose.Schema.Types.ObjectId,
    ref: 'product' ,
    required: true,
},
productName: String,
quantity: {
type: Number,
 required: true,
default: 1
},
status:{
    type:String,
    default:'Pending',
},
paymentmethod:{
    type:String,
    default:''
},
redeemedCoupon:{
type:String,
default:''
},

Amount:{
  type:Number,
  default:''
},
orderDate: {
    type: Date,
    required: true,
    default: Date.now
},
address:{
  type:String
}
}],
})

module.exports= mongoose.model("User",userSchema);



