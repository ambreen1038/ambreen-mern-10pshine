const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const { sequelize, models } = require('../models');
const bcrypt = require('bcrypt');
const expect = chai.expect;

chai.use(chaiHttp);

const REGISTER_PATH = '/api/auth/register';
const LOGIN_PATH = '/api/auth/login';
const LOGOUT_PATH = '/api/auth/logout';

describe('🔐 Auth API', () => {
  before(async () => {
    await sequelize.sync({ force: true });
  });

  after(async () => {
    await sequelize.close();
  });

  // Clean up users after each test to isolate
  afterEach(async () => {
    await models.User.destroy({ where: {} });
  });

  describe('POST /api/auth/register', () => {
    const testUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'SecurePass123!'
    };

    it('should register with valid data (201)', async () => {
      const res = await chai.request(app)
        .post(REGISTER_PATH)
        .send(testUser);

      expect(res).to.have.status(201);
      expect(res.body).to.have.property('user');
      expect(res.body.user).to.not.have.property('passwordHash');
      expect(res.headers).to.have.property('set-cookie');
    });

    it('should reject weak passwords (400)', async () => {
      const res = await chai.request(app)
        .post(REGISTER_PATH)
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
        .post(REGISTER_PATH)
        .send(testUser);

      expect(res).to.have.status(409);
    });

    it('should reject invalid email format (400)', async () => {
      const res = await chai.request(app)
        .post(REGISTER_PATH)
        .send({ ...testUser, email: 'not-an-email' });

      expect(res).to.have.status(400);
      expect(res.body.errors).to.satisfy(errors =>
        errors.some(e => e.field === 'email')
      );
    });

    it('should reject missing required fields (400)', async () => {
      const res = await chai.request(app)
        .post(REGISTER_PATH)
        .send({ email: '', password: '' });

      expect(res).to.have.status(400);
      expect(res.body.errors).to.satisfy(errors =>
        errors.some(e => ['email', 'password'].includes(e.field))
      );
    });
  });

  describe('POST /api/auth/login', () => {
    const credentials = {
      email: 'login@test.com',
      password: 'ValidPass123!'
    };

    beforeEach(async () => {
      // Clean slate before creating user
      await models.User.destroy({ where: {} });
      await models.User.create({
        name: 'Login Test',
        email: credentials.email,
        passwordHash: await bcrypt.hash(credentials.password, 10)
      });
    });

    it('should login with valid credentials (200)', async () => {
      const res = await chai.request(app)
        .post(LOGIN_PATH)
        .send(credentials);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property('accessToken');
      expect(res.headers).to.have.property('set-cookie');
    });

    it('should block brute force attacks (429)', async () => {
      const attempts = 5;
      for (let i = 0; i < attempts; i++) {
        await chai.request(app)
          .post(LOGIN_PATH)
          .send({ ...credentials, password: 'wrong' });
      }

      const res = await chai.request(app)
        .post(LOGIN_PATH)
        .send(credentials);

      expect(res).to.have.status(429);
    });

    it('should reject invalid email format (400)', async () => {
      const res = await chai.request(app)
        .post(LOGIN_PATH)
        .send({ email: 'invalid-email', password: credentials.password });

      expect(res).to.have.status(400);
      expect(res.body.errors).to.satisfy(errors =>
        errors.some(e => e.field === 'email')
      );
    });

    it('should reject missing required fields (400)', async () => {
      const res = await chai.request(app)
        .post(LOGIN_PATH)
        .send({ email: '', password: '' });

      expect(res).to.have.status(400);
      expect(res.body.errors).to.satisfy(errors =>
        errors.some(e => ['email', 'password'].includes(e.field))
      );
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should clear authentication cookies (200)', async () => {
      const res = await chai.request(app)
        .post(LOGOUT_PATH);

      expect(res).to.have.status(200);
      expect(res.headers).to.have.property('set-cookie');
      // Optional: check that cookie is cleared or expired
      const cookie = res.headers['set-cookie'].find(c => c.includes('token='));
      expect(cookie).to.match(/(Expires=Thu, 01 Jan 1970|Max-Age=0)/);
    });
  });
});
