const session = require("express-session");
const nodemailer = require("nodemailer");
const generateOtp = require("generate-otp");
const users = require("../model/userModels");
const productcollection = require("../model/productModels");
const couponcollection = require("../model/couponModel");
const walletcollection = require("../model/walletModel");
const bcrypt = require("bcrypt");
const { name } = require("ejs");
const bannercollection = require("../model/bannerModel");
const easyinvoice = require("easyinvoice");const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const loginLoad = async (req, res) => {
  if (req.session.user) {
    res.redirect("/");
  } else {
    res.render("login");
  }
};

const firstpage=async(req,res) =>{
  if(!req.session.user){

    const banner = await bannercollection.find();

    const currentPage = parseInt(req.query.page) || 1;
    const skip = (currentPage - 1) * PAGE_SIZE;

    const products = await productcollection
      .find()
      .skip(skip)
      .limit(PAGE_SIZE)
      .exec();


  res.render("firstpage",{products,banner,currentPage})
  }
}


const signupLoad = async (req, res) => {
  try {
    const data = await users.findOneAndRemove({ isVerified: false });
    if (req.session.user) {
      res.redirect("/");
    } else {
      res.render("signup");
    }
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

const PAGE_SIZE = 4;
const homeLoad = async (req, res) => {
  if (req.session.user) {
    const banner = await bannercollection.find();

    const currentPage = parseInt(req.query.page) || 1;
    const skip = (currentPage - 1) * PAGE_SIZE;

    const products = await productcollection
      .find()
      .skip(skip)
      .limit(PAGE_SIZE)
      .exec();

    const user = await users.findOne({ email: req.session.user });

    const wallet = await walletcollection.findOne({ customerid: user._id });
    if (!wallet) {
      const newwallet = new walletcollection({
        customerid: user._id,
      });

      await newwallet.save();
    }
    res.render("home", { products, currentPage, banner });
  } else {
    res.redirect("/firstpage");
  }
};

const loginVerify = async (req, res) => {
  try {
    const check = await users.findOne({ email: req.body.email });

    if (
      check.email === req.body.email &&
      check.isblocked === false &&
      check.password === req.body.password &&
      check.isVerified === true
    ) {
      {
        req.session.user = req.body.email;
        res.redirect("/");
      }
    } else {
      res.render("login", {
        error: "Invalid login credential.Please try again",
      });
    }
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

const insertUser = async (req, res) => {
  try {
    const { username, email, password, phone } = req.body;

    const existingUser = await users.findOne({ email: email });

    if (existingUser) {
      return res.render("signup", {
        error: "Email already exists. Please use a different email address.",
      });
    } else {
      const otp = generateOtp.generate(4, {
        digits: true,
        alphabets: false,
        specialChars: false,
      });

      const data = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        phone: req.body.phone,
        OTP: otp,
      };

      await users.create([data]);

      req.session.email = req.body.email;

      transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "testtdemoo11111@gmail.com",
          pass: "wikvaxsgqyebphvh",
        },
      });
      const mailOptions = {
        from: "testtdemoo11111@gmail.com",
        to: req.body.email,
        subject: "Your Otp code",
        text: `your otp code is:${otp}`,
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("error sending otp", error);
        } else {
          console.log("otp send:", info.response);
        }
      });

      setTimeout(async () => {
        await users.findOneAndUpdate(
          { email: req.session.email },
          { $unset: { OTP: 1 } },
          { new: true }
        );
       
      }, 30000);
      res.redirect("/otp");
    }
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

const otpLoad = (req, res) => {
  try {
    res.render("otp", { errorMessage: "" });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

const verifyOtp = async (req, res) => {
  try {
    const username = req.session.email;
    const foundUser = await users.findOne({ email: username });

    const enterOtp = parseInt(req.body.otp);

    if (parseInt(foundUser.OTP) === enterOtp) {
      await users.findByIdAndUpdate(foundUser._id, { isVerified: true });

      res.redirect("/login");
    } else {
      res.render("otp", { errorMessage: "Invalid OTP. Please try again." });
    }
  } catch (error) {
    res.status(500).send("Internal server error");
  }
};

const resendOtp = async (req, res) => {
  try {
    const email = req.session.email;
    const userData = await users.findOne({ email: email });
    const otp = generateOtp.generate(4, {
      digits: true,
      alphabets: false,
      specialChars: false,
    });

    req.session.user = req.body.email;

    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "testtdemoo11111@gmail.com",
        pass: "wikvaxsgqyebphvh",
      },
    });

    const mailOptions = {
      from: "midhunrpillai4059@gmail.com",
      to: "midhunrpillai4059@gmail.com",
      subject: "Your Resent OTP Code",
      text: `Your resend OTP code is: ${otp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ message: "Error sending OTP" });
      } else {
        console.log("OTP sent:", info.response);
      }
    });
    const values = await users.findOneAndUpdate(
      { email: email },
      { $set: { OTP: otp } },
      { new: true }
    );
    res.redirect("/otp");
  } catch (error) {
   
    res.status(500).json({ message: "Internal server error" });
  }
};

const profile = async (req, res) => {
  try {
    const user = req.session.user;
    const data = await users.findOne({ email: user });
    const wallet = await walletcollection.findOne({ customerid: data._id });

    if (user && wallet) {
      var walletBalance = wallet.Amount;
      res.render("profile", { data, walletBalance });
    } else {
      res.redirect("/profile");
    }
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

const editprofile = async (req, res) => {
  const user = req.session.user;

  const data = await users.findOne({ email: user });

  try {
    if (data) {
      res.render("editprofile", { data });
    } else {
      res.redirect("/profile");
    }
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

const resetpassLoad = async (req, res) => {
  try {
    if (req.session.user) {
      res.render("resetpassword");
    } else {
      res.redirect("/profile");
    }
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

const checkpassword = async (req, res) => {
  try {
    const user = req.session.user;
    const data = await users.findOne({ email: user });

    if (req.body.currentpassword === data.password) {
      await users.findByIdAndUpdate(data._id, {
        password: req.body.newpassword,
      });
      res.redirect("/profile");
    }
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

const updateprofile = async (req, res) => {
  const user = req.session.user;
  const filter = { email: user };
  const update = {
    username: req.body.username,
    email: req.body.email,
    phone: req.body.phone,
  };

  try {
    const updatedUser = await users.findOneAndUpdate(filter, update, {
      new: true, // Return the modified document rather than the original
      runValidators: true, // Run validation on update
    });

    if (!updatedUser) {
      return res.redirect("/profile");
    }

    res.redirect("/profile");
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).send("Internal Server Error");
  }
};

const addaddress = async (req, res) => {
  const user = req.session.user;
  const data = await users.findOne({ email: user });
  try {
    if (data) {
      res.render("addaddress", { user, data });
    } else {
      res.redirect("/profile");
    }
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

const addAddressToUser = async (req, res) => {
  const userId = req.params.id;

  try {
    const newAddress = {
      street: req.body.street,
      city: req.body.city,
      state: req.body.state,
      pincode: req.body.pincode,
      country: req.body.country,
    };

    const updatedUser = await users.findByIdAndUpdate(
      userId,
      { $push: { address: newAddress } },
      { new: true }
    );
    res.redirect("/profile");
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(201).json(updatedUser);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

const addaddresscheckout = async (req, res) => {
  const user = req.session.user;
  const data = await users.findOne({ email: user });

  try {
    if (data) {
      res.render("addaddresscheckout", { user, data });
    } else {
      res.redirect("/checkout");
    }
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

const addAddressToCheckout = async (req, res) => {
  const userId = req.params.id;

  try {
    const newAddress = {
      street: req.body.street,
      city: req.body.city,
      state: req.body.state,
      pincode: req.body.pincode,
      country: req.body.country,
    };
    const updatedUser = await users.findByIdAndUpdate(
      userId,
      { $push: { address: newAddress } },
      { new: true }
    );

    res.redirect("/checkout");
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(201).json(updatedUser);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

const editAddress = async (req, res) => {
  const user = req.session.user;
  const data = await users.findOne({ email: user });
  try {
    if (data) {
      res.render("editaddress", { data });
    } else {
      res.redirect("/profile");
    }
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

const editaddresscheckout = async (req, res) => {
  const user = req.session.user;
  const data = await users.findOne({ email: user });
  try {
    if (data) {
      res.render("editaddresscheckout", { data });
    } else {
      res.redirect("/checkout");
    }
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

const updateAddress = async (req, res) => {
  try {
    const user = { email: req.session.user };

    const newAddress = {
      address: [
        {
          street: req.body.street,
          city: req.body.city,
          state: req.body.state,
          pincode: req.body.pincode,
          country: req.body.country,
        },
      ],
    };

    const option = { upsert: true };
    await users.updateOne(user, newAddress, option);
    res.redirect("/profile");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

const updateAddresscheckout = async (req, res) => {
  try {
    const user = { email: req.session.user };

    const newAddress = {
      address: [
        {
          street: req.body.street,
          city: req.body.city,
          state: req.body.state,
          pincode: req.body.pincode,
          country: req.body.country,
        },
      ],
    };

const option = { upsert: true };
    await users.updateOne(user, newAddress, option);
    res.redirect("/checkout");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

const applyCoupon = async (req, res) => {
  const email = req.session.user;
  try {
    const couponCode = req.body.code;
    const totalPrice = req.body.total;
    const coupon = await couponcollection.findOne({ couponCode });
    const minimumAmount = coupon.minimumpurchase;
    if (!coupon === coupon.couponCode) {
      return res.json({ success: false, message: "Not Valid" });
    }

    if (!coupon || coupon.expirationDate < new Date()) {
      return res.json({ success: false, message: "Coupon Expired" });
    }

    const user = await users.findOne({ email: email });

    if (totalPrice <= minimumAmount) {
      return res.json({
        success: false,
        message: ` Minimum purchase of ${minimumAmount} is required to claim the coupon `,
      });
    }
    const newTotal = totalPrice - coupon.discountAmount;

    user.totalPrice = newTotal;
    const discountAmount = coupon.discountAmount;

    await user.save();

    res.json({ success: true, newTotal, discountAmount });
  } catch (error) {
    res.status(500).json({ success: false, message: "Invalid coupon code" });
  }
};

const forgotLoad = async (req, res) => {
  let error = "";
  res.render("forgot", { error });
};

const verifyEmail = async (req, res) => {
  req.session.email = req.body.email;
  const email = req.session.email;

  try {
    const userremail = await users.findOne({ email: email });

    if (userremail) {
      otp = generateOtp.generate(4, {
        digits: true,
        alphabets: false,
        specialChars: false,
      });

      transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "testtdemoo11111@gmail.com",
          pass: "wikvaxsgqyebphvh",
        },
      });
      const mailOptions = {
        from: "midhunrpillai4059@gmail.com",
        to: "midhunrpillai4059@gmail.com",
        subject: "Your Otp code",
        text: `your otp code is:${otp}`,
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("error sending otp", error);
        } else {
          console.log("otp send:", info.response);
        }
      });
     
      let errorMessage = "";
      res.render("forgototp", { errorMessage, user: userremail._id });
    } else {
      let error = "Email not match";
      res.render("forgot", { error });
    }

    setTimeout(async () => {
      await users.findOneAndUpdate(
        { email: req.session.email },
        { $unset: { OTP: 1 } },
        { new: true }
      );
    }, 30000);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

const forgototpverify = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await users.findById(id);

    const enterOtp = req.body.otp;
    console.log(enterOtp);
    if (otp === enterOtp) {
      res.render("newpassword", { userr: user._id });
    } else {
      res.render("forgototp", {
        errorMessage: "Invalid OTP. Please try again.",
      });
    }
  } catch (error) {
    res.status(500).send("internal server error");
  }
};

const setnewpassword = async (req, res) => {
  try {
    const newPassword = req.body.password;
    const id = req.params.id;
    const user = await users.findById(id);

    await users.findByIdAndUpdate(id, { password: newPassword });

    res.redirect("/login");
  } catch (error) {
    res.status(500).send("internal server error");
  }
};

const errorpage = async (req, res) => {
  res.render("errorpage");
};



const generateInvoice = async (req, res) => {
  const orderId = req.params.id;
  const userId = req.session.user;

  try {
    const user = await users.findOne({ email: userId });
    const orderDetails = await users
      .findOne({ "orders._id": orderId })
      .populate("orders.product");

    const order = orderDetails.orders.find((order) => order._id == orderId);

    const product = order.product;
    const quantity = order.quantity;

    const products = [
      {
        quantity: quantity,
        description: product.name,
        "tax-rate": 0,
        price: product.price,
      },
    ];

    let totalPrice = products.reduce((total, product) => {
      return total + product.price * product.quantity;
    }, 0);


    const coupon = await couponcollection.findOne({});

    if (coupon && !coupon.isBlocked && totalPrice >= coupon.minimumpurchase) {
      const discountAmount = coupon.discountAmount;
      totalPrice -= discountAmount;

     
      products.push({
        quantity: 1,
        description: `Discount (${coupon.couponCode})`,
        "tax-rate": 0,
        price: -discountAmount,
      });
    }

    const logoUrl = "https://watchbox-sfcc.imgix.net/og/watchbox-og-full.png";
    const invoiceData = {
      currency: "INR",
      marginTop: 25,
      marginRight: 25,
      marginLeft: 25,
      marginBottom: 25,
      logo: logoUrl,
      sender: {
        company: "Glassy",
        address: "Dotspace Trivandrum",
        zip: "695411",
        city: "Trivandrum",
        country: "India",
      },
      client: {
        company: user.username,
        address: ` ${user.address[0].street}, ${user.address[0].city}, ${user.address[0].state} - ${user.address[0].pincode}, ${user.address[0].country}`,
      },

      information: {
        date: new Date().toLocaleDateString(),
        number: `INV_${order._id}`,
      },
      products: products,
      "bottom-notice": `Thank you for choosing GLASSY! We appreciate your business
          If you have any questions or concerns regarding this invoice,
          please contact our customer support at support@glassy.com.
          Your satisfaction is our priority. Hope to see you again!`,
    };

    easyinvoice.createInvoice(invoiceData, function (result) {
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=invoice_${orderId}.pdf`
      );
      res.setHeader("Content-Type", "application/pdf");
      res.send(Buffer.from(result.pdf, "base64"));
    });
  } catch (error) {
    res.status(500).send("Error generating the invoice.");
  }
}; 


const resendOtpagain = async (req, res) => {
  try {
    const email = req.session.email;
    const userData = await users.findOne({ email: email });
    const otp = generateOtp.generate(4, {
      digits: true,
      alphabets: false,
      specialChars: false,
    });

    req.session.user = req.body.email;
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "testtdemoo11111@gmail.com",
        pass: "wikvaxsgqyebphvh",
      },
    });

    const mailOptions = {
      from: "midhunrpillai4059@gmail.com",
      to: "midhunrpillai4059@gmail.com", 
      subject: "Your Resent OTP Code",
      text: `Your resend OTP code is: ${otp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending OTP:", error);
        return res.status(500).json({ message: "Error sending OTP" });
      } else {
        console.log("OTP sent:", info.response);
      }
    });

    const values = await users.findOneAndUpdate(
      { email: email },
      { $set: { OTP: otp } },
      { new: true }
    );
    res.redirect("/forgototp");
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const userLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
      res.redirect("/");
    } else {
      res.redirect("/");
    }
  });
};

module.exports = {
  loginVerify,
  firstpage,
  otpLoad,
  verifyOtp,
  resendOtp,

  errorpage,

  insertUser,
  loginLoad,
  homeLoad,
  signupLoad,

  addAddressToUser,
  editAddress,
  addaddress,
  updateAddress,
  editaddresscheckout,
  updateAddresscheckout,
  addaddresscheckout,
  addAddressToCheckout,

  profile,
  editprofile,
  updateprofile,
  resetpassLoad,
  checkpassword,

  applyCoupon,

  forgotLoad,
  verifyEmail,
  forgototpverify,
  setnewpassword,
  generateInvoice,
  resendOtpagain,

  userLogout,
};
