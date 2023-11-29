const mongoose=require('mongoose')

const productSchema=new mongoose.Schema({

name:{
  type:String,
  require:true,
},
  description:{
    type:String,
    require:true,
  },
  price:{
    type:Number,
    require:true,
  },
  category:{
    type:String,
    require:true,
  },
  image:[{
    type:String,
    require:true,
  }]
  ,
  stock:{
    type:Number,
    require:true,
  }
})

const productcollection=new mongoose.model('product',productSchema)

module.exports=productcollection;