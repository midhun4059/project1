const categorycollection = require("../model/categoryModel");
const productcollection = require("../model/productModels");
const users = require("../model/userModels");
const couponCollection = require("../model/couponModel");
const { render } = require("../routes/userRoutes");
const pdfmake = require("pdfmake");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");

const adminLog = async (req, res) => {
  if (req.session.admin) {
    try {
      const lastSevenDays = [];
      let currentDate = new Date();
      for (let i = 0; i < 7; i++) {
        let day = new Date();
        day.setDate(currentDate.getDate() - i);
        lastSevenDays.push(day.toISOString().split("T")[0]);
      }

      const orderCounts = await users.aggregate([
        {
          $unwind: "$orders",
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$orders.orderDate" },
            },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);

      let data = [];

      const labels = lastSevenDays;

      labels.forEach((label) => {
        const order = orderCounts.find((o) => o._id === label);
        if (order) {
          data.push(order.count);
        } else {
          data.push(0);
        }
      });

      const labelsWithoutYearAndMounth = labels.map((label) => {
        const date = new Date(label);
        return date.getDate();
      });

      let monthsOfCurrentYear = [];
      let currentYear = currentDate.getFullYear();

      for (let month = 1; month < 13; month++) {
        monthsOfCurrentYear.push(
          `${currentYear}-${month.toString().padStart(2, "0")}`
        );
      }

      const orderPerMounth = await users.aggregate([
        {
          $unwind: "$orders",
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m", date: "$orders.orderDate" },
            },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);

      let mountData = [];
      monthsOfCurrentYear.forEach((mounth) => {
        const orderForMounth = orderPerMounth.find(
          (order) => order._id === mounth
        );
        if (orderForMounth) {
          mountData.push(orderForMounth.count);
        } else {
          mountData.push(0);
        }

      });

      const salesData = await users.aggregate([
        {
          $unwind: "$orders",
        },
        {
          $lookup: {
            from: "products",
            localField: "orders.product",
            foreignField: "_id",
            as: "productDetails",
          },
        },
        {
          $unwind: "$productDetails",
        },
        {
          $project: {
            productName: "$productDetails.name",
            productPrice: "$productDetails.price",
            totalQuantity: "$orders.quantity",
            totalPrice: "$orders.Amount",
            orderDate: "$orders.orderDate",
            status: "$orders.status",
            paymentMethod: "$orders.paymentmethod",
            redeemedCoupon: "$orders.redeemedCoupon",
            address: "$address",
          },
        },
      ]);
    


      res.render("index", {salesData,
        labelsWithoutYearAndMounth,
        data,
        mountData,
        monthsOfCurrentYear,
      });
    } catch (error) {
      res.status(500).send("Internal Server Error");
    }
  } else {
    res.render("adminLogin");
  }
};



const salesReport = async (req, res) => {
  try {
    const startDate = new Date(req.query.startDate);
    const endDate = new Date(req.query.endDate);
    endDate.setDate(endDate.getDate() + 1);

    const salesData = await users.aggregate([
      {
        $match: {
          "orders.orderDate": { $gte: startDate, $lt: endDate },
        },
      },
      {
        $unwind: "$orders",
      },
      {
        $lookup: {
          from: "products",
          localField: "orders.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $unwind: "$productDetails",
      },
      {
        $project: {
          productName: "$productDetails.name",
          productPrice: "$productDetails.price",
          totalQuantity: "$orders.quantity",
          totalPrice: "$orders.Amount",
          orderDate: "$orders.orderDate",
          status: "$orders.status",
          paymentMethod: "$orders.paymentmethod",
          redeemedCoupon: "$orders.redeemedCoupon",
          address: "$address",
        },
      },
    ]);

    res.render('index', { salesData });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sales Report");

    const headers = [
      "Product Name",
      "Product Price",
      "Total Quantity",
      "Total Price",
      "Order Date",
      "Status",
      "Payment Method",
      "Redeemed Coupon",
      "Address",
    ];
    worksheet.addRow(headers);

    salesData.forEach((sale) => {
      const row = Object.values(sale);
      worksheet.addRow(row);
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=sales_report.xlsx"
    );

    const buffer = await workbook.xlsx.writeBuffer();
    res.end(buffer);

    
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

const salesReportPdf = async (req, res) => {
  try {
    const startDate = new Date(req.query.startDate);
    const endDate = new Date(req.query.endDate);
    endDate.setDate(endDate.getDate() + 1);

    const salesData = await users.aggregate([
      {
        $match: {
          "orders.orderDate": { $gte: startDate, $lt: endDate },
        },
      },
      {
        $unwind: "$orders",
      },
      {
        $lookup: {
          from: "products",
          localField: "orders.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $unwind: "$productDetails",
      },
      {
        $project: {
          productName: "$productDetails.name",
          productPrice: "$productDetails.price",
          totalQuantity: "$orders.quantity",
          totalPrice: "$orders.Amount",
          orderDate: "$orders.orderDate",
          status: "$orders.status",
          paymentMethod: "$orders.paymentmethod",
          redeemedCoupon: "$orders.redeemedCoupon",
          address: "$address",
        },
      },
    ]);

    const PDFDocument = require("pdfkit");
    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=sales_report.pdf"
    );

    doc.pipe(res);

    doc.fontSize(16).text("Sales Report", { align: "center" });
    doc.moveDown();

    const headerY = doc.y;
    const headers = [
      "Product Name",
      "Product Price",
      "Total Quantity",
      "Total Price",
      "Order Date",
      "Status",
      "Payment Method",
      "Redeemed Coupon",
      "Address",
    ];

    const columnX = [50, 200, 350, 450, 550, 650, 750, 850, 950];

    headers.forEach((header, index) => {
      doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .text(header, columnX[index], headerY);
      doc
        .moveTo(columnX[index], headerY + 15)
        .lineTo(columnX[index] + 100, headerY + 15)
        .stroke();
    });

    let yOffset = headerY + 15;
    salesData.forEach((sale) => {
      doc.rect(50, yOffset, 100, 20).stroke();
      doc.rect(150, yOffset, 150, 20).stroke();
      doc.rect(300, yOffset, 100, 20).stroke();
      doc.rect(400, yOffset, 100, 20).stroke();
      doc.rect(500, yOffset, 100, 20).stroke();
      doc.rect(600, yOffset, 100, 20).stroke();
      doc.rect(700, yOffset, 100, 20).stroke();
      doc.rect(800, yOffset, 100, 20).stroke();
      doc.rect(900, yOffset, 100, 20).stroke();

      doc
        .fontSize(10)
        .font("Helvetica")
        .text(sale.productName, 55, yOffset + 5);
      doc.text(sale.productPrice.toString(), 205, yOffset + 5);
      doc.text(sale.totalQuantity.toString(), 355, yOffset + 5);
      doc.text(sale.totalPrice.toString(), 455, yOffset + 5);
      doc.text(sale.orderDate.toString(), 555, yOffset + 5);
      doc.text(sale.status, 655, yOffset + 5);
      doc.text(sale.paymentMethod, 755, yOffset + 5);
      doc.text(sale.redeemedCoupon, 855, yOffset + 5);
      doc.text(sale.address, 955, yOffset + 5);

      doc
        .moveTo(50, yOffset + 20)
        .lineTo(950, yOffset + 20)
        .stroke();

      yOffset += 20;
    });

    doc.end();
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

const adEmail = "admin@gmail.com";
const adPassword = "123";

const adminHome = async (req, res) => {
  if (req.body.email === adEmail && req.body.password === adPassword) {
    req.session.admin = req.body.email;
    res.redirect("/admin");
  } else {
    res.render("adminLogin", { error: "Invalid credential" });
  }
};

const usersLoad = async (req, res) => {
  const user = await users.find();
  res.render("user", { user });
};

const categoryLoad = async (req, res) => {
  const category = await categorycollection.find();
  res.render("category", { category });
};

const addCategoryLoad = async (req, res) => {
  res.render("addCategory");
};

const insertCategory = async (req, res) => {
  try {
    const categoryName = req.body.category;

    const existingCategory = await categorycollection.findOne({
      category: { $regex: new RegExp("^" + categoryName + "$", "i") },
    });

    if (existingCategory) {
      res.redirect("/admin/category/add?AlreadyExisting=true");
    } else {
      const capitalCategoryCount = await categorycollection.countDocuments({
        category: { $regex: new RegExp("^" + categoryName + "$") },
      });

      if (capitalCategoryCount > 0) {
        res.redirect("/admin/category/add?CapitalCaseExisting=true");
      } else {
        const categoryData = {
          category: categoryName,
          description: req.body.description,
        };

        await categorycollection.insertMany([categoryData]);
        res.redirect("/admin/category");
      }
    }
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

const editCategoryLoad = async (req, res) => {
  try {
    let id = req.params.id;

    const category = await categorycollection.findById(id);

    if (!category) {
      res.redirect("/admin/category");
    } else {
      res.render("editcategory", { category: category });
    }
  } catch (error) {
    res.redirect("/admin/category");
  }
};

const updateCategory = async (req, res) => {
  try {
    let id = req.params.id;

    const check = await categorycollection.findById(id);

    if (check) {
      res.redirect("/admin/category");
    } else {
      const result = await categorycollection.findByIdAndUpdate(id, {
        category: req.body.category,
        description: req.body.description,
      });
      if (!result) {
        console.log("not found");
      } else {
        res.redirect("/admin/category");
      }
    }
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

const deleteCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await categorycollection.findByIdAndRemove({ _id: id });
    if (result) {
      res.redirect("/admin/category");
    }
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

const userBlock = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await users.findByIdAndUpdate(id, { isblocked: true });
    if (!user) {
      res.status(400).json({ error: "User not found or could not be blocked" });
    }
    res.redirect("/admin/users");
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const userUnblock = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await users.findByIdAndUpdate(id, { isblocked: false });

    if (!user) {
      res
        .status(400)
        .json({ error: "User not found or could not be unblocked" });
    }
    res.redirect("/admin/users");
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
const CouponLoad = async (req, res) => {
  const coupons = await couponCollection.find();
  res.render("adminCoupon", { coupons });
};
const addCoupon = async (req, res) => {
  res.render("addCoupon");
};

const insertCoupon = async (req, res) => {
  try {
    const data = {
      couponCode: req.body.couponCode,
      discountAmount: req.body.discountAmount,
      expirationDate: req.body.expirationDate,
      minimumpurchase: req.body.minimumpurchase,
    };

    const check = await couponCollection.findOne({
      couponCode: req.body.couponCode,
    });

    if (check) {
      res.redirect("/adminCoupon");
    } else {
      await couponCollection.insertMany([data]);
      res.redirect("/adminCoupon");
    }
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

const couponBlock = async (req, res) => {
  try {
    const id = req.params.id;

    const user = await couponCollection.findByIdAndUpdate(id, {
      isBlocked: true,
    });

    if (!user) {
      res.status(400).json({ error: "User not found or could not be blocked" });
    }

    res.redirect("/adminCoupon");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

const couponUnblock = async (req, res) => {
  try {
    const id = req.params.id;

    const user = await couponCollection.findByIdAndUpdate(id, {
      isBlocked: false,
    });

    if (!user) {
      res
        .status(400)
        .json({ error: "User not found or could not be unblocked" });
    }
    res.redirect("/adminCoupon");
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const orderLoad = async (req, res) => {
  try {
    const user = await users
      .find({ orders: { $exists: true, $ne: [] } })
      .populate("orders.product");

    res.render("orders", { user });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

const updateOrderStatus = async (req, res) => {
  const userId = req.params.userId;
  const orderId = req.params.orderId;
  const newStatus = req.params.newStatus;

  try {
    const order = await users.findOneAndUpdate(
      { "orders._id": orderId },
      { $set: { "orders.$.status": newStatus } },
      { new: true }
    );
    res.redirect("/admin/orders");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};



const adminLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.redirect("/admin");
    } else {
      res.status(200);
      res.redirect("/admin");
    }
  });
};

module.exports = {
  adminLog,
  adminHome,
  adminLogout,

  usersLoad,
  userBlock,
  userUnblock,

  categoryLoad,
  addCategoryLoad,
  insertCategory,
  editCategoryLoad,
  updateCategory,
  deleteCategory,
  orderLoad,

  CouponLoad,
  addCoupon,
  insertCoupon,
  couponBlock,
  couponUnblock,

  updateOrderStatus,

  salesReport,
  salesReportPdf,
  
};
