const mongoose=require('mongoose');

const mongoDBconnection=async()=>{
try{
  console.log("Mongo is connected")
  const connect=await mongoose.connect(process.env.MONGO)
  console.log("data base connected");
}
catch(error){
  console.log("errror")
  console.log(error);
}

}
module.exports=mongoDBconnection;