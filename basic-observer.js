const subject = (function() {
  subscribers = []
  let messageLog = []

  const notify = (data) => {
    subscribers.forEach(({callback}) => {
      callback(data)
    })
  }

  const subscribe = (id, callback) => {
    subscribers.push({id, callback})
  }

  const unsubscribe = (id) => {
    const subscriberIndex = subscribers.findIndex(sub => sub.id === id)
    subscribers.splice(subscriberIndex, 1)
  }

  const queueMessage = message => {
    messageLog.push(message)
    notify(message)
  }

  return {
    subscribe,
    unsubscribe,
    queueMessage
  }
})()

let uuid = 0

const generateObserver = (function() {
  function observer () {
    let lastMessage = ''
    const id = uuid++

    const updateMessage = (message) => {
      lastMessage = message
      console.log(` I am ${id} and I heard ${lastMessage}`)
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

subject.subscribe(observer1.id(), observer1.update)
subject.subscribe(observer2.id(), observer2.update)
subject.subscribe(observer3.id(), observer3.update)

subject.queueMessage('hello there')
subject.unsubscribe(observer2.id())

subject.queueMessage('bye now')

