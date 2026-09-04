// server/models/Contact.js
// Lưu trữ các yêu cầu Beat Custom, hợp tác và tin nhắn từ khách hàng
const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Vui lòng nhập họ tên'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Vui lòng nhập email'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    type: {
      type: String,
      enum: ['custom-beat', 'collab', 'license', 'other'],
      default: 'custom-beat',
    },
    budget: {
      type: String,
      default: '',
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Vui lòng nhập nội dung'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'completed', 'cancelled'],
      default: 'new',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Contact', ContactSchema);
