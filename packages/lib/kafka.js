const { logger } = require('./log')

var kafka = require('kafka-node'),
    Producer = kafka.Producer,
    KeyedMessage = kafka.KeyedMessage,
    client = new kafka.KafkaClient({ kafkaHost: config.kafka.kafkaHost }),
    producer = new Producer(client, {
        partitionerType: 1
    })

producer.on('ready', function () {
    logger.info('kafka ready')
});

producer.on('error', function (err) {
    logger.error('kafka error', err)
})

module.exports = {
    stat: (info) => {
        let km = new KeyedMessage(info.key, JSON.stringify(info.message))
        payloads = [
            { topic: config.kafka.topic, messages: [km]}
        ];

        producer.send(payloads, function (err, data) {
            if(err) {
                logger.info('kafka producer err', err, data)
            }
        });
    }
} 