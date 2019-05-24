const subject = (function() {

  const messageQueue = []
  let bufferCallback = () => {}

  const notify = (message) => {
    bufferCallback(message)
  }

  const queueMessage = (text, topic) => {
    const message = { body: {topic,  text} }
    messageQueue.push(message)
    notify(message)
  }

  const subscribe = callback => {
    bufferCallback = callback
  }

  const unsubscribe = () => {
    bufferCallback = () => {}
  }

  const getMessageQueue = () => {
    return JSON.stringify(messageQueue, null, 2)
  }

  return {
    subscribe,
    unsubscribe,
    queueMessage,
    getMessageQueue
  }
})()


const buffer = (function() {
  const messageQueue = []
  subscribers = {}

  const queueMessage = (message) => {

    const { topic, text } = message.body
    for (let observer of Object.values(subscribers)) {
      const { topics } = observer
      const observerCallback = topics[topic]
      if(observerCallback) {
        notify(message, observerCallback)
      }
    }
  }

  const notify = (message, callback) => {
    callback(message)
  }

  const subscribe = (id, topic, callback) => {
    if ( subscribers[id] ) {
      return subscribers[id].topics[topic] = callback
    }
    subscribers[id] = { topics: { [topic]: callback }}
  }

  const unsubscribe = (id, topic=null) => {
    if ( !subscribers[id] ) {
      throw new Error(`Unsubscribe error: no subscriber with id ${id}`)
    }
    if ( !topic ) {
      console.log('deleteing ', id)
      return delete subscribers[id]
    }
    if ( !subscribers[id].topics[topic] )
       throw new Error(`Unsubscribe error: no topic ${topic} for subscriber with id ${id}`)

    delete subscribers[id].topics[topic]
  }

  getSubscribers = () => {
    return JSON.stringify(subscribers, (_, value) => typeof value === 'function' ? '[Function]' : value, 2)
  }

  return {
    subscribe,
    unsubscribe,
    queueMessage,
    getSubscribers
  }
})()

let uuid = 0

const generateObserver = (function() {
  function observer () {
    let lastMessage = ''
    const id = uuid++

    const updateMessage = (message) => {
      lastMessage = message.body
      console.log(` I am ${id} and I heard ${lastMessage.text} about ${lastMessage.topic}`)
    }

    const getMessage = () => lastMessage

    return {
      id: () => id,
      update: updateMessage,
      get: getMessage
    }
  }

  return observer
})()

const observer1 = generateObserver()
const observer2 = generateObserver()
const observer3 = generateObserver()

buffer.subscribe(observer1.id(), 'malaria', observer1.update)
buffer.subscribe(observer1.id(), 'ebola', observer1.update)

buffer.subscribe(observer2.id(), 'ebola', observer2.update)
buffer.subscribe(observer3.id(), 'malaria', observer3.update)

subject.subscribe(buffer.queueMessage)

subject.queueMessage('hello there', 'malaria')
subject.queueMessage('oh jeez', 'ebola')

buffer.unsubscribe(observer1.id(), 'ebola')

subject.queueMessage('unheard', 'marburg')

subject.queueMessage('oh jeez', 'ebola')
subject.unsubscribe()
subject.queueMessage('all gone', 'malaria')
