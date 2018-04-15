var express = require('express');
var router = express.Router();
const config = require('../config');
const { OAuth2Client } = require('google-auth-library');

const CLIENT_ID = config.google.CLIENT_ID;

const verifyIdToken = (token) => {
  return new Promise((resolve, reject) => {
    const client = new OAuth2Client(CLIENT_ID);
    async function verify() {
      const ticket = await client.verifyIdToken({
          idToken: token,
          audience: CLIENT_ID,
      });
      const payload = ticket.getPayload();
      const userid = payload['sub'];
      const domain = payload['hd'];
      if (domain === 'student.leedsbeckett.ac.uk') {
        resolve(userid);
      }
      reject();
    }
    verify().catch(console.error);
  });
}

/* Handle Google login. */
router.post('/login', function(req, res, next) {
  const t = req.body.tokenId;
  verifyIdToken(t)
    .then(userid => res.json({
      result: 'OK',
      userData: {
        userid
      }
    }))
    .catch(err => res.json({ err: true }));
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