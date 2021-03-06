const config = require('./config');
const jwt = require('jsonwebtoken');

const createJWT = data => jwt.sign(
  { data },
  config.jwt.secret,
  { algorithm: 'HS256', expiresIn: config.jwt.expiresIn }
);

const validateJWT = token => jwt.verify(token, config.jwt.secret);

const requireJWTAuth = (req, res, next) => {
  if (req.method === 'OPTIONS') {
    next();
    return;
  }
  const token = req.get('X-JWT-Auth');
  if (!token) {
    res.status(403).json({ error: 'Auth Token Required' });
    return;
  }
  try {
    const jwt = validateJWT(token);
    res.uid = jwt.data.uid;
    res.sid = jwt.data.sid;
    res.googleId = jwt.data.googleId;
    res.setHeader('X-JWT-Token', createJWT(jwt.data));
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid Token' });
  }
}

module.exports = { createJWT, validateJWT, requireJWTAuth };