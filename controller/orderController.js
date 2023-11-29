const productcollection = require("../model/productModels");
const Users = require("../model/userModels");
const Razorpay = require("razorpay");
const dotenv = require("dotenv").config();
var instance = new Razorpay({
  key_id:"rzp_test_n0MSjxnGUDs0pC",
  key_secret: '5d7I3Jns3vvOZpO0VPiFbrco',
});

const razorpayLoad = async (req, res) => {
  try {
    const username = req.session.user;
    console.log("herer",);

    const users = await Users.findOne({ email: username });
    // console.log("users",users);
    const totalPrice = users.totalPrice;
    console.log("totalPrice", totalPrice);
    var options = {
      amount: totalPrice * 100, // amount in the smallest currency unit
      currency: "INR",
      receipt: "order_rcptid_11",
    };
    const razorpayorder = await instance.orders.create(options);
    console.log("Razorpay Order:", razorpayorder);

    return res.json({ razorpayorder });
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  razorpayLoad,
};
