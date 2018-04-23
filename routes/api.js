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
    const { username, uid, sid } = result[0];
    res.json({
      result: status.login_status.LOGGED_IN,
      uid,
      sid,
      username,
      email,
      token: createJWT({ uid, sid })
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

router.post('/link', function(req, res, next) {
  const { sid } = res;
  const { vid, oauth } = req.body;
  db.query(sql.REMOVE_VENDOR_LINK, [ sid, vid ], rm_err => {
    if (rm_err) {
      console.log(rm_err);
      res.json({ error: true });
    } else {
      db.query(sql.ADD_VENDOR_LINK,
        [ sid, vid, oauth ],
        (err, result, fields) => {
          if (err) {
            console.log(err);
            res.json({ error: true });
          } else {
            res.json({ sid, vid });
          }
        }
      );
    }
  })
});

const wrapDbQuery = (query, values=[]) => (
  new Promise((reject, resolve) => {
    db.query(query,[ ...values ],
      (err, result, fields) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  })
);

router.get('/enrolments', function(req, res, next) {
  const { sid } = res;
  const { vid, oauth } = req.body;

  db.query(sql.GET_ENROLED_CM_LIST, [ sid ],
    (err, courses, fields) => {
      if (err) {
        res.json({ error: true, err });
      } else {
        db.query(sql.GET_PROJECT_LIST, [ sid ],
          (err2, projects, fields2) => {
            if (err) {
              res.json({ error: true, err });
            } else {
              res.json({ courses, projects });
            }
          });
      }
    });
});

router.get('/topskills', function(req, res, next) {
  const { sid } = res;
  const { vid, oauth } = req.body;

  console.log({ sid, vid, oauth });
  db.query(sql.GET_TOP_SKILLS, [ sid, sid ],
    (err, top_tags, fields) => {
      if (err) {
        res.json({ error: true, err });
      } else {
        const total = top_tags.map(t => t.score).reduce((a,b)=>(a+b),0);
        res.json({ top_tags, total });
      }
    });
});

// DEBUG
console.log('X-JWT-Auth:' + createJWT({ sid:1, uid: 1, googleId: 101612508763503800668 }));

module.exports = router;