const { body, validationResult } = require("express-validator");

const Item = require("../models/item");
const Category = require("../models/category");
const Supplier = require("../models/supplier");

const asyncHandler = require("express-async-handler");

// Display list of all categories.
exports.category_list = asyncHandler(async (req, res, next) => {
    const allcategories = await Category.find({}, "name ")
      .sort({ name: 1 })
      .exec();
  
    res.render("category_list", { title: "Category List", category_list: allcategories });
  });

// Display detail page for a specific category.
exports.category_detail = asyncHandler(async (req, res, next) => {
  const [category, categoryItems] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({ category: req.params.id })
    .populate('name')
    .sort({ name: 1 })
    .exec(),
  ])

  if (category === null) {
    // No results.
    const err = new Error("Category not found");
    err.status = 404;
    return next(err);
  }

  res.render("category_detail", {
    title: "Category Detail",
    category: category,
    category_items: categoryItems,
  });
});

// Display Category create form on GET.
exports.category_create_get = (req, res, next) => {
  res.render("category_form", { title: "Create Category" });
};

// Handle category create form on POST.
exports.category_create_post = [
  // Validate and sanitize the name field.
  body("name", "Category name must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a category object with escaped and trimmed data.
    const category = new Category({ name: req.body.name });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render("category_form", {
        title: "Create Category",
        category: category,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.
      // Check if Category with same name already exists.
      const catExists = await Category.findOne({ name: req.body.name }).exec();
      if (catExists) {
        // Category exists, redirect to its detail page.
        res.redirect(catExists.url);
      } else {
        await category.save();
        // New category saved. Redirect to category detail page.
        res.redirect(category.url);
      }
    }
  }),
];

// Display Category delete form on GET.
exports.category_delete_get = asyncHandler(async (req, res, next) => {
  // Get details of category
  const category = await Category.findById(req.params.id).exec();

  if (category === null) {
    // No results.
    res.redirect("/catalog/categories");
  }

  // Find items that reference the category
  const itemsWithinCategory = await Item.find({ category: req.params.id }).exec();

  res.render("category_delete", {
    title: "Delete Category",
    category: category,
    itemsWithinCategory: itemsWithinCategory,
  });
});

// Handle category delete on POST.
exports.category_delete_post = asyncHandler(async (req, res, next) => {
  try {
    const [category, itemsWithinCategory] = await Promise.all([
      Category.findById(req.params.id).exec(),
      Item.find({ category: req.params.id }).exec(),
    ])

    // If there are items belonging to this category.
    if (itemsWithinCategory.length > 0) {
      return res.render("category_delete", {
        title: "Delete Category",
        category: category,
        itemsWithinCategory: itemsWithinCategory,
      });
    }

    // Proceed with deleting the category
    await Category.findByIdAndDelete(req.params.id).exec();

    res.redirect("/catalog/categories");

  } catch(error) {
    console.log(error);
  }
  
});

// Display category update form on GET.
exports.category_update_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: category update GET");
});

// Handle category update on POST.
exports.category_update_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: category update POST");
});
