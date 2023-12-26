const bannercollection = require("../model/bannerModel");

const fileUpload = require("express-fileupload");

const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/images"));
  },
  filename: function (req, file, cb) {
    const name = Date.now() + "-" + file.originalname;
    cb(null, name);
  },
});

const bannerLoad = async (req, res) => {
  try {
    const banner = await bannercollection.find();

    res.render("bannerAdmin", { banner });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

const addbannerLoad = async (req, res) => {
  res.render("addBanner");
};

const uploads = multer({ storage: storage });

const bannerAdd = async (req, res) => {
  try {
    const banner = {
      description: req.body.description,
      image: req.files.map((file) => file.filename),
    };

    await bannercollection.insertMany([banner]);

    res.redirect("/bannerAdmin");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

const deleteBanner = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await bannercollection.findByIdAndRemove({ _id: id });
     

    if (result) {
      res.redirect("/bannerAdmin");
    }  
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  bannerAdd,
  bannerLoad,
  addbannerLoad,
  deleteBanner,
};
