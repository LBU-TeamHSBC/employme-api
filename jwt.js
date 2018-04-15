const config = require('./config');
const jwt = require('jsonwebtoken');

const createJWT = data => jwt.sign(
  { data },
  config.jwt.secret,
  { algorithm: 'HS256', expiresIn: config.jwt.expiresIn }
);

const validateJWT = token => jwt.verify(token, config.jwt.secret);

module.exports = { createJWT, validateJWT };