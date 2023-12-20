const productcollection = require("../model/productModels");
const Users = require("../model/userModels");
const Razorpay = require("razorpay");

const users=require('../model/userModels')
const couponcollection=require('../model/couponModel');
const walletcollection=require('../model/walletModel');
const returnCollection=require('../model/returnModel');

const dotenv = require("dotenv").config();
var instance = new Razorpay({
  key_id:"rzp_test_n0MSjxnGUDs0pC",
  key_secret: '5d7I3Jns3vvOZpO0VPiFbrco',
});

const razorpayLoad = async (req, res) => {
  try {
    const username = req.session.user;
    

    const users = await Users.findOne({ email: username });
    // console.log("users",users);
    const totalPrice = users.totalPrice;
  
    var options = {
      amount: totalPrice * 100, // amount in the smallest currency unit
      currency: "INR",
      receipt: "order_rcptid_11",
    };
    const razorpayorder = await instance.orders.create(options);
    
    return res.json({ razorpayorder });
  } catch (error) {
    console.error(error);
  }
};


const returnOrder=async(req,res)=>{
  try{
      const orderId = req.params.id;
      const userId = req.session.user;
      const user=await users.findOne({email:userId}).populate('orders.product');
      const orderDetails=await users.findOne({'orders._id':orderId}).populate('orders.product');
      const order = orderDetails.orders.find(order => order._id == orderId);

      // if (order.paymentmethod === 'Online Payment' || order.paymentmethod === 'Cash On Delivery' && (order.status === 'Delivered')) {
      //     const wallet = await walletcollection.findOneAndUpdate(
      //         { customerid: user._id },
      //         { $inc: {Amount: (order.Amount) } ,
      //         $push:{
      //           transactions:{
      //               type:'Refund',
      //               amount:(order.Amount),
      //           },
      //       },
            
            
      //       },
      //         { new: true }
      //     ) 
      // }

      for (const order of user.orders) {
          const product = order.product;
          const orderedQuantity = order.quantity;
          product.stock += orderedQuantity;
          await product.save();
      }
         

       await users.findOneAndUpdate(
          { 'orders._id': orderId }, 
          { $set: {'orders.$.status': 'Return requested !!' } }, 
          { new: true } 
      );

      const returnOrderDetails = new returnCollection({
        userId: userId,
        orderId: orderId,
        product: order.product._id,
        quantity: order.quantity,
        status: 'Requested', 
        date: new Date(),
    });
    await returnOrderDetails.save();

      res.redirect('/showorders')

  }catch(error){
      console.log("Error",error)
  }
}



const showorders=async(req,res)=>{
  try{
    const email=req.session.user;
    const user=await users.findOne({email:email}).populate('orders.product');
    
    if(user){
     res.render('showorders',{user,orderItems:user.orders})
  
    }else{
     res.redirect('/checkout');
    }
   
  }catch(error){
    console.error(error);
  }
  }
  
  const cancelOrder=async(req,res)=>{
    try{
        const orderId = req.params.id;
        const userId = req.session.user;
        const user=await users.findOne({email:userId}).populate('orders.product');
        const orderDetails=await users.findOne({'orders._id':orderId}).populate('orders.product')
        const order = orderDetails.orders.find(order => order._id == orderId);
       
        if (order.paymentmethod === 'Online Payment'|| order.paymentmethod==='Wallet' && (order.status === 'Pending' || order.status === 'Shipped' || order.status === 'Out for Delivery')) {
            const wallet = await walletcollection.findOneAndUpdate(
                { customerid: user._id },
                { $inc: {Amount: (order.Amount)},
                $push:{
                    transactions:{
                        type:'Refund',
                        amount:(order.Amount),
                    },
                },
            },
                { new: true }
            )
        };
  
        for (const order of user.orders) {
            const product = order.product;
            const orderedQuantity = order.quantity;
            product.stock += orderedQuantity;
            await product.save();
        }
               
        
        const updateorder = await users.findOneAndUpdate(
            { 'orders._id': orderId }, 
            { $set: {'orders.$.status': 'Cancelled' } }, 
            { new: true } 
        );
       
        res.redirect('/showorders')
        
  
    }catch (error) {
        console.error('Error loading :', error);
        res.status(500).send('Internal Server Error');
      }
  }
  

  const couponlist= async (req, res) => {
    try {
      const couponCodes = await couponcollection.find({ isBlocked: false });
      res.json(couponCodes);
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  };


module.exports = {
  razorpayLoad,
  returnOrder,
  showorders,
cancelOrder,
couponlist,
};
