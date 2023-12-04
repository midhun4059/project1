const mongoose = require('mongoose')


const transactionSchema = new mongoose.Schema({
    type: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    time: {
      type: Date,
      default: Date.now,
    },
  });

const WalletSchema=new mongoose.Schema({
    customerid:{
      type: String,
  
    },
    Amount:{type:Number,default:0},
    transactions:[transactionSchema],
})


const walletcollection = mongoose.model("Walletdetails", WalletSchema)

module.exports = walletcollection
