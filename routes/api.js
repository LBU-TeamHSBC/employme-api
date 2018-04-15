var express = require('express');
var router = express.Router();
const config = require('../config');
const status = require('../statusCodes');
const sql = require('../sql');
const { createJWT, validateJWT } = require('../jwt');
const { verifyIdToken } = require('../googleTokenUtils');
const { OAuth2Client } = require('google-auth-library');
const mysql = require('mysql');

const db = mysql.createConnection(config.db);

const returnLoginToken = (res, googleId, email) => (err, result) => {
  if (err) {
    res.json({ result: UNKNOWN_ERROR });
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
  db.connect(err => {
    if (err) {
      console.log(err);
      return;
    }

    verifyIdToken(t)
    .then(data => {
      const googleId = data.sub;
      const email = data.email;
      // got user id? => check if it's in the DB if yes return json else insert & return json
      db.query(sql.SQL_GET_USER_FROM_DB,
        [ googleId ],
        returnLoginToken(res, googleId, email));
    })
    .catch(result => res.json({ result }));
  
  });
});

router.get('/vendors', (req, res) => {
  const VENDOR_SQL = "SELECT id, name, oauth_url, category FROM vendor ORDER BY name";
  // const cur = db.cursor();
  // cur.execute(VENDOR_SQL).then();
  res.json([
    {id:1, name:'GitHub', oauth_url:'https://', category:'PROJECT'},
    {id:4, name:'Leeds Beckett University', oauth_url:'https://', category:'COURSE'}
  ]);
});

module.exports = router;