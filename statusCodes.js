const status = {
  login_status: {
    NOT_LOGGED_IN: 0,
    LOGGED_IN: 1,
    SIGNUP_REQUIRED: 2,
    INVALID_EMAIL: 3,
    USER_CANCELLED: 4,
    UNKNOWN_ERROR: 999
  }  
};

module.exports = status;