const categorycollection = require('../model/categoryModel');
const productcollection = require('../model/productModels');
const users=require('../model/userModels');
const couponCollection=require('../model/couponModel');
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

const addCategoryLoad=async (req,res)=>{
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


const editCategoryLoad = async (req, res) => {
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
const CouponLoad=async(req,res)=>{
 const coupons=await couponCollection.find();
 res.render('adminCoupon',{coupons});
}
const addCoupon=async(req,res)=>{
  res.render('addCoupon');
}

const insertCoupon=async(req,res)=>{
  try{
    const data={
     couponCode: req.body.couponCode,
     discountAmount:req.body.discountAmount,
     expirationDate:req.body.expirationDate,
     minimumpurchase:req.body.minimumpurchase,
    }

    const check=await couponCollection.findOne({couponCode:req.body.couponCode});
  
    if(check){
      console.log("already exists");
      res.redirect('/adminCoupon');
    }

    else{
      await couponCollection.insertMany([data])
      res.redirect('/adminCoupon');
    }
  }catch(error){
    console.error(error)
  }
}

const couponBlock=async (req, res) => {
  try {
    const id = req.params.id;
    console.log('204:',id)
    const user = await couponCollection.findByIdAndUpdate(id, { isBlocked: true });

    if (!user) {
      res.status(400).json({ error: 'User not found or could not be blocked' });
    }
   
    res.redirect('/adminCoupon');
  } catch (error) {
    console.error(error);
    
}
};

const couponUnblock=async (req, res) => {
  try {
    const id = req.params.id;
    console.log('221:',id)

    const user = await couponCollection.findByIdAndUpdate(id, { isBlocked: false });

    if (!user) {
      res.status(400).json({ error: 'User not found or could not be unblocked' });
    } 
    res.redirect('/adminCoupon');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const orderLoad=async(req,res)=>{
  try{
const user=await users.find({orders:{$exists:true,$ne:[]}}).populate('orders.product')

res.render('orders',{user})

  }catch(error){
    console.error(error);
  }
}

const updateOrderStatus= async(req,res)=>{
  const userId=req.params.userId;
  const orderId=req.params.orderId;
  const newStatus=req.params.newStatus;
console.log('278:',orderId);
console.log('279:',newStatus);

try{
  const order=await users.findOneAndUpdate(
    {'orders._id':orderId},
    {$set:{'orders.$.status':newStatus}},
    {new:true}

  )
  res.redirect('/admin/orders')
}catch(error){
  console.log(error);
}
}




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
addCategoryLoad,
insertCategory,
editCategoryLoad,
updateCategory,
deleteCategory,
orderLoad,

CouponLoad,
addCoupon,
insertCoupon,
couponBlock,
couponUnblock,

updateOrderStatus,
};