# Developer-Account

Developer account system service

Based on the Koa framework, Redis is used for storage components, and github is used for  authentication 

 1. Install the dependencies
```
    yarn install 
```

 2. Start Service
 
 You can start the current process
```
    node app.js
```
Or use [pm2](https://github.com/Unitech/pm2) Management process

```
    pm2 start pm2.json --env dev
```

You can find the running log in this directory `./ logs/`



## Config github Oauth
```
    # vim config/env/dev.env.js

    github: {
        'ClientID': '******',
        'ClientSecret': '******',
        'CallbackURL': '******'
    }
```


## Interface
-  Get login status　

    METHOD:GET

    URL: /auth/login

```
        {
            "code":0,
            "mssage":"",
            "data":
                {
                    "uid":"21072025",
                    "vip":"0",
                    "cratetime":"1601181067",
                    "ext":
                        {"projects":4}
                }
        }
```

 - Login out
    
    METHOD:GET
    
    URL: /auth/logout

```
            {
                "code":0,
                "mssage":"",
                "data":null
            }
 ```

 - github Authentication 
    
    METHOD:GET
    
    URL: /auth/github

- github Authentication Callback

    METHOD:GET
    
    URL: /auth/github/callback