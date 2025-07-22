const r = require('express').Router();
const { register, login } = require('../controllers/auth.controller');
r.post('/register', register);
r.post('/login', login);
module.exports = r;
