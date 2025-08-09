const { body, param } = require('express-validator');
const { Note } = require('../models');

module.exports = {
  createNote: [
    body('title')
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage('Title must be 3-100 characters'),
    body('content')
      .trim()
      .isLength({ min: 10 })
      .withMessage('Content must be ≥10 characters'),
    body('tags')
      .optional()
      .isArray({ min: 0, max: 5 })
      .withMessage('Maximum 5 tags allowed')
  ],

  noteId: [
    param('id')
      .isUUID()
      .withMessage('Invalid ID format')
      .custom(async (id, { req }) => {
        const note = await Note.findByPk(id);
        if (!note) throw new Error('Note not found');
        if (note.userId !== req.user.id) throw new Error('Unauthorized');
        return true;
      })
  ]
};