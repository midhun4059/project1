const { users } = require("moongose/models");
const productCollection = require("../model/productModels");
const User = require('../model/userModels');
const session = require('express-session');

const cart = async (req, res) => {
  try {
    const useremail = req.session.user;
const user= await User.findOne({email:useremail}).populate('cartitems.cart.productId');
const cartitems = user.cartitems.map(cart => cart);
    if (user) {

      const totalPriceArray = user.cartitems.map((cartItem) => {
        return cartItem.cart.reduce((acc, curr) => {
          console.log("1299",curr.productId.price, curr.quantity)
          return acc + curr.productId.price * curr.quantity;
        }, 0);
      });
    
      
      const totalPrice = totalPriceArray.reduce((acc, price) => acc + price, 0);
      console.log(totalPrice)
      
  
      user.totalPrice=totalPrice
  
      // Save the updated user data
      await user.save();
      res.render("cart", { cartitems,user })
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


        if (existingProduct) {
          console.log("herreq")
          // If the product is already in the cart, update the quantity
          existingProduct.cart.forEach((product)=>{
            product.quantity +=1
          })
        } else {

  
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


const deleteCart=async(req,res)=>{
  try{
const id=req.params.id;
console.log("id",id)
const email=req.session.user;
const data = await User.findOneAndUpdate(
  { email: email },
  { $pull: { 'cartitems': { 'cart': { $elemMatch: { productId: id } } } } },
);
  console.log("data",data)
if(data){
  res.redirect('/cart');
}else{
  res.redirect('/');
}
  }
  catch(error){
    console.error(error);
  }
}

const addQuantity = async (req, res) => {
  const { userId, productId } = req.params;

  try {
    const user = await User.findById(userId).populate('cartitems.cart.productId')

    if (!user) {
      return res.status(404).send('User not found');
    }

    console.log("user",user)

    let foundCartItem;
    let foundProduct;

    user.cartitems.forEach((cartItem) => {
      const product = cartItem.cart.find(product => product.productId._id.toString() === productId);
      
    
      if (product) {
        foundCartItem = cartItem;
        foundProduct = product;
      }
    });
    


    if (!foundCartItem || !foundProduct) {
      return res.status(404).send('Product not found in the cart');
    }

    // Increment the quantity
    foundProduct.quantity += 1;

    // Recalculate total price
    
    const totalPriceArray = user.cartitems.map((cartItem) => {
      return cartItem.cart.reduce((acc, curr) => {
       
        return acc + curr.productId.price * curr.quantity;
      }, 0);
    });
  
    
    const totalPrice = totalPriceArray.reduce((acc, price) => acc + price, 0);
    
    

    user.totalPrice=totalPrice

    // Save the updated user data
    await user.save();

    // Redirect after the save operation is completed
    res.redirect('/cart');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

const subQuantity = async (req, res) => {
  const { userId, productId } = req.params;

  try {
    const user = await User.findById(userId).populate('cartitems.cart.productId');


    if (!user) {
      return res.status(404).send('User not found');
    }

    let foundCartItem;
    let foundProduct;

    user.cartitems.forEach((cartItem) => {
      const product = cartItem.cart.find(product => product.productId._id.toString() === productId);

      if (product) {
        foundCartItem = cartItem;
        foundProduct = product;
      }
    });

    if (!foundCartItem || !foundProduct) {
      return res.status(404).send('Product not found in the cart');
    }

    // Decrement the quantity, ensuring it doesn't go below 1
    foundProduct.quantity = Math.max(foundProduct.quantity - 1, 1);

    // Recalculate total price
    
    const totalPriceArray = user.cartitems.map((cartItem) => {
      return cartItem.cart.reduce((acc, curr) => {
        return acc + curr.productId.price * curr.quantity;
      }, 0);
    });
    
    const totalPrice = totalPriceArray.reduce((acc, price) => acc + price, 0);
    

user.totalPrice=totalPrice

    // Save the updated user data
    await user.save();


    // Redirect after the save operation is completed
    res.redirect('/cart');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};




const checkoutLoad=  async (req, res) => {
  try {
    const email = req.session.user;
    const user = await User.findOne({ email: email }).populate('cartitems.cart.productId');
console.log('1',user);
console.log('2',user.cartitems);


    if (user && user.cartitems ) {
      res.render('checkout', { cartItems: user.cartitems, user });
    } else {
      res.redirect('/home');
    }
  } catch (error) {
    console.error(error);
  }
}

const confirmLoad = async (req, res) => {
  try {
    const email = req.session.user;
    const user = await User.findOne({ email: email });
    console.log(user);

    if (user && user.cartitems && Array.isArray(user.cartitems) && user.cartitems.length > 0) {
      console.log('Condition satisfied. Processing cart items...');

      // Assuming there is only one cartItem in the array
      const cartItem = user.cartitems[0];
      
      for (const item of cartItem.cart) {
        const orderItem = {
          product: item.productId, // Assuming productId is the correct property
          productName: item.productName,
          quantity: item.quantity,
          // Add other fields as needed
        };

        user.orders.push(orderItem);
      }

      for (const order of user.orders) {
        const product = order.product;
        const orderedQuantity = order.quantity;
        // You need to get the actual product document from the database
        const productFromDB = await productCollection.findById(product);
        productFromDB.stock -= orderedQuantity;
        await productFromDB.save();
      }

      // Clear the cart
      cartItem.cart = [];
      await user.save();
      res.render('orderconfirm');
    } else {
      res.redirect('/profile');
    }
  } catch (error) {
    console.error(error);
    // Handle the error appropriately, e.g., send an error response
    res.status(500).send('Internal Server Error');
  }
};


module.exports = { cart, addtocart ,deleteCart,addQuantity,subQuantity,checkoutLoad,confirmLoad};
