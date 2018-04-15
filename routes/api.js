var express = require('express');
var router = express.Router();
const config = require('../config');
const status = require('../statusCodes');
const sql = require('../sql');
const { createJWT, validateJWT, requireJWTAuth } = require('../jwt');
const { verifyIdToken } = require('../googleTokenUtils');
const mysql = require('mysql');

const db = mysql.createConnection(config.db);

const returnLoginToken = (res, googleId, email) => (err, result) => {
  if (err) {
    res.json({ result: status.login_status.UNKNOWN_ERROR });
    return;
  }
  if (result.length == 0) {
    res.json({ result: status.login_status.SIGNUP_REQUIRED });
  } else {
    const username = result[0].username;
    const uid = result[0].id;
    res.json({
      result: status.login_status.LOGGED_IN,
      uid,
      username,
      email,
      token: createJWT({ uid, googleId })
    });
  }
}

/* Handle Google login. */
router.post('/login', function(req, res, next) {
  const t = req.body.tokenId;
  verifyIdToken(t)
  .then(data => {
    const googleId = data.sub;
    const email = data.email;
    db.query(sql.GET_USER_FROM_DB,
      [ googleId ],
      returnLoginToken(res, googleId, email));
  })
  .catch(result => res.json({ result }));
});

// All API endpoints below this require a valid JWT to be passed
// via the "X-JWT-Auth" header. An updated token is returned via
// the "X-JWT-Token" header.
router.use(requireJWTAuth);

router.get('/vendors', (req, res) => {
  db.query(sql.GET_VENDOR_LIST, (err, result, fields) => {
    if (err) {
      res.json([]);
    } else {
      res.json(result);
    }
  });
});

module.exports = router;