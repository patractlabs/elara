const config = global.config = require('../config/index')();
const { logger } = require('../src/lib/log')
const stat = require('../src/api/stat')
const kafka = require('kafka-node');
const Offset = kafka.Offset;
const client = new kafka.KafkaClient({ kafkaHost: config.kafka.kafkaHost });
const offset = new Offset(client);
const consumer = new kafka.Consumer(
    client,
    [
        { topic: config.kafka.topic, partition: 0 }
    ],
    {
        autoCommit: true
    }
);

console.log('consumer start');

consumer.on('error', function (error) {
    logger.error('error', error)
});
consumer.on('offsetOutOfRange', function (topic) {
    logger.error('offsetOutOfRange', topic)
    offset.fetch([topic], function (err, offsets) {
        let min = Math.min.apply(null, offsets[topic.topic][topic.partition])
        consumer.setOffset(topic.topic, topic.partition, min)
        logger.info('setOffset', topic.topic, topic.partition, min)
    })
});

consumer.on('message', function (message) {
    try {
        switch (message.key) {
            case 'request': {
                stat.request(JSON.parse(message.value))
            } 
            case 'connections':{
                //统计当前连接数
            }
            default:
                break;
        }
    } catch (e) {
        logger.error('consumer message error', e)
    }

    //logger.info(JSON.stringify(message))
});