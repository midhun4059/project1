const { users } = require("moongose/models");
const productCollection = require("../model/productModels");
const User = require('../model/userModels');
const walletcollection=require('../model/walletModel')


const cart = async (req, res) => {
  try {
    const useremail = req.session.user;
const user= await User.findOne({email:useremail}).populate('cartitems.cart.productId');
const cartitems = user.cartitems.map(cart => cart);
    if (user) {
const totalPriceArray = user.cartitems.map((cartItem) => {
        return cartItem.cart.reduce((acc, curr) => {
          return acc + curr.productId.price * curr.quantity;
        }, 0);
      });
    const totalPrice = totalPriceArray.reduce((acc, price) => acc + price, 0);
      console.log(totalPrice)
      
  
      user.totalPrice=totalPrice;
  
      // Save the updated user data
      await user.save();
      res.render("cart",{cartitems,user})
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
            return item.productId._id.toString() === productId;
          });
          return foundproduct;
        });
  if (existingProduct) {
        // If the product is already in the cart, update the quantity
          existingProduct.cart.forEach((product)=>{
            product.quantity +=1
          })
        } else {
          const cartitemspush={
            productId:productId,
            quantity:1,
            totalPrice:product.price
          }// If the product is not in the cart, add it
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

    console.log('237:',req.body);
    const email = req.session.user;
    const user = await User.findOne({ email: email }).populate('cartitems.cart.productId');
    console.log('238:',user);
    const wallet=await walletcollection.findOne({customerid:user._id})
    console.log('240',wallet);
    if (wallet && wallet.Amount !== undefined) {
        console.log("Amount:", wallet.Amount);
    } else {
        console.log("Wallet or Amount not found");
    }


    if (user && user.cartitems ) {
      res.render('checkout', { cartItems: user.cartitems, user ,wallet:wallet.Amount});
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
    console.log('275',req.body);

    if(req.body.method==='Online Payment'){

    // Check if user exists and has cartitems with at least one item
    if (user && user.cartitems && user.cartitems.length > 0) {
    
      // Loop through each entry in cartitems
      for (const cartItemEntry of user.cartitems) {
        // Check if the entry has a valid 'cart' property and it is an array
        if (cartItemEntry.cart && Array.isArray(cartItemEntry.cart)) {
          const cart = cartItemEntry.cart;
          const selectedAddress=await User.findOne({email:email},{address:{$elemMatch:{ _id:req.body.selectedAddress}}});



          for (const item of cart) {
            const orderItem = {
              product: item.productId, // Assuming productId is the correct property
              productName: item.productName,
              quantity: item.quantity,
              Amount: item.totalPrice,
              address:selectedAddress,
              paymentmethod:req.body.method,


              // Add other fields as needed
            };

            user.orders.push(orderItem);
          }

          // Assuming 'cart' is the correct property
          cartItemEntry.cart = [];
        }
      }
      if(user.cartitems){
        user.cartitems=[];
      }

      // Save the user object with emptied carts
      await user.save();
      console.log('User saved successfully after emptying carts.');

      // Remove the cart items from the database
      const updateResult = await User.updateOne(
        { email: email },
        { $set: { 'cartitems.[].cart': [] } }
      );


      res.render('orderconfirm');
    }
  }else if(req.body.method==='Wallet'){

    if (user && user.cartitems && user.cartitems.length > 0) {
    
      // Loop through each entry in cartitems
      for (const cartItemEntry of user.cartitems) {
        // Check if the entry has a valid 'cart' property and it is an array
        if (cartItemEntry.cart && Array.isArray(cartItemEntry.cart)) {
          const cart = cartItemEntry.cart;
          const selectedAddress=await User.findOne({email:email},{address:{$elemMatch:{ _id:req.body.selectedAddress}}});



          for (const item of cart) {
            const orderItem = {
              product: item.productId, // Assuming productId is the correct property
              productName: item.productName,
              quantity: item.quantity,
              Amount: item.totalPrice,
              address:selectedAddress,
              paymentmethod:req.body.method,


              // Add other fields as needed
            };

            const conf= await walletcollection.findOneAndUpdate(
              { customerid: user._id },
              { $inc: {Amount:(-(item.totalPrice*item.quantity))},
              $push:{
                  transactions:{
                      type:'debit',
                      amount:((item.totalPrice*item.quantity)),
                  },
              },
          },
              { new: true });

            user.orders.push(orderItem);
          }

          // Assuming 'cart' is the correct property
          cartItemEntry.cart = [];
        }
      }
      if(user.cartitems){
        user.cartitems=[];
      }

      // Save the user object with emptied carts
      await user.save();
      console.log('User saved successfully after emptying carts.');

      // Remove the cart items from the database
      const updateResult = await User.updateOne(
        { email: email },
        { $set: { 'cartitems.[].cart': [] } }
      );

      

    


      res.render('orderconfirm');
    }

  }else if(req.body.method==='Cash On Delivery'){

    if (user && user.cartitems && user.cartitems.length > 0) {
    
      // Loop through each entry in cartitems
      for (const cartItemEntry of user.cartitems) {
        // Check if the entry has a valid 'cart' property and it is an array
        if (cartItemEntry.cart && Array.isArray(cartItemEntry.cart)) {
          const cart = cartItemEntry.cart;
          const selectedAddress=await User.findOne({email:email},{address:{$elemMatch:{ _id:req.body.selectedAddress}}});



          for (const item of cart) {
            const orderItem = {
              product: item.productId, // Assuming productId is the correct property
              productName: item.productName,
              quantity: item.quantity,
              Amount: item.totalPrice,
              address:selectedAddress,
              paymentmethod:req.body.method,


              // Add other fields as needed
            };

            user.orders.push(orderItem);
          }

          // Assuming 'cart' is the correct property
          cartItemEntry.cart = [];
        }
      }
      if(user.cartitems){
        user.cartitems=[];
      }

      // Save the user object with emptied carts
      await user.save();
      console.log('User saved successfully after emptying carts.');

      // Remove the cart items from the database
      const updateResult = await User.updateOne(
        { email: email },
        { $set: { 'cartitems.[].cart': [] } }
      );


      res.render('orderconfirm');
    }

  }
    
  

    
    // else if(method=='Wallet'){
    //   // const total=req.body.totalAmount
    //   const user = await User.findOne({ email: req.session.user});
    //   const wallet=await walletcollection.findOne({customerid:user._id}) 
    //   const selectedAddressIndex = req.body.selectedAddress;
    //       for (const item of user.cart) {
    //           const orderItem = {
    //               product: item.product,
    //               productName: item.productName,
    //               quantity: item.quantity,
    //               paymentmethod: method,
    //               totalPrice:(item.totalPrice*item.quantity),
    //               addressId:selectedAddressIndex,
                  
    //           };
    //           await walletcollection.findOneAndUpdate(
    //               { customerid: user._id },
    //               { $inc: {Amount:(-(item.totalPrice*item.quantity))},
    //               $push:{
    //                   transactions:{
    //                       type:'debit',
    //                       amount:((item.totalPrice*item.quantity)),
    //                   },
    //               },
    //           },
    //               { new: true });

    //           user.orders.push(orderItem);
    //       }}
    
    
    
    else {
      res.redirect('/cart');
    }
  } catch (error) {
    console.error(error);
    // Handle the error appropriately, e.g., send an error response
    res.status(500).send('Internal Server Error');
  }
};




module.exports = { cart, 
  addtocart ,
  deleteCart,
  addQuantity,
  subQuantity,
  checkoutLoad,
  confirmLoad}
