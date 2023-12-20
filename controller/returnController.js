const userCollection = require("../model/userModels");
const returnCollection = require("../model/returnModel");
const walletcollection=require("../model/walletModel")

const returnLoad=async (req,res)=>{
    try{
        const orderreturn = await returnCollection.find({}).populate('product');

        orderreturn.forEach(retur => {
            retur.productName = retur.product ? retur.product.name : 'N/A';
        });
        
     res.render("return",{orderreturn})
        
    }catch(error){
        console.error("Error due to render coupon:", error);
    res.status(500).send("Error ");
    }
} 

const accept=async(req,res)=>{
    try{
        let orderId= req.params.id;
        const returndetails=await returnCollection.findOne({orderId:orderId})
        const orderDetails=await userCollection.findOne({'orders._id':orderId})
        
        const order = orderDetails.orders.find(order => order._id == orderId);
        
        const updateorder = await userCollection.findOneAndUpdate(
            {'orders._id':orderId }, 
            {$set:{'orders.$.status':'Returned'}}, 
            {new:true } 
        );
        const updateReturn = await returnCollection.findOneAndUpdate(
            { orderId: orderId },
            { $set: { status: 'Return approved' } },
            { new: true }
        );
       


        res.redirect('/admin/return')

    }catch(error){
        console.log("Error in accepting the product ", error)
        res.status(500).send("Error due to accept return");
    }
}

const reject=async(req,res)=>{
    try{
        let orderId= req.params.id;
        const returndetails=await returnCollection.findOne({orderId:orderId})
        const orderDetails=await userCollection.findOne({'orders._id':orderId}).populate('orders.product')
        const order = orderDetails.orders.find(order => order._id == orderId);
        
        const updateorder = await userCollection.findOneAndUpdate(
            {'orders._id':orderId }, 
            {$set:{'orders.$.status':'Rejected'}}, 
            {new:true } 
        );

        const updateReturn = await returnCollection.findOneAndUpdate(
            { orderId: orderId },
            { $set: { status: 'Return Rejected' } },
            { new: true }
        );
     
        res.redirect('/admin/return')


    }catch(error){
        console.log("Error in Rejecting the product ", error)
        res.status(500).send("Error due to reject return")
    }
}



module.exports={
    returnLoad,accept,reject
}