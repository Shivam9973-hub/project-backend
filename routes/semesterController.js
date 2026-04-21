const express = require('express');
const Semester = require('../models/Semester');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

const gradeMap = {
  'A+': 10, 'A': 9, 'B': 8, 'C': 7, 'D': 6, 'E': 5, 'F': 0
};

const calculateSgpa = (subjects) => {
  let totalCredits = 0;
  let totalPoints = 0;
  subjects.forEach(sub => {
    totalCredits += Number(sub.credits);
    let gradeStr = String(sub.grade).toUpperCase();
    const point = gradeMap[gradeStr] !== undefined ? gradeMap[gradeStr] : Number(sub.grade);
    let finalPoint = isNaN(point) ? 0 : point;
    totalPoints += (Number(sub.credits) * finalPoint);
  });
  return totalCredits > 0 ? Number((totalPoints / totalCredits).toFixed(2)) : 0;
};

router.post('/add', protect, async (req, res) => {
  try {
    const { semesterNumber, subjects } = req.body;
    if (!semesterNumber || !subjects || subjects.length === 0) {
      return res.status(400).json({ message: 'Invalid Data' });
    }
    
    const sgpa = calculateSgpa(subjects);

    const existing = await Semester.findOne({ userId: req.user.id, semesterNumber });
    if (existing) {
       return res.status(400).json({ message: 'Semester already exists' });
    }

    const semester = await Semester.create({
      userId: req.user.id,
      semesterNumber,
      subjects,
      sgpa
    });
    res.status(201).json(semester);
  } catch (error) {
    if(error.code === 11000) return res.status(400).json({message: 'Semester already exists'});
    res.status(500).json({ message: error.message });
  }
});

router.get('/all', protect, async (req, res) => {
  try {
    const semesters = await Semester.find({ userId: req.user.id }).sort({ semesterNumber: 1 });
    res.status(200).json(semesters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/update/:id', protect, async (req, res) => {
  try {
    const { subjects } = req.body;
    const sgpa = calculateSgpa(subjects);

    const semester = await Semester.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { subjects, sgpa },
      { new: true }
    );
    if (!semester) return res.status(404).json({ message: 'Not found' });
    res.status(200).json(semester);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/delete/:id', protect, async (req, res) => {
  try {
    const semester = await Semester.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!semester) return res.status(404).json({ message: 'Not found' });
    res.status(200).json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
