const chai = require('chai')
let assert = chai.assert

const QueueMessage = require('../src/QueueMessage')

describe('QueueMessage', () => {
  let okStatus = 'ok'
  let errorStatus = 'error'
  let data = 'This is a valid QueueMessage'

  const number = 1
  const string = 'hello'
  const array = [1, 2, 3]
  const buffer = Buffer.from('test buffer')
  const object = { number, string, array, buffer }

  it('#fromJSON() returns a QueueMessage with status "error" if it receives an invalid QueueMessage', () => {
    let badQueueMessage = 'thisIsNotAQueueMessage'
    assert.strictEqual(QueueMessage.fromJSON(badQueueMessage).status, errorStatus)
  })

  it('#fromJSON() parses the stringified QueueMessage with the correct status', () => {
    let goodQueueMessage = JSON.stringify(new QueueMessage(okStatus, data))
    assert.strictEqual(QueueMessage.fromJSON(goodQueueMessage).status, okStatus)
  })

  it('#fromJSON() parses the stringified QueueMessage containing a number', () => {
    let queueMessage = JSON.stringify(new QueueMessage(okStatus, number))
    let data = QueueMessage.fromJSON(queueMessage).data
    assert.strictEqual(data, number)
  })

  it('#fromJSON() parses the stringified QueueMessage containing a string', () => {
    let queueMessage = JSON.stringify(new QueueMessage(okStatus, string))
    let data = QueueMessage.fromJSON(queueMessage).data
    assert.strictEqual(data, string)
  })

  it('#fromJSON() parses the serialized QueueMessage containing an array', () => {
    let queueMessage = JSON.stringify(new QueueMessage(okStatus, array))
    let data = QueueMessage.fromJSON(queueMessage).data
    assert.isArray(data, array)
    assert.sameMembers(data, array)
  })

  it('#fromJSON() parses the serialized QueueMessage containing a buffer', () => {
    let queueMessage = JSON.stringify(new QueueMessage(okStatus, buffer))
    let data = QueueMessage.fromJSON(queueMessage).data
    let _buffer = Buffer.from(data)
    assert.strictEqual(_buffer.toString('utf8'), 'test buffer', 'buffer content not match')
  })

  it('#fromJSON() parses the serialized QueueMessage containing an object', () => {
    let queueMessage = JSON.stringify(new QueueMessage(okStatus, object))
    let data = QueueMessage.fromJSON(queueMessage).data
    assert.isObject(data, 'not an object')
    assert.hasAllKeys(data, ['number', 'string', 'array', 'buffer'], 'object members not match')
    assert.strictEqual(data.number, number, 'number not match')
    assert.strictEqual(data.string, string, 'string not match')
    assert.isArray(data.array, array, 'not an array')
    assert.sameMembers(data.array, array, 'array members not match')
    let buffer = Buffer.from(data.buffer)
    assert.strictEqual(buffer.toString('utf8'), 'test buffer', 'buffer content not match')
  })
})
