const express=require("express");
const adminRoutes=express();
const path=require("path");
const session=require("express-session")
const adminController=require("../controller/adminController")


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
const upload=multer({storage:storage}).single('image');


adminRoutes.use(express.urlencoded({extended:true}))
adminRoutes.use(express.json())
adminRoutes.use(express.static('public'))

adminRoutes.set('view engine','ejs')
adminRoutes.set('views','./views')
adminRoutes.use(express.static(path.join(__dirname,'public')))

adminRoutes.use(session({
  secret:"wdgfsathgfdsfsdsd",
  saveUninitialized:false,
  resave:false
}))

adminRoutes.get('/admin',adminController.adminLog);
adminRoutes.post('/admin',adminController.adminHome);


adminRoutes.get('/admin/users',adminController.usersLoad)
adminRoutes.post('/admin/block/:id',adminController.userBlock)
adminRoutes.post('/admin/unblock/:id',adminController.userUnblock);

adminRoutes.get('/admin/category',adminController.categoryLoad)
adminRoutes.get('/admin/category/add',adminController.addCategoryLoad)
adminRoutes.post('/admin/category/add',adminController.insertCategory)
adminRoutes.get('/admin/category/delete/:id',adminController.deleteCategory)
adminRoutes.get('/admin/category/edit/:id',adminController.editCategoryLoad)
adminRoutes.post('/admin/category/update/:id',adminController.updateCategory)

adminRoutes.get('/admin/products',adminController.productsLoad)
adminRoutes.get('/admin/products/add',adminController.addProductLoad)
adminRoutes.post('/admin/products/add',upload,adminController.insertProducts)
adminRoutes.get('/admin/products/delete/:id',adminController.deleteProduct)
adminRoutes.get('/admin/products/edit/:id',adminController.editProductLoad)
adminRoutes.post('/admin/products/update/:id',upload,adminController.updateProduct)

adminRoutes.get('/admin/orders',adminController.orderLoad);


adminRoutes.post('/admin/logout',adminController.adminLogout);
module.exports=adminRoutes;
