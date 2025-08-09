const express = require('express');
const router = express.Router();
const notesController = require('../controllers/notes.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { body } = require('express-validator');


// ✅ Import your Note model
const { Note } = require('../models'); // Adjust path if needed

// Apply auth middleware to all routes
router.use(verifyToken);

// 📌 Get all notes for the logged-in user
router.get('/', notesController.getAllNotes);

// 📌 Update a note partially (PATCH)
router.patch('/:id', async (req, res) => {
  const noteId = req.params.id;
  const userId = req.user.id; // set in verifyToken middleware
  const updates = req.body;   // { pinned: true } or { title: "New title" }

  try {
    const note = await Note.findOne({ where: { id: noteId, userId } });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    await note.update(updates);
    res.json(note);
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 📌 Create a new note
router.post(
  '/',
  [
    body('title')
      .trim()
      .notEmpty().withMessage('Title is required')
      .isLength({ max: 100 }).withMessage('Title must be ≤100 characters'),

    body('content')
      .trim()
      .notEmpty().withMessage('Content is required')
      .isLength({ min: 10 }).withMessage('Content must be ≥10 characters')
  ],
  validate,
  notesController.createNote
);

// 📌 Get, update, or delete a note by ID
router.route('/:id')
  .get(notesController.getNote)
  .put(
    [
      body('title').optional().trim().isLength({ max: 100 }),
      body('content').optional().trim().isLength({ min: 10 })
    ],
    validate,
    notesController.updateNote
  )
  .delete(notesController.deleteNote);

module.exports = router;
