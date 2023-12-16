const categorycollection = require('../model/categoryModel');
const productcollection = require('../model/productModels');
const users=require('../model/userModels');
const couponCollection=require('../model/couponModel');
const { render } = require('../routes/userRoutes');


const adminLog = async (req, res) => {
  if (req.session.admin) {
    try {
      // Get the last seven days
      const lastSevenDays = [];
      let currentDate = new Date();
      for (let i = 0; i < 7; i++) {
        let day = new Date();
        day.setDate(currentDate.getDate() - i);
        lastSevenDays.push(day.toISOString().split('T')[0]);
      }

      // Use aggregation to get order counts for each day
      const orderCounts = await users.aggregate([
        {
          $unwind: '$orders',
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$orders.orderDate' },
            },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);

      // Create a map to easily access counts by date
      // const orderCountsMap = new Map(orderCounts.map(({ _id, count }) => [ _id, count ]));

      let data=[];

  const labels=lastSevenDays
  
  labels.forEach((label)=>{
    const order=orderCounts.find((o)=>o._id===label)
    if(order){
      data.push(order.count)
    }else{
      data.push(0)
    }

  })

  const labelsWithoutYearAndMounth=labels.map(label=>{
    const date=new Date(label);
    return date.getDate()
  })




      // console.log(data,labelsWithoutYearAndMounth);
      // console.log("orderCounts",orderCounts);



// Mounthly

let monthsOfCurrentYear = [];
    let currentYear = currentDate.getFullYear();

    for (let month = 1; month < 13; month++) {
        monthsOfCurrentYear.push(`${currentYear}-${month.toString().padStart(2, '0')}`);
    }


    const orderPerMounth = await users.aggregate([
      {
        $unwind: '$orders',
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m', date: '$orders.orderDate' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    let mountData=[];
    monthsOfCurrentYear.forEach((mounth)=>{
      const orderForMounth=orderPerMounth.find((order)=>order._id===mounth);
      if(orderForMounth){
        mountData.push(orderForMounth.count)
      } else{
        mountData.push(0)
      }
    })

    console.log("orderPerMounth",orderPerMounth,mountData,monthsOfCurrentYear);



      // Render the view with order counts
      res.render('index', { labelsWithoutYearAndMounth,data,mountData,monthsOfCurrentYear});
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  } else {
    res.render('adminLogin');
  }
};


const ExcelJS = require('exceljs');

const salesReport = async (req, res) => {
  try {
    const startDate = new Date(req.query.startDate);
    const endDate = new Date(req.query.endDate);
    endDate.setDate(endDate.getDate() + 1);

    const salesData = await users.aggregate([
      {
        $match: {
          'orders.orderDate': { $gte: startDate, $lt: endDate },
        },
      },
      {
        $unwind: '$orders',
      },
      {
        $lookup: {
          from: 'products', // Replace 'products' with the actual name of your product collection
          localField: 'orders.product',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
      {
        $unwind: '$productDetails',
      },
      {
        $project: {
          productName: '$productDetails.name',
          productPrice: '$productDetails.price',
          totalQuantity: '$orders.quantity',
          totalPrice: '$orders.Amount',
          orderDate: '$orders.orderDate',
          status: '$orders.status',
          paymentMethod: '$orders.paymentmethod',
          redeemedCoupon: '$orders.redeemedCoupon',
          address: '$address',
        },
      },
    ]);

    // Create a new workbook and add a worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sales Report');

    // Define the header row
    const headers = [
      'Product Name',
      'Product Price',
      'Total Quantity',
      'Total Price',
      'Order Date',
      'Status',
      'Payment Method',
      'Redeemed Coupon',
      'Address',
    ];
    worksheet.addRow(headers);

    // Populate the worksheet with sales data using forEach
    salesData.forEach((sale) => {
      const row = Object.values(sale);
      worksheet.addRow(row);
    });

    // Set the content type and headers for the response
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=sales_report.xlsx');

    // Send the workbook as a buffer to the response
    const buffer = await workbook.xlsx.writeBuffer();
    res.end(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};



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

const insertCategory = async (req, res) => {
  try {
    const categoryName = req.body.category;

    // Check if a category with the same name (case-insensitive) exists
    const existingCategory = await categorycollection.findOne({
      category: { $regex: new RegExp('^' + categoryName + '$', 'i') }
    });

    if (existingCategory) {
      console.log("Category already exists");
      res.redirect('/admin/category/add?AlreadyExisting=true');
    } else {
      // Check if there is only one category in capital case
      const capitalCategoryCount = await categorycollection.countDocuments({
        category: { $regex: new RegExp('^' + categoryName + '$') }
      });

      if (capitalCategoryCount > 0) {
        console.log("Category already exists in capital case");
        res.redirect('/admin/category/add?CapitalCaseExisting=true');
      } else {
        // Insert the category data
        const categoryData = {
          category: categoryName,
          description: req.body.description,
        };

        await categorycollection.insertMany([categoryData]);
        res.redirect('/admin/category');
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

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

salesReport,
};