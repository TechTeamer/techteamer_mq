const QueueManager = require('../src/QueueManager')
const ConsoleInspector = require('./consoleInspector')
const config = require('./config/LoadConfig')

describe('Publisher && Subscriber actions', () => {
  const publisherName = 'test-publisher-action'
  const logger = new ConsoleInspector(console)
  const maxRetry = 5

  const publisherManager = new QueueManager(config)
  publisherManager.setLogger(logger)
  const publisher = publisherManager.getPublisher(publisherName)

  const subscriberManager = new QueueManager(config)
  subscriberManager.setLogger(logger)
  const subscriber = subscriberManager.getSubscriber(publisherName, { maxRetry, timeoutMs: 10000 })

  before(() => {
    return publisherManager.connect().then(() => {
      return subscriberManager.connect()
    })
  })

  after(() => {
    logger.empty()
  })

  it('subscriber.registerAction() registers the action, publisher.callAction() sends a STRING and the registered callback for the action receives it', (done) => {
    const stringMessage = 'foobar'

    subscriber.registerAction('compareString', (msg) => {
      if (msg === stringMessage) {
        done()
      } else {
        done(new Error('The compared String is not equal to the String that was sent'))
      }
    })

    publisher.sendAction('compareString', stringMessage).catch((err) => {
      done(err)
    })
  })
})
