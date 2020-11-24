let passport=require('koa-passport')
let GitHubStrategy=require('passport-github2').Strategy

passport.serializeUser(function(user,done){
  done(null,user)
})
passport.deserializeUser(function(user,done){
  done(null,user)
})


module.exports=passport
