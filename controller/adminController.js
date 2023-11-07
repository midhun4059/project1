const categorycollection = require('../model/categoryModel');
const productcollection = require('../model/productModels');
const users=require('../model/userModels');
const { render } = require('../routes/userRoutes');


const adminLog=async(req,res)=>{
  if(req.session.admin){
    res.render('index')
  }else{
    res.render('adminLogin')
  }
}



//admin credential

const adEmail='admin@gmail.com';
const adPassword='123';

const adminHome=async(req,res)=>{
  if(req.body.email===adEmail&&req.body.password===adPassword){
    req.session.admin=req.body.email
    res.redirect('/admin')

  }else{
    res.render('adminLogin',{error:'Invalid credential'})
  }
}

const usersLoad=async(req,res)=>{
  const user= await users.find()
  res.render('user',{user})
}

const categoryLoad=async(req,res)=>{
  const category=await categorycollection.find()
  res.render('category',{category})
}

const addCategory=async (req,res)=>{
  res.render('addCategory')
}

const insertCategory=async(req,res)=>{
   try{
    const categorydata={
      category:req.body.category,
      description:req.body.description,
    } 
    const check=await categorycollection.findOne({category:req.body.category})

    if( check){
 
      console.log("already exist");
      res.redirect('/admin/category/add?AlreadyExisting=true')
    }
   
    else{

      console.log(categorydata);
      await categorycollection.insertMany([categorydata])
      res.redirect('/admin/category')
    }

   }
   catch(error){
    console.log(error);


   }
}


const editCategory = async (req, res) => {
  try {
    let id = req.params.id;

    const category = await categorycollection.findById(id);

    if (!category) {
      res.redirect('/admin/category');
    } else {
      res.render('editcategory', { category: category });
    }
  } catch (error) {
    console.log("Error in finding the category:", error);
    res.redirect('/admin/category');
  }
}


const updateCategory=async(req,res)=>{
try{
  let id=req.params.id;

const check=await categorycollection.findById(id);

if(check){
  res.redirect('/admin/category')
}
else{

  const result=await categorycollection.findByIdAndUpdate(id,{
    category:req.body.category,
    description:req.body.description
  })
if(!result){
  console.log('not found');
}else{
  res.redirect('/admin/category')
}
}

}
catch{
  console.log('Error updating the category:',err);
}

  
}

const deleteCategory=async (req,res)=>{
  try{
    const id=req.params.id;
    const result=await categorycollection.findByIdAndRemove({_id:id});
    if(result){
      res.redirect('/admin/category')
    }else{
      console.log('product not found');
    }
  }catch(error){
    console.log('Error deleting the category:',error);
  }
}

const productsLoad=async(req,res)=>{
  const product=await productcollection.find()
  res.render('products',{product})
}

const addProduct=async(req,res)=>{
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
      console.log(productdata);
      await productcollection.insertMany([productdata]);
      res.redirect('/admin/products');
    }
  } catch (error) {
    console.log(error);
  }
}


const editProduct=async(req,res)=>{
  let id=req.params.id;
  const product=await productcollection.findById(id)
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
if(check){
  res.redirect('/admin/products')
}

else{


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
  }
catch{
  console.log('Error updating the product:',err);
}
}


const userBlock = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await users.findByIdAndUpdate(id, { isblocked: true });

    if (!user) {
      res.status(400).json({ error: 'User not found or could not be blocked' });
    }
   
    res.redirect('/admin/users');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Unblock a user
const userUnblock = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await users.findByIdAndUpdate(id, { isblocked: false });

    if (!user) {
      res.status(400).json({ error: 'User not found or could not be unblocked' });
    } 
    res.redirect('/admin/users');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



const adminLogout=(req,res)=>{
  req.session.destroy((err)=>{
    if(err){
      console.log(err);
      res.redirect('/admin')
    }else{
      console.log("logout susccesfully");
      res.status(200)
      res.redirect('/admin')
    }
  })
}

module.exports=
{adminLog,
  adminHome,
  adminLogout,
  
  usersLoad,
  userBlock,
  userUnblock,

  categoryLoad,
addCategory,
insertCategory,
editCategory,
updateCategory,
deleteCategory,

productsLoad,
addProduct,
editProduct,
insertProducts,
deleteProduct,
updateProduct};