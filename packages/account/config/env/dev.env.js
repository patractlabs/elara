process.env.DEBUG = process.env.DEBUG || 'dev-errer:*'
module.exports = {
    keys: ['elara@#^*&'],
    name: 'Developer-Account',
    port: 7001,
    session: {
        key: 'sid',
        signed: false,
        maxAge: 86400000,
        httpOnly:false
    },
    redis: {
        host: '127.0.0.1',
        port: '6379',
        password: '***'
    },
    github: {
        'ClientID': 'e97719c4776fc0832c47',
        'ClientSecret': 'e66f0a5a074a33aa71a60b16cf846ee8fa170165',
        'CallbackURL': 'http://127.0.0.1:7001/auth/github/callback'
    },
    login: 'https://patract.io/login'
}
