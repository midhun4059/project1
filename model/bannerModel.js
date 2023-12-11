const mongoose=require('mongoose')

const bannerSchema=new mongoose.Schema({
  image:[{
    type:String,
    require:true,
  }]
  ,
  description:{
    type:String,
    require:true,
  }
})

const bannercollection=new mongoose.model('banner',bannerSchema);

module.exports=bannercollection;