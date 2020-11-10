# elara-stat
Elara Stat Server

Shared account Session login status with Developer Account.
Provide project management and statistics functions under Elara's developer account

Based on the Koa framework, Redis is used for storage components, and Kafka is used for message queues

 
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



3. Start message queue consumer

```
node ./kafka/consumer.js
```

4. Start dashboard data build
```
node ./timer/dashboard.js
```

## Need to verify the login interface
### 1. Request project  list 

    METHOD:GET
    URL: /projects 


  ```
  {
      "code": 0,
      "message": "",
      "data": [
          {
              "id": "b78a79f98a2bb1a991a357504a5b04c1",
              "status": "Active",
              "chain": "substrate",
              "name": "thedao",
              "uid": "...",
              "secret": "b94e4f1e9c7386c92007ad40af1c882d",
              "createtime": "1600398327",
              "lasttime": "1600398327",
              "allowlist": "false"
          },
         ...
      ]
  }
  ```

args:

-  id：Project ID

- status:（Active | Other)

- chain:

- name

- createtime



### 2. Request project  details 

    METHOD:GET 
    URL:/project/<PID>


```{
        "id": "b78a79f98a2bb1a991a357504a5b04c1",
        "status": "Active",
        "chain": "chainx",
        "name": "thedao",
        "mail": "toxotguo@gmail.com",
        "secret": "b94e4f1e9c7386c92007ad40af1c882d",
        "createtime": "1600398327",
        "lasttime": "1600398327",
        "allowlist": "false"
    }
```
args:
- id：Project ID

- status:（Active | Other)

- chain

-  name

- createtime

-   secret:api key

### 3. New project　

    METHOD:POST 
    URL:/project

args：
- chain
- name:  (Validation rules /[a-zA-Z]{4,32}/ )

### 4. Statistics on the day of the project  GET　/stat/day/PID


  ```
  {"code":0,"mssage":"","data":{"request":"3","updatetime":"1600223548","method":{},"bandwidth":0,"code":{},"agent":{},"origin":{}}}
  ```
args：

  - request
  - updatetime
  - bandwidth：（byte)

### 5. Week statistics of the project　

    METHOD:GET 
    URL:/stat/week/<PID>


  ```
  {"code":0,"mssage":"","data":{"20200912":{"request":"3","updatetime":"1600223548","method":{},"bandwidth":0,"code":{},"agent":{},"origin":{}},"20200913":{"request":"3","updatetime":"1600223548","method":{},"bandwidth":0,"code":{},"agent":{},"origin":{}},}}		
  ```

args:
  - request
  - method
  - bandwidth: （byte)

  
## No need to verify the login interface

### 1.　Statistics of chain requests　

    METHOD:GET 
    URL:/stat/chain

  ```
  {"code":0,"mssage":"","data":{"ethereum":0,"chainx":"13"}}
  ```
### 2. Latest request　
    METHOD:GET
    URL: /stat/requests
### 3. Dashboard data　
    METHOD:GET
    URL: /stat/dashboard
### 4. Limit verification     
    METHOD:GET
    URL: /limit/<Chain>/<Pid>

     If code==0 is returned, there is no limit