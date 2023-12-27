const feedbackCollection = require("../model/feedbackModel");
const users = require("../model/userModels");
const productCollection = require("../model/productModels");

const feedback = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const feedbackText = req.body.feedback;
    const rating = req.body.rating;
    const user = req.session.user;
    let orderID
    const userId = await users.findOne({ email: user });
    const orders = userId.orders;
    orders.forEach((ele)=>{
      const orderid = ele.product
      
      orderID = orderid
    })
   
    

    const newFeedback = new feedbackCollection({
      username: userId._id,
      product: orderId,
      feedback: feedbackText,
      rating: rating,
    });

    await newFeedback.save();

    res.redirect("/showorders");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  feedback,
};
