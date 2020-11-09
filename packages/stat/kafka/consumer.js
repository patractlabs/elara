const config = global.config = require('../config/index')();
const { logger } = require('../src/lib/log')
const stat = require('../src/api/stat')

var kafka = require('kafka-node'),
    Consumer = kafka.Consumer,
    client = new kafka.KafkaClient({ kafkaHost: config.kafka.kafkaHost }),
    consumer = new Consumer(
        client,
        [
            { topic: config.kafka.topic, partition: 0 }
        ],
        {
            autoCommit: true
        }
    );

consumer.on('error', function (err) {
    logger.error('kafka error', err)
})

consumer.on('message', function (message) {
    try {
        switch (message.key) {
            case 'request': {
                stat.request(JSON.parse(message.value))
            }
            default:
                break;
        }
    } catch (e) {
        logger.error('consumer message error', e)
    }

    logger.info(JSON.stringify(message))
});