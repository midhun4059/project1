
const User = require('../model/userModels');
const Product = require('../model/productModels');
const Wishlist = require('../model/wishlistModels'); 


const wishLoad=async(req,res)=>{
  try{
      const users=req.session.user
      
      const product=await Wishlist.find({}).populate('Product')
      const user=await User.findOne({email:users})
      
      if(user){
         res.render('wishlist',{product}) 
      }else{
          throw "User not found"
      }
      }
  catch(err){
      console.log("Error in Wishlist load",err)

  }
}

const addToWish=async(req,res)=>{
  const email=req.session.user;
  const productId=req.params.id;
  try{
      const product=await Product.findOne({_id:productId})
      const user = await User.findOne({ email:email});

      if(user&&product){
          const isExist=await Wishlist.findOne({UserId:user._id,Product:product._id})
          
          if(!isExist){
              const data={
                  UserId:user._id,
                  Product:productId,
                  
                  }
                  const result=await Wishlist.insertMany([data])
                  console.log("Add to wish list successfull")
          }else{
              console.log("Product already exist in your wishlist");
              res.redirect('/wishlist');
                      }

      }else{
          throw "Product or User Not Found"
      }

      res.redirect('/wishlist')
      

  }catch(error){
      console.log("Error adding to wishlist",error)

  }
}

const removeFromWishlist = async (req, res) => {
  const userId = req.session.user;
  const productId = req.params.id;

  try {
      // Find the user based on the email
      const user = await User.findOne({ email: userId });

      if (user) {
          // Find the wishlist item based on the product ID
          const wishlistItem = await Wishlist.findOneAndRemove({
              UserId: user._id,
              'Product': productId
          });
          res.redirect('/wishlist');
          
      } 
      
      else {
          // User not found
          console.log('No such user found');
          res.redirect('/wishlist'); // Redirect to the wishlist page or handle accordingly
      }
  } catch (error) {
      console.log('Error removing from wishlist', error);
      res.redirect('/wishlist'); // Redirect to the wishlist page or handle accordingly
  }
};


    const wishlistAddCart = async (req, res) => {
        const userId = req.session.user;
        const productId = req.params.id;
      
        try {
          const product = await Product.findOne({ _id: productId });
          const user = await User.findOne({ email: userId });
      
          const existingProductIndex = user.cartitems.cart.findIndex(
            (item) => item.product.toString() === productId
          );
      
          if (existingProductIndex !== -1) {
            user.cart[existingProductIndex].quantity += 1;
          } else {
            const productPrice = product.price;
            const offerPrices = product.OfferPrice;
      
            const newCart = {
              product: productId,
              quantity: 1,
              totalPrice: offerPrices > 0 ? offerPrices : productPrice,
            };
      
            user.cart.push(newCart);
          }
      
          // Remove the product from the wishlist
          if(user){
            const wishlistItem = await Wishlist.findOneAndRemove({
              UserId: user._id,
              'Product': productId
          });
          
          console.log('126:', wishlistItem);
          }
      
          await user.save();
      
          console.log('Product added to cart:', user._id, productId);
          res.redirect('/wishlist');
        } catch (error) {
          console.log('Error Adding Product To Cart From Wishlist', error);
          // Handle the error and send an appropriate response to the user
          res.status(500).send('Internal Server Error');
        }
      };
      

// Export the controllers
module.exports = {
  wishLoad,
  addToWish,
  wishlistAddCart,
  removeFromWishlist
};
