const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema({
  Product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "product",
    required: true,
  },
  UserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const wishlist = mongoose.model("wishlist", wishlistSchema);

module.exports = wishlist;
