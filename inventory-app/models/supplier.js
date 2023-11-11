const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const SupplierSchema = new Schema({
    name: {type: String, required: true, minLength: 3, maxLength: 100},
    address: {type: String, maxLength: 100, required: true},
    phone: {type: String, minLength:10, maxLength:20}
});

// Virtual for genre's URL
SupplierSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/catalog/supplier/${this._id}`;
});

// Export model
module.exports = mongoose.model("Supplier", SupplierSchema);
