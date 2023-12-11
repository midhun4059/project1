const session=require('express-session');
const express=require("express");

const productcollection = require('../model/productModels');
const app=express();
const fileUpload = require('express-fileupload');
app.use(fileUpload());
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


// const upload = multer({storage:storage});

// const upload = multer();



const productdetails=async(req,res)=>{
  let id=req.params.id;
  const products=await productcollection.findById(id)
  res.render('productdetails',{products})
}

const productsLoad=async(req,res)=>{
  const product=await productcollection.find()
  res.render('products',{product})
}

const addProductLoad=async(req,res)=>{
  res.render('addProducts');
}

const upload = multer({storage:storage});

const insertProducts = async (req, res) => {
  try {
    const productdata = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      image: req.files.map(file => file.filename),
      stock: req.body.stock,
    };
    const check = await productcollection.findOne({ name: req.body.name });

    if (check) {
      res.redirect('/admin/products/add?AlreadyExisting=true');
      return;
    } else {
      
      await productcollection.insertMany([productdata]);
      res.redirect('/admin/products');
    }
  } catch (error) {
    console.log(error);
  }
}


const editProductLoad=async(req,res)=>{
  let id=req.params.id;
await productcollection.findById(id)
.then(product=>{
  if(!product){
  res.redirect('/admin/products')
  }else{
  res.render('editproduct',{product:product})
}
})
.catch(error=>{
  console.log("Error in finding the products:",error);
  res.redirect('/admin/products')
})
}

const deleteProduct=async (req,res)=>{
  try{
    const id=req.params.id;
    const result=await productcollection.findByIdAndRemove({_id:id});
    if(result){
      res.redirect('/admin/products')
    }else{
      console.log('product not found');
    }
  }catch(error){
    console.error("Error deleting user:",error)
  }
}

const updateProduct=async(req,res)=>{
  try{
let id=req.params.id;

const check=await productcollection.findById(id);


const result=await productcollection.findByIdAndUpdate(id,{
  name:req.body.name,
  description:req.body.description,
  price:req.body.price,
  category:req.body.category,
  image: req.files.map(file => file.filename),
  stock:req.body.stock,
})
if(!result){
  console.log("not found");
}else{
  res.redirect('/admin/products')
}

  }
catch(error){
  console.log(error);
}
}

 
const productonly=async(req,res)=>{
  if(req.session.user){
    const products=await productcollection.find()
    res.render('productsonly',{products})
  }else{
    res.redirect('/login')
  }
  }

  const sortedProducts = async (req, res) =>{
  try {
    if (req.session.user) {
      {
        const sortOrder = req.body.sort;
        const products=await productcollection.find()
    
        // Your existing logic to fetch and filter products from the database
    
        // Sort the products based on the selected order
        if (sortOrder === 'asc') {
            products.sort((a, b) => a.price - b.price);
        } else if (sortOrder === 'desc') {
            products.sort((a, b) => b.price - a.price);
        }
    
        // Render the sorted products and send them back to the client
        res.render('productsonly', { products });
    }
  }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}
  




module.exports={productdetails,
  productsLoad,
  addProductLoad,
  editProductLoad,
  insertProducts,
  deleteProduct,

  productonly,

  sortedProducts,
  

  updateProduct}