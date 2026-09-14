const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');

// Đảm bảo thư mục uploads tồn tại
const uploadsDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Cấu hình multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e6);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const imageExts = /jpeg|jpg|png|gif|webp/;
  const audioExts = /mp3|wav|ogg|m4a|flac/;
  const imageMimes = /^image\/(jpeg|png|gif|webp)$/;
  const audioMimes = /^(audio\/(mpeg|wav|ogg|mp4|x-m4a|flac|x-wav)|video\/mp4)$/;
  const ext = path.extname(file.originalname).toLowerCase().slice(1);

  if (file.fieldname === 'image') {
    if (imageExts.test(ext) && imageMimes.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File ảnh không hợp lệ (MIME: ${file.mimetype}). Chỉ chấp nhận jpg, png, gif, webp`));
    }
  } else if (file.fieldname === 'audio') {
    if (audioExts.test(ext) && audioMimes.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File audio không hợp lệ (MIME: ${file.mimetype}). Chỉ chấp nhận mp3, wav, ogg, m4a, flac`));
    }
  } else {
    cb(new Error(`Loại file không được hỗ trợ: ${file.fieldname}`));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

const adminAuth = require('../middleware/adminAuth');
const { isCloudinaryConfigured, uploadToCloudinary } = require('../services/cloudinaryService');

// POST /api/upload/image — upload ảnh artwork
router.post('/image', adminAuth, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'Không có file ảnh' });
  
  if (isCloudinaryConfigured()) {
    try {
      const result = await uploadToCloudinary(req.file.path, 'bat-music/images', 'image');
      fs.unlinkSync(req.file.path);
      return res.json({ success: true, url: result.url });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Lỗi upload ảnh lên Cloudinary: ' + err.message });
    }
  }

  const url = `/uploads/${req.file.filename}`;
  res.json({ success: true, url });
});

// POST /api/upload/audio — upload file mp3
router.post('/audio', adminAuth, upload.single('audio'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'Không có file audio' });
  
  if (isCloudinaryConfigured()) {
    try {
      const result = await uploadToCloudinary(req.file.path, 'bat-music/audios', 'video');
      fs.unlinkSync(req.file.path);
      return res.json({ success: true, url: result.url });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Lỗi upload audio lên Cloudinary: ' + err.message });
    }
  }

  const url = `/uploads/${req.file.filename}`;
  res.json({ success: true, url });
});

// POST /api/upload/both — upload cả ảnh và audio cùng lúc
router.post('/both', adminAuth, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'audio', maxCount: 1 }]), (req, res) => {
  const result = {};
  if (req.files?.image?.[0]) result.imageUrl = `/uploads/${req.files.image[0].filename}`;
  if (req.files?.audio?.[0]) result.audioUrl = `/uploads/${req.files.audio[0].filename}`;
  res.json({ success: true, ...result });
});

module.exports = router;
