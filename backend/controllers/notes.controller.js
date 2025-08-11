const { Note } = require('../models');
const { logger } = require('../utils/logger');
const { Op } = require('sequelize'); // Import once here

// ✅ GET all notes (with optional search query)
exports.getAllNotes = async (req, res, next) => {
  try {
    const searchQuery = req.query.q?.trim() || '';
    const whereClause = {
      userId: req.user.id,
    };

    if (searchQuery) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${searchQuery}%` } },
        { content: { [Op.iLike]: `%${searchQuery}%` } }
      ];
    }

    const notes = await Note.findAll({ where: whereClause });

    // ✅ Count totals
    const totalCount = notes.length;
    const pinnedCount = notes.filter(note => note.pinned).length;
    const deletedCount = notes.filter(note => note.deletedAt !== null).length;

    logger.info('Fetched user notes', {
      userId: req.user.id,
      count: totalCount,
      searchQuery
    });

    res.json({
      notes,
      counts: {
        total: totalCount,
        pinned: pinnedCount,
        deleted: deletedCount
      }
    });
  } catch (error) {
    logger.error('Get notes failed', {
      userId: req.user.id,
      error: error.message
    });
    next(error);
  }
};

// ✅ CREATE a note
exports.createNote = async (req, res, next) => {
  try {
    const { title, content, tags } = req.body;

    const note = await Note.create({
      title: title?.trim(),
      content: content?.trim(),
      tags,
      userId: req.user.id
    });

    logger.info('Note created', {
      noteId: note.id,
      userId: req.user.id
    });

    res.status(201).json({
      id: note.id,
      title: note.title,
      createdAt: note.createdAt
    });
  } catch (error) {
    logger.error('Create note failed', {
      userId: req.user?.id,
      error: error.message
    });
    next(error);
  }
};

// ✅ GET single note
exports.getNote = async (req, res, next) => {
  try {
    const note = await Note.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!note) {
      logger.warn('Note not found', {
        noteId: req.params.id,
        userId: req.user.id
      });
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json(note);
  } catch (error) {
    logger.error('Get note failed', {
      noteId: req.params.id,
      error: error.message
    });
    next(error);
  }
};

// ✅ UPDATE note
exports.updateNote = async (req, res, next) => {
  try {
    const note = await Note.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!note) {
      logger.warn('Update failed - note not found', {
        noteId: req.params.id,
        userId: req.user.id
      });
      return res.status(404).json({ message: 'Note not found' });
    }

    await note.update(req.body);

    logger.info('Note updated', {
      noteId: note.id,
      userId: req.user.id
    });

    res.json(note);
  } catch (error) {
    logger.error('Update note failed', {
      noteId: req.params.id,
      error: error.message
    });
    next(error);
  }
};

// ✅ DELETE note
exports.deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!note) {
      logger.warn('Delete failed - note not found', {
        noteId: req.params.id,
        userId: req.user.id
      });
      return res.status(404).json({ message: 'Note not found' });
    }

    await note.destroy();

    logger.info('Note deleted', {
      noteId: req.params.id,
      userId: req.user.id
    });

    res.sendStatus(204);
  } catch (error) {
    logger.error('Delete note failed', {
      noteId: req.params.id,
      error: error.message
    });
    next(error);
  }
};
