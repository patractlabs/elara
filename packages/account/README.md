# Elara-Developer-Account

Elara Developer account system service

Based on the Koa framework, Redis is used for storage components, and github is used for  authentication 

## How to use
 1. Install the dependencies
```
    yarn install 
```
2. Prepare

- uses [Redis](https://github.com/redis/redis) As a storage component, you need to prepare a redis running instance (you can build it yourself or use the redis service provided by cloud service). In the following configuration phase, the Host/Port/Password of the instance will be used.

3. Configuration
```
    # Edit ./config/env/dev.env.js
     redis: {
            host: '***', // configure it as the host of the redis instance in step 2
            port: '***',//configure it as the port of redis instance in step 2
            password: '***'//configure it as the password of redis instance in step 2
        }

    # Config github Oauth
    github: {
        'ClientID': '******',
        'ClientSecret': '******',
        'CallbackURL': '******'
    }

```

 4. Start Service
 
 You can start the current process
```
    node app.js
```
Or use [pm2](https://github.com/Unitech/pm2) Management process

```
    pm2 start pm2.json --env dev
```

You can find the running log in this directory `./ logs/`



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