#! /usr/bin/env node

console.log(
    'This script populates some items, categories, and suppliers to your database.'
  );
  
  // Get arguments passed on command line
  const userArgs = process.argv.slice(2);
  
  const Item = require("./models/item");
  const Category = require("./models/category");
  const Supplier = require("./models/supplier");
  
  const categories = [];
  const suppliers = [];
  const items = [];
  
  const mongoose = require("mongoose");
  mongoose.set("strictQuery", false); // Prepare for Mongoose 7
  
  const mongoDB = userArgs[0];
  
  main().catch((err) => console.log(err));
  
  async function main() {
    console.log("Debug: About to connect");
    await mongoose.connect(mongoDB);
    console.log("Debug: Should be connected?");
    await createSuppliers();
    await createCategories();
    await createItems();
    console.log("Debug: Closing mongoose");
    mongoose.connection.close();
  }
  
  // We pass the index to the ...Create functions so that, for example,
  // category[0] will always be the pen genre, regardless of the order
  // in which the elements of promise.all's argument complete.
  async function categoryCreate(index, name) {
    const category = new Category({ name: name });
    await category.save();
    categories[index] = category;
    console.log(`Added category: ${name}`);
  }
  
  async function itemCreate(index, name, description, price, inStock, category, suppliers) {
    const itemdetail = { 
        name: name, 
        description: description,
        price: price,
        inStock: inStock,
        category: category,
        suppliers: suppliers
    };
  
    const item = new Item(itemdetail);
    await item.save();
    items[index] = item;
    console.log(`Added item: ${name}`);
  }
  
  async function supplierCreate(index, name, address, phone) {
    const supplierdetail = {
      name: name,
      address: address,
    };

    if (phone != false) supplierdetail.phone = phone;
  
    const supplier = new Supplier(supplierdetail);
    await supplier.save();
    suppliers[index] = supplier;
    console.log(`Added supplier: ${name}`);
  }
  
  
  async function createItems() {
    console.log("Adding items");
    await Promise.all([
        itemCreate(0, "Gel Pen Set", "Set of 5 smooth gel pens.", 7.99, 3, categories[0], [suppliers[1], suppliers[3]]),
        itemCreate(1, "Mechanical Pencil", "Mechanical pencil with lead refills.", 4.49, 6, categories[1], [suppliers[0], suppliers[2]]),
        itemCreate(2, "Eraser Pack", "Pack of 10 high-quality erasers.", 2.99, 8, categories[2], [suppliers[4]]),
        itemCreate(3, "Heavy-Duty Stapler", "Stapler for heavy use with built-in staple remover.", 15.99, 2, categories[3], [suppliers[1]]),
        itemCreate(4, "Wooden Clipboard", "Durable wooden clipboard with metal clip.", 8.49, 5, categories[4], [suppliers[3], suppliers[4]]),
        itemCreate(5, "Executive Office Chair", "Comfortable and stylish office chair.", 79.99, 10, categories[5], [suppliers[2], suppliers[3]]),
        itemCreate(6, "Modern Desk", "Sleek and spacious desk for your workspace.", 129.99, 4, categories[6], [suppliers[0], suppliers[4]]),
        itemCreate(7, "Laptop Stand", "Adjustable laptop stand for ergonomic use.", 19.99, 7, categories[7], [suppliers[1], suppliers[2]]),
        itemCreate(8, "Leather-Bound Notebook", "Luxurious leather-bound notebook with lined pages.", 12.99, 6, categories[8], [suppliers[0], suppliers[3]]),
      ]);
  }
  
  async function createCategories() {
    console.log("Adding categories");
    await Promise.all([
      categoryCreate(0, "Pen"),
      categoryCreate(1, "Pencil"),
      categoryCreate(2, "Eraser"),
      categoryCreate(3, "Stapler"),
      categoryCreate(4, "Clipboard"),
      categoryCreate(5, "Office Chair"),
      categoryCreate(6, "Desk"),
      categoryCreate(7, "Laptop"),
      categoryCreate(8, "Notebook")
    ]);
  }
  
  async function createSuppliers() {
    console.log("Adding suppliers");
    await Promise.all([
      supplierCreate(0, "Supplier 1", "123 Cherry Street, Made Up Land, USA", "1-800-123-4567"),
      supplierCreate(1, "Supplier 2", "456 Apple Avenue, Fantasy City, USA", "1-800-123-4568"),
      supplierCreate(2, "Supplier 3", "789 Orange Boulevard, Imaginary Town, USA", "1-800-123-4569"),
      supplierCreate(3, "Supplier 4", "321 Lemon Lane, Dreamland, USA", "1-800-123-4570"),
      supplierCreate(4, "Supplier 5", "654 Grape Grove, Wonderland, USA", "1-800-123-4571"),
    ]);
  }