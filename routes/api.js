var express = require('express');
var router = express.Router();
const config = require('../config');
const status = require('../statusCodes');
const sql = require('../sql');
const { createJWT, validateJWT } = require('../jwt');
const { OAuth2Client } = require('google-auth-library');
const mysql = require('mysql');

const db = mysql.createConnection(config.db);

const verifyIdToken = token => {
  return new Promise((resolve, reject) => {
    if (!token) {
      reject(status.login_status.USER_CANCELLED);
      return;
    }
    const client = new OAuth2Client(config.google.CLIENT_ID);
    async function verify() {
      const ticket = await client.verifyIdToken({
          idToken: token,
          audience: config.google.CLIENT_ID,
      });
      const payload = ticket.getPayload();
      const sub = payload['sub'];
      const email = payload['email']
      const domain = payload['hd'];
      if (domain !== 'student.leedsbeckett.ac.uk') {
        reject(status.login_status.INVALID_EMAIL);
        return;
      }
      resolve({ sub, email });
    }
    verify().catch(err => reject(status.login_status.UNKNOWN_ERROR));
  });
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
      // got user id? => check if it's in the DB if yes return json else create & login
      db.query(sql.SQL_GET_USER_FROM_DB, [googleId], (err, result) => {
        if (err) {
          res.json({ result: UNKNOWN_ERROR });
          return;
        }

        if (result.length == 0) {
          // INSERT INTO DB
          res.json({ result: status.login_status.SIGNUP_REQUIRED });
        } else {
          const username = result[0].username;
          const uid = result[0].id;
          res.json({
            result: status.login_status.LOGGED_IN,
            uid,
            username,
            email: data.email,
            token: createJWT({ uid, googleId })
          });
        }

      });

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