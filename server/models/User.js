// server/models/User.js
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    // Không required vì Google/Facebook login không cần
    minlength: 6,
  },
  avatar: {
    type: String,
    default: '',
  },
  provider: {
    type: String,
    enum: ['local', 'google', 'facebook'],
    default: 'local',
  },
  providerId: {
    type: String, // Google/Facebook user ID
    default: '',
  },
  unlockedTracks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Track',
  }],
  resetToken: String,
  resetTokenExpiry: Date,
}, {
  timestamps: true,
});

// Hash password trước khi save (chuẩn Mongoose async hook không dùng callback next)
userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// So sánh password
userSchema.methods.comparePassword = async function (candidate) {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

// Trả về user info an toàn (không có password)
userSchema.methods.toSafeJSON = function () {
  return {
    _id:             this._id,
    name:            this.name,
    email:           this.email,
    avatar:          this.avatar,
    provider:        this.provider,
    unlockedTracks:  this.unlockedTracks,
    createdAt:       this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);
