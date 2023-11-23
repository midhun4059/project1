const session=require('express-session');
const productcollection = require('../model/productModels');








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


const insertProducts = async (req, res) => {
  try {
    const productdata = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      image: req.file.filename,
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
  image:req.file.filename,
  stock:req.body.stock,
})
if(!result){
  console.log("not found");
}else{
  res.redirect('/admin/products')
}

  }
catch{
  console.log('Error updating the product:',err);
}
}

module.exports={productdetails,
  productsLoad,
  addProductLoad,
  editProductLoad,
  insertProducts,
  deleteProduct,
  updateProduct}