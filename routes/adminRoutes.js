const express=require("express");
const adminRoutes=express();
const multer=require('multer')
const path=require("path");
const session=require("express-session")
const adminController=require("../controller/adminController")
const productController=require('../controller/productController');
const bannerController=require("../controller/bannerController")
const returnController=require("../controller/returnController")
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

adminRoutes.get("/admincoupon",adminController.CouponLoad);
adminRoutes.get("/admin/add-coupon",adminController.addCoupon);
adminRoutes.post("/admin/add-coupon",adminController.insertCoupon);
adminRoutes.post("/admin/couponblock/:id",adminController.couponBlock);
adminRoutes.post("/admin/couponunblock/:id",adminController.couponUnblock);

adminRoutes.get('/bannerAdmin',bannerController.bannerLoad);
adminRoutes.get('/admin/addbanner',bannerController.addbannerLoad);
adminRoutes.post('/admin/addbanner',upload.array('image',3),bannerController.bannerAdd);
adminRoutes.get('/banner/delete/:id',bannerController.deleteBanner);

adminRoutes.get('/admin/products',productController.productsLoad)
adminRoutes.get('/admin/products/add',productController.addProductLoad)
adminRoutes.post('/admin/products/add',upload.array('image',3),productController.insertProducts)
adminRoutes.get('/admin/products/delete/:id',productController.deleteProduct)
adminRoutes.get('/admin/products/edit/:id',productController.editProductLoad)
adminRoutes.post('/admin/products/update/:id',upload.array('image',3),productController.updateProduct);

adminRoutes.get('/admin/products/deleteImage/:productId/:imageIndex', productController.deleteProductImage);

adminRoutes.post('/filterproducts',productController.filterProducts)

adminRoutes.get('/salesReport',adminController.salesReport);
adminRoutes.get('/salesReportPdf',adminController.salesReportPdf)

adminRoutes.post('/admin/logout',adminController.adminLogout);

adminRoutes.get("/admin/return",returnController.returnLoad)

adminRoutes.get("/returnaccept/:id",returnController.accept)
adminRoutes.get("/returndeny/:id",returnController.reject)


module.exports=adminRoutes;
