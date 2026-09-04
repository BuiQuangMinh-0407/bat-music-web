const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  trackIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Track' }],
  amount: { type: Number, required: true },
  orderCode: { type: String, required: true, unique: true, index: true },
  status: { type: String, enum: ['pending', 'paid', 'expired'], default: 'pending' },
  paymentMethod: { type: String, default: 'bank_transfer' },
  paidAt: Date,
  expiredAt: { type: Date, default: () => new Date(Date.now() + 30 * 60 * 1000) }, // 30 min
}, { timestamps: true });

// Auto-expire old orders
OrderSchema.index({ expiredAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Order', OrderSchema);
