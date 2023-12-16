const bannercollection=require("../model/bannerModel")

const fileUpload = require('express-fileupload');

const multer=require('multer')

const storage=multer.diskStorage({
  destination:function(req,file,cb){
      cb(null,path.join(__dirname,'../public/images'))
  },
  filename:function(req,file,cb){
      const name=Date.now()+'-'+file.originalname;
      cb(null,name)
  }
})




const bannerLoad=async (req,res)=>{
  try{

const banner=await bannercollection.find();

    res.render('bannerAdmin',{banner});

  }
  catch(error){
    console.log(error);
  }
}

const addbannerLoad=async(req,res)=>{
  res.render('addBanner');
}

const uploads = multer({storage:storage});

const bannerAdd=async(req,res)=>{
  try{
    const banner=
    {
      description:req.body.description,
      image: req.files.map(file => file.filename),
    }

    await bannercollection.insertMany([banner]);

    res.redirect('/bannerAdmin');
  }

  catch(error){
    console.log(error);
  }
}


const deleteBanner=async (req,res)=>{
  try{
    const id=req.params.id;
    const result=await bannercollection.findByIdAndRemove({_id:id});
console.log('62:',result);

    if(result){
      res.redirect('/bannerAdmin')
    }else{
      console.log('product not found');
    }
  }catch(error){
    console.log('Error deleting the category:',error);
  }
}




module.exports={
  bannerAdd,
  bannerLoad,
  addbannerLoad,
  deleteBanner,
}