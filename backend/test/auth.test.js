const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const { sequelize, models } = require('../models');
const bcrypt = require('bcrypt');
const expect = chai.expect;

chai.use(chaiHttp);

describe('🔐 Auth API', () => {
  before(async () => {
    await sequelize.sync({ force: true });
  });

  after(async () => {
    await sequelize.close();
  });

  describe('POST /api/auth/register', () => {
    const testUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'SecurePass123!'
    };

    it('should register with valid data (201)', async () => {
      const res = await chai.request(app)
        .post('/api/auth/register')
        .send(testUser);
      
      expect(res).to.have.status(201);
      expect(res.body).to.have.property('user');
      expect(res.body.user).to.not.have.property('passwordHash');
      expect(res.headers).to.have.property('set-cookie');
    });

    it('should reject weak passwords (400)', async () => {
      const res = await chai.request(app)
        .post('/api/auth/register')
        .send({ ...testUser, password: 'weak' });
      
      expect(res).to.have.status(400);
      expect(res.body.errors).to.satisfy(errors => 
        errors.some(e => e.field === 'password')
      );
    });

    it('should prevent duplicate emails (409)', async () => {
      await models.User.create({
        name: 'Existing',
        email: testUser.email,
        passwordHash: await bcrypt.hash('any', 10)
      });

      const res = await chai.request(app)
        .post('/api/auth/register')
        .send(testUser);
      
      expect(res).to.have.status(409);
    });
  });

  describe('POST /api/auth/login', () => {
    const credentials = {
      email: 'login@test.com',
      password: 'ValidPass123!'
    };

    before(async () => {
      await models.User.create({
        name: 'Login Test',
        email: credentials.email,
        passwordHash: await bcrypt.hash(credentials.password, 10)
      });
    });

    it('should login with valid credentials (200)', async () => {
      const res = await chai.request(app)
        .post('/api/auth/login')
        .send(credentials);
      
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('accessToken');
      expect(res.headers).to.have.property('set-cookie');
    });

    it('should block brute force attacks (429)', async () => {
      const attempts = 5;
      for (let i = 0; i < attempts; i++) {
        await chai.request(app)
          .post('/api/auth/login')
          .send({ ...credentials, password: 'wrong' });
      }
      
      const res = await chai.request(app)
        .post('/api/auth/login')
        .send(credentials);
      
      expect(res).to.have.status(429);
    });
  });
});