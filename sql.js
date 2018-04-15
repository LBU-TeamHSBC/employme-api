const sql = {
  GET_USER_FROM_DB: 'SELECT id, username, email, user_type FROM user WHERE google_id=? LIMIT 1',
  GET_VENDOR_LIST: 'SELECT id, name, oauth_url, category FROM vendor ORDER BY name'
};

module.exports = sql;