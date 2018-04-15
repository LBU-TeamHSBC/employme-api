const config = require('./config');
const status = require('./statusCodes');
const { OAuth2Client } = require('google-auth-library');

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
};

module.exports = { verifyIdToken };