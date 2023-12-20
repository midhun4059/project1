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

const updateProduct = async (req, res) => {
  try {
    let id = req.params.id;

    // Check if the product exists
    const existingProduct = await productcollection.findById(id);

    if (!existingProduct) {
     
      return res.status(404).send("Product not found");
    }

    // Prepare the updated product data
    const updatedProductData = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      stock: req.body.stock,
    };

    // Update the image only if new files are uploaded
    if (req.files && req.files.length > 0) {
      updatedProductData.image = req.files.map((file) => file.filename);
    }

    // Update the product in the database
    const result = await productcollection.findByIdAndUpdate(id, updatedProductData);

    if (!result) {
   
      return res.status(500).send("Update failed");
    }

   
    res.redirect('/admin/products');
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

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
  
const deleteProductImage = async (req, res) => {
  try {
    const productId = req.params.productId;
    const imageIndex = req.params.imageIndex;

    // Check if the product exists
    const existingProduct = await productcollection.findById(productId);

    if (!existingProduct) {
      console.log("Product not found");
      return res.status(404).send("Product not found");
    }

    // Check if the image index is valid
    if (imageIndex < 0 || imageIndex >= existingProduct.image.length) {
      
      return res.status(400).send("Invalid image index");
    }

    // Remove the image at the specified index
    existingProduct.image.splice(imageIndex, 1);

    // Save the updated product
    await existingProduct.save();

    console.log("Image deleted successfully");
    res.redirect(`/admin/products/edit/${productId}`);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};


const filterProducts= async (req, res) => {
  try {
      const selectedCategory = req.body.category;

      // Use the selected category to filter products from the database
      let filteredProducts;
      if (selectedCategory) {
          // If a specific category is selected, filter by that category
          filteredProducts = await productcollection.find({ category: selectedCategory });
      } else {
          // If no category is selected, return all products
          filteredProducts = await productcollection.find();
      }

      // Render the filtered products
      res.render('productsonly', { products: filteredProducts });
  } catch (error) {
      // Handle errors
      console.error('Error filtering products:', error);
      res.status(500).send('Internal Server Error');
  }
};



module.exports={productdetails,
  productsLoad,
  addProductLoad,
  editProductLoad,
  insertProducts,
  deleteProduct,

  productonly,

  sortedProducts,
  
  deleteProductImage,

  filterProducts,

  updateProduct}