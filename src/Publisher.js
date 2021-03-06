const QueueMessage = require('./QueueMessage')

class Publisher {
  /**
   * @param {QueueConnection} queueConnection
   * @param {Console} logger
   * @param {String} exchange
   */
  constructor (queueConnection, logger, exchange) {
    this._connection = queueConnection
    this._logger = logger
    this.exchange = exchange
    this.routingKey = ''
  }

  /**
   * Overridden in queueClient to assertQueue instead of exchange
   *
   * @param channel
   * @returns {Promise}
   */
  assertExchangeOrQueue (channel) {
    return channel.assertExchange(this.exchange, 'fanout', { durable: true })
  }

  async initialize () {
    const channel = await this._connection.getChannel()
    await this.assertExchangeOrQueue(channel)
  }

  /**
   * @param {String} action
   * @param {*} data
   * @param {String} [correlationId]
   * @param {Number} [timeOut]
   * @param {Map} [attachments]
   * @return {Promise}
   * */
  sendAction (action, data, correlationId = null, timeOut = null, attachments = null) {
    return this.send({ action, data }, correlationId, timeOut, attachments)
  }

  /**
   * @param {*} message
   * @param {String} [correlationId]
   * @param {Number} [timeOut]
   * @param {Map} [attachments]
   * @return {Promise}
   */
  async send (message, correlationId = null, timeOut = null, attachments = null) {
    const options = {}

    if (correlationId) {
      options.correlationId = correlationId
    }

    try {
      const channel = await this._connection.getChannel()
      let param
      try {
        param = new QueueMessage('ok', message, timeOut)
        if (attachments instanceof Map) {
          for (const [key, value] of attachments) {
            param.addAttachment(key, value)
          }
        }
      } catch (err) {
        this._logger.error('CANNOT PUBLISH MESSAGE', this.exchange, err)
        throw err
      }

      return new Promise((resolve, reject) => {
        const isWriteBufferEmpty = channel.publish(this.exchange, this.routingKey, param.serialize(), options, (err) => {
          if (err) {
            reject(err)
          } else {
            resolve()
          }
        })

        if (!isWriteBufferEmpty) { // http://www.squaremobius.net/amqp.node/channel_api.html#channel_publish
          channel.on('drain', resolve)
        }
      })
    } catch (err) {
      this._logger.error('PUBLISHER: cannot get channel', err)
      throw err
    }
  }
}

module.exports = Publisher
