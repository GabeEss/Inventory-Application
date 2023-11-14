const { body, validationResult } = require("express-validator");

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
  const [supplier, supplierItems] = await Promise.all([
    Supplier.findById(req.params.id).exec(),
    Item.find({ suppliers: req.params.id })
    .populate('name')
    .sort({ name: 1 })
    .exec(),
  ])

  if (supplier === null) {
    // No results.
    const err = new Error("Supplier not found");
    err.status = 404;
    return next(err);
  }

  res.render("supplier_detail", {
    title: "Supplier Detail",
    supplier: supplier,
    supplier_items: supplierItems,
  });
});

// Display Supplier create form on GET.
exports.supplier_create_get = (req, res, next) => {
  res.render("supplier_form", { title: "Create Supplier" });
};

// Handle supplier create form on POST.
exports.supplier_create_post = [
  // Validate and sanitize the name field.
  body("name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Supplier name must be specified."),
  body("address")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Supplier address must be specified."),
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Supplier phone number must be specified.")
    .matches(/[0-9]{10}/)
    .withMessage("Enter a 10-digit phone number (numbers only)."),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a supplier object with escaped and trimmed data.
    const supplier = new Supplier({ 
      name: req.body.name,
      address: req.body.address,
      phone: req.body.phone
    });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render("supplier_form", {
        title: "Create Supplier",
        supplier: supplier,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.
      // Check if Supplier with same name already exists.
      const supplierExists = await Supplier.findOne({ name: req.body.name }).exec();
      if (supplierExists) {
        // Supplier exists, redirect to its detail page.
        res.redirect(supplierExists.url);
      } else {
        await supplier.save();
        // New supplier saved. Redirect to supplier detail page.
        res.redirect(supplier.url);
      }
    }
  }),
];

// Display Supplier delete form on GET.
exports.supplier_delete_get = asyncHandler(async (req, res, next) => {
  // Get details of supplier
  const supplier = await Supplier.findById(req.params.id).exec();

  if (supplier === null) {
    // No results.
    res.redirect("/catalog/suppliers");
  }

  // Find items that reference the supplier
  const itemsWithSupplier = await Item.find({ suppliers: req.params.id }).exec();

  res.render("supplier_delete", {
    title: "Delete Supplier",
    supplier: supplier,
    itemsWithSupplier: itemsWithSupplier,
  });
});

// Handle supplier delete on POST.
exports.supplier_delete_post = asyncHandler(async (req, res, next) => {

  // Find and update items that reference the supplier
  await Item.updateMany({ suppliers: req.params.id }, { $pull: { suppliers: req.params.id } }).exec();

  // Proceed with deleting the supplier
  await Supplier.findByIdAndDelete(req.params.id).exec();

  res.redirect("/catalog/suppliers");
});

// Display supplier update form on GET.
exports.supplier_update_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: supplier update GET");
});

// Handle supplier update on POST.
exports.supplier_update_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: supplier update POST");
});
