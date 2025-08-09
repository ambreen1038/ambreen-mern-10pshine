const { Note, User } = require('../models');
const { logger } = require('../utils/logger');
const { Op } = require('sequelize'); // <-- Add this import for Sequelize operators

class NotesService {
  async listUserNotes(userId, { 
    page = 1, 
    limit = 10, 
    sort = 'DESC',
    search = ''
  } = {}) {
    const where = { userId };

    if (search) {
      // Search in both title and content using OR
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { content: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Note.findAndCountAll({
      where,
      order: [['createdAt', sort]],
      limit,
      offset: (page - 1) * limit,
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'name']
      }]
    });

    return {
      data: rows,
      meta: {
        total: count,
        page,
        pageSize: rows.length,
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  async getNote(userId, noteId) {
    const note = await Note.findOne({
      where: { id: noteId, userId },
      include: ['author']
    });

    if (!note) {
      const error = new Error('Note not found');
      error.code = 'NOT_FOUND';
      error.status = 404;
      throw error;
    }

    return note;
  }

  async createNote(userId, { title, content, tags = [] }) {
    const note = await Note.create({ 
      title: title.trim(),
      content: content.trim(),
      tags: Array.isArray(tags) ? tags : [tags],
      userId
    });

    logger.audit('NOTE_CREATED', { noteId: note.id, userId });
    return note;
  }

 async updateNote(userId, noteId, updates) {
  const note = await Note.findOne({ where: { id: noteId, userId } });
  if (!note) {
    throw Object.assign(new Error('Note not found'), {
      code: 'NOT_FOUND',
      status: 404,
    });
  }
  await note.update(updates);
  logger.audit('NOTE_UPDATED', { noteId, userId });
  return note;
}


  async deleteNote(userId, noteId) {
    const deleted = await Note.destroy({
      where: { id: noteId, userId }
    });

    if (!deleted) {
      throw Object.assign(new Error('Note not found'), {
        code: 'NOT_FOUND',
        status: 404
      });
    }

    logger.audit('NOTE_DELETED', { noteId, userId });
    return { id: noteId };
  }

}

module.exports = new NotesService();
