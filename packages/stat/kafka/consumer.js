const config = global.config = require('../config/index')();
const { logger } = require('../../lib/log')
const stat = require('../src/api/stat')
const kafka = require('kafka-node');
const Offset = kafka.Offset;
const client = new kafka.KafkaClient({ kafkaHost: config.kafka.kafkaHost });
const offset = new Offset(client);

let option = {
    kafkaHost: config.kafka.kafkaHost,
    groupId: config.kafka.consumerGroup,
    sessionTimeout: 15000,
    protocol: ['roundrobin'],
    fromOffset: 'latest',
    autoCommit: true,
    autoCommitIntervalMs:1000
};
const consumer = new kafka.ConsumerGroup(option, config.kafka.topic)

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
            case 'connections': {
                //统计当前连接数
            }
            default:
                break;
        }
    } catch (e) {
        logger.error('consumer message error', e)
    }

    logger.info(JSON.stringify(message))
});