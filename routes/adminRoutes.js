const express=require("express");
const adminRoutes=express();
const path=require("path");
const session=require("express-session")
const adminController=require("../controller/adminController")
const productController=require('../controller/productController');

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
adminRoutes.get('/admin/orders',adminController.orderLoad);
adminRoutes.get('/updateOrderStatus/:userId/:orderId/:newStatus',adminController.updateOrderStatus)
adminRoutes.post('/admin/logout',adminController.adminLogout);

adminRoutes.get('/admin/products',productController.productsLoad)
adminRoutes.get('/admin/products/add',productController.addProductLoad)
adminRoutes.post('/admin/products/add',upload,productController.insertProducts)
adminRoutes.get('/admin/products/delete/:id',productController.deleteProduct)
adminRoutes.get('/admin/products/edit/:id',productController.editProductLoad)
adminRoutes.post('/admin/products/update/:id',upload,productController.updateProduct)

module.exports=adminRoutes;
