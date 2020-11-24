const passport = require('../lib/passport')
const Account = require('../api/account')
const { getID } = require('../lib/tool')
const Result = require('../lib/result')

let github = async (ctx, next) => {
    return passport.authenticate('github')(ctx)
}
let logout = async (ctx, next) => {
    ctx.logout();
    ctx.response.body = (new Result(0, '', null)).toString()
    return next()
}

let login = async (ctx, next) => {
    if (ctx.isAuthenticated()) {
        ctx.response.body = (await Account.info(ctx.state.user)).toString()
    }
    else {
        ctx.response.body = (new Result(-1, 'CheckAuthenticated Fail', null)).toString()
    }
    return next()
}

let callback = async (ctx, next) => {
    return passport.authenticate('github', { scope: ['user'] }, async (error, user, info) => {
        if (!error && user) {
            let sid = getID(24)

            if (user.profile && user.profile.id) {
                let uid = user.profile.id
                let username = user.profile.username

                let account = await Account.info(uid)
                if (!account.isOk()) {
                    account = await Account.create(uid, username, config.defaultLevel, 'github')
                    if (account.isOk()) {
                        ctx.login(uid) //设置登陆
                        ctx.session['sid'] = sid
                    }
                    else {
                        //新建失败，重定向到登陆页
                        ctx.response.redirect(config.login) //重定向到登陆页
                        return next()
                    }
                }
                else {
                    ctx.session['sid'] = sid
                    ctx.login(uid) //设置登陆
                }
            }
            else {
                ctx.response.redirect(config.login) //重定向到登陆页
                return next()
            }

            let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>patract.io 授权</title>
</head>
<body>
    授权成功
    <script>
        window.onload = function () {
        window.opener.postMessage("${sid}","https://elara.patract.io");
        window.close();
    }
    </script>
</body>
</html>`
            ctx.response.type = 'html'
            ctx.response.body = html
            return next()
        }

        console.log(error)
        ctx.response.redirect(config.login)
        return next()
    })(ctx)
}

module.exports = {
    'GET /auth/github/callback': callback, //github 验证回调
    'GET /auth/github': github, //github验证
    'GET /auth/login': login,　//登录信息
    'GET /auth/logout': logout//退出登录

}

