const mongoose = require('mongoose');

const TrackSchema = new mongoose.Schema(
  {
    title:    { type: String, required: true, trim: true },
    producer: { type: String, default: 'BAT', trim: true },
    genre:    { type: String, enum: ['R&B', 'Lo-Fi', 'Hip-Hop', 'Pop', 'Trap', 'Other'], default: 'R&B' },
    bpm:      { type: Number, default: 90 },
    key:      { type: String, default: 'Am' },
    duration: { type: String, default: '3:00' },
    price:    { type: Number, required: true, min: 0 },
    tags:     [{ type: String }],
    imageUrl: { type: String, default: '' },   // ảnh artwork
    audioUrl: { type: String, default: '' },   // link hoặc path file mp3
    audioType:{ type: String, enum: ['url', 'file'], default: 'url' }, // nguồn audio
    plays:    { type: String, default: '0' },
    color:    { type: String, default: '#c9a96e' },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Track', TrackSchema);
