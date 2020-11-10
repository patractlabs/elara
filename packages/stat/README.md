# elara-stat
Elara Stat Service

Shared account Session login status with Elara-Developer Account.
Provide project management and statistics functions under Elara's developer account

Based on the Koa framework, Redis is used for storage components, and Kafka is used for message queues

## How to use 
 1. Install the dependencies
```
    yarn install 
```
2. Prepare

- uses [Redis](https://github.com/redis/redis) As a storage component, you need to prepare a redis running instance (you can build it yourself or use the redis service provided by cloud service). In the following configuration phase, the Host/Port/Password of the instance will be used.
- uses [Kafka](http://kafka.apache.org/) As a Message middleware, you need to prepare a kafka running instance (you can build it yourself or use the redis service provided by cloud service). In the following configuration phase, the Host/Port/Password of the instance will be used.
- Add a Topic "elara-dev" in Kafak

3. Configuration
```
    # Edit ./config/env/dev.env.js
     redis: {
        host: '127.0.0.1',　//configure it as the host of the redis instance in step 2
        port: '6379', configure it as the port of the redis instance in step 2
        password: '***'
    },
    kafka: {
        'kafkaHost': '127.0.0.1:9092', configure it as the host and port of the kafka instance in step 2
        'topic': 'elara-dev',
        'sasl': { mechanism: 'plain', username: '***', password: '***' }
    },
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



5. Start message queue consumer

```
node ./kafka/consumer.js
```

6. Start dashboard data build
```
node ./timer/dashboard.js
```
7. View Dashboard

    Browser open http://127.0.0.1:7002/dashboard

## Interface

###  Need to verify the login status
#### 1. Request project  list 

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



#### 2. Request project  details 

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

#### 3. New project　

    METHOD:POST 
    URL:/project

args：
- chain
- name:  (Validation rules /[a-zA-Z]{4,32}/ )

#### 4. Statistics on the day of the project  GET　/stat/day/PID


  ```
  {"code":0,"mssage":"","data":{"request":"3","updatetime":"1600223548","method":{},"bandwidth":0,"code":{},"agent":{},"origin":{}}}
  ```
args：

  - request
  - updatetime
  - bandwidth：（byte)

#### 5. Week statistics of the project　

    METHOD:GET 
    URL:/stat/week/<PID>


  ```
  {"code":0,"mssage":"","data":{"20200912":{"request":"3","updatetime":"1600223548","method":{},"bandwidth":0,"code":{},"agent":{},"origin":{}},"20200913":{"request":"3","updatetime":"1600223548","method":{},"bandwidth":0,"code":{},"agent":{},"origin":{}},}}		
  ```

args:
  - request
  - method
  - bandwidth: （byte)

  
### No need to verify the login status

#### 1.　Statistics of chain requests　

    METHOD:GET 
    URL:/stat/chain

  ```
  {"code":0,"mssage":"","data":{"ethereum":0,"chainx":"13"}}
  ```
#### 2. Latest request　
    METHOD:GET
    URL: /stat/requests
#### 3. Dashboard data　
    METHOD:GET
    URL: /stat/dashboard
#### 4. Limit verification     
    METHOD:GET
    URL: /limit/<Chain>/<Pid>

     If code==0 is returned, there is no limit