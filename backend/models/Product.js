const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    colors: { type: [String], default: [] },
    category: { type: String, trim: true },
    image: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
