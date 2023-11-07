const mongoose=require('mongoose')

const categorySchema=new mongoose.Schema({
  category:{
    type:String,
    require:true,
  },
  description:{
    type:String,
    require:true,
  }
})

const categorycollection=new mongoose.model('category',categorySchema);

module.exports=categorycollection;