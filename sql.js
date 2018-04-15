const sql = {
  SQL_GET_USER_FROM_DB: 'SELECT id, username, email, user_type FROM user WHERE google_id=? LIMIT 1'
};

module.exports = sql;