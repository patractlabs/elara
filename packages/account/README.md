# Developer-Account

Developer account system service

Based on the Koa framework, Redis is used for storage components, and github is used for  authentication 


```
    # Install the dependencies
    yarn install 

    # Start the service
    node app.js

```

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

    GET /auth/login
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
    
    GET /auth/logout
```
            {
                "code":0,
                "mssage":"",
                "data":null
            }
 ```

 - github Authentication 
    
    GET /auth/github

- github Authentication Callback

    GET /auth/github/callback