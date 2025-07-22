const { User } = require('../models'), bcrypt = require('bcryptjs'), jwt = require('jsonwebtoken');

exports.register = async (req, res, next) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({ id: user.id });
  } catch (e) { next(e); }
};

exports.login = async (req, res, next) => {
  try {
    const u = await User.findOne({ where: { email: req.body.email } });
    if (!u || !bcrypt.compareSync(req.body.password, u.password)) 
      return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: u.id, email: u.email }, process.env.JWT_SECRET);
    res.json({ token });
  } catch (e) { next(e); }
};
