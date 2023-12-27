const session = require("express-session");
const express = require("express");
const app = express();
const multer = require("multer");

const feedbackCollection = require("../model/feedbackModel");
const productcollection = require("../model/productModels");

const fileUpload = require("express-fileupload");
app.use(fileUpload());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/images"));
  },
  filename: function (req, file, cb) {
    const name = Date.now() + "-" + file.originalname;
    cb(null, name);
  },
});

const productdetails = async (req, res) => {
  try {
    const productId = req.params.id;

    const products = await productcollection.findById(productId);
    const feedback = await feedbackCollection.find({product : productId})
    .populate('username')

    

    res.render("productdetails", { products, feedback });
  } catch (error) {
    res.status(500).send("Internal Server Error");
 }
};


const productsLoad = async (req, res) => {
  const product = await productcollection.find();
  res.render("products", { product });
};

const addProductLoad = async (req, res) => {
  res.render("addProducts");
};

const upload = multer({ storage: storage });

const insertProducts = async (req, res) => {
  try {
    const productdata = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      image: req.files.map((file) => file.filename),
      stock: req.body.stock,
    };
    const check = await productcollection.findOne({ name: req.body.name });

    if (check) {
      res.redirect("/admin/products/add?AlreadyExisting=true");
      return;
    } else {
      await productcollection.insertMany([productdata]);
      res.redirect("/admin/products");
    }
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

const editProductLoad = async (req, res) => {
  let id = req.params.id;
  await productcollection
    .findById(id)
    .then((product) => {
      if (!product) {
        res.redirect("/admin/products");
      } else {
        res.render("editproduct", { product: product });
      }
    })
    .catch((error) => {
      res.redirect("/admin/products");
    });
};

const deleteProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await productcollection.findByIdAndRemove({ _id: id });
    if (result) {
      res.redirect("/admin/products");
    }
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

const updateProduct = async (req, res) => {
  try {
    let id = req.params.id;
    const existingProduct = await productcollection.findById(id);
    if (!existingProduct) {
      return res.status(404).send("Product not found");
    }
    const updatedProductData = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      stock: req.body.stock,
    };

    if (req.files && req.files.length > 0) {
      updatedProductData.image = req.files.map((file) => file.filename);
    }
    const result = await productcollection.findByIdAndUpdate(
      id,
      updatedProductData
    );
    if (!result) {
      return res.status(500).send("Update failed");
    }
    res.redirect("/admin/products");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

const productonly = async (req, res) => {
  if (req.session.user) {
    const products = await productcollection.find();
    res.render("productsonly", { products });
  } else {
    res.redirect("/login");
  }
};

const sortedProducts = async (req, res) => {
  try {
    if (req.session.user) {
      {
        const sortOrder = req.body.sort;
        const products = await productcollection.find();
        if (sortOrder === "asc") {
          products.sort((a, b) => a.price - b.price);
        } else if (sortOrder === "desc") {
          products.sort((a, b) => b.price - a.price);
        }
        res.render("productsonly", { products });
      }
    }
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

const deleteProductImage = async (req, res) => {
  try {
    const productId = req.params.productId;
    const imageIndex = req.params.imageIndex;
    const existingProduct = await productcollection.findById(productId);

    if (!existingProduct) {
      return res.status(404).send("Product not found");
    }
    if (imageIndex < 0 || imageIndex >= existingProduct.image.length) {
      return res.status(400).send("Invalid image index");
    }
    existingProduct.image.splice(imageIndex, 1);
    await existingProduct.save();
    res.redirect(`/admin/products/edit/${productId}`);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

const filterProducts = async (req, res) => {
  try {
    const selectedCategory = req.body.category;

    let filteredProducts;
    if (selectedCategory) {
      filteredProducts = await productcollection.find({
        category: selectedCategory,
      });
    } else {
      filteredProducts = await productcollection.find();
    }

    res.render("productsonly", { products: filteredProducts });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  productdetails,
  productsLoad,
  addProductLoad,
  editProductLoad,
  insertProducts,
  deleteProduct,
  productonly,
  sortedProducts,
  deleteProductImage,
  filterProducts,
  updateProduct,
};
