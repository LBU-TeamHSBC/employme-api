const sql = {
  GET_USER_FROM_DB: 'SELECT id, username, email, user_type FROM user WHERE google_id=? LIMIT 1',
  GET_VENDOR_LIST: 'SELECT id, name, oauth_url, category FROM vendor ORDER BY name',
  ADD_VENDOR_LINK: 'INSERT INTO student_vendor (student_id, vendor_id, oauth_token) VALUES (?, ?, ?)',
  REMOVE_VENDOR_LINK: 'DELETE FROM student_vendor WHERE student_id=? AND vendor_id=?',
  GET_ENROLMENTS_LIST: 'SELECT * FROM WHERE ?'
};

module.exports = sql;