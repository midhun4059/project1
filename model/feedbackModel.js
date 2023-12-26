const mongoose=require("mongoose");

const feedbackSchema=new mongoose.Schema({
  username: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    
  },product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "product",
    required: true,
  },
  feedback:{
    type:String,
  },
  rating:{
    type:Number,
  }
})

const feedbackCollection=new mongoose.model("feedback",feedbackSchema);

module.exports=feedbackCollection