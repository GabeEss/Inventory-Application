const { body, validationResult } = require("express-validator");

const Item = require("../models/item");
const Category = require("../models/category");
const Supplier = require("../models/supplier");

const asyncHandler = require("express-async-handler");


exports.index = asyncHandler(async (req, res, next) => {
    // Get details of item, category, and supplier counts (in parallel)
  const [
    numItems,
    numCategories,
    numSuppliers,
  ] = await Promise.all([
    Item.countDocuments({}).exec(),
    Category.countDocuments({}).exec(),
    // BookInstance.countDocuments({ status: "Available" }).exec(),
    Supplier.countDocuments({}).exec(),
  ]);

  res.render("index", {
    title: "Local Inventory Home",
    item_count: numItems,
    category_count: numCategories,
    supplier_count: numSuppliers,
  });
});

// Display list of all items.
exports.item_list = asyncHandler(async (req, res, next) => {
    const allItems = await Item.find({}, "name category inStock price")
      .sort({ name: 1 })
      .populate("category")
      .exec();
  
    res.render("item_list", { title: "Item List", item_list: allItems });
  });
  

// Display detail page for a specific item.
exports.item_detail = asyncHandler(async (req, res, next) => {
    const itemId = req.params.id;
    
    const item = await Item.findById(itemId).populate("category").populate("suppliers").exec();

    if (!item) {
        const err = new Error("Item not found");
        err.status = 404;
        return next(err);
    }

    res.render("item_detail", {
      title: "Item Detail",
      item: item,
    });
  });
  

// Display Item create form on GET.
exports.item_create_get = async (req, res, next) => {
  try {
    // Fetch all categories and suppliers
    const allCategories = await Category.find({}, "name").sort({ name: 1 }).exec();
    const allSuppliers = await Supplier.find({}, "name").sort({ name: 1 }).exec();

    // Render the form with categories and suppliers
    res.render("item_form", {
      title: "Create Item",
      allCategories: allCategories,
      allSuppliers: allSuppliers,
    });
  } catch (error) {
    // Handle errors
    next(error);
  }
};

// Handle item create form on POST.
exports.item_create_post = [
  // Validate and sanitize the name field.
  body("name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Name must be specified."),
  body("description")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Description must be specified."),
  body("price")
    .trim()
    .notEmpty()
    .withMessage("Price must be specified.")
    .isNumeric()
    .withMessage("Price must be a number."),
  body("inStock")
    .trim()
    .notEmpty()
    .withMessage("In stock must be specified.")
    .isNumeric()
    .withMessage("In stock must be a number."),
    body("category")
    .isMongoId()
    .withMessage("Invalid category ID.")
    .custom(async (value) => {
      const category = await Category.findById(value);
      if (!category) {
        throw new Error("Invalid category.");
      }
    })
    .notEmpty() // Added to ensure category is specified
    .withMessage("Category must be specified."),
    body("suppliers")
    .custom(async (values) => {
      // Convert to an array, handling both single and multiple values
      const supplierIds = [].concat(values);

      if (supplierIds.length < 1) {
        throw new Error("At least one supplier must be selected.");
      }

      const invalidSuppliers = await Promise.all(
      supplierIds.map(async (value) => {
        const supplier = await Supplier.findById(value);
        return !supplier;
      })
    );
    if (invalidSuppliers.some((invalid) => invalid)) {
      throw new Error("Invalid supplier.");
    }
    })
    .withMessage("At least one valid supplier must be selected.")
    .isMongoId({ each: true }) // Ensure each element in the array is a valid MongoDB ObjectId
    .withMessage("Invalid supplier ID."),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a item object with escaped and trimmed data.
    const item = new Item({ 
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      inStock: req.body.inStock,
      category: req.body.category,
      suppliers: req.body.suppliers,
     });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      const allCategories = await Category.find({}, "name").sort({ name: 1 }).exec();
      const allSuppliers = await Supplier.find({}, "name").sort({ name: 1 }).exec();

      res.render("item_form", {
        title: "Create Item",
        item: item,
        allCategories: allCategories,
        allSuppliers: allSuppliers,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.
      // Check if Item with same name already exists.
      const itemExists = await Item.findOne({ name: req.body.name }).exec();
      if (itemExists) {
        // Category exists, redirect to its detail page.
        res.redirect(itemExists.url);
      } else {
        await item.save();
        // New category saved. Redirect to category detail page.
        res.redirect(item.url);
      }
    }
  }),
];

// Display item delete form on GET.
exports.item_delete_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: item delete GET");
});

// Handle item delete on POST.
exports.item_delete_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: item delete POST");
});

// Display item update form on GET.
exports.item_update_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: item update GET");
});

// Handle item update on POST.
exports.item_update_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: item update POST");
});
