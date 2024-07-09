const { users } = require("moongose/models");
const productCollection = require("../model/productModels");
const User = require("../model/userModels");
const walletcollection = require("../model/walletModel");
const Wishlist = require("../model/wishlistModels");

const cart = async (req, res) => {
  try {
    const useremail = req.session.user;
    const user = await User.findOne({ email: useremail }).populate(
      "cartitems.cart.productId"
    );
    const cartitems = user.cartitems.map((cart) => cart);
    if (user) {
      const totalPriceArray = user.cartitems.map((cartItem) => {
        return cartItem.cart.reduce((acc, curr) => {
          return acc + curr.productId.price * curr.quantity;
        }, 0);
      });
      const totalPrice = totalPriceArray.reduce((acc, price) => acc + price, 0);

      user.totalPrice = totalPrice;

      await user.save();
      res.render("cart", { cartitems, user });
    } else {
      res.redirect("/");
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const addtocart = async (req, res) => {
  try {
    if (req.session.user) {
      const { productId, quantity } = req.body;
      const useremail = req.session.user;

      const product = await productCollection.findById(productId);
      const user = await User.findOne({ email: useremail });

      if (!product || !user) {
        return res.status(404).json({ error: "Product not found" });
      }

      if (user && product) {
        if (!user.cartitems) {
          user.cartitems = [];
        }

        const existingProduct = user.cartitems.find
        ((cartitems) => {
          const foundproduct = cartitems.cart.find((item) => {
            return item.productId._id.toString() === productId;
          });
          return foundproduct;
        });
        if (existingProduct) {
          existingProduct.cart.forEach((product) => {
            product.quantity += 1;
          });
        } else {
          const cartitemspush = {
            productId: productId,
            quantity: 1,
            totalPrice: product.price,
          };
          user.cartitems.push({
            cart: [cartitemspush],
          });
        }
        if (user) {
          const wishlistItem = await Wishlist.findOneAndRemove({
            UserId: user._id,
            Product: productId,
          });
        }

        await user.save();
        res.redirect("/cart");
      } else {
        res.redirect("/");
      }
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteCart = async (req, res) => {
  try {
    const id = req.params.id;

    const email = req.session.user;
    const data = await User.findOneAndUpdate(
      { email: email },
      { $pull: { cartitems: { cart: { $elemMatch: { productId: id } } } } }
    );

    if (data) {
      res.redirect("/cart");
    } else {
      res.redirect("/");
    }
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

const addQuantity = async (req, res) => {
  const { userId, productId } = req.params;

  try {
    const user = await User.findById(userId).populate(
      "cartitems.cart.productId"
    );

    if (!user) {
      return res.status(404).send("User not found");
    }

    let foundCartItem;
    let foundProduct;

    user.cartitems.forEach((cartItem) => {
      const product = cartItem.cart.find(
        (product) => product.productId._id.toString() === productId
      );

      if (product) {
        foundCartItem = cartItem;
        foundProduct = product;
      }
    });

    if (!foundCartItem || !foundProduct) {
      return res.status(404).send("Product not found in the cart");
    }

    foundProduct.quantity += 1;

    const totalPriceArray = user.cartitems.map((cartItem) => {
      return cartItem.cart.reduce((acc, curr) => {
        return acc + curr.productId.price * curr.quantity;
      }, 0);
    });

    const totalPrice = totalPriceArray.reduce((acc, price) => acc + price, 0);
    user.totalPrice = totalPrice;

    await user.save();
    res.redirect("/cart");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

const subQuantity = async (req, res) => {
  const { userId, productId } = req.params;

  try {
    const user = await User.findById(userId).populate(
      "cartitems.cart.productId"
    );

    if (!user) {
      return res.status(404).send("User not found");
    }

    let foundCartItem;
    let foundProduct;

    user.cartitems.forEach((cartItem) => {
      const product = cartItem.cart.find(
        (product) => product.productId._id.toString() === productId
      );

      if (product) {
        foundCartItem = cartItem;
        foundProduct = product;
      }
    });

    if (!foundCartItem || !foundProduct) {
      return res.status(404).send("Product not found in the cart");
    }

    foundProduct.quantity = Math.max(foundProduct.quantity - 1, 1);

    const totalPriceArray = user.cartitems.map((cartItem) => {
      return cartItem.cart.reduce((acc, curr) => {
        return acc + curr.productId.price * curr.quantity;
      }, 0);
    });

    const totalPrice = totalPriceArray.reduce((acc, price) => acc + price, 0);

    user.totalPrice = totalPrice;
    await user.save();

    res.redirect("/cart");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

const checkoutLoad = async (req, res) => {
  try {
    const email = req.session.user;
    const user = await User.findOne({ email: email }).populate(
      "cartitems.cart.productId"
    );

    const wallet = await walletcollection.findOne({ customerid: user._id });

  

    if (user && user.cartitems) {
      res.render("checkout", {
        cartItems: user.cartitems,
        user,
        wallet: wallet.Amount,
      });
    } else {
      res.redirect("/home");
    }
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

const confirmLoad = async (req, res) => {
  try {
    const email = req.session.user;
    const user = await User.findOne({ email: email });

    if (req.body.method === "Online Payment") {
      if (user && user.cartitems && user.cartitems.length > 0) {
        for (const cartItemEntry of user.cartitems) {
          if (cartItemEntry.cart && Array.isArray(cartItemEntry.cart)) {
            const cart = cartItemEntry.cart;
            const selectedAddress = await User.findOne(
              { email: email },
              { address: { $elemMatch: { _id: req.body.selectedAddress } } }
            );
            for (const item of cart) {
              const orderItem = {
                product: item.productId,
                productName: item.productName,
                quantity: item.quantity,
                Amount: item.totalPrice,
                address: selectedAddress,
                paymentmethod: req.body.method,
              };

              await productCollection.findOneAndUpdate(
                { _id: item.productId },
                { $inc: { stock: -item.quantity } }
              );

              user.orders.push(orderItem);
            }
            cartItemEntry.cart = [];
          }
        }
        if (user.cartitems) {
          user.cartitems = [];
        }

        await user.save();

        const updateResult = await User.updateOne(
          { email: email },
          { $set: { "cartitems.[].cart": [] } }
        );

        res.render("orderconfirm");
      }
    } else if (req.body.method === "Wallet") {
      if (user && user.cartitems && user.cartitems.length > 0) {
        for (const cartItemEntry of user.cartitems) {
          if (cartItemEntry.cart && Array.isArray(cartItemEntry.cart)) {
            const cart = cartItemEntry.cart;
            const selectedAddress = await User.findOne(
              { email: email },
              { address: { $elemMatch: { _id: req.body.selectedAddress } } }
            );

            for (const item of cart) {
              const orderItem = {
                product: item.productId,
                productName: item.productName,
                quantity: item.quantity,
                Amount: item.totalPrice,
                address: selectedAddress,
                paymentmethod: req.body.method,
              };

              const conf = await walletcollection.findOneAndUpdate(
                { customerid: user._id },
                {
                  $inc: { Amount: -(item.totalPrice * item.quantity) },
                  $push: {
                    transactions: {
                      type: "debit",
                      amount: item.totalPrice * item.quantity,
                    },
                  },
                },
                { new: true }
              );

              await productCollection.findOneAndUpdate(
                { _id: item.productId },
                { $inc: { stock: -item.quantity } }
              );

              user.orders.push(orderItem);
            }

            cartItemEntry.cart = [];
          }
        }
        if (user.cartitems) {
          user.cartitems = [];
        }

        await user.save();

        const updateResult = await User.updateOne(
          { email: email },
          { $set: { "cartitems.[].cart": [] } }
        );
        res.render("orderconfirm");
      }
    } else if (req.body.method === "Cash On Delivery") {
      if (user && user.cartitems && user.cartitems.length > 0) {
        for (const cartItemEntry of user.cartitems) {
          if (cartItemEntry.cart && Array.isArray(cartItemEntry.cart)) {
            const cart = cartItemEntry.cart;
            const selectedAddress = await User.findOne(
              { email: email },
              { address: { $elemMatch: { _id: req.body.selectedAddress } } }
            );

            for (const item of cart) {
              const orderItem = {
                product: item.productId,
                productName: item.productName,
                quantity: item.quantity,
                Amount: item.totalPrice,
                address: selectedAddress,
                paymentmethod: req.body.method,
              };

              await productCollection.findOneAndUpdate(
                { _id: item.productId },
                { $inc: { stock: -item.quantity } }
              );

              user.orders.push(orderItem);
            }

            cartItemEntry.cart = [];
          }
        }
        if (user.cartitems) {
          user.cartitems = [];
        }

        await user.save();
        

        const updateResult = await User.updateOne(
          { email: email },
          { $set: { "cartitems.[].cart": [] } }
        );
        res.render("orderconfirm");
      }
    } else {
      res.redirect("/cart");
    }
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  cart,
  addtocart,
  deleteCart,
  addQuantity,
  subQuantity,
  checkoutLoad,
  confirmLoad,
};
