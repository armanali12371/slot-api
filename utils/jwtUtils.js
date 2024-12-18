const jwt = require('jsonwebtoken');
const { JWT_SECRET_KEY } = process.env;

const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: '1h' });
};

const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET_KEY);
};

module.exports = { generateToken, verifyToken };
