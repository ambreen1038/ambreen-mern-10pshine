const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const { sequelize, models } = require('../models');
const jwt = require('jsonwebtoken');
const expect = chai.expect;

chai.use(chaiHttp);

describe('📝 Notes API', () => {
  let user1Token, user2Token, user1Id;

  before(async () => {
    await sequelize.sync({ force: true });
    
    // Setup test users
    const [user1, user2] = await Promise.all([
      models.User.create({
        name: 'User A',
        email: 'a@test.com',
        passwordHash: 'hash' // Simplified for tests
      }),
      models.User.create({
        name: 'User B',
        email: 'b@test.com',
        passwordHash: 'hash'
      })
    ]);

    user1Id = user1.id;
    user1Token = jwt.sign({ id: user1.id }, process.env.JWT_SECRET);
    user2Token = jwt.sign({ id: user2.id }, process.env.JWT_SECRET);

    // Setup test notes
    await models.Note.bulkCreate([
      { title: 'User1 Note', content: 'Private', userId: user1.id },
      { title: 'User2 Note', content: 'Secret', userId: user2.id }
    ]);
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
  });

  describe('POST /api/notes', () => {
    it('should create new note (201)', async () => {
      const res = await chai.request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ title: 'New', content: 'Note' });
      
      expect(res).to.have.status(201);
      expect(res.body).to.have.property('id');
    });
  });

  describe('Note Privacy', () => {
    let otherUserNoteId;

    before(async () => {
      const note = await models.Note.findOne({ 
        where: { userId: { [sequelize.Op.ne]: user1Id } 
      }
      });
      otherUserNoteId = note.id;
    });

    it('should prevent viewing others notes (404)', async () => {
      const res = await chai.request(app)
        .get(`/api/notes/${otherUserNoteId}`)
        .set('Authorization', `Bearer ${user1Token}`);
      
      expect(res).to.have.status(404);
    });

    it('should prevent updating others notes (404)', async () => {
      const res = await chai.request(app)
        .put(`/api/notes/${otherUserNoteId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ title: 'Hacked' });
      
      expect(res).to.have.status(404);
    });
  });
});