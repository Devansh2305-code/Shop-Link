const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    password: { type: String, required: true, select: false },
    type: { type: String, enum: ['vendor', 'customer'], required: true },
    // Vendor-specific fields
    shopName: { type: String, trim: true },
    shopLocation: { type: String, trim: true },
    shopCategory: { type: String, trim: true },
    upiId: { type: String, trim: true },
    qrCodeImage: { type: String },
    shopOpen: { type: Boolean, default: false },
    deliveryMode: { type: String, enum: ['instant', 'scheduled', 'pickup'], default: 'instant' },
    scheduledTime: { type: String },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Remove password from JSON output
userSchema.set('toJSON', {
  transform(doc, ret) {
    delete ret.password;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
