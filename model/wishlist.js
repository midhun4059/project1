const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  productId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'product',
    required:true,
  }
});

const wishlist = mongoose.model('Coupon', wishlistSchema);

module.exports=wishlist;