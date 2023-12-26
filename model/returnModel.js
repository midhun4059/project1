const mongoose = require("mongoose");

const ReturnSchema = new mongoose.Schema({
  userId: String,
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "orders" },
  product: { type: mongoose.Schema.Types.ObjectId, ref: "product" },
  quantity: Number,
  status: String,
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

const returnCollection = mongoose.model("returndetails", ReturnSchema);

module.exports = returnCollection;
