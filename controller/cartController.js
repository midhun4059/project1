const productCollection = require("../model/productModels");
const User = require('../model/userModels');
const session = require('express-session');

const cart = async (req, res) => {
  try {
    const useremail = req.session.user;
const user= await User.findOne({email:useremail}).populate('cartitems.cart.productId');



const cartitems = user.cartitems.map(cart => cart);




    if (user) {
      
   
      res.render("cart", { cartitems });
      console.log("cartid",)
    } else {
      res.redirect("/");
    }
  } catch (error) {
console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


const addtocart = async (req, res) => {
  try {
    if (req.session.user) {
      const { productId, quantity } = req.body;

      const useremail = req.session.user;


      // Check if product exists
      const product = await productCollection.findById(productId);
      const user = await User.findOne({ email: useremail });

      if (!product || !user) {
        return res.status(404).json({ error: 'Product not found' });
      }

      // Retrieve or create a cart for the user
      if (user && product) {

        // Initialize user.cartitems as an empty array if it's undefined
        if (!user.cartitems) {
          user.cartitems = [];
        }

        // Check if the product is already in the cart
      

        const existingProduct = user.cartitems.find(cartitems => {
      
          const foundproduct = cartitems.cart.find(item => {
            console.log("item",item.productId._id, "productid", productId);
            return item.productId._id.toString() === productId;
          });
          return foundproduct;
        });
        console.log('existing product:', existingProduct);
        console.log("herreeeee")

        if (existingProduct) {
          console.log("herreq")
          // If the product is already in the cart, update the quantity
          existingProduct.cart.forEach((product)=>{
            product.quantity +=1
          })
        } else {
          console.log("herreeeee")
  
          const cartitemspush={
            productId:productId,
            quantity:1
          }
    
          // If the product is not in the cart, add it
          user.cartitems.push({
            cart: [cartitemspush]
          });
        }

        // Save the updated user
        await user.save();
        res.redirect('/cart');
      } else {
        res.redirect("/");
      }
    } else {
      res.redirect('/login');
    }
  } catch (error) {
    console.log("error here")
    console.error(error);

    res.status(500).json({ error: 'Internal Server Error' });
  }
};



module.exports = { cart, addtocart };
