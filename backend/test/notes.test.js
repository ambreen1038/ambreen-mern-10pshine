const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const { sequelize, models } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const expect = chai.expect;

chai.use(chaiHttp);

describe('📝 Notes API', () => {
  let user1Token, user2Token, user1Id, user2Id;
  let user1NoteId;

  before(async () => {
    await sequelize.sync({ force: true });

    // Create users with real password hashes
    const [user1, user2] = await Promise.all([
      models.User.create({
        name: 'User A',
        email: 'a@test.com',
        passwordHash: await bcrypt.hash('passwordA', 10),
      }),
      models.User.create({
        name: 'User B',
        email: 'b@test.com',
        passwordHash: await bcrypt.hash('passwordB', 10),
      }),
    ]);

    user1Id = user1.id;
    user2Id = user2.id;

    // Generate tokens
    user1Token = jwt.sign({ id: user1.id }, process.env.JWT_SECRET);
    user2Token = jwt.sign({ id: user2.id }, process.env.JWT_SECRET);

    // Create notes
    const [note1, note2] = await models.Note.bulkCreate([
      { title: 'User1 Note', content: 'Private', userId: user1.id },
      { title: 'User2 Note', content: 'Secret', userId: user2.id },
    ], { returning: true });

    user1NoteId = note1.id;
  });

  afterEach(async () => {
    // Optional: clean notes between tests if you want strict isolation
    // await models.Note.destroy({ where: {} });
  });

  describe('GET /api/notes', () => {
    it('should return only own notes (200)', async () => {
      const res = await chai.request(app)
        .get('/api/notes')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res).to.have.status(200);
      expect(res.body.data).to.be.an('array');
      expect(res.body.data).to.have.length(1);
      expect(res.body.data[0].title).to.equal('User1 Note');
    });

    it('should reject request without token (401)', async () => {
      const res = await chai.request(app).get('/api/notes');
      expect(res).to.have.status(401);
    });
  });

  describe('GET /api/notes/:id', () => {
    it('should get own note by id (200)', async () => {
      const res = await chai.request(app)
        .get(`/api/notes/${user1NoteId}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('title', 'User1 Note');
    });

    it('should prevent viewing others notes (404)', async () => {
      const note = await models.Note.findOne({
        where: { userId: { [sequelize.Op.ne]: user1Id } },
      });

      const res = await chai.request(app)
        .get(`/api/notes/${note.id}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res).to.have.status(404);
    });
  });

  describe('POST /api/notes', () => {
    it('should create new note (201)', async () => {
      const res = await chai.request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ title: 'New Note', content: 'Note content' });

      expect(res).to.have.status(201);
      expect(res.body).to.have.property('id');
    });

    it('should reject missing title or content (400)', async () => {
      const res = await chai.request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ title: '' }); // Missing content

      expect(res).to.have.status(400);
      expect(res.body.errors).to.satisfy(errors =>
        errors.some(e => e.field === 'title' || e.field === 'content')
      );
    });

    it('should reject without auth token (401)', async () => {
      const res = await chai.request(app)
        .post('/api/notes')
        .send({ title: 'No Auth', content: 'No token' });

      expect(res).to.have.status(401);
    });
  });

  describe('PUT /api/notes/:id', () => {
    it('should update own note (200)', async () => {
      const res = await chai.request(app)
        .put(`/api/notes/${user1NoteId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ title: 'Updated Title' });

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('title', 'Updated Title');
    });

    it('should prevent updating others notes (404)', async () => {
      const note = await models.Note.findOne({
        where: { userId: { [sequelize.Op.ne]: user1Id } },
      });

      const res = await chai.request(app)
        .put(`/api/notes/${note.id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ title: 'Hacked' });

      expect(res).to.have.status(404);
    });
  });

  describe('DELETE /api/notes/:id', () => {
    it('should delete own note (200)', async () => {
      const newNote = await models.Note.create({ title: 'To Delete', content: 'Delete me', userId: user1Id });

      const res = await chai.request(app)
        .delete(`/api/notes/${newNote.id}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res).to.have.status(200);
    });

    it('should prevent deleting others notes (404)', async () => {
      const note = await models.Note.findOne({
        where: { userId: { [sequelize.Op.ne]: user1Id } },
      });

      const res = await chai.request(app)
        .delete(`/api/notes/${note.id}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res).to.have.status(404);
    });
  });
});
