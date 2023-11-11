const Item = require("../models/item");
const Category = require("../models/category");
const Supplier = require("../models/supplier");

const asyncHandler = require("express-async-handler");

// Display list of all suppliers.
exports.supplier_list = asyncHandler(async (req, res, next) => {
    const allsuppliers = await Supplier.find({}, "name")
      .sort({ name: 1 })
      .exec();
  
    res.render("supplier_list", { title: "Supplier List", supplier_list: allsuppliers });
  });

// Display detail page for a specific supplier.
exports.supplier_detail = asyncHandler(async (req, res, next) => {
  res.send(`NOT IMPLEMENTED: supplier detail: ${req.params.id}`);
});

// Display supplier create form on GET.
exports.supplier_create_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: supplier create GET");
});

// Handle supplier create on POST.
exports.supplier_create_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: supplier create POST");
});

// Display supplier delete form on GET.
exports.supplier_delete_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: supplier delete GET");
});

// Handle supplier delete on POST.
exports.supplier_delete_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: supplier delete POST");
});

// Display supplier update form on GET.
exports.supplier_update_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: supplier update GET");
});

// Handle supplier update on POST.
exports.supplier_update_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: supplier update POST");
});
