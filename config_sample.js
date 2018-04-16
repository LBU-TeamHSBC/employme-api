const config = {
  db: {
    host: '127.0.0.1',
    user: 'myusername',
    password: 'A_p455w0rd!',
    database: 'employme'
  },
  google: {
    CLIENT_ID: "GOOGLE_CLIENT_ID"
  },
  jwt: {
    secret: 'SOME_SECRET_FOR_JWT',
    expiresIn: '1h'
  }
}

export default config;
