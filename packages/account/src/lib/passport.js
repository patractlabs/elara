let passport = require('koa-passport')
let GitHubStrategy = require('passport-github2').Strategy

passport.serializeUser(function (user, done) {
    done(null, user)
})
passport.deserializeUser(function (user, done) {
    done(null, user)
})
passport.use(
    new GitHubStrategy(
        {
            clientID: global.config.github.ClientID,
            clientSecret: global.config.github.ClientSecret,
            callbackURL: global.config.github.CallbackURL,
        },
        function (accessToken, refreshToken, profile, callback) {
            callback(null, { accessToken, refreshToken, profile })
        }
    )
)

module.exports = passport
