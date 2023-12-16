const express=require("express");
const adminRoutes=express();
const multer=require('multer')
const path=require("path");
const session=require("express-session")
const adminController=require("../controller/adminController")
const productController=require('../controller/productController');
const bannerController=require("../controller/bannerController")
const adminAuth=require('../middleware/adminAuth')
// const fileUpload = require('express-fileupload');


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/images'));
    },
    filename: function (req, file, cb) {
        const name = Date.now() + '-' + file.originalname;
        cb(null, name);
    }
});
const upload = multer({ storage: storage });


// adminRoutes.use(fileUpload());

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


adminRoutes.get('/admin/users',adminAuth.isLogin,adminController.usersLoad)
adminRoutes.post('/admin/block/:id',adminAuth.isLogin,adminController.userBlock)
adminRoutes.post('/admin/unblock/:id',adminAuth.isLogin,adminController.userUnblock);

adminRoutes.get('/admin/category',adminAuth.isLogin,adminController.categoryLoad)
adminRoutes.get('/admin/category/add',adminAuth.isLogin,adminController.addCategoryLoad)
adminRoutes.post('/admin/category/add',adminAuth.isLogin,adminController.insertCategory)
adminRoutes.get('/admin/category/delete/:id',adminAuth.isLogin,adminController.deleteCategory)
adminRoutes.get('/admin/category/edit/:id',adminAuth.isLogin,adminController.editCategoryLoad)
adminRoutes.post('/admin/category/update/:id',adminAuth.isLogin,adminController.updateCategory)
adminRoutes.get('/admin/orders',adminAuth.isLogin,adminController.orderLoad);
adminRoutes.get('/updateOrderStatus/:userId/:orderId/:newStatus',adminAuth.isLogin,adminController.updateOrderStatus)

adminRoutes.get("/admincoupon",adminAuth.isLogin,adminController.CouponLoad);
adminRoutes.get("/admin/add-coupon",adminAuth.isLogin,adminController.addCoupon);
adminRoutes.post("/admin/add-coupon",adminAuth.isLogin,adminController.insertCoupon);
adminRoutes.post("/admin/couponblock/:id",adminAuth.isLogin,adminController.couponBlock);
adminRoutes.post("/admin/couponunblock/:id",adminAuth.isLogin,adminController.couponUnblock);

adminRoutes.get('/bannerAdmin',adminAuth.isLogin,bannerController.bannerLoad);
adminRoutes.get('/admin/addbanner',adminAuth.isLogin,bannerController.addbannerLoad);
adminRoutes.post('/admin/addbanner',adminAuth.isLogin,upload.array('image',3),bannerController.bannerAdd);
adminRoutes.get('/banner/delete/:id',adminAuth.isLogin,bannerController.deleteBanner);




adminRoutes.get('/admin/products',adminAuth.isLogin,productController.productsLoad)
adminRoutes.get('/admin/products/add',adminAuth.isLogin,productController.addProductLoad)
adminRoutes.post('/admin/products/add',adminAuth.isLogin,upload.array('image',3),productController.insertProducts)
adminRoutes.get('/admin/products/delete/:id',adminAuth.isLogin,productController.deleteProduct)
adminRoutes.get('/admin/products/edit/:id',adminAuth.isLogin,productController.editProductLoad)
adminRoutes.post('/admin/products/update/:id',adminAuth.isLogin,upload.array('image',3),productController.updateProduct);

adminRoutes.get('/admin/products/deleteImage/:productId/:imageIndex', productController.deleteProductImage);

adminRoutes.post('/filterproducts',productController.filterProducts)

adminRoutes.get('/salesReport',adminAuth.isLogin,adminController.salesReport);

adminRoutes.post('/admin/logout',adminController.adminLogout);

module.exports=adminRoutes;
