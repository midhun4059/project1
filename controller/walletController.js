const users = require("../model/userModels");
const productcollection = require("../model/productModels");
const walletcollection = require("../model/walletModel");

const walletLoad = async (req, res) => {
  try {
    const userId = req.session.user;
    const user = await collection.findOne({ email: userId });
    const wallet = await walletcollection.findOne({ customerid: user._id });

    if (wallet) {
      const walletBalance = wallet.Amount;
      res.render("profile", { walletBalance });
    } else {
      res.render("profile", { walletBalance: 0 });
    }
  } catch (error) {
    res.status(500).send("Internal server error");
  }
};

const walletHistory = async (req, res) => {
  try {
    const userId = req.session.user;
    const user = await users.findOne({ email: userId });
    const wallet = await walletcollection.findOne({ customerid: user._id });

    if (wallet) {
      const walletBalance = wallet.Amount;
      const transactions = wallet.transactions;

      res.render("walletHistory", { walletBalance, transactions });
    } else {
      res.render("walletHistory", { walletBalance: 0, transactions: [] });
    }
  } catch (error) {
    res.status(500).send("Internal server error");
  }
};
module.exports = {
  walletLoad,
  walletHistory,
};
