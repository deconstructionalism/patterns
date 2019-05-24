const assert = require('assert')

// COMPOSABLE BEHAVIORS

const subscribable = mod => {

  const subscribers = {}

  const subscribe = (id, topic, callback) => {
    assert(typeof id === 'number', 'subscriber id must be a number')
    assert(typeof topic === 'string', 'subscriber topic must be a string')
    assert(typeof callback === 'function', 'subscriber callback must be a function  ')

    if ( topic === '$all' ) {
       return subscribers[id] = { topics: { $all : callback } }
    }

    if ( subscribers[id] ) {
      delete subscribers[id].topics.$all
      return subscribers[id].topics[topic] = callback
    }

    subscribers[id] = { topics: { [topic]: callback }}
  }

  const unsubscribe = (id, topic=null) => {
    assert(typeof id === 'number', 'subscriber id must be a number')
    assert(typeof topic === 'string' || topic === null, 'subscriber topic must be a string or null')

    if ( !subscribers[id] ) {
      throw new Error(`Unsubscribe error: no subscriber with id ${id}`)
    }

    if ( !topic || topic == '$all' ) {
      return delete subscribers[id]
    }

    if ( !subscribers[id].topics[topic] )
       throw new Error(`Unsubscribe error: no topic ${topic} for subscriber with id ${id}`)

    delete subscribers[id].topics[topic]
  }

  const getSubscriberCallbacksByTopic = topic => {
    assert(typeof topic === 'string', 'subscriber topic must be a string')

    return Object.values(subscribers).flatMap(({ topics }) => {
      return '$all' in topics
               ? topics.$all
               : topic in topics
                 ? topics[topic]
                 : []
    })
  }

  return (function() {
    return {
      ...mod,
      subscribe,
      unsubscribe,
      getSubscriberCallbacksByTopic,
      subscribers: (() => subscribers)()
    }
  })()
}

const emitter = mod => {

  assert(mod.subscribers, 'emitter must already be subscribable')

  const sent = []
  const messageBuffer = []

  const queueMessage = (message) => {
    assert(typeof message.text === 'string', 'queueMessage text must be a string')
    assert(typeof message.topic === 'string', 'queueMessage topic must be a string')

    messageBuffer.push(message)
    sendMessage()
  }

  const sendMessage = () => {
    const [ message ] = messageBuffer.slice(-1, 1)
    const { topic } = message
    const callbacks = mod.getSubscriberCallbacksByTopic(topic)
    try {
      callbacks.forEach(cb => cb(message))
      sent.push(messageBuffer.pop())
    } catch (error) {
      console.log('ERROR: could not send message to all observers', error)
    }
  }

  return (function () {
    return {
      ...mod,
      queueMessage,
      messageBuffer: (() => messageBuffer)(),
      sent: (() => sent)()
    }
  })()
}

const basicResponder = (responseCallback, mod) => {

  const respond = message => {
   responseCallback(message, mod)
  }

  return (function() {
    return {
      ...mod,
      respond
    }
  })()
}


// MODULE FACTORY

const makeNode = (() => {
  let uuid = 0

  return (function () {
    const id = uuid++

    return {
      id: (() => id)()
    }

  })
})()

// HELPER TO COMPOSE BEHAVIORS - simple function to compose a module with behaviors

const composeBehaviors = (mod, behaviors=[]) => {
  let composedModule = {...mod}
  behaviors.forEach(behavior => composedModule = behavior(composedModule))
  return composedModule
}

// GENERIC RESPONSE FUNCTION FOR MESSAGE RECEIVED CALLBACK

const response = (message, mod) => {
  console.log(`${mod.id} - topic: ${message.topic} text: ${message.text}`)
}






// MAKE NODES

const subject = composeBehaviors(makeNode(), [subscribable, emitter])
const buffer = composeBehaviors(makeNode(), [subscribable, emitter])
const observer1 = composeBehaviors(makeNode(), [basicResponder.bind(this, response)])
const observer2 = composeBehaviors(makeNode(), [basicResponder.bind(this, response)])
const observer3 = composeBehaviors(makeNode(), [basicResponder.bind(this, response)])

/*
               SUBJECT
                  |
                  | $all
                  V
                BUFFER
               /  |   \
              /   |    \
             /    |     \
            /     |      \
           /      |       \
          / ebola | $all   \ marburg
         V        V         V
       OBS1     OBS2       OBS3


*/

// SUBSCRIBE BUFFER TO SUBJECT

subject.subscribe(buffer.id, '$all', buffer.queueMessage)

// SUBSCRIBE OBSERVERS TO BUFFER

buffer.subscribe(observer1.id, 'ebola', observer1.respond)
buffer.subscribe(observer2.id, '$all', observer2.respond)
buffer.subscribe(observer3.id, 'marburg', observer3.respond)

// QUEUE SOME MESSAGES

subject.queueMessage({ text: 'well then', topic: 'sucker' })
subject.queueMessage({ text: 'well then', topic: 'marburg' })
