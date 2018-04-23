const sql = {
  GET_USER_FROM_DB: 'SELECT u.id AS uid, s.id AS sid, username, email, user_type FROM user u LEFT JOIN student AS s ON u.id=s.user_id WHERE google_id=? LIMIT 1',
  GET_VENDOR_LIST: 'SELECT id, name, oauth_url, category FROM vendor ORDER BY name',
  ADD_VENDOR_LINK: 'INSERT INTO student_vendor (student_id, vendor_id, oauth_token) VALUES (?, ?, ?)',
  REMOVE_VENDOR_LINK: 'DELETE FROM student_vendor WHERE student_id=? AND vendor_id=?',
  // GET_ENROLED_CM_LIST: 'SELECT v.name, CONCAT(c.name, ", ", cm.name) AS course_module, scm.progress AS cmprog, sc.progress AS cprog FROM student_course sc INNER JOIN course c ON c.id=sc.course_id LEFT JOIN course_module cm ON cm.course_id=c.id LEFT JOIN student_course_module scm ON scm.course_module_id=cm.id INNER JOIN vendor AS v ON v.id=c.vendor_id WHERE sc.student_id=?',
  GET_ENROLED_CM_LIST: 'SELECT CONCAT(v.name, ", ", c.name) AS name, cm.name AS course_module, scm.progress AS cmprog, sc.progress AS cprog FROM student_course sc INNER JOIN course c ON c.id=sc.course_id LEFT JOIN course_module cm ON cm.course_id=c.id LEFT JOIN student_course_module scm ON scm.course_module_id=cm.id INNER JOIN vendor AS v ON v.id=c.vendor_id WHERE sc.student_id=?',
  GET_PROJECT_LIST: 'SELECT v.name AS vendor, sp.name, rating, lines_of_code FROM student_project sp INNER JOIN vendor AS v ON v.id=sp.vendor_id WHERE student_id=?',
  GET_TOP_SKILLS: 'SELECT t.name, CEIL(SUM((ct.weighting * sc.progress) / 100)) AS score FROM student_course sc INNER JOIN course_tag AS ct ON ct.course_id=sc.course_id INNER JOIN tag AS t ON t.id=ct.tag_id WHERE sc.student_id=? GROUP BY t.id UNION SELECT t.name, CEIL(SUM((spt.weighting * sp.rating) / 100 * (lines_of_code / 10000))) AS score FROM student_project sp INNER JOIN student_project_tag AS spt ON spt.student_project_id=sp.id INNER JOIN tag AS t ON t.id=spt.tag_id WHERE sp.student_id=? GROUP BY t.id ORDER BY score DESC LIMIT 4'
};

module.exports = sql;