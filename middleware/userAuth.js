const isLogin = (req, res, next) => {
  if (req.session.user) {
      
      next();
  } else {
    res.redirect('/login');
  }
};

const isLogout=async(req,res,next)=>{

  try{

      if(req.session.user){
          res.redirect('/');
      }
      next();
  }catch(error){
      console.log(error.message);
  }

}

module.exports={
  isLogin,isLogout
}