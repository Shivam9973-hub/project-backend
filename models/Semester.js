const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  credits: { type: Number, required: true, min: 0.5 },
  grade: { type: String, required: true },
  type: { type: String, enum: ['theory', 'practical'], default: 'theory' }
});

const semesterSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  semesterNumber: { type: Number, required: true },
  subjects: [subjectSchema],
  sgpa: { type: Number, required: true }
}, { timestamps: true });

// Prevent duplicate semesters per user
semesterSchema.index({ userId: 1, semesterNumber: 1 }, { unique: true });

module.exports = mongoose.model('Semester', semesterSchema);
